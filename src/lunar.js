/*
Chuyển đổi âm lịch - dương lịch cho múi giờ Việt Nam.

Phả hệ Việt ghi ngày giỗ theo âm lịch ("21/5" là ngày 21 tháng 5 âm), nên muốn
biết năm nay giỗ rơi vào ngày dương nào thì phải đổi lịch. Gramps không có khái
niệm âm lịch Việt Nam, và không có thư viện npm nào đủ nhỏ mà đúng cho lịch
Việt (lịch Việt lệch lịch Trung Quốc ở vài năm vì tính theo UTC+7), nên thuật
toán nằm ngay đây.

Thuật toán của Hồ Ngọc Đức, dựa trên tính toán thiên văn của Jean Meeus: tìm
ngày Sóc (trăng non) và kinh độ mặt trời để xác định tháng nhuận. Múi giờ cố
định +7, đúng với lịch in ở Việt Nam từ 1976 tới nay.
*/

const TIMEZONE = 7.0
const PI = Math.PI

/* Số ngày Julius của một ngày dương lịch (dd/mm/yyyy). */
export function jdFromDate(dd, mm, yy) {
  const a = Math.floor((14 - mm) / 12)
  const y = yy + 4800 - a
  const m = mm + 12 * a - 3
  let jd =
    dd +
    Math.floor((153 * m + 2) / 5) +
    365 * y +
    Math.floor(y / 4) -
    Math.floor(y / 100) +
    Math.floor(y / 400) -
    32045
  if (jd < 2299161) {
    jd =
      dd + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - 32083
  }
  return jd
}

/* Ngày dương lịch [dd, mm, yyyy] từ số ngày Julius. */
export function jdToDate(jd) {
  let a
  let b
  let c
  if (jd > 2299160) {
    a = jd + 32044
    b = Math.floor((4 * a + 3) / 146097)
    c = a - Math.floor((b * 146097) / 4)
  } else {
    b = 0
    c = jd + 32082
  }
  const d = Math.floor((4 * c + 3) / 1461)
  const e = c - Math.floor((1461 * d) / 4)
  const m = Math.floor((5 * e + 2) / 153)
  const day = e - Math.floor((153 * m + 2) / 5) + 1
  const month = m + 3 - 12 * Math.floor(m / 10)
  const year = b * 100 + d - 4800 + Math.floor(m / 10)
  return [day, month, year]
}

/*
Ngày Sóc thứ k kể từ điểm mốc 1900-01-01, làm tròn về ngày.

k = 0 ứng với kỳ trăng non ngày 1900-01-01. Công thức lấy từ Meeus, "Astronomical
Algorithms", chương 49, giữ tới bậc đủ cho lịch dùng hằng ngày.
*/
function newMoon(k) {
  const T = k / 1236.85
  const T2 = T * T
  const T3 = T2 * T
  const dr = PI / 180
  let Jd1 = 2415020.75933 + 29.53058868 * k + 0.0001178 * T2 - 0.000000155 * T3
  Jd1 += 0.00033 * Math.sin((166.56 + 132.87 * T - 0.009173 * T2) * dr)
  const M = 359.2242 + 29.10535608 * k - 0.0000333 * T2 - 0.00000347 * T3
  const Mpr = 306.0253 + 385.81691806 * k + 0.0107306 * T2 + 0.00001236 * T3
  const F = 21.2964 + 390.67050646 * k - 0.0016528 * T2 - 0.00000239 * T3
  let C1 =
    (0.1734 - 0.000393 * T) * Math.sin(M * dr) + 0.0021 * Math.sin(2 * dr * M)
  C1 -= 0.4068 * Math.sin(Mpr * dr) + 0.0161 * Math.sin(2 * dr * Mpr)
  C1 -= 0.0004 * Math.sin(3 * dr * Mpr)
  C1 += 0.0104 * Math.sin(2 * dr * F) - 0.0051 * Math.sin(dr * (M + Mpr))
  C1 -= 0.0074 * Math.sin(dr * (M - Mpr)) + 0.0004 * Math.sin(dr * (2 * F + M))
  C1 -=
    0.0004 * Math.sin(dr * (2 * F - M)) - 0.0006 * Math.sin(dr * (2 * F + Mpr))
  C1 +=
    0.001 * Math.sin(dr * (2 * F - Mpr)) + 0.0005 * Math.sin(dr * (2 * Mpr + M))
  let deltat
  if (T < -11) {
    deltat =
      0.001 +
      0.000839 * T +
      0.0002261 * T2 -
      0.00000845 * T3 -
      0.000000081 * T * T3
  } else {
    deltat = -0.000278 + 0.000265 * T + 0.000262 * T2
  }
  return Jd1 + C1 - deltat
}

