import {describe, expect, it} from 'vitest'
import {getFatherLine} from '../../src/charts/util.js'
import {tagNamesOf} from '../../src/tagNames.js'

// Tên trong đây là bịa.
describe('dòng "con ông" phân biệt người trùng tên', () => {
  it('ghép họ tên cha từ gia đình cha mẹ chính', () => {
    const person = {
      profile: {
        primary_parent_family: {
          father: {name_surname: 'Trần', name_given: 'Văn Mẫu'},
        },
      },
    }
    expect(getFatherLine(person)).toBe('con ông Trần Văn Mẫu')
  })

  it('trống khi không có cha trong cây (dâu, thủy tổ) hoặc thiếu profile', () => {
    expect(getFatherLine({profile: {primary_parent_family: {}}})).toBe('')
    expect(getFatherLine({profile: {}})).toBe('')
    expect(getFatherLine({})).toBe('')
    expect(getFatherLine(undefined)).toBe('')
  })

  it('cha chỉ có tên riêng hoặc chỉ có họ vẫn in được', () => {
    const only = given => ({
      profile: {primary_parent_family: {father: {name_given: given}}},
    })
    expect(getFatherLine(only('Mẫu'))).toBe('con ông Mẫu')
  })
})

describe('tên thẻ theo handle', () => {
  it('đổi danh sách handle thành tên, bỏ handle không có tên', () => {
    const names = new Map([
      ['h1', 'Đời 3'],
      ['h2', 'Ngành 2 - Chi 1'],
    ])
    expect(tagNamesOf({tag_list: ['h1', 'h2', 'h9']}, names)).toEqual([
      'Đời 3',
      'Ngành 2 - Chi 1',
    ])
    expect(tagNamesOf({tag_list: ['h1']}, undefined)).toEqual([])
    expect(tagNamesOf(undefined, names)).toEqual([])
  })
})
