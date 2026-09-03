import {css, html} from 'lit'
import {map} from 'lit/directives/map.js'

import '@material/mwc-textfield'
import '@material/web/dialog/dialog.js'
import '@material/web/button/text-button.js'
import '@material/web/fab/fab.js'
import '@material/web/iconbutton/icon-button.js'

import {mdiPencil} from '@mdi/js'
import '../components/GrampsjsIcon.js'
import '../components/GrampsjsObjectPickerDialog.js'
import {GrampsjsView} from './GrampsjsView.js'
import {GrampsjsStaleDataMixin} from '../mixins/GrampsjsStaleDataMixin.js'
import '../components/GrampsjsTooltip.js'

import {chartNameDisplayFormat, fireEvent} from '../util.js'
import {iconButtonColorStyles} from '../SharedStyles.js'

export class GrampsjsViewTreeChartBase extends GrampsjsStaleDataMixin(
  GrampsjsView
) {
  static get styles() {
    return [
      super.styles,
      iconButtonColorStyles,
      css`
        :host {
          display: block;
          margin: 0;
        }

        .chart-shell {
          position: relative;
          --grampsjs-chart-height: max(
            260px,
            calc(
              100dvh - var(--tree-content-top, 64px) -
                var(--tree-bottom-inset, 0px) - 40px
            )
          );
        }

        #chart {
          height: var(--grampsjs-chart-height);
        }

        @media (max-width: 991px) {
          .chart-shell {
            --tree-bottom-inset: calc(66px + env(safe-area-inset-bottom, 0px));
          }
        }

        #menu-controls mwc-textfield {
          width: 6em;
        }

        #menu-controls table {
          width: 100%;
        }

        #menu-controls td {
          padding: 8px;
        }

        @media (max-width: 600px) {
          #menu-controls tr,
          #menu-controls td {
            display: block;
          }

          #menu-controls tr + tr {
            margin-top: 16px;
          }

          #menu-controls td {
            padding: 0 0 8px;
          }

          #menu-controls mwc-select {
            width: 100%;
            min-width: 0;
          }
        }

        md-fab {
          position: fixed;
          bottom: 32px;
          right: 32px;
        }

        @media (max-width: 991px) {
          md-fab {
            bottom: calc(80px + env(safe-area-inset-bottom, 0px));
            right: 16px;
          }
        }
      `,
    ]
  }

  static get properties() {
    return {
      grampsId: {type: String},
      disableBack: {type: Boolean},
      disableHome: {type: Boolean},
      nAnc: {type: Number},
      nDesc: {type: Number},
      nMaxImages: {type: Number},
      nameDisplayFormat: {type: String},
      _data: {type: Array},
      _setAnc: {type: Boolean},
      _setDesc: {type: Boolean},
      _setMaxImages: {type: Boolean},
      _editMode: {type: Boolean},
    }
  }

  defaults = {
    nAnc: 1,
    nDesc: 1,
    nMaxImages: 50,
    nameDisplayFormat: chartNameDisplayFormat.surnameThenGiven,
  }

  constructor() {
    super()
    this.grampsId = ''
    this.disableBack = false
    this.disableHome = false
    this._data = []
    this._setAnc = false
    this._setDesc = false
    this._setSep = false
    this._setMaxImages = false
    this._editMode = false
    this._fetchId = 0
    this._boundToggleEditMode = this._toggleEditMode.bind(this)
    this._boundDisableEditMode = this._disableEditMode.bind(this)
    this._boundHeaderResize = () => this._updateChartSize()
    this._boundToolsRequest = () => this._publishHeaderTools()
    this._boundTreeAction = (action, value) =>
      this._handleTreeAction(action, value)
  }

  connectedCallback() {
    super.connectedCallback()
    window.addEventListener('edit-mode:toggle', this._boundToggleEditMode)
    window.addEventListener('edit-mode:off', this._boundDisableEditMode)
    window.addEventListener('page-header:resize', this._boundHeaderResize)
    window.addEventListener('resize', this._boundHeaderResize)
    window.addEventListener('tree:tools-request', this._boundToolsRequest)
  }

  firstUpdated() {
    super.firstUpdated()
    this._updateChartSize()
  }

  updated(changed) {
    super.updated(changed)
    this._publishHeaderTools()
    this._updateChartSize()
  }

  _updateChartSize() {
    if (!this.active) return
    const chart = this.renderRoot.querySelector('#chart')
    const shell = this.renderRoot.querySelector('.chart-shell')
    if (chart)
      shell?.style.setProperty(
        '--tree-content-top',
        `${Math.max(0, chart.getBoundingClientRect().top + window.scrollY)}px`
      )
  }

  _publishHeaderTools() {
    if (!this.active || !this.treeView) return
    fireEvent(window, 'tree:tools', {
      owner: this,
      view: this.treeView,
      disableBack: this.disableBack,
      disableHome: this.disableHome,
      summary: this.loading ? 'Đang tải gia phả…' : this.renderSummary(),
      onAction: this._boundTreeAction,
    })
  }

  _handleTreeAction(action, value) {
    if (!this.active) return
    const actions = {
      home: () => this._backToHomePerson(),
      back: () => this._handleBack(),
      person: () => this._goToPerson(),
      preferences: () => this._openMenuControls(),
      overview: () => this._showOverview(),
      collapse: () => this._collapseLineage(),
      focus: () => this._focusSelected(),
      view: () => fireEvent(this, 'tree:view', {view: value}),
    }
    actions[action]?.()
  }

  disconnectedCallback() {
    super.disconnectedCallback()
    window.removeEventListener('edit-mode:toggle', this._boundToggleEditMode)
    window.removeEventListener('edit-mode:off', this._boundDisableEditMode)
    window.removeEventListener('page-header:resize', this._boundHeaderResize)
    window.removeEventListener('resize', this._boundHeaderResize)
    window.removeEventListener('tree:tools-request', this._boundToolsRequest)
    fireEvent(window, 'tree:tools-clear', {owner: this})
  }

  get nAnc() {
    return this.defaults.nAnc
  }

  get nDesc() {
    return this.defaults.nDesc
  }

  get nMaxImages() {
    return this.defaults.nMaxImages
  }

  get nameDisplayFormat() {
    return this.defaults.nameDisplayFormat
  }

  renderContent() {
    return html`<div class="chart-shell">
        <div id="chart">${this.renderChart()}</div>
      </div>
      ${this.renderControls()}
      <grampsjs-object-picker-dialog
        objectType="person"
        .appState="${this.appState}"
        @select-object:selected="${this._handlePersonPicked}"
      ></grampsjs-object-picker-dialog>
      ${this.appState.permissions.canEdit && !this._editMode
        ? this.renderFab()
        : ''}`
  }

  // Without this the only way into the chart is the home person and whatever
  // can be reached by clicking node after node — unworkable in a lineage of
  // 1504 people where most names repeat.
  _openPersonPicker() {
    this.renderRoot.querySelector('grampsjs-object-picker-dialog')?.open('')
  }

  _handlePersonPicked(event) {
    const grampsId =
      event.detail?.object?.gramps_id ?? event.detail?.gramps_id ?? ''
    if (!grampsId) {
      return
    }
    if (grampsId === this.grampsId) {
      this.renderRoot
        .querySelector(
          'grampsjs-tree-chart, grampsjs-lineage-chart, grampsjs-relationship-chart'
        )
        ?.focusPerson()
    }
    window.dispatchEvent(
      new CustomEvent('pedigree:person-selected', {detail: {grampsId}})
    )
  }

  renderFab() {
    return html`
      <md-fab
        variant="secondary"
        aria-label="${this._('Edit')}"
        @click="${this._enableEditMode}"
      >
        <grampsjs-icon
          slot="icon"
          .path="${mdiPencil}"
          color="var(--mdc-theme-on-secondary)"
        ></grampsjs-icon>
      </md-fab>
    `
  }

  _enableEditMode() {
    this._editMode = true
    fireEvent(this, 'edit-mode:on', {
      title: this._('Edit'),
      hideDeleteButton: true,
    })
  }

  _disableEditMode() {
    this._editMode = false
  }

  _handleAddPersonRelation(e) {
    const personData = this._data.find(p => p.handle === e.detail.handle)
    if (!personData) {
      return
    }
    const addPersonEl = this.renderRoot.querySelector(
      'grampsjs-tree-chart-add-person'
    )
    if (addPersonEl) {
      addPersonEl.open(personData)
    }
  }

  _toggleEditMode() {
    if (!this.active || !this.appState.permissions.canEdit) {
      return
    }
    if (this._editMode) {
      this._disableEditMode()
      fireEvent(this, 'edit-mode:off', {})
    } else {
      this._enableEditMode()
    }
  }

  renderControls() {
    return html`
      <md-dialog id="menu-controls">
        <div slot="headline">Tùy chọn gia phả</div>
        <div slot="content">
          <table>
            ${this._setAnc
              ? html` <tr>
                  <td>${this._('Max Ancestor Generations')}</td>
                  <td>
                    <mwc-textfield
                      value=${this.nAnc}
                      type="number"
                      min="1"
                      @change=${this._handleChangeAnc}
                    ></mwc-textfield>
                  </td>
                </tr>`
              : ''}${this._setDesc
              ? html`
                  <tr>
                    <td>${this._('Max Descendant Generations')}</td>
                    <td>
                      <mwc-textfield
                        value=${this.nDesc}
                        type="number"
                        min="0"
                        @change=${this._handleChangeDesc}
                      ></mwc-textfield>
                    </td>
                  </tr>
                `
              : ''}${this._setSep
              ? html`
                  <tr>
                    <td>${this._('Max Degree of Separation')}</td>
                    <td>
                      <mwc-textfield
                        value=${this.nAnc}
                        type="number"
                        min="0"
                        @change=${this._handleChangeAnc}
                      ></mwc-textfield>
                    </td>
                  </tr>
                `
              : ''}${this._setMaxImages
              ? html`
                  <tr>
                    <td>${this._('Max Number of Images displayed')}</td>
                    <td>
                      <mwc-textfield
                        value=${this.nMaxImages}
                        type="number"
                        min="0"
                        size="5"
                        @change=${this._handleChangeMaxImages}
                      ></mwc-textfield>
                    </td>
                  </tr>
                `
              : ''}
            <tr>
              <td>${this._('Name Display Format')}</td>
              <td>
                <mwc-select
                  fixedMenuPosition
                  id="name-display-format"
                  @change=${this._handleChangeNameDisplayFormat}
                >
                  ${map(
                    Object.values(chartNameDisplayFormat),
                    i => html` <mwc-list-item
                      value="${i}"
                      ?selected="${i === this.nameDisplayFormat}"
                      >${this._(i)}</mwc-list-item
                    >`
                  )}
                </mwc-select>
              </td>
            </tr>
          </table>
        </div>
        <div slot="actions">
          <md-text-button @click="${this._resetLevels}"
            >${this._('Reset')}</md-text-button
          >
          <md-text-button @click="${this._closeMenuControls}"
            >${this._('Close')}</md-text-button
          >
        </div>
      </md-dialog>
    `
  }

  // eslint-disable-next-line class-methods-use-this
  renderChart() {
    return ''
  }

  _backToHomePerson() {
    fireEvent(this, 'tree:home')
  }

  _prevPerson() {
    fireEvent(this, 'tree:back')
  }

  update(changed) {
    super.update(changed)
    if (changed.has('grampsId') || changed.has('settings')) {
      this._fetchData(this.grampsId)
    }
  }

  handleUpdateStaleData() {
    this._fetchData(this.grampsId)
  }

  // eslint-disable-next-line class-methods-use-this
  _resetLevels() {}

  _getPersonRules(grampsId) {
    return {
      function: 'or',
      rules: [
        {
          name: 'IsLessThanNthGenerationAncestorOf',
          values: [grampsId, this.nAnc + 1],
        },
        {
          name: 'IsLessThanNthGenerationDescendantOf',
          values: [grampsId, this.nDesc + 1],
        },
      ],
    }
  }

  async _fetchData(grampsId) {
    this._fetchId += 1
    const fetchId = this._fetchId
    this.loading = true
    const rules = this._getPersonRules(grampsId)
    const data = await this.appState.apiGet(
      `/api/people/?rules=${encodeURIComponent(JSON.stringify(rules))}&locale=${
        this.appState.i18n.lang || 'en'
      }&profile=self&extend=event_ref_list,primary_parent_family,family_list`
    )
    if (fetchId !== this._fetchId) {
      return
    }
    this.loading = false
    if ('data' in data) {
      this.error = false
      this._data = data.data
    } else if ('error' in data) {
      this.error = true
      this._errorMessage = data.error
    }
  }

  _goToPerson() {
    fireEvent(this, 'tree:person')
  }

  _handleBack() {
    fireEvent(this, 'tree:back')
  }

  _handleChangeAnc(e) {
    this.nAnc = parseInt(e.target.value, 10)
  }

  _handleChangeDesc(e) {
    this.nDesc = parseInt(e.target.value, 10)
  }

  _handleChangeMaxImages(e) {
    this.nMaxImages = parseInt(e.target.value, 10)
  }

  _handleChangeNameDisplayFormat(e) {
    this.nameDisplayFormat = e.target.value
  }

  _openMenuControls() {
    this.shadowRoot.getElementById('menu-controls').show()
  }

  _closeMenuControls() {
    this.shadowRoot.getElementById('menu-controls').close()
  }
}
