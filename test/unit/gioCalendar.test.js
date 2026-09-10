import {describe, it, expect} from 'vitest'
import {
  collectAnniversaries,
  groupByLunarMonth,
  groupByDay,
  buildMonthSections,
  upcomingEntries,
  matchesQuery,
  lunarMonthName,
  formatSolarShort,
  lunarMonthSpan,
  formatSolarSpan,
  lunarToday,
  formatSolarLong,
  formatLunarLong,
  buildCalendarMonth,
  lunarSpanLabel,
  calendarDays,
  buildGioIcs,
  foldIcsLine,
  escapeIcsText,
} from '../../src/gioCalendar.js'
import {lunarToSolar, solarToLunar} from '../../src/lunar.js'

// Dữ liệu giả, không phải người thật trong họ.
const people = [
  {
    gramps_id: 'I9001',
    profile: {name_surname: 'Bùi', name_given: 'Văn A'},
    attribute_list: [
      {type: 'Ngày giỗ', value: '21/5'},
      {type: 'Đời', value: '9'},
    ],
  },
  {
    gramps_id: 'I9002',
    profile: {name_surname: 'Bùi', name_given: 'Thị B, C'},
    attribute_list: [{type: 'Ngày giỗ', value: '2/1'}],
  },
  {
    gramps_id: 'I9003',
    profile: {name_surname: 'Bùi', name_given: 'Hỏng'},
    attribute_list: [{type: 'Ngày giỗ', value: 'không rõ'}],
  },
]

const from = new Date(2026, 8, 2) // 2/9/2026 dương

describe('collectAnniversaries', () => {
  it('bỏ qua ngày giỗ không đọc được và xếp theo ngày gần nhất', () => {
    const entries = collectAnniversaries(people, from)
    expect(entries.map(e => e.person.gramps_id)).toEqual(['I9002', 'I9001'])
    expect(entries[1].generation).toBe('9')
    expect(entries[1].name).toBe('Bùi Văn A')
  })

  it('nhóm theo tháng âm và năm âm', () => {
    const groups = groupByLunarMonth(collectAnniversaries(people, from))
    expect(groups.map(g => g.month)).toEqual([1, 5])
    expect(groups[0].lunarYear).toBe(2027)
  })
})

