import {html, css} from 'lit'
import {zoomTransform} from 'd3-zoom'

import '@material/mwc-menu'
import '@material/mwc-list/mwc-list-item'

import {GrampsjsChartBase} from './GrampsjsChartBase.js'
import {RelationshipChart} from '../charts/RelationshipChart.js'
import {getImageUrl} from '../charts/util.js'

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
      const card = svg.querySelector('.person.selected .personBox')
      const matrix = svg.getScreenCTM()
      if (card && matrix) {
        const box = card.getBoundingClientRect()
        const point = svg.createSVGPoint()
        point.x = box.x + box.width / 2
        point.y = box.y + box.height / 2
        const center = point.matrixTransform(matrix.inverse())
        svg.setAttribute(
          'viewBox',
          `${center.x - width / 2} ${center.y - height / 2} ${width} ${height}`
        )
      }
    }
    this._focusPending = false
    this._overviewPending = false
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
