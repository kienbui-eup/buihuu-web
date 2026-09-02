import {html} from 'lit'
import {GrampsjsViewTreeChart} from './GrampsjsViewTreeChart.js'
import {RelationshipScopeIndex} from '../charts/relationshipScope.js'
import {personProfileDisplayName} from '../util.js'
import '../components/GrampsjsRelationshipChart.js'

export class GrampsjsViewRelationshipChart extends GrampsjsViewTreeChart {
  static get properties() {
    return {scope: {type: String}}
  }

  constructor() {
    super()
    this.scope = 'descendants'
    this._setMaxImages = true
    this.defaults.nMaxImages = 0
  }

  get nMaxImages() {
    return (
      this.appState?.settings?.relationshipChartMaxImages ??
      this.defaults.nMaxImages
    )
  }

  set nMaxImages(value) {
    this.appState.updateSettings({relationshipChartMaxImages: value}, false)
  }

  get nameDisplayFormat() {
    return (
      this.appState?.settings?.relationshipChartNameDisplayFormat ??
      this.defaults.nameDisplayFormat
    )
  }

  set nameDisplayFormat(value) {
    this.appState.updateSettings(
      {relationshipChartNameDisplayFormat: value},
      false
    )
  }

  _resetLevels() {
    this.nMaxImages = this.defaults.nMaxImages
    this.nameDisplayFormat = this.defaults.nameDisplayFormat
  }

  get selection() {
    if (this._scopeSource !== this._data) {
      this._scopeSource = this._data
      this._scopeIndex = new RelationshipScopeIndex(this._data)
      this._scopeResults = new Map()
    }
    const key = `${this.scope}:${this.grampsId}`
    if (!this._scopeResults.has(key)) {
      this._scopeResults.set(
        key,
        this._scopeIndex.select(this.grampsId, this.scope)
      )
    }
    return this._scopeResults.get(key)
  }

  _showOverview() {
    this.renderRoot.querySelector('grampsjs-relationship-chart')?.showOverview()
  }

  _focusSelected() {
    this.renderRoot.querySelector('grampsjs-relationship-chart')?.focusPerson()
  }

  renderChart() {
    return html`
      <div @add-new-person-relation=${this._handleAddPersonRelation}>
        <grampsjs-relationship-chart
          grampsId=${this.grampsId}
          scope=${this.scope}
          nMaxImages=${this.nMaxImages}
          nameDisplayFormat=${this.nameDisplayFormat}
          ?canEdit=${this._editMode}
          .data=${this.selection.people}
        ></grampsjs-relationship-chart>
      </div>
    `
  }

  renderSummary() {
    const selection = this.selection
    const person = this._scopeIndex.people.get(
      this._scopeIndex.ids.get(this.grampsId)
    )
    const name = personProfileDisplayName(person?.profile)
    let summary = `Hậu duệ của ${name}`
    if (this.scope === 'all') summary = 'Toàn bộ gia phả'
    if (this.scope === 'branch')
      summary = selection.missingBranch
        ? `Chưa có nhãn chi/ngành. Đang xem nhánh từ ${name}.`
        : selection.label || 'Toàn nhánh đang xem'
    return `${selection.people.length} người · ${summary}`
  }
}

window.customElements.define(
  'grampsjs-view-relationship-chart',
  GrampsjsViewRelationshipChart
)
