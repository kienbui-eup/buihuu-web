// Utility functions for d3.js charts.

import {range} from 'd3-array'
import {select} from 'd3-selection'
import {scaleSequential} from 'd3-scale'
import {interpolateWarm} from 'd3-scale-chromatic'
import {getThumbnailUrl, getThumbnailUrlCropped} from '../api.js'
import {normalizeRect} from '../util.js'

export const getPerson = (data, handle) =>
  data.find(person => person.handle === handle) || {}

export const getPersonByGrampsId = (data, grampsId) =>
  data.find(person => person.gramps_id === grampsId) || {}

export const getImageUrl = (person, size, square = true) => {
  if (!person.media_list || person.media_list.length === 0) {
    return ''
  }
  const [mediaRef] = person.media_list
  const rect = normalizeRect(mediaRef.rect)
  if (!rect) {
    return getThumbnailUrl(mediaRef.ref, size, square)
  }
  return getThumbnailUrlCropped(mediaRef.ref, rect, size, square)
}

export const getTree = (
  data,
  handle,
  depth,
  includeEmpty = true,
  i = 0,
  label = 'p'
) => {
  if (depth === 0) {
    return {}
  }
  const person = getPerson(data, handle)
  const tree = {
    name_given: person?.profile ? person?.profile?.name_given : null,
    name_surname: person?.profile ? person?.profile?.name_surname : null,
    id: label,
    depth: i,
    person,
  }
  if (depth === 1) {
    return tree
  }
  const fatherHandle =
    person?.extended?.primary_parent_family?.father_handle || ''
  const motherHandle =
    person?.extended?.primary_parent_family?.mother_handle || ''
  tree.children = []
  if (fatherHandle || includeEmpty) {
    tree.children.push(
      getTree(data, fatherHandle, depth - 1, includeEmpty, i + 1, `${label}f`)
    )
  }
  if (motherHandle || includeEmpty) {
    tree.children.push(
      getTree(data, motherHandle, depth - 1, includeEmpty, i + 1, `${label}m`)
    )
  }
  return tree
}

export const getDescendantTree = (data, handle, depth, i = 0, label = 'p') => {
  if (depth === 0) {
    return {}
  }
  const person = getPerson(data, handle)
  const tree = {
    name_given: person?.profile ? person?.profile?.name_given : null,
    name_surname: person?.profile ? person?.profile?.name_surname : null,
    id: label,
    depth: i,
    person,
  }
  if (depth === 1) {
    return tree
  }
  const childHandles =
    (person?.extended?.families || []).flatMap(fam => {
      const isFather = fam.father_handle === person.handle
      const isMother = fam.mother_handle === person.handle
      if (!isFather && !isMother) {
        return []
      }
      const relationKey = isFather ? 'frel' : 'mrel'

      return (fam.child_ref_list || [])
        .filter(childRef => childRef[relationKey] === 'Birth')
        .map(cref => cref.ref)
    }) ?? []
  tree.children = childHandles.map((childHandle, childInd) =>
    getDescendantTree(
      data,
      childHandle,
      depth - 1,
      i + 1,
      `${label}c${childInd}`
    )
  )
  return tree
}

export const LegendCategorical = (
  legend,
  legendData,
  {
    legendItemHeight = 15,
    legendItemWidth = 15,
    legendItemMargin = 5,
    opacity = 1,
  } = {}
) => {
  legend
    .selectAll('rect')
    .data(legendData)
    .enter()
    .append('rect')
    .attr('x', 0)
    .attr('y', (d, i) => i * (legendItemHeight + legendItemMargin))
    .attr('width', legendItemWidth)
    .attr('height', legendItemHeight)
    .attr('fill', d => d.color)
    .attr('fill-opacity', opacity)

  legend
    .selectAll('text')
    .data(legendData)
    .enter()
    .append('text')
    .attr('x', legendItemWidth + 8)
    .attr('fill', 'var(--grampsjs-body-font-color)')
    .attr('text-anchor', 'start')
    .attr('font-family', "'Be Vietnam Pro', Arial, sans-serif")
    .attr('font-weight', 350)
    .attr('font-size', 13)
    .attr(
      'y',
      (d, i) => i * (legendItemHeight + legendItemMargin) + legendItemHeight / 2
    )
    .attr('dy', '0.35em')
    .text(d => d.label)
}

