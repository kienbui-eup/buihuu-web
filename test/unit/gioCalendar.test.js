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
  buildGioIcs,
  foldIcsLine,
  escapeIcsText,
} from '../../src/gioCalendar.js'
import {lunarToSolar} from '../../src/lunar.js'

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
