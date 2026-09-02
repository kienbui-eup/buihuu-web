import {min, max} from 'd3-array'
import {create, select} from 'd3-selection'
import {hierarchy, tree} from 'd3-hierarchy'
import {curveBumpX, link, symbolTriangle, symbol} from 'd3-shape'
import {zoom} from 'd3-zoom'
import {chartNameDisplayFormat, fireEvent} from '../util.js'
import {joinName} from '../branding.js'
import {appendAddPersonButton} from './addPersonButton.js'
import {personCardLines} from './util.js'

const genderColor = {
  0: 'var(--color-girl)',
  1: 'var(--color-boy)',
  2: 'var(--color-unknown)',
  3: 'var(--color-other)',
}

// Returns the total depth of the tree
function countDepthOfTree(treeData) {
  if (treeData == null) {
    return 0
  }
  return (
    1 +
    Math.max(
      countDepthOfTree(treeData?.children?.[0]),
      countDepthOfTree(treeData?.children?.[1])
    )
  )
}

function getMinMaxX(descendants) {
  const xValues = descendants.map(d => d.x)
  const maxX = max(xValues)
  const minX = min(xValues)
  return [minX, maxX]
}

function TreeChartCore(
  svgParent,
  data,
  {
    depth = 3,
    padding = 20, // horizontal padding for first and last column
    gapX = 30, // horizontal gap between boxes
    gapY = 5, // vertical gap between boxes
    stroke = 'var(--grampsjs-body-font-color-70)', // stroke for links
    strokeWidth = 1, // stroke width for links
    strokeOpacity = 0.4, // stroke opacity for links
    strokeLinejoin, // stroke line join for links
    strokeLinecap, // stroke line cap for links
    curve = curveBumpX, // curve for the link
    boxWidth = 190,
    boxHeight = 90,
    imgPadding = 10,
    childrenTriangle = true,
    getImageUrl = null,
    orientation = 'LTR',
    nameDisplayFormat = chartNameDisplayFormat.surnameThenGiven,
    canEdit = false,
  } = {}
) {
  // Create a hierarchical data structure based on the input data
  const root = hierarchy(data)

  const descendants = root.descendants()

  // The true depth of the tree may be less than the passed in "depth" if the tree just doesn't
  // go that far back
  const trueDepth = Math.min(countDepthOfTree(data), depth)

  tree()
    .nodeSize([boxHeight + gapY, boxWidth + gapX])
    .separation((a, b) => (a.parent === b.parent ? 1 : 1))(root)

  // Center the tree.
  let x0 = Infinity
  let x1 = -x0
  root.each(d => {
    if (d.x > x1) x1 = d.x
    if (d.x < x0) x0 = d.x
  })

  if (orientation === 'RTL') {
    descendants.forEach(d => {
      // eslint-disable-next-line no-param-reassign
      d.y = -d.y
    })
  }
  // Use the required curve
  if (typeof curve !== 'function') throw new Error('Unsupported curve')
  const width = trueDepth * boxWidth + (trueDepth - 1) * gapX + 2 * padding
  const [minX, maxX] = getMinMaxX(descendants)
  const height = maxX - minX + boxHeight
  const yOffset = minX - boxHeight / 2
  const xOffset =
    orientation === 'RTL'
      ? boxWidth / 2 + padding - width
      : -boxWidth / 2 - padding

  const chart = svgParent
    .append('g')
    .attr('transform', `translate(${-xOffset},${0})`)

  // Giữ lại selection đường nối để tô đậm dòng dõi khi rê chuột lên một ô.
  const linkPaths = chart
    .append('g')
    .attr('fill', 'none')
    .attr('stroke', stroke)
    .attr('stroke-opacity', strokeOpacity)
    .attr('stroke-linecap', strokeLinecap)
    .attr('stroke-linejoin', strokeLinejoin)
    .attr('stroke-width', strokeWidth)
    .selectAll('path')
    .data(root.links())
    .join('path')
    .attr('class', 'tree-link')
    .attr('d', d => {
      const sourceX = d.source.x
      const sourceY =
        orientation === 'LTR'
          ? d.source.y + boxWidth / 2 - 10
          : d.source.y - boxWidth / 2 + 10
      const targetX = d.target.x
      const targetY =
        orientation === 'LTR'
          ? d.target.y - boxWidth / 2 + 10
          : d.target.y + boxWidth / 2 - 10

      return link(curve)
        .x(dd => dd.y)
        .y(dd => dd.x)({
        source: {x: sourceX, y: sourceY},
        target: {x: targetX, y: targetY},
      })
    })

  const node = chart
    .append('g')
    .selectAll('a')
    .data(descendants)
    .join('a')
    .attr('transform', d => `translate(${d.y},${d.x})`)
    .style('filter', d =>
      d.depth === 0
        ? 'drop-shadow(0 3px 8px var(--grampsjs-body-font-color-30))'
        : null
    )

  node
    .append('rect')
    .filter(d => d.data.person)
    .attr(
      'fill',
      d => genderColor[d.data?.person?.gender] ?? 'var(--color-unknown)'
    )
    .attr('width', 24)
    .attr('height', boxHeight - 1)
    .attr('rx', 12)
    .attr('ry', 12)
    .attr(
      'transform',
      `translate(${-boxWidth / 2 - 4},${-boxHeight / 2 + 0.5})`
    )
    .attr('id', d => d.data.id) // Unique id for each rect

  function clicked(event, d) {
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
    .attr('fill', 'var(--grampsjs-color-shade-230)')
    .attr('width', boxWidth)
    .attr('height', boxHeight)
    .attr('rx', 8)
    .attr('ry', 8)
    .attr('transform', `translate(${-boxWidth / 2},${-boxHeight / 2})`)
    .attr('id', d => d.data.id) // Unique id for each slice

  function triangleClicked(e) {
    fireEvent(this, 'pedigree:show-children', {pageX: e.pageX, pageY: e.pageY})
    e.stopPropagation()
    e.preventDefault()
  }

  function yPos(d) {
    return orientation === 'LTR'
      ? d.y - boxWidth / 2 - 12
      : d.y + boxWidth / 2 + 12
  }

  if (childrenTriangle) {
    const triangle = symbol().type(symbolTriangle).size(200)

    const angle = orientation === 'LTR' ? -90 : 90

    node
      .append('path')
      .filter(d => d.depth === 0)
      .attr('d', triangle)
      .attr(
        'transform',
        d => `translate(${yPos(d)},${d.x}) rotate(${angle}) scale(-1, 0.5)`
      )
      .attr('fill', 'var(--grampsjs-body-font-color-30)')
      .attr('id', 'triangle-children')
      .on('click', triangleClicked)
  }

  const imgRadius = (boxHeight - imgPadding * 2) / 2
  const textPadding = d =>
    getImageUrl(d) ? 2 * imgRadius + 2 * imgPadding : 2 * imgPadding

  const clipString = (s, length, fontSize = 13) => {
    if (!s) {
      return ''
    }
    const nChar = length / (fontSize * 0.6)
    if (s.length <= nChar) {
      return s
    }
    if (nChar < 2) {
      return ''
    }
    return `${s.slice(0, nChar - 2)}…`
  }

  const textWidth = d =>
    getImageUrl(d)
      ? boxWidth - 2 * imgPadding - 2 * imgRadius
      : boxWidth - 2 * imgPadding

  // Ô người viết theo lối gia phả Việt: họ tên liền một dòng, rồi tên tự, đời
  // và ngày giỗ. Xem personCardLines trong ./util.js.
  const lineHeight = 17

  const fullName = d =>
    nameDisplayFormat === chartNameDisplayFormat.surnameThenGiven
      ? joinName(d.data.name_surname, d.data.name_given)
      : joinName(d.data.name_given, d.data.name_surname)

  node
    .filter(d => d.data.name_given || d.data.name_surname)
    .each(function drawCard(d) {
      const lines = personCardLines(
        d.data.person,
        d.data.person?.profile,
        fullName(d) || '…'
      )
      // Ít dòng thì căn giữa theo chiều cao ô, để ô của người chỉ còn mỗi cái
      // tên không bị dồn lên mép trên.
      const top =
        -boxHeight / 2 +
        (boxHeight - (lines.length - 1) * lineHeight) / 2 +
        lineHeight / 4

      select(this)
        .selectAll('text.card-line')
        .data(lines)
        .join('text')
        .attr('class', 'card-line')
        .attr('x', -boxWidth / 2 + textPadding(d))
        .attr('y', (line, i) => top + i * lineHeight)
        .attr('text-anchor', 'start')
        .attr('font-size', line => line.size)
        .attr('font-weight', line => line.weight)
        .attr('fill', line =>
          line.muted
            ? 'var(--grampsjs-body-font-color-70)'
            : 'var(--grampsjs-body-font-color-90)'
        )
        .attr('paint-order', 'stroke')
        .text(line => clipString(line.text, textWidth(d), line.size))
    })

  if (canEdit) {
    appendAddPersonButton(
      node.filter(d => d.data.person),
      boxWidth / 2 - 14,
      -boxHeight / 2 + 14,
      d => d.data.person?.handle
    )
  }

  node
    .filter(getImageUrl)
    .append('circle')
    .attr('r', imgRadius)
    .attr('cy', -boxHeight / 2 + imgRadius + imgPadding)
    .attr('cx', -boxWidth / 2 + imgRadius + imgPadding)
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
          },
        })
      )
    })
    .on('mouseleave', () => {
      if (window.matchMedia('(hover: none)').matches) return
      window.dispatchEvent(new CustomEvent('object:preview-hide'))
    })

  return [xOffset, yOffset, width, height, boxWidth + 2 * padding]
}