export const LegendColorBar = (
  legend,
  {
    opacity = 1,
    minColorValue = 0,
    maxColorValue = 100,
    colorBarWidth = 20,
    colorBarHeight = 200,
  } = {}
) => {
  const numColorTicks = 5 // Number of legend ticks

  if (
    minColorValue === Infinity ||
    maxColorValue === -Infinity ||
    minColorValue === maxColorValue
  ) {
    return
  }

  // Create a color scale
  const colorScale = scaleSequential(interpolateWarm).domain([
    maxColorValue,
    minColorValue,
  ])

  // Create legend gradient
  legend
    .append('linearGradient')
    .attr('id', 'color-gradient')
    .attr('gradientUnits', 'userSpaceOnUse')
    .attr('x1', 0)
    .attr('y1', 0)
    .attr('x2', 0)
    .attr('y2', 200)
    .selectAll('stop')
    .data(range(0, 1.1, 0.1))
    .enter()
    .append('stop')
    .attr('offset', d => `${d * 100}%`)
    .attr('stop-color', d =>
      colorScale(d * (maxColorValue - minColorValue) + minColorValue)
    )

  // Create legend rectangle
  legend
    .append('rect')
    .attr('width', colorBarWidth) // Adjust the width as needed
    .attr('height', colorBarHeight) // Adjust the height as needed
    .style('fill', 'url(#color-gradient)')
    .style('fill-opacity', opacity)

  const colorbarTicks = colorScale.ticks(numColorTicks)

  legend
    .selectAll('.colorbar-tick')
    .data(colorbarTicks)
    .enter()
    .append('g')
    .attr('class', 'colorbar-tick')
    .attr(
      'transform',
      d =>
        `translate(30, ${
          (1 - (d - minColorValue) / (maxColorValue - minColorValue)) *
          colorBarHeight
        })`
    )
    .each(function () {
      const tickGroup = select(this)
      tickGroup
        .append('line')
        .attr('x1', -4)
        .attr('x2', -10) // Adjust the length of the tick mark
        .attr('stroke', 'var(--grampsjs-body-font-color)') // Set the tick color
    })
    .append('text')
    .attr('class', 'colorbar-tick')
    .attr('fill', 'var(--grampsjs-body-font-color)')
    .attr('x', 4)
    .attr('text-anchor', 'start')
    .attr('dy', '0.4em')
    .text(d => `${d}`)
}

// The Bùi Hữu tree records a "Đời" (generation) attribute for every person and,
// for most of them, a lunar memorial date instead of birth/death years. Charts
// are unreadable without the generation — 586 of 1504 people share their full
// name with someone else — and the memorial date only fits the box once the
// "Giỗ ngày " prefix is dropped.
export const getGeneration = person => {
  const attributes = person?.attribute_list || []
  const attribute = attributes.find(attr => attr.type === 'Đời')
  return attribute?.value || ''
}

export const shortenMemorialDate = date =>
  (date || '').replace(/^Giỗ ngày\s+/, '')

/*
Nội dung một ô người trong biểu đồ được rút gọn cho màn hình điện thoại:

    Bùi Hữu Văn            (họ tên đầy đủ, được xuống dòng nếu cần)
    Đời 7 · Ngành 2 · Chi 1
    Giỗ 4/3 ÂL             (người đã khuất)
    Sinh 1982              (người còn sống)

Tên tự, húy, hiệu, thụy và ngôi vị vẫn có ở trang chi tiết. Chúng không nằm
trong ô cây để người xem nhận ra đúng người nhanh hơn và không phải đọc dấu ba
chấm do nội dung bị cắt.
*/

