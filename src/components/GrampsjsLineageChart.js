import {css} from 'lit'
import {GrampsjsTreeChart} from './GrampsjsTreeChart.js'
import {TreeChart} from '../charts/TreeChart.js'
import {LineageIndex} from '../charts/lineage.js'
import {fireEvent} from '../util.js'
import {clampViewBox, overviewMinScale, svgUserCenter} from '../charts/util.js'

export class GrampsjsLineageChart extends GrampsjsTreeChart {
  static get properties() {
    return {homePerson: {type: String}}
  }

  static get styles() {
    return [
      super.styles,
      css`
        .tree-selected .person-card {
          stroke: var(--heritage-gold);
          stroke-width: 3px;
          vector-effect: non-scaling-stroke;
          filter: drop-shadow(0 5px 8px var(--grampsjs-body-font-color-30));
        }
        .tree-selected.person-living .person-card {
          stroke: transparent;
          filter: none;
        }
        .tree-selected.person-living .nameplate-body {
          stroke: var(--heritage-gold);
          stroke-width: 2.5px;
        }
        svg a:focus-visible .person-card {
          stroke: var(--md-sys-color-primary);
          stroke-width: 3px;
        }
      `,
    ]
  }

  constructor() {
    super()
    this.homePerson = ''
    this.descendants = true
    this._expanded = new Set()
    this._index = new LineageIndex([])
    this._resetViewport = false
    this._overview = false
  }

  willUpdate(changed) {
    if (changed.has('data')) this._index = new LineageIndex(this.data)
    if (
      changed.has('data') ||
      changed.has('grampsId') ||
      changed.has('homePerson')
    ) {
      const root = this._index.root(this.homePerson, this.grampsId)
      const path = this._index.path(root, this._index.ids.get(this.grampsId))
      path.slice(0, -1).forEach(handle => this._expanded.add(handle))
    }
    super.willUpdate(changed)
    if (this._resetViewport) {
      this._savedZoom = null
      this._savedViewBox = null
      this._focusPending = false
      this._focused = false
      this._resetViewport = false
    }
  }

  _togglePerson(grampsId) {
    const handle = this._index.ids.get(grampsId)
    if (!handle) return
    fireEvent(this, 'tree:show-branch', {grampsId})
  }

  collapseAll() {
    this._expanded.clear()
    this._resetViewport = true
    this.requestUpdate()
  }

  showOverview() {
    this._overview = true
    this._resetViewport = true
    this.requestUpdate()
  }

  _fitChartToViewport() {
    if (!this._overview) {
      super._fitChartToViewport()
      return
    }
    const svg = this.renderRoot.querySelector('svg')
    const content = svg?.querySelector('#chart-content')
    if (!content || this.containerWidth <= 0 || this.containerHeight <= 0)
      return
    const box = content.getBBox()
    const fit = Math.min(
      1,
      (this.containerWidth - 32) / box.width,
      (this.containerHeight - 32) / box.height
    )
    // Vừa khung nhưng không thu quá tỷ lệ tối thiểu: cây 17 đời ép hết vào
    // một màn hình thì chữ chỉ còn vài px. Khi phải cắt bớt, giữ người đang
    // chọn (hoặc người gốc) trong khung.
    const scale = Math.max(overviewMinScale(this.containerWidth), fit)
    const width = this.containerWidth / scale
    const height = this.containerHeight / scale
    let x = box.x + box.width / 2 - width / 2
    let y = box.y - 16 / scale
    if (scale > fit) {
      const center = svgUserCenter(
        svg,
        svg.querySelector('.tree-selected .person-card') ||
          svg.querySelector('.tree-root .person-card')
      )
      if (center) {
        ;({x, y} = clampViewBox(
          center.x - width / 2,
          center.y - height / 2,
          width,
          height,
          box,
          16 / scale
        ))
      }
    }
    svg.setAttribute('viewBox', `${x} ${y} ${width} ${height}`)
    this._overview = false
    this._focused = true
  }

  renderChart() {
    const root = this._index.root(this.homePerson, this.grampsId)
    const data = this._index.tree(root, this._expanded)
    if (!data) return ''
    return TreeChart(data, null, {
      childrenTriangle: false,
      getImageUrl: () => '',
      gapX: 24,
      gapY: 30,
      bboxWidth: this.containerWidth,
      bboxHeight: this.containerHeight,
      nameDisplayFormat: this.nameDisplayFormat,
      canEdit: this.canEdit,
      initialZoom: this._savedZoom,
      initialViewBox: this._savedViewBox,
      selectedGrampsId: this.grampsId,
      onPersonClick: id => this._togglePerson(id),
      personActionLabel: 'Xem hậu duệ',
    })
  }

  // eslint-disable-next-line class-methods-use-this
  renderChildrenMenu() {
    return ''
  }
}

window.customElements.define('grampsjs-lineage-chart', GrampsjsLineageChart)
