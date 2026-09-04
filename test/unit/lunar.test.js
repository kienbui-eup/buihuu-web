import {describe, it, expect} from 'vitest'
import {
  lunarToSolar,
  solarToLunar,
  parseLunarDayMonth,
  nextAnniversary,
  canChiYear,
} from '../../src/lunar.js'

describe('canChiYear', () => {
  it('gọi đúng tên can chi của các năm quen thuộc', () => {
    expect(canChiYear(1945)).toBe('Ất Dậu')
    expect(canChiYear(2024)).toBe('Giáp Thìn')
    expect(canChiYear(2026)).toBe('Bính Ngọ')
    expect(canChiYear(2027)).toBe('Đinh Mùi')
  })
})

describe('lunarToSolar', () => {
  // Ngày Tết là mốc dễ đối chiếu nhất: lịch nào in ra cũng có.
  it('đổi mùng 1 tháng Giêng thành đúng ngày Tết dương lịch', () => {
    expect(lunarToSolar(1, 1, 2024)).toEqual([10, 2, 2024])
    expect(lunarToSolar(1, 1, 2025)).toEqual([29, 1, 2025])
    expect(lunarToSolar(1, 1, 2026)).toEqual([17, 2, 2026])
    expect(lunarToSolar(1, 1, 2027)).toEqual([6, 2, 2027])
  })

  it('đổi ngày giỗ tổ Hùng Vương 10/3 âm', () => {
    expect(lunarToSolar(10, 3, 2025)).toEqual([7, 4, 2025])
    expect(lunarToSolar(10, 3, 2026)).toEqual([26, 4, 2026])
  })

  it('đổi rằm tháng Giêng', () => {
    expect(lunarToSolar(15, 1, 2025)).toEqual([12, 2, 2025])
  })
})

describe('solarToLunar', () => {
  it('đổi ngược ngày Quốc khánh 2/9/1945', () => {
    expect(solarToLunar(2, 9, 1945).slice(0, 3)).toEqual([26, 7, 1945])
  })

  it('khứ hồi giữ nguyên ngày', () => {
    const solar = lunarToSolar(21, 5, 2026)
    expect(solarToLunar(...solar).slice(0, 3)).toEqual([21, 5, 2026])
  })
})

describe('parseLunarDayMonth', () => {
  it('đọc dạng ngày/tháng dữ liệu nhập vào đang dùng', () => {
    expect(parseLunarDayMonth('21/5')).toEqual({day: 21, month: 5, leap: 0})
    expect(parseLunarDayMonth(' 3/12 ')).toEqual({day: 3, month: 12, leap: 0})
  })

  it('nhận biết tháng nhuận', () => {
    expect(parseLunarDayMonth('15/4 nhuận')).toEqual({
      day: 15,
      month: 4,
      leap: 1,
    })
  })

  it('trả null với chuỗi không đọc được', () => {
    expect(parseLunarDayMonth('bậy')).toBeNull()
    expect(parseLunarDayMonth('')).toBeNull()
    expect(parseLunarDayMonth('40/5')).toBeNull()
    expect(parseLunarDayMonth('5/13')).toBeNull()
    expect(parseLunarDayMonth(null)).toBeNull()
  })
})

describe('nextAnniversary', () => {
  const from = new Date(2026, 7, 27) // 27/08/2026

  it('trả ngày giỗ trong tương lai, khớp với phép đổi lịch', () => {
    const next = nextAnniversary(21, 5, from)
    expect(next).not.toBeNull()
    expect(next.daysAway).toBeGreaterThanOrEqual(0)
    expect(next.solar).toEqual(lunarToSolar(21, 5, next.lunarYear))
  })

  it('nhảy sang năm âm sau khi ngày trong năm nay đã qua', () => {
    // Mùng 1 Tết năm âm 2026 rơi vào 17/02/2026, đã qua so với mốc trên.
    expect(nextAnniversary(1, 1, from).solar).toEqual([6, 2, 2027])
  })

  it('ngày mai vẫn tính là sắp tới, không nhảy sang năm sau', () => {
    const [d, m, y] = lunarToSolar(21, 5, 2027)
    const dayBefore = new Date(y, m - 1, d - 1)
    expect(nextAnniversary(21, 5, dayBefore).daysAway).toBe(1)
  })
})