const ATTR_RANK = 'Ngôi vị'

const ATTR_SENIOR_LINE = 'Dòng trưởng'

// Thẻ ngành chi do pipeline gắn: "Ngành 2 - Chi 3", riêng ngành 1 không tách
// chi nên chỉ có "Ngành 1".
const BRANCH_TAG = /^Ngành\s*(\d+)(?:\s*[-–·,]\s*Chi\s*(\d+))?$/iu

// Số đếm viết bằng chữ trong Ngôi vị: "Chi thứ ba", "Ngành hai".
const NUMBER_WORDS = {
  nhất: 1,
  một: 1,
  hai: 2,
  nhì: 2,
  ba: 3,
  tư: 4,
  bốn: 4,
  năm: 5,
  sáu: 6,
  bảy: 7,
  bẩy: 7,
  tám: 8,
  chín: 9,
  mười: 10,
}

const tagNames = tags =>
  (tags || [])
    .map(tag => (typeof tag === 'string' ? tag : tag?.name) || '')
    .map(name => name.normalize('NFC').trim())

/*
Ngành và chi đọc từ thẻ của một người: {branch, sub} hoặc null khi không có
thẻ ngành chi (tám cụ đời 1-4 ở thân chung, hoặc dữ liệu chưa tải thẻ).
*/
export const getBranch = tags => {
  const names = tagNames(tags)
  for (let i = 0; i < names.length; i += 1) {
    const match = names[i].match(BRANCH_TAG)
    if (match) {
      return {branch: Number(match[1]), sub: match[2] ? Number(match[2]) : null}
    }
  }
  return null
}

export const formatBranch = branch => {
  if (!branch) {
    return ''
  }
  return branch.sub
    ? `Ngành ${branch.branch} · Chi ${branch.sub}`
    : `Ngành ${branch.branch}`
}

// "Chi thứ ba" → {kind: 'chi', n: 3}; "Chi phái 1", "Chi trưởng" → null vì
// không phải một số thứ tự ngành/chi.
const parseRank = rank => {
  const match = rank
    .normalize('NFC')
    .trim()
    .match(/^(ngành|chi)\s+(?:thứ\s+)?(\S+)$/iu)
  if (!match) {
    return null
  }
  const word = match[2].toLowerCase()
  const n = /^\d+$/.test(word) ? Number(word) : NUMBER_WORDS[word]
  return n ? {kind: match[1].toLowerCase(), n} : null
}

// Ngôi vị nói cùng một điều với thẻ ngành chi thì không in lần thứ hai.
const rankRepeatsBranch = (rank, branch) => {
  const parsed = parseRank(rank)
  if (!parsed || !branch) {
    return false
  }
  return parsed.kind === 'ngành'
    ? parsed.n === branch.branch
    : parsed.n === branch.sub
}

// Tên chữ đặt thêm, xếp theo thứ tự ưu tiên hiển thị: húy là tên thật nên đứng
// trước, còn lại là tên chữ. "Tên trong bảng đối chiếu" cố ý không nằm ở đây -
// nó là dị bản chép trong bảng gốc, để dành cho trang chi tiết.
const COURTESY_NAME_TYPES = ['Húy', 'Tự', 'Hiệu', 'Thụy']

const attributeValue = (person, type) =>
  (person?.attribute_list || []).find(attr => attr.type === type)?.value || ''

// Loại tên tuỳ biến về từ máy chủ khi thì là chuỗi, khi thì là đối tượng
// NameType, tuỳ phiên bản Gramps.
const nameTypeLabel = name => {
  const {type} = name || {}
  if (!type) {
    return ''
  }
  return typeof type === 'string' ? type : type.string || ''
}

