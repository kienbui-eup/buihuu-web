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
import '../components/GrampsjsTreeToolbar.js'

import {chartNameDisplayFormat, fireEvent} from '../util.js'
import {iconButtonColorStyles} from '../SharedStyles.js'
import {treeViewShortLabel} from '../treeDefaults.js'

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
          isolation: isolate;
          overflow: hidden;
          color: var(--md-sys-color-on-surface);
          background: color-mix(
            in srgb,
            var(--heritage-gold) 3%,
            var(--md-sys-color-background)
          );
          --grampsjs-chart-height: max(
            180px,
            calc(
              100dvh - var(--tree-content-top, 64px) -
                var(--tree-bottom-inset, 0px) - var(--tree-footer-height, 40px)
            )
          );
        }

        .chart-shell::before {
          content: '';
          position: absolute;
          z-index: 2;
          inset: 0;
          border: 1px solid
            color-mix(in srgb, var(--heritage-rule) 50%, transparent);
          pointer-events: none;
        }

        /* Chú thích góc dưới trái: đang xem phạm vi nào, bao nhiêu người, từ
           ai; trên máy tính thêm một dòng cách thao tác. Người tra cứu trên
           điện thoại luôn biết mình đang ở đâu mà không phải mở menu. */
        .chart-caption {
          position: absolute;
          z-index: 3;
          left: 18px;
          bottom: 18px;
          max-width: min(560px, calc(100% - 128px));
          padding: 7px 12px;
          color: var(--md-sys-color-on-surface-variant);
          background: color-mix(
            in srgb,
            var(--heritage-gold) 8%,
            var(--md-sys-color-surface)
          );
          border: 1px solid var(--heritage-rule);
          border-left: 3px solid var(--heritage-gold);
          border-radius: var(--grampsjs-frame-radius);
          box-shadow: 0 2px 10px var(--grampsjs-body-font-color-10);
          backdrop-filter: blur(4px);
          font-size: 12px;
          line-height: 1.5;
          pointer-events: none;
        }

        .chart-caption strong {
          font-weight: 600;
          color: var(--heritage-ink);
        }

        .chart-caption .hint {
          display: block;
          font-size: 11px;
          opacity: 0.8;
        }

        .chart-status {
          position: absolute;
          z-index: 4;
          left: 50%;
          top: 44%;
          translate: -50% -50%;
          width: min(320px, calc(100% - 48px));
          box-sizing: border-box;
          padding: 22px 24px;
          color: var(--md-sys-color-on-surface);
          background: color-mix(
            in srgb,
            var(--heritage-gold) 8%,
            var(--md-sys-color-surface)
          );
          border: 1px solid var(--heritage-rule);
          border-top: 3px solid var(--heritage-gold);
          border-radius: 6px;
          box-shadow: 0 10px 32px var(--grampsjs-body-font-color-20);
          backdrop-filter: blur(8px);
          text-align: center;
        }

        .chart-status strong {
          display: block;
          color: var(--heritage-ink);
          font-family: var(--grampsjs-heading-font-family);
          font-size: 17px;
          margin-bottom: 4px;
        }

        .chart-status span {
          display: block;
          color: var(--md-sys-color-on-surface-variant);
          font-size: 13px;
        }

        .chart-status button {
          min-height: 44px;
          margin-top: 14px;
          padding: 0 18px;
          color: var(--md-sys-color-on-primary);
          background: var(--md-sys-color-primary);
          border: 0;
          border-radius: 4px;
          font: inherit;
          cursor: pointer;
        }

        .chart-status button:focus-visible {
          outline: 2px solid var(--heritage-gold);
          outline-offset: 3px;
        }

        #chart {
          position: relative;
          z-index: 1;
          height: var(--grampsjs-chart-height);
        }

        @media (max-width: 991px) {
          .chart-shell {
            --tree-bottom-inset: calc(66px + env(safe-area-inset-bottom, 0px));
            --tree-footer-height: 0px;
          }
          .chart-shell::before {
            content: none;
          }
          .chart-caption {
            left: 8px;
            bottom: 8px;
            max-width: calc(100% - 100px);
            padding: 5px 8px;
            border-left-width: 1px;
            box-shadow: none;
          }
          .chart-caption .hint {
            display: none;
          }
        }

        /* Hộp tuỳ chọn: mỗi tuỳ chọn một hàng nhãn và ô nhập viền mảnh, cùng
           nét chỉ với các khung khác thay cho bảng và ô nền xám của bản gốc. */
        #menu-controls .field {
          display: grid;
          grid-template-columns: 1fr minmax(140px, 220px);
          gap: 8px 16px;
          align-items: center;
          padding: 12px 0;
          border-bottom: 1px solid var(--heritage-rule);
        }

        #menu-controls .field:last-child {
          border-bottom: 0;
        }

        #menu-controls .field > span {
          font-size: 14px;
          line-height: 1.5;
          color: var(--md-sys-color-on-surface);
        }

        #menu-controls mwc-textfield {
          width: 7em;
          justify-self: end;
        }

        #menu-controls mwc-select {
          width: 100%;
          min-width: 0;
        }

        #menu-controls mwc-textfield,
        #menu-controls mwc-select {
          --mdc-shape-small: var(--grampsjs-frame-radius);
          --mdc-text-field-outlined-idle-border-color: var(--heritage-rule);
          --mdc-text-field-outlined-hover-border-color: var(--heritage-gold);
          --mdc-select-outlined-idle-border-color: var(--heritage-rule);
          --mdc-select-outlined-hover-border-color: var(--heritage-gold);
        }

        @media (max-width: 600px) {
          #menu-controls .field {
            grid-template-columns: 1fr;
          }

          #menu-controls mwc-textfield {
            justify-self: start;
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

        @media (max-width: 991px) and (max-height: 500px) {
          md-fab {
            right: 72px;
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
    this._boundTreeAction = (action, value) =>
      this._handleTreeAction(action, value)
  }

  connectedCallback() {
    super.connectedCallback()
    window.addEventListener('edit-mode:toggle', this._boundToggleEditMode)
    window.addEventListener('edit-mode:off', this._boundDisableEditMode)
    window.addEventListener('page-header:resize', this._boundHeaderResize)
    window.addEventListener('resize', this._boundHeaderResize)
  }

  firstUpdated() {
    super.firstUpdated()
    this._updateChartSize()
  }

  updated(changed) {
    super.updated(changed)
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

  // Công cụ nổi thành một cột bên phải, gồm cả nút chọn nhánh.
  renderToolbar() {
    if (!this.treeView || this._editMode) return ''
    return html`<grampsjs-tree-toolbar
      .state=${{
        view: this.treeView,
        appState: this.appState,
        grampsId: this.grampsId,
        homePerson: this.settings?.homePerson ?? '',
        disableBack: this.disableBack,
        disableHome: this.disableHome,
        onAction: this._boundTreeAction,
      }}
    ></grampsjs-tree-toolbar>`
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
      search: () => this._openPersonPicker(),
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
        ${this.loading
          ? html`<div class="chart-status" role="status">
              <strong>Đang mở gia phả</strong>
              <span>Vui lòng chờ trong giây lát…</span>
            </div>`
          : ''}
        ${this.error
          ? html`<div class="chart-status" role="alert">
              <strong>Chưa mở được gia phả</strong>
              <span>Kiểm tra kết nối rồi thử tải lại.</span>
              <button
                type="button"
                @click=${() => this.handleUpdateStaleData()}
              >
                Thử lại
              </button>
            </div>`
          : ''}
        ${!this.loading && !this.error ? this.renderCaption() : ''}
        ${this.renderToolbar()}
      </div>
      ${this.renderControls()}
      <grampsjs-object-picker-dialog
        objectType="person"
        nameSearch
        .appState="${this.appState}"
        @select-object:selected="${this._handlePersonPicked}"
      ></grampsjs-object-picker-dialog>
      ${this.appState.permissions.canEdit && !this._editMode
        ? this.renderFab()
        : ''}`
  }

  renderCaption() {
    if (!this.treeView) return ''
    return html`<div class="chart-caption" role="status">
      <strong>${treeViewShortLabel(this.treeView)}</strong> ·
      ${this.renderSummary()}
      <span class="hint">Kéo để di chuyển · Cuộn hoặc chụm để thu phóng</span>
    </div>`
  }

  // Lớp con mô tả phạm vi đang xem (số người, từ ai); mặc định để trống.
  // eslint-disable-next-line class-methods-use-this
  renderSummary() {
    return ''
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
          ${this._setAnc
            ? html`<div class="field">
                <span>${this._('Max Ancestor Generations')}</span>
                <mwc-textfield
                  outlined
                  value=${this.nAnc}
                  type="number"
                  min="1"
                  @change=${this._handleChangeAnc}
                ></mwc-textfield>
              </div>`
            : ''}
          ${this._setDesc
            ? html`<div class="field">
                <span>${this._('Max Descendant Generations')}</span>
                <mwc-textfield
                  outlined
                  value=${this.nDesc}
                  type="number"
                  min="0"
                  @change=${this._handleChangeDesc}
                ></mwc-textfield>
              </div>`
            : ''}
          ${this._setSep
            ? html`<div class="field">
                <span>${this._('Max Degree of Separation')}</span>
                <mwc-textfield
                  outlined
                  value=${this.nAnc}
                  type="number"
                  min="0"
                  @change=${this._handleChangeAnc}
                ></mwc-textfield>
              </div>`
            : ''}
          ${this._setMaxImages
            ? html`<div class="field">
                <span>${this._('Max Number of Images displayed')}</span>
                <mwc-textfield
                  outlined
                  value=${this.nMaxImages}
                  type="number"
                  min="0"
                  size="5"
                  @change=${this._handleChangeMaxImages}
                ></mwc-textfield>
              </div>`
            : ''}
          <div class="field">
            <span>${this._('Name Display Format')}</span>
            <mwc-select
              outlined
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
          </div>
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
