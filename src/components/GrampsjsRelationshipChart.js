import {html} from 'lit'
import {treeHeritageStyles} from '../charts/TreeHeritageStyles.js'
import {zoomTransform} from 'd3-zoom'

import '@material/mwc-menu'
import '@material/mwc-list/mwc-list-item'

import {GrampsjsChartBase} from './GrampsjsChartBase.js'
import {RelationshipChart} from '../charts/RelationshipChart.js'
import {
  chartTopInset,
  clampViewBox,
  getImageUrl,
  overviewMinScale,
  rescaleViewBox,
  svgUserCenter,
} from '../charts/util.js'

class GrampsjsRelationshipChart extends GrampsjsChartBase {
  static get styles() {
    return [super.styles, treeHeritageStyles]
  }

  static get properties() {
    return {
      grampsId: {type: String},
      scope: {type: String},
      nAnc: {type: Number},
      nMaxImages: {type: Number},
      gapX: {type: Number},
      nameDisplayFormat: {type: String},
      canEdit: {type: Boolean},
    }
  }

  constructor() {
    super()
    this.grampsId = ''
    this.gapX = 30
    this._savedZoom = null
    this._savedViewBox = null
    this._focusPending = true
    this._overviewPending = false
    this.scope = 'descendants'
  }

  willUpdate(changed) {
    // Save zoom transform before Lit replaces the SVG node
    const svg = this.renderRoot
      ?.getElementById('container')
      ?.querySelector('svg')
    this._savedZoom = svg ? zoomTransform(svg) : null
    this._savedViewBox = svg?.getAttribute('viewBox') || null
    if (
      changed.has('grampsId') ||
      changed.has('scope') ||
      this._focusPending ||
      this._overviewPending
    ) {
      this._savedZoom = null
      this._savedViewBox = null
    } else if (
      this._savedViewBox &&
      (changed.has('containerWidth') || changed.has('containerHeight'))
    ) {
      // Xoay điện thoại hay mở menu bên: giữ tâm và tỷ lệ, đổi khung theo
      // kích cỡ mới thay vì để SVG co giãn theo khung cũ.
      this._savedViewBox = rescaleViewBox(
        this._savedViewBox,
        changed.get('containerWidth') ?? this.containerWidth,
        changed.get('containerHeight') ?? this.containerHeight,
        this.containerWidth,
        this.containerHeight
      )
    }
    // Phạm vi Toàn gia phả không tự thu vừa khung: hơn nghìn người ép vào một
    // màn hình chỉ còn một vệt mờ, không đọc được ai. Mở ở cặp vợ chồng gốc
    // như các phạm vi khác; ai muốn xem toàn cảnh bấm Vừa khung.
  }

  focusPerson() {
    this._focusPending = true
    this._overviewPending = false
    this.requestUpdate()
  }

  showOverview() {
    this._overviewPending = true
    this.requestUpdate()
  }

  _chartReady(svg) {
    if (svg !== this.renderRoot.querySelector('svg')) return
    const width = this.containerWidth
    const height = this.containerHeight
    if (width <= 0 || height <= 0) return
    if (this._overviewPending) {
      const box = svg.querySelector('#chart-content').getBBox()
      const fit = Math.min(
        1,
        (width - 32) / box.width,
        (height - 32) / box.height
      )
      // Vừa khung nhưng không thu quá tỷ lệ tối thiểu; khi phải cắt bớt thì
      // giữ người đang chọn ở giữa khung.
      const scale = Math.max(overviewMinScale(width), fit)
      const viewWidth = width / scale
      const viewHeight = height / scale
      let x = box.x + box.width / 2 - viewWidth / 2
      let y = box.y - 16 / scale
      if (scale > fit) {
        const center = svgUserCenter(
          svg,
          svg.querySelector('.person.selected .personBox')
        )
        if (center) {
          ;({x, y} = clampViewBox(
            center.x - viewWidth / 2,
            center.y - viewHeight / 2,
            viewWidth,
            viewHeight,
            box,
            16 / scale
          ))
        }
      }
      svg.setAttribute('viewBox', `${x} ${y} ${viewWidth} ${viewHeight}`)
    } else if (!this._savedViewBox || this._focusPending) {
      this._frameRootFamily(svg, width, height)
    }
    this._focusPending = false
    this._overviewPending = false
  }

