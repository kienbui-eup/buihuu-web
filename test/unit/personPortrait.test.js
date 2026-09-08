import {describe, expect, it} from 'vitest'
import {
  getPersonPortrait,
  generationPortrait,
} from '../../src/charts/personPortrait.js'
import {getPortraitAge, getPortraitAgeGroup} from '../../src/charts/util.js'

const person = (generation, gender = 1) => ({
  gender,
  attribute_list: [{type: 'Đời', value: String(generation)}],
})

describe('chân dung minh họa cho 17 đời', () => {
  it('có một cặp ảnh riêng cho từng đời khi hồ sơ chưa có năm sinh', () => {
    const paths = []
    for (let generation = 1; generation <= 17; generation += 1) {
      for (const gender of [0, 1]) {
        const path = getPersonPortrait(person(generation, gender), {}, 2026)
        expect(path).toBe(
          generationPortrait(generation, gender === 0 ? 'female' : 'male')
        )
        paths.push(path)
      }
    }
    expect(new Set(paths).size).toBe(34)
  })
  it('đời 17 thiếu năm sinh dùng trẻ nhỏ theo mốc khoảng 2020', () => {
    const data = person(17)
    expect(getPortraitAge(data, {}, 2026)).toBe(6)
    expect(getPortraitAgeGroup(data, {}, 2026)).toBe('child')
    expect(getPersonPortrait(data, {}, 2026)).toContain('doi-17-nam')
    expect(data).toEqual(person(17))
  })
  it.each(['2018', '2020', '2022'])('năm sinh %s dùng mẫu trẻ nhỏ', year => {
    expect(
      getPersonPortrait(person(17, 0), {birth: {date: year}}, 2026)
    ).toContain('doi-17-nu')
  })
  it('ưu tiên năm sinh thực tế dù số đời gợi nhóm tuổi khác', () => {
    expect(
      getPersonPortrait(person(17), {birth: {date: '1986'}}, 2026)
    ).toContain('doi-15-nam')
    expect(
      getPersonPortrait(person(14, 0), {birth: {date: '2020'}}, 2026)
    ).toContain('doi-17-nu')
    expect(
      getPersonPortrait(person(16), {birth: {date: '2010'}}, 2026)
    ).toContain('thieu-nien-nam')
  })
  it('tính tuổi đến năm mất thay vì tiếp tục làm già chân dung', () => {
    expect(
      getPersonPortrait(
        person(15),
        {birth: {date: '2002'}, death: {date: '2010'}},
        2026
      )
    ).toContain('doi-17-nam')
    expect(
      getPortraitAge(
        person(15),
        {birth: {date: '2002'}, death: {date: 'Giỗ ngày 4 tháng 3 âm lịch'}},
        2026
      )
    ).toBeNull()
  })
  it('mốc 2020 của đời 17 không giữ hình trẻ nhỏ mãi về sau', () => {
    expect(getPersonPortrait(person(17), {}, 2045)).toContain('doi-16-nam')
  })
  it('giữ biểu tượng trung tính khi chưa rõ giới tính', () => {
    expect(getPersonPortrait(person(17, 2), {}, 2026)).toBe('')
    expect(getPersonPortrait({}, {}, 2026)).toBe('')
  })
  it('xử lý đời thiếu hoặc ngoài phạm vi mà không tạo URL hỏng', () => {
    for (const generation of [0, -1, 18, 'không rõ', 1.5]) {
      expect(getPersonPortrait(person(generation), {}, 2026)).toContain(
        'doi-15-nam'
      )
    }
  })
})
