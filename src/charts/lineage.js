// Chỉ dùng nhãn dòng trưởng đã được biên soạn. Không suy thứ tự sinh từ ID,
// thứ tự API hoặc giới tính; nhánh chưa có nhãn vẫn mở được bằng cách bấm.
export class LineageIndex {
  constructor(people) {
    this.people = new Map(people.map(person => [person.handle, person]))
    this.ids = new Map(people.map(person => [person.gramps_id, person.handle]))
    this.children = new Map()
    this.parents = new Map()
    for (const person of people) {
      const children = new Set()
      for (const family of person.extended?.families || []) {
        const relation =
          family.father_handle === person.handle ? 'frel' : 'mrel'
        if (
          ![family.father_handle, family.mother_handle].includes(person.handle)
        )
          continue
        for (const ref of family.child_ref_list || []) {
          if (ref[relation] === 'Birth' && this.people.has(ref.ref))
            children.add(ref.ref)
        }
      }
      this.children.set(person.handle, [...children])
      for (const child of children) {
        if (!this.parents.has(child)) this.parents.set(child, [])
        this.parents.get(child).push(person.handle)
      }
    }
    this.lineage = new Set()
    const queue = people
      .filter(person =>
        person.attribute_list?.some(
          attr => attr.type === 'Dòng trưởng' && attr.value?.trim()
        )
      )
      .map(person => person.handle)
    // Giữ cả các mắt xích cha–con tới người có nhãn, kể cả cha không mang nhãn.
    for (let i = 0; i < queue.length; i += 1) {
      const handle = queue[i]
      if (this.lineage.has(handle)) continue
      this.lineage.add(handle)
      queue.push(...(this.parents.get(handle) || []))
    }
  }

  path(root, target) {
    const previous = new Map([[root, null]])
    const queue = [root]
    for (let i = 0; i < queue.length; i += 1) {
      const handle = queue[i]
      if (handle === target) {
        const result = []
        for (
          let current = target;
          current !== null;
          current = previous.get(current)
        )
          result.unshift(current)
        return result
      }
      for (const child of this.children.get(handle) || []) {
        if (!previous.has(child)) {
          previous.set(child, handle)
          queue.push(child)
        }
      }
    }
    return []
  }

  root(homeId, selectedId) {
    const home = this.ids.get(homeId)
    const selected = this.ids.get(selectedId)
    if (home && (!selected || this.path(home, selected).length)) return home
    let root = selected || home
    const seen = new Set()
    while (root && !seen.has(root)) {
      seen.add(root)
      const parents = this.parents.get(root) || []
      const father =
        this.people.get(root)?.extended?.primary_parent_family?.father_handle
      const parent = parents.includes(father) ? father : parents[0]
      if (!parent || seen.has(parent)) break
      root = parent
    }
    return root
  }

  tree(root, expanded) {
    const visit = (handle, path, depth, id) => {
      if (path.has(handle) || !this.people.has(handle)) return null
      const person = this.people.get(handle)
      const nextPath = new Set([...path, handle])
      const allChildren = (this.children.get(handle) || []).filter(
        child => !nextPath.has(child)
      )
      const isExpanded = expanded.has(handle)
      const visible = allChildren.filter(
        child => isExpanded || this.lineage.has(child)
      )
      return {
        id,
        person,
        depth,
        name_given:
          person.profile?.name_given || person.primary_name?.first_name || '',
        name_surname: person.profile?.name_surname || '',
        expandable: allChildren.some(child => !this.lineage.has(child)),
        expanded: isExpanded,
        hiddenCount: allChildren.length - visible.length,
        children: visible
          .map((child, index) =>
            visit(child, nextPath, depth + 1, `${id}c${index}`)
          )
          .filter(Boolean),
      }
    }
    return visit(root, new Set(), 0, 'p')
  }
}
