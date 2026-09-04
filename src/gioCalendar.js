/*
Lịch giỗ: gom ngày giỗ của cả họ và xuất ra lịch iCalendar.

Người trong họ hỏi hai câu: "sắp tới giỗ ai" và "làm sao để điện thoại tự
nhắc". Câu đầu do collectAnniversaries trả lời, câu sau do buildGioIcs: một
file .ics chuẩn RFC 5545, mỗi người một sự kiện cả ngày vào lần giỗ kế tiếp,
kèm hai lời nhắc trước 7 ngày và 1 ngày như tập quán các trang dòng họ vẫn làm.

Không có gì ở đây chạm tới DOM, để test được bằng vitest thuần.
*/

import {
  parseLunarDayMonth,
  nextAnniversary,
  solarToLunar,
  lunarToSolar,
  canChiYear,
} from './lunar.js'
import {getAttributeValue, personProfileDisplayName} from './util.js'
import {ATTR_DEATH_ANNIVERSARY, ATTR_GENERATION} from './branding.js'
import {normalizeSearchText} from './pageSearch.js'

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

/* Tháng Giêng và tháng Chạp gọi theo tên, các tháng khác gọi theo số. */
export function lunarMonthName(month) {
  if (month === 1) return 'Giêng'
  if (month === 12) return 'Chạp'
  return String(month)
}

export const WEEKDAY_SHORT = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7']
export const WEEKDAY_LONG = [
  'Chủ nhật',
  'Thứ hai',
  'Thứ ba',
  'Thứ tư',
  'Thứ năm',
  'Thứ sáu',
  'Thứ bảy',
]

export function weekdayIndex([d, m, y]) {
  return new Date(y, m - 1, d).getDay()
}

/* "T6 4/9": thứ và ngày dương, không kèm năm vì năm ghi ở đầu mỗi tháng. */
export function formatSolarShort(solar) {
  const [d, m] = solar
  return `${WEEKDAY_SHORT[weekdayIndex(solar)]} ${d}/${m}`
}

/*
Khoảng ngày dương của một tháng âm: {first, last}. Tháng thiếu chỉ có 29 ngày,
nhận ra khi đổi ngược "ngày 30" không còn là ngày 30.
*/
export function lunarMonthSpan(month, lunarYear) {
  const first = lunarToSolar(1, month, lunarYear, 0)
  let last = lunarToSolar(30, month, lunarYear, 0)
  if (last === null || solarToLunar(...last)[0] !== 30) {
    last = lunarToSolar(29, month, lunarYear, 0)
  }
  return {first, last}
}

/* "8/1 – 5/2/2027", hoặc "9/12/2026 – 7/1/2027" khi hai đầu khác năm. */
export function formatSolarSpan(first, last) {
  const [d1, m1, y1] = first
  const [d2, m2, y2] = last
  const start = y1 === y2 ? `${d1}/${m1}` : `${d1}/${m1}/${y1}`
  return `${start} – ${d2}/${m2}/${y2}`
}

/* Ngày âm lịch hôm nay: {day, month, year}, dùng cho dòng "Hôm nay" và tab. */
export function lunarToday(from = new Date()) {
  const [day, month, year] = solarToLunar(
    from.getDate(),
    from.getMonth() + 1,
    from.getFullYear()
  )
  return {day, month, year}
}

/*
Gom những người giỗ cùng một ngày (cùng ngày âm, cùng năm âm của lần giỗ kế
tiếp) vào một nhóm để giao diện vẽ ô ngày một lần. Danh sách vào phải đã xếp
theo lần giỗ kế tiếp như collectAnniversaries trả về.
*/
export function groupByDay(entries) {
  const days = []
  entries.forEach(entry => {
    const last = days[days.length - 1]
    if (
      last &&
      last.day === entry.lunar.day &&
      last.month === entry.lunar.month &&
      last.lunarYear === entry.next.lunarYear
    ) {
      last.entries.push(entry)
    } else {
      days.push({
        day: entry.lunar.day,
        month: entry.lunar.month,
        lunarYear: entry.next.lunarYear,
        solar: entry.next.solar,
        daysAway: entry.next.daysAway,
        entries: [entry],
      })
    }
  })
  return days
}

/*
Mười hai mục theo tháng âm, mỗi mục gom theo ngày, để trang lịch giỗ mở từng
tháng như lật một cuốn lịch treo tường.

Trong tháng đang đứng, giỗ còn lại trong năm nay xếp trước; giỗ đã qua (lần tới
rơi vào năm âm sau) xếp sau, và nextYearFrom cho biết vị trí đổi năm để giao
diện kẻ một vạch. Các tháng khác chỉ nằm trong một năm âm nên nextYearFrom là -1.
*/
export function buildMonthSections(entries, from = new Date()) {
  const today = lunarToday(from)
  const sections = Array.from({length: 12}, (_, i) => ({
    month: i + 1,
    name: lunarMonthName(i + 1),
    current: i + 1 === today.month,
    entries: [],
  }))
  entries.forEach(entry => {
    sections[entry.lunar.month - 1].entries.push(entry)
  })
  sections.forEach(section => {
    section.entries.sort(
      (a, b) =>
        a.next.daysAway - b.next.daysAway || a.name.localeCompare(b.name, 'vi')
    )
    section.days = groupByDay(section.entries)
    section.lunarYear =
      section.days[0]?.lunarYear ??
      (section.month >= today.month ? today.year : today.year + 1)
    section.yearName = canChiYear(section.lunarYear)
    section.nextYearFrom = section.days.findIndex(
      day => day.lunarYear > section.lunarYear
    )
  })
  return sections
}

/* Giỗ trong `days` ngày tới, kể cả hôm nay; danh sách vào đã xếp theo ngày. */
export function upcomingEntries(entries, days = 30) {
  return entries.filter(entry => entry.next.daysAway <= days)
}

/*
Một dòng có khớp ô lọc không. Lọc theo tên bỏ dấu, hoặc theo ngày âm khi người
tra gõ số: "24/7" tìm mọi giỗ ngày 24 tháng 7, "24" tìm mọi giỗ ngày 24.
*/
export function matchesQuery(entry, query) {
  const q = normalizeSearchText(query ?? '')
  if (!q) return true
  if (/^\d{1,2}(\/\d{0,2})?$/.test(q)) {
    const [day, month] = q.split('/')
    if (Number(day) !== entry.lunar.day) return false
    return (
      month === undefined || month === '' || Number(month) === entry.lunar.month
    )
  }
  return normalizeSearchText(entry.name).includes(q)
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
