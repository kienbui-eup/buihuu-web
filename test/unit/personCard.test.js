import {describe, it, expect} from 'vitest'
import {
  getCourtesyName,
  getLifeSpan,
  getLineage,
  personCardLines,
} from '../../src/charts/util.js'

// Dữ liệu lấy nguyên từ bản .gramps do phahe-import sinh ra: cụ Bùi Ánh, đời 7,
// tự Pháp Độ, chi phái 1, giỗ mùng 4 tháng 3 âm lịch.
const buiAnh = {
  gramps_id: 'I0028',
  primary_name: {first_name: 'Ánh', surname_list: [{surname: 'Bùi'}]},
  alternate_names: [
    {type: 'Tự', first_name: 'Pháp Độ'},
    {type: 'Tên trong bảng đối chiếu', first_name: 'Pháp Độ'},
  ],
  attribute_list: [
    {type: 'Đời', value: '7'},
    {type: 'Ngôi vị', value: 'Chi phái 1'},
    {type: 'Ngày giỗ', value: '4/3'},
    {type: 'Độ tin cậy', value: 'cao'},
  ],
  profile: {
    name_given: 'Ánh',
    name_surname: 'Bùi',
    death: {date: 'Giỗ ngày 4 tháng 3 âm lịch'},
  },
}

describe('getCourtesyName', () => {
  it('đọc tên tự', () => {
    expect(getCourtesyName(buiAnh)).toBe('tự Pháp Độ')
  })

  it('ưu tiên húy vì đó là tên thật', () => {
    const person = {
      alternate_names: [
        {type: 'Tự', first_name: 'Pháp Chính'},
        {type: 'Húy', first_name: 'Hàn'},
      ],
    }
    expect(getCourtesyName(person)).toBe('húy Hàn')
  })

  it('bỏ qua tên trùng với tên chính, không lặp lại một cái tên', () => {
    const person = {
      primary_name: {first_name: 'Pháp Hiền'},
      alternate_names: [{type: 'Tự', first_name: 'Pháp Hiền'}],
    }
    expect(getCourtesyName(person)).toBe('')
  })

  it('đọc được cả khi loại tên về dạng đối tượng', () => {
    const person = {
      alternate_names: [{type: {string: 'Hiệu'}, first_name: 'Hưng Thái'}],
    }
    expect(getCourtesyName(person)).toBe('hiệu Hưng Thái')
  })

  it('không có tên chữ thì trả chuỗi rỗng', () => {
    expect(getCourtesyName({})).toBe('')
  })
})

describe('getLineage', () => {
  it('ghép đời với ngôi vị', () => {
    expect(getLineage(buiAnh)).toBe('Đời 7 · Chi phái 1')
  })

  it('bỏ ngôi vị dạng mã số vì nó chỉ có nghĩa trong sổ chi', () => {
    const person = {
      attribute_list: [
        {type: 'Đời', value: '12'},
        {type: 'Ngôi vị', value: '3.4.1.1'},
      ],
    }
    expect(getLineage(person)).toBe('Đời 12')
  })

  it('thay chỗ trống của chi bằng dòng trưởng', () => {
    const person = {
      attribute_list: [
        {type: 'Đời', value: '13'},
        {type: 'Dòng trưởng', value: 'N2C2'},
      ],
    }
    expect(getLineage(person)).toBe('Đời 13 · Dòng trưởng')
  })

  it('có tên chi thì ưu tiên tên chi, không nhồi cả hai vào một dòng', () => {
    const person = {
      attribute_list: [
        {type: 'Đời', value: '7'},
        {type: 'Ngôi vị', value: 'Chi phái 1'},
        {type: 'Dòng trưởng', value: 'N2C2'},
      ],
    }
    expect(getLineage(person)).toBe('Đời 7 · Chi phái 1')
  })

  it('không có đời thì không dựng dòng trống', () => {
    expect(getLineage({})).toBe('')
  })
})

describe('getLifeSpan', () => {
  it('ưu tiên ngày giỗ âm lịch', () => {
    expect(getLifeSpan(buiAnh, buiAnh.profile)).toBe('Giỗ 4/3 ÂL')
  })

  it('có cả năm sinh lẫn năm mất thì ghi khoảng đời', () => {
    const profile = {birth: {date: '1938'}, death: {date: '27/4/2014'}}
    expect(getLifeSpan({}, profile)).toBe('1938 - 2014')
  })

  it('chỉ có năm sinh', () => {
    expect(getLifeSpan({}, {birth: {date: '1986'}})).toBe('Sinh 1986')
  })

  it('không có năm nào thì rút gọn ngày giỗ chép trong sự kiện', () => {
    const profile = {death: {date: 'Giỗ ngày 15 tháng 12 âm lịch'}}
    expect(getLifeSpan({}, profile)).toBe('Giỗ 15 tháng 12 âm lịch')
  })

  it('không có gì thì trả chuỗi rỗng', () => {
    expect(getLifeSpan({}, {})).toBe('')
  })
})

describe('personCardLines', () => {
  it('dựng đủ bốn dòng theo lối gia phả Việt', () => {
    const lines = personCardLines(buiAnh, buiAnh.profile, 'Bùi Ánh')
    expect(lines.map(line => line.text)).toEqual([
      'Bùi Ánh',
      'tự Pháp Độ',
      'Đời 7 · Chi phái 1',
      'Giỗ 4/3 ÂL',
    ])
  })

  it('dòng họ tên đậm hơn các dòng còn lại', () => {
    const [name, ...rest] = personCardLines(buiAnh, buiAnh.profile, 'Bùi Ánh')
    expect(rest.every(line => Number(line.weight) < Number(name.weight))).toBe(
      true
    )
    expect(name.muted).toBe(false)
    expect(rest.every(line => line.muted)).toBe(true)
  })

  it('bỏ hẳn dòng không có dữ liệu thay vì để trống', () => {
    const person = {attribute_list: [{type: 'Đời', value: '15'}]}
    const lines = personCardLines(person, {}, 'Bùi Hữu Cường')
    expect(lines.map(line => line.text)).toEqual(['Bùi Hữu Cường', 'Đời 15'])
  })

  it('không quá bốn dòng', () => {
    const lines = personCardLines(buiAnh, buiAnh.profile, 'Bùi Ánh')
    expect(lines.length).toBeLessThanOrEqual(4)
  })
})
