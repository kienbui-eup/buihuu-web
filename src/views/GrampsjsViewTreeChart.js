import {html} from 'lit'
import {GrampsjsViewTreeChartBase} from './GrampsjsViewTreeChartBase.js'
import '../components/GrampsjsLineageChart.js'
import '../components/GrampsjsTreeChartAddPerson.js'
import {loadTreePeople} from '../charts/treeData.js'
import {DEFAULT_TREE_VIEW} from '../treeDefaults.js'

export class GrampsjsViewTreeChart extends GrampsjsViewTreeChartBase {
  static get properties() {
    return {treeView: {type: String}}
  }

  constructor() {
    super()
    this.treeView = DEFAULT_TREE_VIEW
  }

  get nameDisplayFormat() {
    return (
      this.appState?.settings?.treeChartNameDisplayFormat ??
      this.defaults.nameDisplayFormat
    )
  }

  set nameDisplayFormat(value) {
    this.appState.updateSettings({treeChartNameDisplayFormat: value}, false)
  }

  _resetLevels() {
    this.nameDisplayFormat = this.defaults.nameDisplayFormat
  }

  async _fetchData(grampsId, force = false) {
    const key = `${this.appState.dbInfo?.tree?.id || ''}:${
      this.appState.i18n.lang || 'en'
    }`
    if (
      !force &&
      this._dataApi === this.appState.apiGet &&
      (this._loadedKey === key || this._pendingKey === key)
    )
      return
    this._dataApi = this.appState.apiGet
    this._pendingKey = key
    const fetchId = ++this._fetchId
    this.loading = true
    const result = await loadTreePeople(this.appState, force).catch(() => ({
      error: 'Không tải được cây gia phả. Vui lòng thử lại.',
    }))
    if (fetchId !== this._fetchId) return
    this.loading = false
    this._pendingKey = null
    if ('data' in result) {
      this._data = result.data
      this._loadedKey = key
      this.error = false
    } else {
      this._loadedKey = null
      this.error = true
      this._errorMessage = result.error
    }
  }

  handleUpdateStaleData() {
    this._fetchData(this.grampsId, true)
  }

  _collapseLineage() {
    this._backToHomePerson()
    this.renderRoot.querySelector('grampsjs-lineage-chart')?.collapseAll()
  }

  _showOverview() {
    this.renderRoot.querySelector('grampsjs-lineage-chart')?.showOverview()
  }

  // eslint-disable-next-line class-methods-use-this
  renderSummary() {
    return 'Chạm một người để xem hậu duệ.'
  }

  renderChart() {
    return html`
      <div @add-new-person-relation="${this._handleAddPersonRelation}">
        <grampsjs-lineage-chart
          grampsId=${this.grampsId}
          homePerson=${this.settings.homePerson ||
          this.appState.settings?.homePerson ||
          ''}
          nameDisplayFormat=${this.nameDisplayFormat}
          ?canEdit=${this._editMode}
          .data=${this._data}
          .appState=${this.appState}
        ></grampsjs-lineage-chart>
      </div>
    `
  }

  renderContent() {
    return html`
      ${super.renderContent()}
      <grampsjs-tree-chart-add-person
        .appState=${this.appState}
      ></grampsjs-tree-chart-add-person>
    `
  }
}

window.customElements.define('grampsjs-view-tree-chart', GrampsjsViewTreeChart)