/* Kinh độ mặt trời tại thời điểm jdn, tính theo cung 30 độ (0..11). */
function sunLongitude(jdn) {
  const T = (jdn - 2451545.0) / 36525
  const T2 = T * T
  const dr = PI / 180
  const M = 357.5291 + 35999.0503 * T - 0.0001559 * T2 - 0.00000048 * T * T2
  const L0 = 280.46645 + 36000.76983 * T + 0.0003032 * T2
  let DL = (1.9146 - 0.004817 * T - 0.000014 * T2) * Math.sin(dr * M)
  DL +=
    (0.019993 - 0.000101 * T) * Math.sin(dr * 2 * M) +
    0.00029 * Math.sin(dr * 3 * M)
  let L = L0 + DL
  L *= dr
  L -= PI * 2 * Math.floor(L / (PI * 2))
  return L
}

function getSunLongitude(dayNumber, timeZone) {
  return Math.floor((sunLongitude(dayNumber - 0.5 - timeZone / 24) / PI) * 6)
}

function getNewMoonDay(k, timeZone) {
  return Math.floor(newMoon(k) + 0.5 + timeZone / 24)
}

/* Ngày bắt đầu tháng 11 âm lịch của năm dương yy (tháng chứa Đông chí). */
function getLunarMonth11(yy, timeZone) {
  const off = jdFromDate(31, 12, yy) - 2415021
  const k = Math.floor(off / 29.530588853)
  let nm = getNewMoonDay(k, timeZone)
  const sunLong = getSunLongitude(nm, timeZone)
  if (sunLong >= 9) {
    nm = getNewMoonDay(k - 1, timeZone)
  }
  return nm
}

/* Khoảng cách (số tháng) từ tháng 11 tới tháng nhuận, nếu năm đó nhuận. */
function getLeapMonthOffset(a11, timeZone) {
  const k = Math.floor((a11 - 2415021.076998695) / 29.530588853 + 0.5)
  let last
  let i = 1
  let arc = getSunLongitude(getNewMoonDay(k + i, timeZone), timeZone)
  do {
    last = arc
    i += 1
    arc = getSunLongitude(getNewMoonDay(k + i, timeZone), timeZone)
  } while (arc !== last && i < 14)
  return i - 1
}

/*
Đổi ngày dương sang âm.

Trả về [ngày, tháng, năm, nhuận] với `nhuận` là 1 khi đó là tháng nhuận.
*/
export function solarToLunar(dd, mm, yy, timeZone = TIMEZONE) {
  const dayNumber = jdFromDate(dd, mm, yy)
  const k = Math.floor((dayNumber - 2415021.076998695) / 29.530588853)
  let monthStart = getNewMoonDay(k + 1, timeZone)
  if (monthStart > dayNumber) {
    monthStart = getNewMoonDay(k, timeZone)
  }
  let a11 = getLunarMonth11(yy, timeZone)
  let b11 = a11
  let lunarYear
  if (a11 >= monthStart) {
    lunarYear = yy
    a11 = getLunarMonth11(yy - 1, timeZone)
  } else {
    lunarYear = yy + 1
    b11 = getLunarMonth11(yy + 1, timeZone)
  }
  const lunarDay = dayNumber - monthStart + 1
  const diff = Math.floor((monthStart - a11) / 29)
  let lunarLeap = 0
  let lunarMonth = diff + 11
  if (b11 - a11 > 365) {
    const leapMonthDiff = getLeapMonthOffset(a11, timeZone)
    if (diff >= leapMonthDiff) {
      lunarMonth = diff + 10
      if (diff === leapMonthDiff) {
        lunarLeap = 1
      }
    }
  }
  if (lunarMonth > 12) {
    lunarMonth -= 12
  }
  if (lunarMonth >= 11 && diff < 4) {
    lunarYear -= 1
  }
  return [lunarDay, lunarMonth, lunarYear, lunarLeap]
}

