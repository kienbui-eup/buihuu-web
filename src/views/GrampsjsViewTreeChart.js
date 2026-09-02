import {css, html} from 'lit'
import {GrampsjsViewTreeChartBase} from './GrampsjsViewTreeChartBase.js'
import '../components/GrampsjsLineageChart.js'
import '../components/GrampsjsTreeChartAddPerson.js'

export class GrampsjsViewTreeChart extends GrampsjsViewTreeChartBase {
  static get styles() {
    return [
      super.styles,
      css`
        .lineage-summary {
          margin: 0 0 12px;
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 4px 12px;
        }
        .lineage-summary p {
          margin: 0;
          flex: 1 1 100%;
          font-size: 13px;
        }
        #chart {
          --grampsjs-chart-height: max(260px, calc(100dvh - 235px));
        }
        @media (max-width: 768px) {
          #chart {
            --grampsjs-chart-height: max(260px, calc(100dvh - 335px));
          }
        }
      `,
    ]
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
    // Không giới hạn số đời. Chọn người hay mở nhánh dùng lại dữ liệu đã tải.
    const fields =
      'handle,gramps_id,gender,primary_name,alternate_names,attribute_list,profile,extended'
    const result = await this.appState.apiGet(
      `/api/people/?locale=${encodeURIComponent(
        this.appState.i18n.lang || 'en'
      )}&profile=self&extend=primary_parent_family,family_list&keys=${fields}`
    )
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
      <div class="lineage-summary">
        <p>
          ${this.loading
            ? 'Đang tải các đời…'
            : 'Đủ các đời · Theo dòng trưởng. Bấm để mở/thu nhánh con.'}
        </p>
        <md-text-button @click=${this._showOverview}>Toàn cây</md-text-button>
        <md-text-button @click=${this._collapseLineage}>Thu gọn</md-text-button>
      </div>
      ${super.renderContent()}
      <grampsjs-tree-chart-add-person
        .appState=${this.appState}
      ></grampsjs-tree-chart-add-person>
    `
  }
}

window.customElements.define('grampsjs-view-tree-chart', GrampsjsViewTreeChart)
