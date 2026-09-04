import {describe, expect, it} from 'vitest'
import {
  branchForPerson,
  branchRoots,
} from '../../src/components/GrampsjsTreeBranchBar.js'

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
})