export const getCourtesyName = person => {
  const names = person?.alternate_names || []
  const primary = (person?.primary_name?.first_name || '').trim()
  for (let i = 0; i < COURTESY_NAME_TYPES.length; i += 1) {
    const label = COURTESY_NAME_TYPES[i]
    const match = names.find(name => nameTypeLabel(name) === label)
    const value = (match?.first_name || '').trim()
    if (value && value !== primary) {
      return `${label.toLowerCase()} ${value}`
    }
  }
  return ''
}

/*
Dòng thế thứ của một người, cùng một cú pháp ở mọi chỗ:

    Đời 6 · Ngành 2 · Chi 3 · Dòng trưởng · Chi phái 1

Đời và ngành chi lấy từ thuộc tính "Đời" và thẻ "Ngành x - Chi y"; Dòng trưởng
khi có thẻ hoặc thuộc tính cùng tên. Ngôi vị (chữ tự do trong sổ chi: "Chi thứ
ba", "Ngành hai", "Chi phái 1") chỉ in khi nó nói thêm điều gì ngoài thẻ, vì
"Chi thứ ba" cạnh "Chi 3" làm người đọc tưởng là hai thứ. Ngôi vị dạng mã số
("3.4.1.1") chỉ có nghĩa với người chép sổ nên bỏ.

Thẻ mặc định đọc từ person.extended.tags (trang người, cây); chỗ nào lấy thẻ
từ nơi khác thì truyền vào tham số thứ hai.
*/
export const getLineage = (person, tags = person?.extended?.tags) => {
  const parts = []
  const generation = getGeneration(person)
  if (generation) {
    parts.push(`Đời ${generation}`)
  }
  const branch = getBranch(tags)
  const branchLabel = formatBranch(branch)
  if (branchLabel) {
    parts.push(branchLabel)
  }
  if (
    tagNames(tags).includes(ATTR_SENIOR_LINE) ||
    attributeValue(person, ATTR_SENIOR_LINE)
  ) {
    parts.push(ATTR_SENIOR_LINE)
  }
  const rank = attributeValue(person, ATTR_RANK).trim()
  if (/^(ngành|chi)\b/iu.test(rank) && !rankRepeatsBranch(rank, branch)) {
    parts.push(rank)
  }
  return parts.join(' · ')
}

// Trên thẻ cây chỉ giữ thế hệ và nhánh chính thức từ thẻ dữ liệu. Ngôi vị và
// Dòng trưởng dành cho trang chi tiết vì dễ làm một ô nhỏ thành quá tải.
export const getCardLineage = (person, tags = person?.extended?.tags) => {
  const parts = []
  const generation = getGeneration(person)
  if (generation) {
    parts.push(`Đời ${generation}`)
  }
  const branch = formatBranch(getBranch(tags))
  if (branch) {
    parts.push(branch)
  }
  return parts.join(' · ')
}

const yearOf = date =>
  (date || '').match(/\b(1[5-9]\d{2}|20\d{2})\b/)?.[1] || ''

// Chọn độ tuổi cho chân dung mặc định. Với người đã mất, tuổi được tính ở
// năm mất; với người còn sống, tính theo năm hiện tại. Hồ sơ lịch sử thiếu năm
// sinh dùng nhóm cao tuổi, còn các đời gần dùng nhóm trưởng thành để tránh gán
// khuôn mặt già cho người chưa rõ tuổi.
export const getPortraitAgeGroup = (
  person,
  profile = person?.profile,
  referenceYear = new Date().getFullYear()
) => {
  const birthYear = Number(yearOf(profile?.birth?.date))
  if (!birthYear) {
    const generation = Number(getGeneration(person))
    return Number.isInteger(generation) && generation > 0 && generation <= 12
      ? 'elder'
      : 'adult'
  }
  const deathYear = Number(yearOf(profile?.death?.date))
  const age = (deathYear || referenceYear) - birthYear
  if (!Number.isFinite(age) || age < 0) {
    return 'adult'
  }
  if (age < 18) {
    return 'child'
  }
  return age <= 50 ? 'adult' : 'elder'
}

