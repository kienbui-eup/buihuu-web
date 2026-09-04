import {min, max} from 'd3-array'
import {create, select} from 'd3-selection'
import {hierarchy, tree} from 'd3-hierarchy'
import {curveBumpY, link, symbolTriangle, symbol} from 'd3-shape'
import {zoom} from 'd3-zoom'
import {chartNameDisplayFormat, fireEvent} from '../util.js'
import {joinName} from '../branding.js'
import {appendAddPersonButton} from './addPersonButton.js'
import {
  fitPersonCardLines,
  isDeceased,
  personCardLines,
  personHasChildren,
} from './util.js'
import {
  appendPersonCardDecoration,
  CARD_AVATAR_X,
  MEMORIAL_AVATAR_Y,
} from './heritageFrame.js'
import {appendDescendantsButton} from './descendantsButton.js'

function TreeChartCore(
  svgParent,
  data,
  {
    padding = 20,
    gapX = 30, // horizontal gap between boxes
    gapY = 60, // vertical gap between generations
    stroke = 'var(--grampsjs-body-font-color-70)', // stroke for links
    strokeWidth = 1, // stroke width for links
    strokeOpacity = 0.4, // stroke opacity for links
    strokeLinejoin, // stroke line join for links
    strokeLinecap, // stroke line cap for links
    curve = curveBumpY, // curve for the link
    boxWidth = 204,
    boxHeight = 90,
    childrenTriangle = true,
    getImageUrl = null,
    ancestors = false,
    showRoot = true,
    nameDisplayFormat = chartNameDisplayFormat.surnameThenGiven,
    canEdit = false,
    selectedGrampsId = '',
    onPersonClick = null,
    personActionLabel = '',
  } = {}
) {
  // Create a hierarchical data structure based on the input data
  const root = hierarchy(data)

  const descendants = root.descendants()

  // Người đang xem ở (0, 0); tổ tiên phía trên, con cháu phía dưới.
  tree()
    .nodeSize([boxWidth + gapX, boxHeight + gapY])
    .separation(() => 1)(root)

  const direction = ancestors ? -1 : 1
  if (ancestors) {
    descendants.forEach(d => {
      // eslint-disable-next-line no-param-reassign
      d.y = -d.y
    })
  }
  // Use the required curve
  if (typeof curve !== 'function') throw new Error('Unsupported curve')
  const bounds = {
    left: min(descendants, d => d.x) - boxWidth / 2 - padding,
    right: max(descendants, d => d.x) + boxWidth / 2 + padding,
    top: min(descendants, d => d.y) - boxHeight / 2 - padding,
    bottom: max(descendants, d => d.y) + boxHeight / 2 + padding,
  }

  const chart = svgParent.append('g')

  // Giữ lại selection đường nối để tô đậm dòng dõi khi rê chuột lên một ô.
  const linkPaths = chart
    .append('g')
    .attr('fill', 'none')
    .attr('stroke', stroke)
    .attr('stroke-opacity', strokeOpacity)
    .attr('stroke-linecap', strokeLinecap)
    .attr('stroke-linejoin', strokeLinejoin)
    .attr('stroke-width', strokeWidth)
    .attr('vector-effect', 'non-scaling-stroke')
    .selectAll('path')
    .data(root.links())
    .join('path')
    .attr('class', 'tree-link')
    .attr('d', d => {
      const sourceX = d.source.x
      const sourceY = d.source.y + (direction * boxHeight) / 2
      const targetX = d.target.x
      const targetY = d.target.y - (direction * boxHeight) / 2

      return link(curve)
        .x(dd => dd.x)
        .y(dd => dd.y)({
        source: {x: sourceX, y: sourceY},
        target: {x: targetX, y: targetY},
      })
    })

  const node = chart
    .append('g')
    .selectAll('a')
    .data(descendants.filter(d => showRoot || d.depth > 0))
    .join('a')
    .attr('class', d => (d.depth === 0 ? 'tree-root' : null))
    .classed(
      'tree-selected',
      d => d.data.person?.gramps_id === selectedGrampsId
    )
    .attr('data-gramps-id', d => d.data.person?.gramps_id)
    .attr('role', onPersonClick ? 'button' : null)
    .attr('tabindex', onPersonClick ? 0 : null)
    .attr('aria-expanded', d =>
      onPersonClick && !personActionLabel && d.data.expandable
        ? String(d.data.expanded)
        : null
    )
    .attr('aria-label', d =>
      onPersonClick
        ? `${joinName(d.data.name_surname, d.data.name_given)}${
            personActionLabel
              ? `: ${personActionLabel}`
              : d.data.expandable
              ? d.data.expanded
                ? ': Thu gọn hậu duệ'
                : `: Mở ${d.data.hiddenCount} nhánh con`
              : ''
          }`
        : null
    )
    .attr('transform', d => `translate(${d.x},${d.y})`)

  function clicked(event, d) {
    if (onPersonClick) {
      onPersonClick(d.data.person?.gramps_id)
      return
    }
    dispatchEvent(
      new CustomEvent('pedigree:person-selected', {
        bubbles: true,
        composed: true,
        detail: {grampsId: d.data?.person?.gramps_id},
      })
    )
  }

  node
    .append('rect')
    .filter(d => d.data.person)
    .attr('fill', 'var(--md-sys-color-surface)')
    .attr('stroke', 'var(--md-sys-color-outline-variant)')
    .attr('class', 'person-card')
    .attr('width', boxWidth)
    .attr('height', boxHeight)
    .attr('rx', 4)
    .attr('ry', 4)
    .attr('transform', `translate(${-boxWidth / 2},${-boxHeight / 2})`)
    .attr('id', d => d.data.id) // Unique id for each slice

  appendPersonCardDecoration(
    node.filter(d => d.data.person),
    boxWidth,
    boxHeight,
    {
      x: -boxWidth / 2,
      y: -boxHeight / 2,
      deceased: d => isDeceased(d.data.person, d.data.person?.profile),
      gender: d =>
        d.data.person?.gender === 0
          ? 'female'
          : d.data.person?.gender === 1
          ? 'male'
          : 'unknown',
      hasImage: d => Boolean(getImageUrl(d)),
    }
  )

  function triangleClicked(e) {
    fireEvent(this, 'pedigree:show-children', {pageX: e.pageX, pageY: e.pageY})
    e.stopPropagation()
    e.preventDefault()
  }

  if (childrenTriangle) {
    const triangle = symbol().type(symbolTriangle).size(200)

    const angle = ancestors ? 180 : 0
    const triangleY = -direction * (boxHeight / 2 + 14)

    node
      .append('path')
      .filter(d => d.depth === 0)
      .attr('d', triangle)
      .attr('transform', `translate(0,${triangleY}) rotate(${angle})`)
      .attr('fill', 'var(--grampsjs-body-font-color-30)')
      .attr('id', 'triangle-children')
      .on('click', triangleClicked)
  }

  // Dấu mở nhánh nằm ngoài phần tên, cả ô là vùng bấm trên điện thoại.
  if (onPersonClick) {
    const toggles = node
      .filter(d => !personActionLabel && d.data.expandable)
      .append('g')
      .attr('transform', `translate(0,${boxHeight / 2 + 14})`)
      .attr('pointer-events', 'none')
    toggles
      .append('rect')
      .attr('x', -27)
      .attr('y', -12)
      .attr('width', 54)
      .attr('height', 24)
      .attr('rx', 12)
      .attr('fill', 'var(--md-sys-color-surface)')
      .attr('stroke', 'var(--md-sys-color-primary)')
    toggles
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em')
      .attr('font-size', 12)
      .attr('fill', 'var(--md-sys-color-primary)')
      .text(d => (d.data.expanded ? '−' : `+${d.data.hiddenCount}`))
    node.on('keydown', (event, d) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        clicked(event, d)
      }
    })
  }

  const memorialPhotoRadius = 20
  const textPadding = d => {
    const deceased = isDeceased(d.data.person, d.data.person?.profile)
    if (!deceased) return 14
    return getImageUrl(d) ? 54 : 50
  }

  // Thẻ của người có con cháu mang nút gài "Xem hậu duệ" nhô trên mép phải.
  const hasAction = d => !canEdit && personHasChildren(d.data.person)

  // Ô chỉ giữ tên, đời/ngành/chi và giỗ hoặc năm sinh. Tên dài xuống hai dòng
  // thay vì bị cắt bằng dấu ba chấm.
  const fullName = d =>
    nameDisplayFormat === chartNameDisplayFormat.surnameThenGiven
      ? joinName(d.data.name_surname, d.data.name_given)
      : joinName(d.data.name_given, d.data.name_surname)

  node
    .filter(d => d.data.name_given || d.data.name_surname)
    .each(function drawCard(d) {
      const deceased = isDeceased(d.data.person, d.data.person?.profile)
      const lineHeight = deceased ? 19 : 16
      const lines = fitPersonCardLines(
        personCardLines(
          d.data.person,
          d.data.person?.profile,
          fullName(d) || 'Chưa rõ tên'
        ),
        boxWidth - textPadding(d) - (deceased ? 10 : 14),
        deceased
      )
      // Ít dòng thì căn giữa theo chiều cao ô, để ô của người chỉ còn mỗi cái
      // tên không bị dồn lên mép trên.
      const top = deceased
        ? -boxHeight / 2 +
          (boxHeight - (lines.length - 1) * lineHeight) / 2 +
          lineHeight / 4
        : -boxHeight / 2 +
          boxHeight -
          22 -
          ((lines.length - 1) * lineHeight) / 2

      select(this)
        .selectAll('text.card-line')
        .data(lines)
        .join('text')
        .attr('class', 'card-line')
        .attr('x', deceased ? -boxWidth / 2 + textPadding(d) : 0)
        .attr('y', (line, i) => top + i * lineHeight)
        .attr('text-anchor', deceased ? 'start' : 'middle')
        .attr('font-size', line => line.size)
        .attr('font-weight', line => line.weight)
        .attr('fill', line =>
          line.muted
            ? 'var(--person-card-muted-text, var(--grampsjs-body-font-color-70))'
            : 'var(--person-card-text, var(--grampsjs-body-font-color-90))'
        )
        .attr('paint-order', 'stroke')
        .text(line => line.text)
    })

  if (canEdit) {
    appendAddPersonButton(
      node.filter(d => d.data.person),
      boxWidth / 2 - 14,
      -boxHeight / 2 + 14,
      d => d.data.person?.handle
    )
  } else {
    appendDescendantsButton(
      node.filter(hasAction),
      boxWidth / 2 - 16,
      -boxHeight / 2 - 4,
      clicked
    )
  }

  node
    .filter(getImageUrl)
    .append('circle')
    .attr('class', d =>
      isDeceased(d.data.person, d.data.person?.profile)
        ? 'memorial-photo'
        : 'living-avatar-photo'
    )
    .attr('r', d =>
      isDeceased(d.data.person, d.data.person?.profile)
        ? memorialPhotoRadius
        : 22
    )
    .attr('cy', d =>
      isDeceased(d.data.person, d.data.person?.profile)
        ? -boxHeight / 2 + MEMORIAL_AVATAR_Y
        : -boxHeight / 2 + 8
    )
    .attr('cx', d => -boxWidth / 2 + CARD_AVATAR_X)
    .attr('fill', d => `url(#imgpattern-${d.data.id})`)

  const defs = svgParent.append('defs')

  const imgPattern = defs
    .selectAll('.imgpattern')
    .data(descendants)
    .enter()
    .append('pattern')
    .attr('id', d => `imgpattern-${d.data.id}`)
    .attr('height', 1)
    .attr('width', 1)
    .attr('x', '0')
    .attr('y', '0')

  imgPattern
    .append('image')
    .attr('x', 0)
    .attr('y', 0)
    .attr('height', 70)
    .attr('width', 70)
    .attr('xlink:href', getImageUrl)

  // Nổi bật dòng dõi: rê chuột lên một người thì đường nối từ người đó ngược
  // lên gốc của biểu đồ đậm lên. Đây là câu hỏi hay gặp nhất khi tra cứu, "tôi
  // thuộc nhánh nào", và phả đồ giấy trả lời bằng cách dò ngược theo nét kẻ.
  function highlightLineage(d, on) {
    const lineage = new Set(d.ancestors())
    linkPaths
      .filter(l => lineage.has(l.target) && lineage.has(l.source))
      .attr('stroke', on ? 'var(--mdc-theme-primary)' : stroke)
      .attr('stroke-opacity', on ? 1 : strokeOpacity)
      .attr('stroke-width', on ? strokeWidth * 3 : strokeWidth)
      .raise()
  }

  node
    .style('cursor', canEdit ? 'default' : 'pointer')
    .on('click', canEdit ? null : clicked)
    .on('mouseenter', function (event, d) {
      if (d.data?.person) highlightLineage(d, true)
      if (canEdit) return
      if (window.matchMedia('(hover: none)').matches) return
      const grampsId = d.data?.person?.gramps_id
      if (!grampsId) return
      window.dispatchEvent(
        new CustomEvent('object:preview-show', {
          detail: {
            objectType: 'person',
            grampsId,
            anchorRect: this.getBoundingClientRect(),
            anchorElement: this,
          },
        })
      )
    })
    .on('mouseleave', () => {
      if (window.matchMedia('(hover: none)').matches) return
      window.dispatchEvent(new CustomEvent('object:preview-hide'))
    })

  return bounds
}

