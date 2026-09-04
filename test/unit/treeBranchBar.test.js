import {afterEach, describe, expect, it, vi} from 'vitest'
import {
  branchForPerson,
  branchRoots,
} from '../../src/components/GrampsjsTreeBranchBar.js'
import '../../src/components/GrampsjsChartToolbar.js'

if (!HTMLElement.prototype.attachInternals) {
  Object.defineProperty(HTMLElement.prototype, 'attachInternals', {
    value: () => ({}),
  })
}

afterEach(() => document.body.replaceChildren())

// Dữ liệu giả: không dùng tên hay ngày thật của người trong họ.
const person = (grampsId, handle, tags, {father, gender = 1, doi} = {}) => ({
  gramps_id: grampsId,
  handle,
  gender,
  attribute_list: doi ? [{type: 'Đời', value: String(doi)}] : [],
  extended: {
    tags: tags.map(name => ({name})),
    primary_parent_family: father ? {father_handle: father} : null,
  },
})

describe('người đầu chi cho dải nút nhánh', () => {
  it('chọn người mang thẻ chi mà cha không mang thẻ, ưu tiên nam', () => {
    const people = [
      person('I0001', 'h1', ['Đời 4'], {doi: 4}),
      // Đầu chi và vợ cùng mang thẻ, cha mẹ vợ ở ngoài cây: chọn chồng.
      person('I0003', 'h3', ['Ngành 2 - Chi 1'], {father: 'h1', doi: 5}),
      person('I0002', 'h2', ['Ngành 2 - Chi 1'], {gender: 0, doi: 5}),
      person('I0004', 'h4', ['Ngành 2 - Chi 1'], {father: 'h3', doi: 6}),
      person('I0009', 'h9', ['Ngành 1'], {father: 'h1', doi: 5}),
      person('I0010', 'h10', ['Ngành 1'], {father: 'h9', doi: 6}),
    ]
    const roots = branchRoots(people)
    expect(roots.map(root => root.label)).toEqual([
      'Ngành 1',
      'Ngành 2 · Chi 1',
    ])
    expect(roots[0].grampsId).toBe('I0009')
    expect(roots[1].grampsId).toBe('I0003')
    expect(roots[1].count).toBe(3)
  })

  it('không có ai ngoài chi thì lấy đời nhỏ nhất rồi mã nhỏ nhất', () => {
    const people = [
      person('I0020', 'h20', ['Ngành 3 - Chi 2'], {father: 'h21', doi: 7}),
      person('I0021', 'h21', ['Ngành 3 - Chi 2'], {father: 'h20', doi: 6}),
    ]
    expect(branchRoots(people)[0].grampsId).toBe('I0021')
  })

  it('bỏ qua người không có thẻ ngành chi và xếp theo số', () => {
    const people = [
      person('I0030', 'h30', ['Ngành 3 - Chi 1']),
      person('I0031', 'h31', ['Cần soát lại']),
      person('I0032', 'h32', ['Ngành 2 - Chi 3']),
      person('I0033', 'h33', ['Ngành 2 - Chi 2']),
    ]
    expect(branchRoots(people).map(root => root.label)).toEqual([
      'Ngành 2 · Chi 2',
      'Ngành 2 · Chi 3',
      'Ngành 3 · Chi 1',
    ])
  })

  it('nhận ra chi hiện tại qua cha khi người con chưa có thẻ', () => {
    const people = [
      person('I0001', 'h1', ['Ngành 2 - Chi 1']),
      person('I0002', 'h2', [], {father: 'h1'}),
    ]
    expect(branchForPerson(people, 'I0002')).toEqual({branch: 2, sub: 1})
  })

  it('thu gọn các nhánh vào một nút biểu tượng và phát lựa chọn từ menu', async () => {
    const bar = document.createElement('grampsjs-tree-branch-bar')
    bar.homePerson = 'HOME'
    bar.view = 'main'
    document.body.append(bar)
    await bar.updateComplete
    bar._roots = [{label: 'Ngành 2 · Chi 1', grampsId: 'I0003', count: 3}]
    await bar.updateComplete

    expect(bar.renderRoot.querySelectorAll('md-icon-button')).toHaveLength(1)
    expect(bar.renderRoot.querySelectorAll('md-menu-item')).toHaveLength(3)
    expect(bar.renderRoot.textContent).toContain('Nhánh chính')
    expect(bar.renderRoot.textContent).toContain('Toàn gia phả')

    const onScope = vi.fn()
    bar.addEventListener('tree:scope', onScope)
    bar.renderRoot.querySelectorAll('md-menu-item')[1].click()

    expect(onScope.mock.calls[0][0].detail).toEqual({
      view: 'branch',
      grampsId: 'I0003',
    })
  })

  it('đặt bộ chọn nhánh đầu cột công cụ nhanh', async () => {
    const toolbar = document.createElement('grampsjs-chart-toolbar')
    toolbar.state = {view: 'main', appState: {}}
    document.body.append(toolbar)
    await toolbar.updateComplete

    const stack = toolbar.renderRoot.querySelector('.stack')
    expect(stack.firstElementChild.localName).toBe('grampsjs-tree-branch-bar')
    expect(toolbar.renderRoot.querySelector('#btn-overview')).not.toBeNull()
  })
})
