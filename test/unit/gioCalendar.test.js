import {describe, it, expect} from 'vitest'
import {
  collectAnniversaries,
  groupByLunarMonth,
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