export const getLifeSpan = (person, profile) => {
  // Ngày giỗ âm lịch là mốc cả họ dùng để nhớ, và nhiều cụ chỉ còn mốc này.
  const memorial = attributeValue(person, 'Ngày giỗ')
  if (memorial) {
    return `Giỗ ${memorial} ÂL`
  }
  const birth = yearOf(profile?.birth?.date)
  const death = yearOf(profile?.death?.date)
  if (birth && death) {
    return `${birth} - ${death}`
  }
  if (birth) {
    return `Sinh ${birth}`
  }
  if (death) {
    return `Mất ${death}`
  }
  const deathDate = profile?.death?.date
  return deathDate ? `Giỗ ${shortenMemorialDate(deathDate)}` : ''
}

// Sổ thiếu ngày giỗ của nhiều cụ. Bốn đời đầu còn không có mốc tử dù chắc chắn
// đã khuất; thống kê dự án cũng xác định các đời 1–12 là lớp lịch sử. Từ đời 13
// trở đi chỉ dùng bài vị khi hồ sơ có mốc tử/ngày giỗ, tránh đoán với người gần.
export const isDeceased = (person, profile = person?.profile) => {
  const generation = Number(getGeneration(person))
  return Boolean(
    attributeValue(person, 'Ngày giỗ').trim() ||
      String(profile?.death?.date || '').trim() ||
      (Number.isInteger(generation) && generation > 0 && generation <= 12)
  )
}

export const getCardDate = (person, profile = person?.profile) => {
  if (isDeceased(person, profile)) {
    const memorial = attributeValue(person, 'Ngày giỗ').trim()
    if (memorial) {
      return `Giỗ ${memorial} ÂL`
    }
    const deathDate = String(profile?.death?.date || '').trim()
    return deathDate ? `Giỗ ${shortenMemorialDate(deathDate)}` : ''
  }
  const birth = yearOf(profile?.birth?.date)
  return birth ? `Sinh ${birth}` : ''
}

export const personCardLines = (person, profile, fullName) => {
  const lines = []
  if (fullName) {
    lines.push({text: fullName, weight: '600', size: 14, muted: false})
  }
  const lineage = getCardLineage(person)
  if (lineage) {
    lines.push({text: lineage, weight: '400', size: 12, muted: true})
  }
  const date = getCardDate(person, profile)
  if (date) {
    lines.push({text: date, weight: '400', size: 12, muted: true})
  }
  return lines
}

const estimatedTextWidth = (text, size) =>
  Array.from(text).reduce(
    (width, character) => width + (character === ' ' ? 0.32 : 0.56) * size,
    0
  )

const balancedNameParts = text => {
  const words = text.trim().split(/\s+/)
  if (words.length < 2) {
    return null
  }
  let best = null
  for (let index = 1; index < words.length; index += 1) {
    const first = words.slice(0, index).join(' ')
    const second = words.slice(index).join(' ')
    const difference = Math.abs(first.length - second.length)
    if (!best || difference < best.difference) {
      best = {first, second, difference}
    }
  }
  return [best.first, best.second]
}

// Không cắt nội dung bằng dấu ba chấm. Tên dài được chia thành hai dòng cân
// đối; từng dòng chỉ co chữ vừa đủ để luôn nằm trọn trong bảng tên.
export const fitPersonCardLines = (lines, maxWidth, wrapName = true) => {
  if (!(maxWidth > 0)) {
    return lines
  }
  const fitted = lines.map(line => ({...line}))
  const name = fitted[0]
  if (wrapName && name && estimatedTextWidth(name.text, name.size) > maxWidth) {
    const parts = balancedNameParts(name.text)
    if (parts) {
      fitted.splice(
        0,
        1,
        {...name, text: parts[0], size: 13},
        {...name, text: parts[1], size: 13}
      )
    }
  }
  return fitted.map(line => {
    const width = estimatedTextWidth(line.text, line.size)
    const minimum = line.weight === '600' ? 10.5 : 10
    const size =
      width > maxWidth
        ? Math.max(minimum, (line.size * maxWidth) / width)
        : line.size
    return {...line, size}
  })
}