export function TreeChart(dataDescendants, dataAncestors, chartsettings) {
  const svg = create('svg')
    .call(
      zoom().on('zoom', e =>
        svg.select('#chart-content').attr('transform', e.transform)
      )
    )
    .attr('font-family', 'Inter var')
    .attr('font-size', 13)

  const chartContent = svg.append('g').attr('id', 'chart-content')

  // Restore zoom state from previous render if available
  if (chartsettings.initialZoom) {
    svg.node().__zoom = chartsettings.initialZoom
    chartContent.attr('transform', chartsettings.initialZoom.toString())
  }

  let width = 0
  let height = 0
  let xMin = 0
  let yMin = 0
  let yMax = 0
  let xOffset = 0
  let yOffset = 0

  // Trục thời gian chạy từ trái sang phải: đời trước bên trái, đời sau bên phải.
  //
  // Bản gốc xếp ngược lại - hậu duệ toả sang trái, tổ tiên sang phải. Gia phả
  // Việt đọc theo chiều thuỷ tổ trước rồi lần xuống các đời sau, cùng chiều với
  // chiều đọc chữ, nên hai nửa đổi vai cho nhau: hậu duệ vẽ LTR và đứng yên tại
  // gốc, tổ tiên vẽ RTL và lùi sang trái đúng bằng bề rộng của mình, trừ đi ô
  // gốc mà hai nửa dùng chung.
  if (dataDescendants) {
    const chartD = chartContent.append('g')
    const [xD, yD, widthD, heightD] = TreeChartCore(chartD, dataDescendants, {
      ...chartsettings,
      orientation: 'LTR',
      depth: chartsettings.nDesc,
    })
    chartD.attr('transform', 'translate(0,0)')
    yMin = Math.min(yMin, yD)
    yMax = Math.max(yMax, yD + heightD)
    xMin = Math.min(xMin, xD)
    width += widthD
  }
  if (dataAncestors) {
    const chartA = chartContent.append('g')
    const [xA, yA, widthA, heightA, overlap] = TreeChartCore(
      chartA,
      dataAncestors,
      {...chartsettings, orientation: 'RTL', depth: chartsettings.nAnc}
    )
    chartA.attr('transform', `translate(${-widthA + overlap},0)`)
    yMin = Math.min(yMin, yA)
    yMax = Math.max(yMax, yA + heightA)
    // Nửa tổ tiên bị dịch sang trái bằng transform ở trên, nên biên trái thật của
    // nó không phải xA mà là xA cộng nửa ô gốc — chính là overlap/2. Lấy thẳng xA
    // thì viewBox mở quá xa về bên trái và ô ngoài cùng bên phải bị cắt mất.
    xMin = Math.min(xMin, xA + overlap / 2)
    width += widthA - overlap
  }

  xOffset = xMin
  height = yMax - yMin
  if (chartsettings.bboxWidth > width) {
    xOffset -= (chartsettings.bboxWidth - width) / 2
  }
  yOffset = yMin
  if (chartsettings.bboxHeight > height) {
    yOffset -= (chartsettings.bboxHeight - height) / 2
  } else {
    // Taller than the viewport: anchoring on the top edge scrolls the person
    // the chart is about out of sight and shows their remotest ancestors
    // instead. Keep them centred — they sit at y = 0 by construction.
    yOffset = -chartsettings.bboxHeight / 2
  }
  svg.attr('viewBox', [
    xOffset,
    yOffset,
    chartsettings.bboxWidth,
    chartsettings.bboxHeight,
  ])
  return svg.node()
}
