/*
Lịch giỗ: gom ngày giỗ của cả họ và xuất ra lịch iCalendar.

Người trong họ hỏi hai câu: "sắp tới giỗ ai" và "làm sao để điện thoại tự
nhắc". Câu đầu do collectAnniversaries trả lời, câu sau do buildGioIcs: một
file .ics chuẩn RFC 5545, mỗi người một sự kiện cả ngày vào lần giỗ kế tiếp,
kèm hai lời nhắc trước 7 ngày và 1 ngày như tập quán các trang dòng họ vẫn làm.

Không có gì ở đây chạm tới DOM, để test được bằng vitest thuần.
*/

import {parseLunarDayMonth, nextAnniversary} from './lunar.js'
import {getAttributeValue, personProfileDisplayName} from './util.js'
import {ATTR_DEATH_ANNIVERSARY, ATTR_GENERATION} from './branding.js'

/*
Người có ngày giỗ đọc được, kèm lần giỗ kế tiếp, xếp theo gần nhất.

Một ngày giỗ ghi sai định dạng thì bỏ qua lặng lẽ: dữ liệu chép tay luôn có vài
ô lệch chuẩn, và một dòng hỏng không đáng làm hỏng cả danh sách.
*/
export function collectAnniversaries(people, from = new Date()) {
  return (people ?? [])
    .map(person => {
      const lunar = parseLunarDayMonth(
        getAttributeValue(person, ATTR_DEATH_ANNIVERSARY)
      )
      if (lunar === null) return null
      const next = nextAnniversary(lunar.day, lunar.month, from)
      if (next === null) return null
      return {
        person,
        lunar,
        next,
        name: personProfileDisplayName(person.profile),
        generation: getAttributeValue(person, ATTR_GENERATION),
      }
    })
    .filter(Boolean)
    .sort(
      (a, b) =>
        a.next.daysAway - b.next.daysAway || a.name.localeCompare(b.name, 'vi')
    )
}

/*
Chia danh sách đã xếp theo ngày thành từng tháng âm lịch liên tiếp, bắt đầu từ
tháng đang đứng. Cùng tháng âm nhưng khác năm âm (đầu năm sau) thì là nhóm khác.
*/
export function groupByLunarMonth(entries) {
  const groups = []
  entries.forEach(entry => {
    const last = groups[groups.length - 1]
    if (
      last &&
      last.month === entry.lunar.month &&
      last.lunarYear === entry.next.lunarYear
    ) {
      last.entries.push(entry)
    } else {
      groups.push({
        month: entry.lunar.month,
        lunarYear: entry.next.lunarYear,
        entries: [entry],
      })
    }
  })
  return groups
}

const pad = n => String(n).padStart(2, '0')

const icsDate = ([d, m, y]) => `${y}${pad(m)}${pad(d)}`

function nextDay([d, m, y]) {
  const dt = new Date(Date.UTC(y, m - 1, d + 1))
  return [dt.getUTCDate(), dt.getUTCMonth() + 1, dt.getUTCFullYear()]
}

export function escapeIcsText(value) {
  return String(value ?? '')
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n')
}

/*
Gấp dòng dài quá 75 byte theo RFC 5545: dòng nối bắt đầu bằng một dấu cách.
Đếm theo byte UTF-8 chứ không theo ký tự, vì tên tiếng Việt có dấu tốn 2-3 byte
mỗi chữ.
*/
export function foldIcsLine(line) {
  const encoder = new TextEncoder()
  if (encoder.encode(line).length <= 75) return line
  const parts = []
  let current = ''
  let length = 0
  Array.from(line).forEach(char => {
    const size = encoder.encode(char).length
    if (length + size > 75) {
      parts.push(current)
      current = ` ${char}`
      length = 1 + size
    } else {
      current += char
      length += size
    }
  })
  parts.push(current)
  return parts.join('\r\n')
}

/*
Dựng file iCalendar từ danh sách collectAnniversaries trả về.

baseUrl là gốc của trang (https://phahe.troly.me) để mỗi sự kiện dẫn thẳng tới
trang người đó. UID gắn với mã người và năm âm nên nạp lại file năm sau không
sinh sự kiện trùng.
*/
export function buildGioIcs(
  entries,
  {
    baseUrl = '',
    calendarName = 'Lịch giỗ',
    domain = 'phahe.troly.me',
    stamp = new Date(),
  } = {}
) {
  const dtstamp = stamp
    .toISOString()
    .replace(/[-:]/g, '')
    .replace(/\.\d{3}/, '')
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Phả hệ Bùi Hữu//Lịch giỗ//VI',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${escapeIcsText(calendarName)}`,
    'X-WR-TIMEZONE:Asia/Ho_Chi_Minh',
  ]
  const alarms = [
    ['-P7D', 'còn 7 ngày'],
    ['-P1D', 'ngày mai'],
  ]
  entries.forEach(({person, lunar, next, name, generation}) => {
    const url = baseUrl ? `${baseUrl}/person/${person.gramps_id}` : ''
    const description = [
      `Giỗ ${lunar.day}/${lunar.month} âm lịch`,
      generation ? `Đời ${generation}` : '',
      url,
    ]
      .filter(Boolean)
      .join('\n')
    lines.push(
      'BEGIN:VEVENT',
      `UID:gio-${person.gramps_id}-${next.lunarYear}@${domain}`,
      `DTSTAMP:${dtstamp}`,
      `DTSTART;VALUE=DATE:${icsDate(next.solar)}`,
      `DTEND;VALUE=DATE:${icsDate(nextDay(next.solar))}`,
      `SUMMARY:${escapeIcsText(`Giỗ ${name}`)}`,
      `DESCRIPTION:${escapeIcsText(description)}`
    )
    if (url) lines.push(`URL:${url}`)
    lines.push('TRANSP:TRANSPARENT')
    alarms.forEach(([trigger, when]) => {
      lines.push(
        'BEGIN:VALARM',
        'ACTION:DISPLAY',
        `TRIGGER;VALUE=DURATION:${trigger}`,
        `DESCRIPTION:${escapeIcsText(`Giỗ ${name}, ${when}`)}`,
        'END:VALARM'
      )
    })
    lines.push('END:VEVENT')
  })
  lines.push('END:VCALENDAR')
  return `${lines.map(foldIcsLine).join('\r\n')}\r\n`
}