export function TreeChart(dataDescendants, dataAncestors, chartsettings) {
  const svg = create('svg')
    .call(
      zoom().on('zoom', e =>
        svg.select('#chart-content').attr('transform', e.transform)
      )
    )
    .attr('font-family', 'Be Vietnam Pro, Arial, sans-serif')
    .attr('font-size', 13)

  const chartContent = svg.append('g').attr('id', 'chart-content')

  // Restore zoom state from previous render if available
  if (chartsettings.initialZoom) {
    svg.node().__zoom = chartsettings.initialZoom
    chartContent.attr('transform', chartsettings.initialZoom.toString())
  }

  const bounds = []
  // Hai nửa chung một gốc, nối theo chiều dọc. Chỉ vẽ ô gốc một lần để viền
  // focus và nút thao tác không bị chồng trong biểu đồ đồng hồ cát.
  if (dataDescendants) {
    bounds.push(
      TreeChartCore(chartContent.append('g'), dataDescendants, {
        ...chartsettings,
        ancestors: false,
      })
    )
  }
  if (dataAncestors) {
    bounds.push(
      TreeChartCore(chartContent.append('g'), dataAncestors, {
        ...chartsettings,
        ancestors: true,
        showRoot: !dataDescendants,
      })
    )
  }
  const left = min(bounds, b => b.left) ?? 0
  const right = max(bounds, b => b.right) ?? 0
  const top = min(bounds, b => b.top) ?? 0
  const bottom = max(bounds, b => b.bottom) ?? 0
  const width = chartsettings.bboxWidth
  const height = chartsettings.bboxHeight
  svg.attr('viewBox', [
    right - left <= width ? (left + right - width) / 2 : -width / 2,
    bottom - top <= height ? (top + bottom - height) / 2 : -height / 2,
    width,
    height,
  ])
  if (chartsettings.initialViewBox) {
    svg.attr('viewBox', chartsettings.initialViewBox)
  }
  return svg.node()
}