describe('tra theo tháng âm', () => {
  // Mốc 4/9/2026 dương là 24 tháng 7 năm Bính Ngọ (âm lịch 2026).
  const today = new Date(2026, 8, 4)
  const person = (id, gio, given) => ({
    gramps_id: id,
    profile: {name_surname: 'Bùi', name_given: given},
    attribute_list: [{type: 'Ngày giỗ', value: gio}],
  })
  const entries = collectAnniversaries(
    [
      person('I9101', '24/7', 'Văn Một'),
      person('I9102', '25/7', 'Văn Hai'),
      person('I9103', '25/7', 'Văn Ba'),
      person('I9104', '3/7', 'Văn Bốn'),
      person('I9105', '1/1', 'Văn Năm'),
      person('I9106', '12/12', 'Văn Sáu'),
    ],
    today
  )

  it('biết hôm nay là ngày âm nào và gọi tên tháng Giêng, tháng Chạp', () => {
    expect(lunarToday(today)).toEqual({day: 24, month: 7, year: 2026})
    expect(lunarMonthName(1)).toBe('Giêng')
    expect(lunarMonthName(12)).toBe('Chạp')
    expect(lunarMonthName(7)).toBe('7')
  })

  it('ghi thứ và ngày dương', () => {
    expect(formatSolarShort([4, 9, 2026])).toBe('T6 4/9')
    expect(formatSolarShort([6, 2, 2027])).toBe('T7 6/2')
  })

  it('tính khoảng ngày dương của một tháng âm', () => {
    // Tháng Chạp năm Bính Ngọ kết thúc ngay trước Tết Đinh Mùi 6/2/2027.
    const chap = lunarMonthSpan(12, 2026)
    expect(chap.first).toEqual(lunarToSolar(1, 12, 2026))
    expect(chap.last).toEqual([5, 2, 2027])
    const gieng = lunarMonthSpan(1, 2026)
    expect(gieng.first).toEqual([17, 2, 2026])
    const length =
      (new Date(2026, gieng.last[1] - 1, gieng.last[0]) -
        new Date(2026, 1, 17)) /
        86400000 +
      1
    expect([29, 30]).toContain(length)
    expect(formatSolarSpan([8, 1, 2027], [5, 2, 2027])).toBe('8/1 – 5/2/2027')
    expect(formatSolarSpan([9, 12, 2026], [7, 1, 2027])).toBe(
      '9/12/2026 – 7/1/2027'
    )
  })

  it('gom người giỗ cùng ngày vào một ô ngày', () => {
    const days = groupByDay(entries)
    expect(days[0]).toMatchObject({day: 24, month: 7, daysAway: 0})
    expect(days[1].entries.map(e => e.person.gramps_id)).toEqual([
      'I9103',
      'I9102',
    ])
  })

  it('chia mười hai tháng, tháng đang đứng để giỗ đã qua xuống dưới vạch năm sau', () => {
    const sections = buildMonthSections(entries, today)
    expect(sections).toHaveLength(12)
    expect(sections.map(s => s.entries.length)).toEqual([
      1, 0, 0, 0, 0, 0, 4, 0, 0, 0, 0, 1,
    ])
    const thang7 = sections[6]
    expect(thang7.current).toBe(true)
    expect(thang7.lunarYear).toBe(2026)
    expect(thang7.yearName).toBe('Bính Ngọ')
    expect(thang7.days.map(d => d.day)).toEqual([24, 25, 3])
    expect(thang7.nextYearFrom).toBe(2)
    // Tháng Giêng chỉ còn trong năm âm sau; tháng Chạp vẫn thuộc năm nay.
    expect(sections[0].lunarYear).toBe(2027)
    expect(sections[0].nextYearFrom).toBe(-1)
    expect(sections[11].lunarYear).toBe(2026)
    // Tháng trống vẫn biết mình thuộc năm nào.
    expect(sections[1].lunarYear).toBe(2027)
    expect(sections[8].lunarYear).toBe(2026)
  })

  it('lọc giỗ trong ba mươi ngày tới', () => {
    expect(upcomingEntries(entries, 30).map(e => e.person.gramps_id)).toEqual([
      'I9101',
      'I9103',
      'I9102',
    ])
  })

  it('khớp theo tên bỏ dấu hoặc theo ngày âm', () => {
    const [mot] = entries
    expect(matchesQuery(mot, 'van mot')).toBe(true)
    expect(matchesQuery(mot, 'MỘT')).toBe(true)
    expect(matchesQuery(mot, '24/7')).toBe(true)
    expect(matchesQuery(mot, '24/')).toBe(true)
    expect(matchesQuery(mot, '24')).toBe(true)
    expect(matchesQuery(mot, '4/7')).toBe(false)
    expect(matchesQuery(mot, '24/8')).toBe(false)
    expect(matchesQuery(mot, '')).toBe(true)
  })
})

