import {html, css} from 'lit'
import {zoomTransform} from 'd3-zoom'

import '@material/mwc-menu'
import '@material/mwc-list/mwc-list-item'

import {GrampsjsChartBase} from './GrampsjsChartBase.js'
import {RelationshipChart} from '../charts/RelationshipChart.js'
import {getImageUrl, rescaleViewBox} from '../charts/util.js'

class GrampsjsRelationshipChart extends GrampsjsChartBase {
  static get styles() {
    return [
      super.styles,
      css`
        svg a {
          text-decoration: none !important;
        }
        svg .personBox {
          fill: var(--md-sys-color-surface);
          stroke: var(--md-sys-color-outline-variant);
        }
        svg .person.selected .personBox,
        svg .person:focus-visible .personBox {
          stroke: #d32f2f;
          stroke-width: 3px;
          fill: color-mix(in srgb, #d32f2f 8%, var(--md-sys-color-surface));
          vector-effect: non-scaling-stroke;
        }
        mwc-menu {
          --mdc-typography-subtitle1-font-size: 13px;
          --mdc-menu-item-height: 36px;
        }
      `,
    ]
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
    if (changed.has('scope') && this.scope === 'all')
      this._overviewPending = true
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
      const scale = Math.min(
        1,
        (width - 32) / box.width,
        (height - 32) / box.height
      )
      svg.setAttribute(
        'viewBox',
        `${box.x + box.width / 2 - width / scale / 2} ${box.y - 16 / scale} ${
          width / scale
        } ${height / scale}`
      )
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
    let y = rootBox.y - margin / scale
    const contentBox = toUser(content.getBoundingClientRect())
    if (contentBox.height + 2 * margin <= viewHeight) {
      y = contentBox.y + contentBox.height / 2 - viewHeight / 2
    } else if (rootBox.y - contentBox.y > viewHeight / 3) {
      y = rootMidY - viewHeight / 2
    } else {
      y = contentBox.y - margin / scale
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
