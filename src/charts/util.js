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
Nội dung một ô người trong biểu đồ, viết theo lối gia phả Việt Nam.

Bản gốc dành hai dòng đầu cho họ và tên riêng tách rời, kiểu "Smith / John".
Trong một cuốn phả hệ một dòng họ thì dòng "Bùi" lặp lại ở mọi ô mà không nói
thêm điều gì, còn người Việt vẫn đọc tên liền một mạch. Bốn dòng của ô vì thế
được dùng lại cho những thứ cuốn phả hệ giấy vẫn ghi:

    Bùi Ánh                (họ tên đầy đủ)
    tự Pháp Độ             (tên tự, húy, hiệu, thụy)
    Đời 7 · Chi phái 1     (đời tính từ thuỷ tổ, ngành hoặc chi)
    Giỗ 4/3 ÂL             (ngày giỗ âm lịch, hoặc năm sinh - năm mất)

Dòng nào không có dữ liệu thì bỏ hẳn và các dòng sau dồn lên, vì ô trống trải
đều khắp cây trông như lỗi hiển thị.
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

const yearOf = date =>
  (date || '').match(/\b(1[5-9]\d{2}|20\d{2})\b/)?.[1] || ''

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

export const personCardLines = (person, profile, fullName) => {
  const lines = []
  if (fullName) {
    lines.push({text: fullName, weight: '600', size: 14, muted: false})
  }
  const courtesy = getCourtesyName(person)
  if (courtesy) {
    lines.push({text: courtesy, weight: '400', size: 12, muted: true})
  }
  const lineage = getLineage(person)
  if (lineage) {
    lines.push({text: lineage, weight: '400', size: 12, muted: true})
  }
  const lifespan = getLifeSpan(person, profile)
  if (lifespan) {
    lines.push({text: lifespan, weight: '400', size: 12, muted: true})
  }
  return lines.slice(0, 4)
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