describe('lịch âm dương theo tháng dương', () => {
  // Mốc 10/9/2026 dương là 30 tháng 7 năm Bính Ngọ; 11/9 là mùng 1 tháng 8.
  const today = new Date(2026, 8, 10)
  const person = (id, gio, given) => ({
    gramps_id: id,
    profile: {name_surname: 'Bùi', name_given: given},
    attribute_list: [{type: 'Ngày giỗ', value: gio}],
  })
  const entries = collectAnniversaries(
    [
      person('I9201', '30/7', 'Văn Một'),
      person('I9202', '1/8', 'Văn Hai'),
      person('I9203', '1/8', 'Văn Ba'),
      person('I9204', '29/8', 'Văn Bốn'),
      person('I9205', '30/8', 'Văn Năm'),
      person('I9206', '15/1', 'Văn Sáu'),
    ],
    today
  )

  it('ghi ngày dương và ngày âm dạng dài', () => {
    expect(formatSolarLong([10, 9, 2026])).toBe('Thứ năm, 10/9/2026')
    expect(formatLunarLong({day: 30, month: 7, year: 2026, leap: 0})).toBe(
      '30 tháng 7 năm Bính Ngọ'
    )
    expect(formatLunarLong({day: 1, month: 12, year: 2026, leap: 0})).toBe(
      '1 tháng Chạp năm Bính Ngọ'
    )
    expect(formatLunarLong({day: 3, month: 6, year: 2025, leap: 1})).toBe(
      '3 tháng 6 nhuận năm Ất Tỵ'
    )
  })

  it('lưới sáu tuần bắt đầu thứ hai, mỗi ô có ngày âm', () => {
    const cal = buildCalendarMonth(entries, 2026, 9, today)
    expect(cal.cells).toHaveLength(42)
    // 1/9/2026 là thứ ba nên ô đầu là thứ hai 31/8.
    expect(cal.cells[0].solar).toEqual([31, 8, 2026])
    expect(cal.cells[0].inMonth).toBe(false)
    expect(cal.cells[1]).toMatchObject({
      solar: [1, 9, 2026],
      inMonth: true,
      lunar: {day: 21, month: 7, year: 2026, leap: 0},
    })
    const cell10 = cal.cells.find(c => c.solar[0] === 10 && c.inMonth)
    expect(cell10.daysAway).toBe(0)
    expect(cell10.lunar).toEqual({day: 30, month: 7, year: 2026, leap: 0})
    expect(cal.cells.filter(c => c.inMonth)).toHaveLength(30)
    expect(cal.cells[41].daysAway).toBe(41 - 10)
  })

  it('đặt giỗ vào đúng ô theo ngày âm, kể cả tháng đã qua', () => {
    const cal = buildCalendarMonth(entries, 2026, 9, today)
    const ids = cell => cell.entries.map(e => e.person.gramps_id)
    const at = d => cal.cells.find(c => c.solar[0] === d && c.inMonth)
    expect(ids(at(10))).toEqual(['I9201'])
    expect(ids(at(11))).toEqual(['I9203', 'I9202'])
    expect(ids(at(12))).toEqual([])
    // Tháng 8 âm năm Bính Ngọ thiếu (29 ngày): giỗ 30/8 làm vào ngày 29/8.
    const [d29, m29, y29] = lunarToSolar(29, 8, 2026)
    expect(solarToLunar(d29 + 1, m29, y29)[0]).toBe(1)
    const oct = buildCalendarMonth(entries, y29, m29, today)
    const cell29 = oct.cells.find(c => c.solar[0] === d29 && c.solar[1] === m29)
    expect(ids(cell29)).toEqual(['I9204', 'I9205'])
    // Tháng đã qua vẫn tra được: rằm tháng Giêng 2026 là 3/3/2026.
    const march = buildCalendarMonth(entries, 2026, 3, today)
    const ram = march.cells.find(c => c.solar[0] === 3 && c.inMonth)
    expect(ram.lunar).toMatchObject({day: 15, month: 1})
    expect(ids(ram)).toEqual(['I9206'])
    expect(ram.daysAway).toBeLessThan(0)
  })

  it('không đặt giỗ vào tháng nhuận', () => {
    // Năm Ất Tỵ 2025 nhuận tháng 6: 6 nhuận bắt đầu 25/7/2025.
    const leapStart = lunarToSolar(1, 6, 2025, 1)
    expect(leapStart).not.toBeNull()
    const list = collectAnniversaries(
      [person('I9207', '1/6', 'Văn Bảy')],
      today
    )
    const cal = buildCalendarMonth(list, leapStart[2], leapStart[1], today)
    const cell = cal.cells.find(
      c => c.solar[0] === leapStart[0] && c.solar[1] === leapStart[1]
    )
    expect(cell.lunar.leap).toBe(1)
    expect(cell.entries).toEqual([])
    const main = lunarToSolar(1, 6, 2025, 0)
    const cal2 = buildCalendarMonth(list, main[2], main[1], today)
    const cell2 = cal2.cells.find(
      c => c.solar[0] === main[0] && c.solar[1] === main[1]
    )
    expect(cell2.entries.map(e => e.person.gramps_id)).toEqual(['I9207'])
  })

  it('gọi tên khoảng tháng âm của một tháng dương', () => {
    expect(lunarSpanLabel(buildCalendarMonth([], 2026, 9, today).cells)).toBe(
      'tháng 7 – 8 năm Bính Ngọ'
    )
    // Tháng 2/2027 có Tết Đinh Mùi ngày 6/2.
    expect(lunarSpanLabel(buildCalendarMonth([], 2027, 2, today).cells)).toBe(
      'tháng Chạp năm Bính Ngọ – tháng Giêng năm Đinh Mùi'
    )
    // Tháng 8/2025 nằm trọn trong tháng 6 nhuận và tháng 7 âm.
    expect(lunarSpanLabel(buildCalendarMonth([], 2025, 8, today).cells)).toBe(
      'tháng 6 nhuận – 7 năm Ất Tỵ'
    )
  })

  it('gom giỗ trong tháng dương thành ô ngày, giữ nhãn 30 của tháng thiếu', () => {
    const sept = calendarDays(buildCalendarMonth(entries, 2026, 9, today).cells)
    expect(sept.map(d => [d.day, d.month, d.entries.length])).toEqual([
      [30, 7, 1],
      [1, 8, 2],
    ])
    expect(sept[1].solar).toEqual([11, 9, 2026])
    expect(sept[1].daysAway).toBe(1)
    const [d29, m29, y29] = lunarToSolar(29, 8, 2026)
    const oct = calendarDays(buildCalendarMonth(entries, y29, m29, today).cells)
    expect(oct.map(d => [d.day, d.solar[0]])).toEqual([
      [29, d29],
      [30, d29],
    ])
  })
})

