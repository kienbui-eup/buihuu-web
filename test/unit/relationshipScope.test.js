import {describe, expect, it, vi} from 'vitest'
import {RelationshipScopeIndex} from '../../src/charts/relationshipScope.js'
import {loadTreePeople} from '../../src/charts/treeData.js'
import {DEFAULT_TREE_VIEW, normalizeTreeView} from '../../src/treeDefaults.js'
import '../../src/views/GrampsjsViewTree.js'

function fixture() {
  const people = [
    'root',
    'a',
    'b',
    'a1',
    'a2',
    'deep',
    'spouse',
    'step',
    'loose',
    'external',
  ].map(handle => ({
    handle,
    gramps_id: handle,
    profile: {name_given: `Người mẫu ${handle}`, name_surname: ''},
    extended: {
      families: [],
      tags: ['a', 'a1', 'a2', 'loose'].includes(handle)
        ? [{name: 'Ngành mẫu - Chi A'}]
        : handle === 'b'
        ? [{name: 'Ngành mẫu - Chi B'}]
        : [],
    },
  }))
  const byId = Object.fromEntries(people.map(p => [p.handle, p]))
  const family = (father, mother, children) => {
    const f = {
      handle: `f-${father}`,
      father_handle: father,
      mother_handle: mother,
      child_ref_list: children.map(ref => ({
        ref,
        frel: 'Birth',
        mrel: 'Birth',
      })),
    }
    for (const parent of [father, mother])
      if (byId[parent]) byId[parent].extended.families.push(f)
    for (const child of children) byId[child].extended.primary_parent_family = f
  }
  family('root', '', ['a', 'b'])
  family('a', 'spouse', ['a1', 'a2'])
  family('a1', '', ['deep'])
  family('external', 'spouse', ['step'])
  return people
}

const ids = selection => selection.people.map(p => p.handle).sort()

describe('phạm vi gia phả hợp nhất', () => {
  it('hậu duệ gồm mọi đời và vợ/chồng, không kéo thêm con riêng của người phối ngẫu', () => {
    const index = new RelationshipScopeIndex(fixture())
    expect(ids(index.select('a', 'descendants'))).toEqual([
      'a',
      'a1',
      'a2',
      'deep',
      'spouse',
    ])
  })

  it('toàn nhánh gồm gốc chi, nhánh anh em và người cùng chi chưa nối vào cây', () => {
    const index = new RelationshipScopeIndex(fixture())
    const result = index.select('a1', 'branch')
    expect(result.label).toBe('Ngành mẫu - Chi A')
    expect(ids(result)).toEqual(['a', 'a1', 'a2', 'deep', 'loose', 'spouse'])
    expect(ids(index.select('deep', 'branch'))).toEqual(ids(result))
  })

  it('toàn gia phả không cắt người tách nhánh hoặc giới hạn khoảng cách quan hệ', () => {
    const data = fixture()
    const index = new RelationshipScopeIndex(data)
    expect(index.select('deep', 'all').people).toBe(data)
    expect(ids(index.select('deep', 'all'))).toHaveLength(10)
  })

  it('không tự gán chi khi thiếu nhãn và xử lý dữ liệu vòng', () => {
    const data = fixture()
    const index = new RelationshipScopeIndex(data)
    expect(index.select('root', 'branch').missingBranch).toBe(true)
    expect(index.select('missing', 'descendants').people).toEqual([])
    index.children.set('deep', new Set(['a']))
    expect(ids(index.select('a', 'descendants'))).toEqual([
      'a',
      'a1',
      'a2',
      'deep',
      'spouse',
    ])
  })

  it('dùng chung một lần tải giữa màn hình chính và các chế độ, tách cây/ngôn ngữ', async () => {
    const data = fixture()
    const apiGet = vi.fn().mockResolvedValue({data})
    const appState = {apiGet, i18n: {lang: 'vi'}, dbInfo: {tree: {id: 'demo'}}}
    const a = loadTreePeople(appState)
    const b = loadTreePeople(appState)
    expect(a).toBe(b)
    await a
    await loadTreePeople(appState)
    expect(apiGet).toHaveBeenCalledTimes(1)
    expect(apiGet.mock.calls[0][0]).toContain('tag_list')
    expect(apiGet.mock.calls[0][0]).not.toContain('rules=')
    await loadTreePeople({...appState, i18n: {lang: 'en'}})
    await loadTreePeople({...appState, dbInfo: {tree: {id: 'other'}}})
    await loadTreePeople(appState, true)
    expect(apiGet).toHaveBeenCalledTimes(4)
  })

  it('lỗi tải không bị giữ trong bộ nhớ đệm', async () => {
    const apiGet = vi
      .fn()
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValue({data: fixture()})
    const state = {apiGet}
    await expect(loadTreePeople(state)).rejects.toThrow('offline')
    expect((await loadTreePeople(state)).data).toHaveLength(10)
  })

  it('mặc định nhánh chính; chọn người từ nhánh chính chuyển sang hậu duệ trong cùng màn hình', () => {
    expect(DEFAULT_TREE_VIEW).toBe('main')
    expect(normalizeTreeView('ancestor')).toBe('main')
    expect(normalizeTreeView('relationship')).toBe('descendants')
    const view = document.createElement('grampsjs-view-tree')
    view._openBranch({detail: {grampsId: 'a'}})
    expect(view.view).toBe('descendants')
    expect(view.grampsId).toBe('a')
    view._handleViewChange({detail: {view: 'all'}})
    expect(view.view).toBe('all')
    expect(view.grampsId).toBe('a')
  })
})
