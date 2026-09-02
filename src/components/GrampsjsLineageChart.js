import {css} from 'lit'
import {GrampsjsTreeChart} from './GrampsjsTreeChart.js'
import {TreeChart} from '../charts/TreeChart.js'
import {LineageIndex} from '../charts/lineage.js'
import {fireEvent} from '../util.js'

export class GrampsjsLineageChart extends GrampsjsTreeChart {
  static get properties() {
    return {homePerson: {type: String}}
  }

  static get styles() {
    return [
      super.styles,
      css`
        .tree-selected .person-card {
          stroke: #d32f2f;
          stroke-width: 3px;
          fill: color-mix(in srgb, #d32f2f 8%, var(--md-sys-color-surface));
          vector-effect: non-scaling-stroke;
        }
        svg a:focus-visible .person-card {
          stroke: #d32f2f;
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
    if (this._expanded.has(handle)) this._expanded.delete(handle)
    else this._expanded.add(handle)
    this.focusPerson()
    fireEvent(this, 'pedigree:person-selected', {grampsId})
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
    const scale = Math.min(
      1,
      (this.containerWidth - 48) / box.width,
      (this.containerHeight - 88) / box.height
    )
    const width = this.containerWidth / scale
    const height = this.containerHeight / scale
    svg.setAttribute(
      'viewBox',
      `${box.x + box.width / 2 - width / 2} ${
        box.y - 64 / scale
      } ${width} ${height}`
    )
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
      gapY: 44,
      bboxWidth: this.containerWidth,
      bboxHeight: this.containerHeight,
      nameDisplayFormat: this.nameDisplayFormat,
      canEdit: this.canEdit,
      initialZoom: this._savedZoom,
      initialViewBox: this._savedViewBox,
      selectedGrampsId: this.grampsId,
      onPersonClick: id => this._togglePerson(id),
    })
  }

  // eslint-disable-next-line class-methods-use-this
  renderChildrenMenu() {
    return ''
  }
}

window.customElements.define('grampsjs-lineage-chart', GrampsjsLineageChart)
