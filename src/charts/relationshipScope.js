const branchNames = person =>
  (person?.extended?.tags || [])
    .map(tag => tag.name?.normalize('NFC').trim())
    .filter(name => /^(ngành|chi)\b/iu.test(name || ''))

const belongsTo = (name, branch) =>
  name === branch || name.startsWith(`${branch} - `)

export class RelationshipScopeIndex {
  constructor(people) {
    this.data = people
    this.people = new Map(people.map(p => [p.handle, p]))
    this.ids = new Map(people.map(p => [p.gramps_id, p.handle]))
    this.children = new Map()
    this.parents = new Map()
    this.partners = new Map()
    const link = (map, from, to) => {
      if (!this.people.has(from) || !this.people.has(to)) return
      if (!map.has(from)) map.set(from, new Set())
      map.get(from).add(to)
    }
    for (const person of people) {
      const families = [
        ...(person.extended?.families || []),
        person.extended?.primary_parent_family,
      ].filter(Boolean)
      for (const family of families) {
        const {father_handle: father, mother_handle: mother} = family
        link(this.partners, father, mother)
        link(this.partners, mother, father)
        for (const ref of family.child_ref_list || []) {
          for (const parent of [father, mother]) {
            link(this.children, parent, ref.ref)
            link(this.parents, ref.ref, parent)
          }
        }
      }
      for (const parent of [
        person.extended?.primary_parent_family?.father_handle,
        person.extended?.primary_parent_family?.mother_handle,
      ]) {
        link(this.children, parent, person.handle)
        link(this.parents, person.handle, parent)
      }
    }
  }

  _descendants(seeds, branch = '') {
    const included = new Set()
    const queue = [...seeds]
    for (let i = 0; i < queue.length; i += 1) {
      const handle = queue[i]
      if (included.has(handle) || !this.people.has(handle)) continue
      const labels = branchNames(this.people.get(handle))
      if (
        branch &&
        labels.length &&
        !labels.some(name => belongsTo(name, branch))
      )
        continue
      included.add(handle)
      queue.push(...(this.children.get(handle) || []))
    }
    return included
  }

  _withPartners(handles) {
    const included = new Set(handles)
    for (const handle of handles) {
      for (const partner of this.partners.get(handle) || [])
        included.add(partner)
    }
    return this.data.filter(person => included.has(person.handle))
  }

  branchOf(handle) {
    const queue = [handle]
    const visited = new Set()
    for (let i = 0; i < queue.length; i += 1) {
      const current = queue[i]
      if (visited.has(current)) continue
      visited.add(current)
      const names = branchNames(this.people.get(current))
      if (names.length)
        return names.find(name => /chi\b/iu.test(name)) || names[0]
      queue.push(...(this.parents.get(current) || []))
    }
    return ''
  }

  select(grampsId, scope) {
    const handle = this.ids.get(grampsId)
    if (scope === 'all') return {people: this.data, label: 'Toàn bộ gia phả'}
    if (!handle) return {people: [], label: ''}
    if (scope === 'descendants')
      return {
        people: this._withPartners(this._descendants([handle])),
        label: '',
      }
    const label = this.branchOf(handle)
    if (!label)
      return {
        people: this._withPartners(this._descendants([handle])),
        label: '',
        missingBranch: true,
      }
    const seeds = this.data
      .filter(p => branchNames(p).some(name => belongsTo(name, label)))
      .map(p => p.handle)
    seeds.push(handle)
    const included = this._descendants(seeds, label)
    included.add(handle)
    // Preserve actual connecting parents when a generation has no branch tag.
    for (const member of [...included]) {
      const queue = [[member, []]]
      const visited = new Set([member])
      for (let i = 0; i < queue.length; i += 1) {
        const [current, path] = queue[i]
        for (const parent of this.parents.get(current) || []) {
          if (visited.has(parent)) continue
          visited.add(parent)
          if (included.has(parent)) path.forEach(item => included.add(item))
          else if (!branchNames(this.people.get(parent)).length)
            queue.push([parent, [...path, parent]])
        }
      }
    }
    return {people: this._withPartners(included), label}
  }
}
