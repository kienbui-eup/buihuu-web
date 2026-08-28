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
    .attr('font-family', 'Inter var')
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

export const getLineage = person => {
  const parts = []
  const generation = getGeneration(person)
  if (generation) {
    parts.push(`Đời ${generation}`)
  }
  // Ngôi vị có khi là chữ ("Chi phái 1", "Ngành hai"), có khi là mã đánh số
  // trong sổ chi ("3.4.1.1"). Mã số chỉ có nghĩa với người chép sổ.
  const rank = attributeValue(person, ATTR_RANK)
  if (/^(ngành|chi)\b/i.test(rank)) {
    parts.push(rank)
  } else if (attributeValue(person, ATTR_SENIOR_LINE)) {
    // Dòng trưởng là ngôi thứ được nhắc tới nhiều nhất trong họ, nhưng nó chỉ
    // vào được ô khi chỗ đó không phải dành cho tên chi.
    parts.push('Dòng trưởng')
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
    lines.push({text: fullName, weight: '500', size: 13.5, muted: false})
  }
  const courtesy = getCourtesyName(person)
  if (courtesy) {
    lines.push({text: courtesy, weight: '350', size: 12, muted: true})
  }
  const lineage = getLineage(person)
  if (lineage) {
    lines.push({text: lineage, weight: '350', size: 12, muted: true})
  }
  const lifespan = getLifeSpan(person, profile)
  if (lifespan) {
    lines.push({text: lifespan, weight: '350', size: 12, muted: true})
  }
  return lines.slice(0, 4)
}