describe('buildGioIcs', () => {
  const ics = buildGioIcs(collectAnniversaries(people, from), {
    baseUrl: 'https://phahe.troly.me',
    stamp: new Date(Date.UTC(2026, 8, 2, 0, 0, 0)),
  })

  it('mỗi người một sự kiện cả ngày, đúng ngày dương', () => {
    expect(ics.match(/BEGIN:VEVENT/g)).toHaveLength(2)
    const [d, m, y] = lunarToSolar(21, 5, 2027, 0)
    const expected = `${y}${String(m).padStart(2, '0')}${String(d).padStart(
      2,
      '0'
    )}`
    expect(ics).toContain(`DTSTART;VALUE=DATE:${expected}`)
    expect(ics).toContain('UID:gio-I9001-2027@phahe.troly.me')
    expect(ics).toContain('URL:https://phahe.troly.me/person/I9001')
  })

  it('thoát dấu phẩy trong tên và có hai lời nhắc', () => {
    expect(ics).toContain('SUMMARY:Giỗ Bùi Thị B\\, C')
    expect(ics.match(/TRIGGER;VALUE=DURATION:-P7D/g)).toHaveLength(2)
    expect(ics.match(/TRIGGER;VALUE=DURATION:-P1D/g)).toHaveLength(2)
  })

  it('không dòng nào quá 75 byte và kết thúc bằng CRLF', () => {
    const encoder = new TextEncoder()
    ics.split('\r\n').forEach(line => {
      expect(encoder.encode(line).length).toBeLessThanOrEqual(75)
    })
    expect(ics.endsWith('END:VCALENDAR\r\n')).toBe(true)
  })
})

describe('foldIcsLine và escapeIcsText', () => {
  it('gấp theo byte, không cắt giữa một chữ có dấu', () => {
    const line = `DESCRIPTION:${'Giỗ cụ Bùi Hữu Ánh '.repeat(8)}`
    const folded = foldIcsLine(line)
    const parts = folded.split('\r\n')
    expect(parts.length).toBeGreaterThan(1)
    parts.slice(1).forEach(p => expect(p.startsWith(' ')).toBe(true))
    expect(folded.replace(/\r\n /g, '')).toBe(line)
  })

  it('thoát ký tự đặc biệt', () => {
    expect(escapeIcsText('a;b,c\nd\\e')).toBe('a\\;b\\,c\\nd\\\\e')
  })
})
