import {describe, expect, it, vi} from 'vitest'
import {LineageIndex} from '../../src/charts/lineage.js'
import '../../src/views/GrampsjsViewTreeChart.js'
import {getTreeViewTabIndex, TREE_VIEWS} from '../../src/treeDefaults.js'

function fixture() {
  const people = ['root', 'main', 'side', 'deep', 'leaf', 'outside'].map(
    handle => ({
      handle,
      gramps_id: handle,
      profile: {name_given: `Người mẫu ${handle}`, name_surname: ''},
      attribute_list:
        handle === 'deep' ? [{type: 'Dòng trưởng', value: 'Chi mẫu'}] : [],
      extended: {families: []},
    })
  )
  const byId = Object.fromEntries(people.map(p => [p.handle, p]))
  const family = (father, children) => {
    byId[father].extended.families = [
      {
        father_handle: father,
        child_ref_list: children.map(ref => ({ref, frel: 'Birth'})),
      },
    ]
    children.forEach(child => {
      byId[child].extended.primary_parent_family = {father_handle: father}
    })
  }
  family('root', ['main', 'side'])
  family('main', ['deep'])
  family('side', ['leaf'])
  return people
}

const ids = tree =>
  tree ? [tree.person.handle, ...tree.children.flatMap(ids)] : []

describe('cây dòng trưởng', () => {
  it('giữ đủ đường nối qua người không có nhãn, ẩn nhánh phụ', () => {
    const index = new LineageIndex(fixture())
    const tree = index.tree('root', new Set())
    expect(ids(tree)).toEqual(['root', 'main', 'deep'])
    expect(tree.hiddenCount).toBe(1)
  })

  it('mở và thu nhánh con tại chỗ, không thay gốc hoặc mất dòng trưởng', () => {
    const index = new LineageIndex(fixture())
    expect(ids(index.tree('root', new Set(['root'])))).toEqual([
      'root',
      'main',
      'deep',
      'side',
    ])
    expect(ids(index.tree('root', new Set(['root', 'side'])))).toContain('leaf')
    expect(ids(index.tree('root', new Set()))).toEqual(['root', 'main', 'deep'])
  })

  it('tìm người ẩn trả đường mở nhánh và giữ gốc chung', () => {
    const index = new LineageIndex(fixture())
    const root = index.root('root', 'leaf')
    expect(root).toBe('root')
    const path = index.path(root, index.ids.get('leaf'))
    expect(path).toEqual(['root', 'side', 'leaf'])
    expect(ids(index.tree(root, new Set(path.slice(0, -1))))).toContain('leaf')
    expect(index.root('root', 'outside')).toBe('outside')
  })

  it('không suy trưởng nam từ thứ tự người hay tự nối sai quan hệ', () => {
    const data = fixture().map(p => ({...p, attribute_list: []}))
    const index = new LineageIndex(data)
    expect(ids(index.tree('root', new Set()))).toEqual(['root'])
    expect(ids(index.tree('root', new Set(['root'])))).toEqual([
      'root',
      'main',
      'side',
    ])
  })

  it('không cắt đời sâu và không lặp vô hạn nếu dữ liệu có vòng', () => {
    const people = Array.from({length: 30}, (_, i) => ({
      handle: `p${i}`,
      gramps_id: `p${i}`,
      attribute_list: i === 29 ? [{type: 'Dòng trưởng', value: 'Chi mẫu'}] : [],
      extended: {
        families: [
          {
            father_handle: `p${i}`,
            child_ref_list: [{ref: `p${(i + 1) % 30}`, frel: 'Birth'}],
          },
        ],
      },
    }))
    const index = new LineageIndex(people)
    expect(ids(index.tree('p0', new Set()))).toHaveLength(30)
    expect(index.path('p0', 'missing')).toEqual([])
  })
})

describe('tải nhanh toàn bộ đời và bỏ tab cũ', () => {
  it('chọn người khác không tải lại, dữ liệu thay đổi mới tải lại', async () => {
    const view = document.createElement('grampsjs-view-tree-chart')
    const apiGet = vi.fn().mockResolvedValue({data: fixture()})
    view.appState = {apiGet, i18n: {lang: 'vi', strings: {}}}
    await view._fetchData('root')
    await view._fetchData('leaf')
    expect(apiGet).toHaveBeenCalledTimes(1)
    expect(apiGet.mock.calls[0][0]).not.toContain('page=')
    expect(apiGet.mock.calls[0][0]).not.toContain('rules=')
    view.handleUpdateStaleData()
    expect(apiGet).toHaveBeenCalledTimes(2)
  })

  it('gộp yêu cầu đang chờ, ngăn phản hồi cũ ghi đè lần làm mới', async () => {
    const view = document.createElement('grampsjs-view-tree-chart')
    const pending = []
    const apiGet = vi.fn(() => new Promise(resolve => pending.push(resolve)))
    view.appState = {apiGet, i18n: {lang: 'vi', strings: {}}}
    const first = view._fetchData('root')
    await view._fetchData('leaf')
    expect(apiGet).toHaveBeenCalledTimes(1)
    const refreshed = view._fetchData('root', true)
    pending[1]({data: fixture()})
    await refreshed
    pending[0]({data: []})
    await first
    expect(view._data).toHaveLength(6)
  })

  it('gộp thành bốn chế độ trong một màn hình gia phả', () => {
    expect(TREE_VIEWS).toEqual(['main', 'descendants', 'branch', 'all'])
    for (const old of ['ancestor', 'hourglass', 'fan'])
      expect(getTreeViewTabIndex(old)).toBe(0)
    expect(getTreeViewTabIndex('relationship')).toBe(1)
    expect(getTreeViewTabIndex('descendant')).toBe(1)
  })
})