/*
Giữ tâm và tỷ lệ của khung nhìn khi vùng vẽ đổi kích cỡ: xoay điện thoại, mở
hay đóng menu bên, kéo cửa sổ. Không làm gì thì SVG co giãn theo viewBox cũ
(preserveAspectRatio), người gốc trôi khỏi giữa và có dải trống hai bên.
Tỷ lệ tính từ khung cũ: số điểm ảnh trên một đơn vị SVG là oldWidth / w.
*/
export const rescaleViewBox = (viewBox, oldWidth, oldHeight, width, height) => {
  const parts = String(viewBox || '')
    .trim()
    .split(/[\s,]+/)
    .map(Number)
  if (
    parts.length !== 4 ||
    parts.some(Number.isNaN) ||
    !(oldWidth > 0) ||
    !(oldHeight > 0) ||
    !(width > 0) ||
    !(height > 0)
  ) {
    return viewBox
  }
  const [x, y, w, h] = parts
  if (!(w > 0) || !(h > 0)) {
    return viewBox
  }
  const pxPerUnit = oldWidth / w
  const nextWidth = width / pxPerUnit
  const nextHeight = height / pxPerUnit
  return `${x + w / 2 - nextWidth / 2} ${
    y + h / 2 - nextHeight / 2
  } ${nextWidth} ${nextHeight}`
}

// Người có ít nhất một con trong gia đình mình đứng làm cha hoặc mẹ. Dùng để
// quyết định thẻ nào có nút "Xem hậu duệ".
export const personHasChildren = person =>
  (person?.extended?.families || []).some(
    family =>
      [family.father_handle, family.mother_handle].includes(person.handle) &&
      (family.child_ref_list || []).length > 0
  )

/*
Tỷ lệ thu nhỏ tối thiểu khi bấm Vừa khung. Cây hơn nghìn người ép hết vào một
màn hình thì thẻ chỉ còn vài px, không nhìn ra ai; thu tới mức này thì vẫn
thấy được hình dáng cây và đọc lờ mờ tên, còn xa hơn thì người xem tự chụm.
*/
export const overviewMinScale = width => (width <= 600 ? 0.6 : 0.5)

// Trên điện thoại ô chọn phạm vi nổi ở góc trên trái vùng vẽ; khung nhìn ban
// đầu lùi xuống chừng ấy điểm ảnh để thẻ đầu tiên không nằm dưới ô đó.
export const chartTopInset = width => (width <= 600 ? 52 : 0)

// Tâm của một phần tử SVG trong hệ toạ độ viewBox của svg cha, tính từ vị trí
// thật trên màn hình nên đúng bất kể phần tử nằm trong bao nhiêu lớp transform.
export const svgUserCenter = (svg, element) => {
  const matrix = svg?.getScreenCTM?.()
  if (!element || !matrix) {
    return null
  }
  const rect = element.getBoundingClientRect()
  const point = svg.createSVGPoint()
  point.x = rect.x + rect.width / 2
  point.y = rect.y + rect.height / 2
  const user = point.matrixTransform(matrix.inverse())
  return {x: user.x, y: user.y}
}

// Giữ khung nhìn không trôi ra ngoài nội dung: nội dung rộng hơn khung thì kẹp
// trong biên, hẹp hơn thì căn giữa.
export const clampViewBox = (x, y, width, height, box, margin = 16) => {
  const clamp = (value, low, high) =>
    high < low ? (low + high) / 2 : Math.min(Math.max(value, low), high)
  return {
    x: clamp(x, box.x - margin, box.x + box.width + margin - width),
    y: clamp(y, box.y - margin, box.y + box.height + margin - height),
  }
}