/*
Đổi ngày âm sang dương.

`lunarLeap` = 1 khi ngày đó thuộc tháng nhuận. Trả về [ngày, tháng, năm] dương,
hoặc null nếu năm âm đó không có tháng nhuận như yêu cầu.
*/
export function lunarToSolar(
  lunarDay,
  lunarMonth,
  lunarYear,
  lunarLeap = 0,
  timeZone = TIMEZONE
) {
  let a11
  let b11
  if (lunarMonth < 11) {
    a11 = getLunarMonth11(lunarYear - 1, timeZone)
    b11 = getLunarMonth11(lunarYear, timeZone)
  } else {
    a11 = getLunarMonth11(lunarYear, timeZone)
    b11 = getLunarMonth11(lunarYear + 1, timeZone)
  }
  let off = lunarMonth - 11
  if (off < 0) {
    off += 12
  }
  if (b11 - a11 > 365) {
    const leapOff = getLeapMonthOffset(a11, timeZone)
    let leapMonth = leapOff - 2
    if (leapMonth < 0) {
      leapMonth += 12
    }
    if (lunarLeap !== 0 && lunarMonth !== leapMonth) {
      return null
    }
    if (lunarLeap !== 0 || off >= leapOff) {
      off += 1
    }
  }
  const k = Math.floor(0.5 + (a11 - 2415021.076998695) / 29.530588853)
  const monthStart = getNewMoonDay(k + off, timeZone)
  return jdToDate(monthStart + lunarDay - 1)
}

/*
Đọc chuỗi ngày giỗ dạng "21/5" hoặc "21/5 nhuận".

Dữ liệu nhập vào chỉ ghi ngày và tháng âm, không ghi năm — giỗ lặp lại hằng năm.
Trả về {day, month, leap} hoặc null khi chuỗi không đọc được.
*/
export function parseLunarDayMonth(value) {
  if (!value) return null
  const text = String(value).trim()
  const match = text.match(/^(\d{1,2})\s*[/-]\s*(\d{1,2})(.*)$/)
  if (!match) return null
  const day = parseInt(match[1], 10)
  const month = parseInt(match[2], 10)
  if (day < 1 || day > 30 || month < 1 || month > 12) return null
  const leap = /nhu[âậ]n/i.test(match[3] || '') ? 1 : 0
  return {day, month, leap}
}

/*
Lần giỗ kế tiếp tính từ một ngày dương cho trước.

Thử năm âm hiện tại trước; nếu ngày đó đã qua thì lấy năm sau. Ngày âm 30 không
tồn tại trong tháng thiếu, khi đó lùi về ngày 29 — đúng với tập quán làm giỗ.
*/
export function nextAnniversary(lunarDay, lunarMonth, from = new Date()) {
  const dd = from.getDate()
  const mm = from.getMonth() + 1
  const yy = from.getFullYear()
  const [, , currentLunarYear] = solarToLunar(dd, mm, yy)
  const todayJd = jdFromDate(dd, mm, yy)
  for (let i = 0; i < 3; i += 1) {
    const year = currentLunarYear + i
    let solar = lunarToSolar(lunarDay, lunarMonth, year, 0)
    if (solar === null && lunarDay === 30) {
      solar = lunarToSolar(29, lunarMonth, year, 0)
    }
    if (solar === null) {
      // eslint-disable-next-line no-continue
      continue
    }
    const [sd, sm, sy] = solar
    // Ngày 30 của một tháng thiếu bị đẩy sang mùng 1 tháng sau; kéo lại ngày 29.
    const [backDay] = solarToLunar(sd, sm, sy)
    if (backDay !== lunarDay) {
      const fallback = lunarToSolar(lunarDay - 1, lunarMonth, year, 0)
      if (fallback !== null) {
        const jd = jdFromDate(fallback[0], fallback[1], fallback[2])
        if (jd >= todayJd) {
          return {solar: fallback, lunarYear: year, daysAway: jd - todayJd}
        }
        // eslint-disable-next-line no-continue
        continue
      }
    }
    const jd = jdFromDate(sd, sm, sy)
    if (jd >= todayJd) {
      return {solar, lunarYear: year, daysAway: jd - todayJd}
    }
  }
  return null
}
