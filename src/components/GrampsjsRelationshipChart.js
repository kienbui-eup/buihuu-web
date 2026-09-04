import {html, css} from 'lit'
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
    return [
      super.styles,
      css`
        svg a {
          text-decoration: none !important;
        }
        /* Nút "Xem hậu duệ" ở góc trên phải thẻ người có con cháu. */
        svg .card-action-bg {
          fill: color-mix(
            in srgb,
            var(--heritage-gold) 8%,
            var(--md-sys-color-surface)
          );
          stroke: var(--heritage-gold);
          stroke-width: 1.5px;
          vector-effect: non-scaling-stroke;
          filter: drop-shadow(0 1px 2px var(--grampsjs-body-font-color-30));
          transition: fill 140ms;
        }
        svg .card-action-icon {
          fill: var(--md-sys-color-primary);
        }
        svg .card-action:hover .card-action-bg {
          fill: color-mix(
            in srgb,
            var(--heritage-gold) 30%,
            var(--md-sys-color-surface)
          );
        }
        svg .personBox {
          stroke: var(--heritage-rule);
          stroke-width: 1.25px;
          vector-effect: non-scaling-stroke;
          filter: drop-shadow(0 2px 2px var(--grampsjs-body-font-color-20));
          transition: fill 140ms, stroke 140ms, filter 140ms;
        }
        svg .edge path {
          stroke: color-mix(
            in srgb,
            var(--heritage-gold) 58%,
            var(--heritage-wood)
          );
          stroke-opacity: 0.72;
        }
        svg .person-living .personBox {
          fill: transparent;
          stroke: transparent;
          filter: none;
        }
        svg .person-deceased {
          --person-card-text: #fff8e9;
          --person-card-muted-text: #e2cda7;
        }
        svg .person-deceased .personBox {
          fill: color-mix(in srgb, var(--heritage-wood) 88%, #6d2d22);
          stroke: var(--heritage-gold);
          stroke-width: 1.5px;
          filter: drop-shadow(0 4px 5px var(--grampsjs-body-font-color-30));
        }
        svg .person:hover .personBox,
        svg .person:focus-visible .personBox {
          stroke: var(--md-sys-color-primary);
          filter: drop-shadow(0 4px 5px var(--grampsjs-body-font-color-30));
        }
        svg .person-living:hover .personBox,
        svg .person-living:focus-visible .personBox {
          fill: transparent;
          stroke: transparent;
          filter: none;
        }
        svg .person-living:hover .nameplate-body,
        svg .person-living:focus-visible .nameplate-body {
          fill: color-mix(
            in srgb,
            var(--heritage-gold) 20%,
            var(--md-sys-color-surface)
          );
          stroke: var(--md-sys-color-primary);
        }
        svg .person-deceased:hover .personBox,
        svg .person-deceased:focus-visible .personBox {
          fill: color-mix(in srgb, var(--heritage-wood) 76%, #8a4833);
        }
        svg .edge,
        svg .memorial-inset,
        svg .memorial-base,
        svg .memorial-crest,
        svg .nameplate-body,
        svg .living-avatar-halo,
        svg .living-avatar-icon,
        svg .person-avatar-photo,
        svg .memorial-portrait * {
          vector-effect: non-scaling-stroke;
        }
        svg .nameplate-body {
          fill: color-mix(
            in srgb,
            var(--heritage-gold) 13%,
            var(--md-sys-color-surface)
          );
          stroke: color-mix(
            in srgb,
            var(--heritage-gold) 58%,
            var(--heritage-rule)
          );
          stroke-width: 1px;
          filter: drop-shadow(0 2px 3px var(--grampsjs-body-font-color-15));
          transition: fill 140ms, stroke 140ms;
        }
        svg .living-avatar-halo {
          fill: color-mix(
            in srgb,
            var(--heritage-gold) 26%,
            var(--md-sys-color-surface)
          );
          stroke: var(--heritage-gold);
          stroke-width: 1.25px;
          filter: drop-shadow(0 2px 3px var(--grampsjs-body-font-color-15));
        }
        svg .living-avatar-icon {
          fill: var(--heritage-ink);
          opacity: 0.78;
        }
        svg .person-avatar-photo {
          stroke: color-mix(
            in srgb,
            var(--md-sys-color-surface) 88%,
            var(--heritage-gold)
          );
          stroke-width: 2px;
          vector-effect: non-scaling-stroke;
          filter: drop-shadow(0 2px 3px var(--grampsjs-body-font-color-15));
        }
        svg .memorial-inset {
          fill: none;
          stroke: color-mix(in srgb, var(--heritage-gold) 72%, transparent);
          stroke-width: 1px;
        }
        svg .memorial-base {
          fill: none;
          stroke: var(--heritage-gold);
          stroke-width: 1.5px;
        }
        svg .memorial-crest {
          fill: none;
          stroke: color-mix(in srgb, var(--heritage-gold) 76%, transparent);
          stroke-width: 1px;
          stroke-linecap: round;
          stroke-linejoin: round;
        }
        svg .memorial-portrait-bg {
          fill: color-mix(
            in srgb,
            var(--heritage-gold) 16%,
            var(--heritage-wood)
          );
          stroke: var(--heritage-gold);
          stroke-width: 1.25px;
        }
        svg .memorial-portrait-icon {
          fill: #f1dfbd;
          opacity: 0.96;
        }
        svg .person.selected .personBox,
        svg .person:focus-visible .personBox {
          stroke: var(--heritage-gold);
          stroke-width: 3px;
          vector-effect: non-scaling-stroke;
          filter: drop-shadow(0 5px 8px var(--grampsjs-body-font-color-30));
        }
        svg .person.selected.person-living .personBox,
        svg .person.person-living:focus-visible .personBox {
          stroke: transparent;
          filter: none;
        }
        svg .person.selected.person-living .nameplate-body,
        svg .person.person-living:focus-visible .nameplate-body {
          stroke: var(--heritage-gold);
          stroke-width: 2.5px;
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