  /*
  Khung nhìn ban đầu theo lối đọc sổ chi: cặp vợ chồng gốc nằm trên cùng, con
  cháu trải xuống dưới. Căn gốc vào chính giữa như trước thì nửa trên màn hình
  trống và trên điện thoại ô vợ/chồng bị cắt mất bên phải.

  Điện thoại thu nhỏ vừa đủ để cả cặp vợ chồng nằm trong màn hình, nhưng không
  dưới 80% để chữ trong ô còn đọc được. Nếu người gốc nằm sâu trong biểu đồ
  (phạm vi toàn nhánh có tổ tiên phía trên) thì đưa người gốc về giữa; biểu đồ
  nhỏ hơn khung thì căn giữa theo chiều dọc.
  */
  _frameRootFamily(svg, width, height) {
    const root = svg.querySelector('.person.selected .personBox')
    const content = svg.querySelector('#chart-content')
    const matrix = svg.getScreenCTM()
    if (!root || !content || !matrix) return
    const inverse = matrix.inverse()
    const toUser = rect => {
      const a = svg.createSVGPoint()
      a.x = rect.left
      a.y = rect.top
      const b = svg.createSVGPoint()
      b.x = rect.right
      b.y = rect.bottom
      const p = a.matrixTransform(inverse)
      const q = b.matrixTransform(inverse)
      return {x: p.x, y: p.y, width: q.x - p.x, height: q.y - p.y}
    }
    const rootBox = toUser(root.getBoundingClientRect())
    const rootMidY = rootBox.y + rootBox.height / 2
    let minX = rootBox.x
    let maxX = rootBox.x + rootBox.width
    svg.querySelectorAll('.person:not(.selected) .personBox').forEach(card => {
      const box = toUser(card.getBoundingClientRect())
      const sameRank =
        Math.abs(box.y + box.height / 2 - rootMidY) < box.height / 2
      const adjacent = Math.abs(box.x - rootBox.x) <= rootBox.width * 1.6
      if (sameRank && adjacent) {
        minX = Math.min(minX, box.x)
        maxX = Math.max(maxX, box.x + box.width)
      }
    })
    const margin = 24
    const coupleWidth = maxX - minX
    const scale =
      coupleWidth + 2 * margin > width
        ? Math.max(0.8, (width - 2 * margin) / coupleWidth)
        : 1
    const viewWidth = width / scale
    const viewHeight = height / scale
    const x = (minX + maxX) / 2 - viewWidth / 2
    // Trên điện thoại chừa chỗ cho ô chọn phạm vi nổi ở góc trên trái.
    const topInset = chartTopInset(width) / scale
    let y = rootBox.y - margin / scale - topInset
    const contentBox = toUser(content.getBoundingClientRect())
    const personCount = svg.querySelectorAll('.person .personBox').length
    // Với một gia đình nhỏ trên điện thoại, ưu tiên thấy trọn các thẻ gần gốc.
    // Thu vừa đủ theo bề rộng máy, vẫn giữ chữ đọc được và tránh hai thẻ con
    // bị cắt ở cả hai mép, vốn khiến biểu đồ trông như bị vỡ khi vừa mở.
    if (width <= 600 && personCount <= 5) {
      const compactPhone = width <= 360
      const smallMargin = compactPhone ? 8 : 12
      const smallMinScale = compactPhone ? 0.66 : 0.8
      const contentScale = Math.min(
        1,
        (width - 2 * smallMargin) / contentBox.width,
        (height - 2 * smallMargin - chartTopInset(width)) / contentBox.height
      )
      if (contentScale >= smallMinScale) {
        const smallScale = Math.max(smallMinScale, contentScale)
        const smallViewWidth = width / smallScale
        const smallViewHeight = height / smallScale
        const smallX = contentBox.x + contentBox.width / 2 - smallViewWidth / 2
        const smallY =
          contentBox.y + contentBox.height / 2 - smallViewHeight / 2
        svg.setAttribute(
          'viewBox',
          `${smallX} ${smallY} ${smallViewWidth} ${smallViewHeight}`
        )
        return
      }
    }
    if (contentBox.height + 2 * margin <= viewHeight) {
      y = contentBox.y + contentBox.height / 2 - viewHeight / 2
    } else if (rootBox.y - contentBox.y > viewHeight / 3) {
      y = rootMidY - viewHeight / 2
    } else {
      y = contentBox.y - margin / scale - topInset
    }
    svg.setAttribute('viewBox', `${x} ${y} ${viewWidth} ${viewHeight}`)
  }

  renderChart() {
    if (this.data.length === 0 || !this.grampsId) {
      return ''
    }
    return html`
      ${RelationshipChart(this.data, {
        nAnc: this.nAnc,
        maxImages: this.nMaxImages,
        grampsId: this.grampsId,
        getImageUrl: d => getImageUrl(d?.data || {}, 100),
        bboxWidth: this.containerWidth,
        bboxHeight: this.containerHeight,
        nameDisplayFormat: this.nameDisplayFormat,
        canEdit: this.canEdit,
        initialZoom: this._savedZoom,
        initialViewBox: this._savedViewBox,
        onReady: svg => this._chartReady(svg),
      })}
    `
  }
}

window.customElements.define(
  'grampsjs-relationship-chart',
  GrampsjsRelationshipChart
)
