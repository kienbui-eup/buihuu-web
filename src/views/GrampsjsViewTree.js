import {css, html} from 'lit'

import {GrampsjsView} from './GrampsjsView.js'

import './GrampsjsViewTreeChart.js'

import './GrampsjsViewRelationshipChart.js'
import {fireEvent} from '../util.js'
import {DEFAULT_TREE_VIEW, normalizeTreeView} from '../treeDefaults.js'

export class GrampsjsViewTree extends GrampsjsView {
  static get styles() {
    return [
      super.styles,
      css`
        :host {
          margin: 0;
        }

        /* Khung chung cho vùng vẽ và cột công cụ nổi. */
        .stage {
          position: relative;
        }

        .empty {
          max-width: 560px;
          margin: 32px var(--heritage-gutter);
          padding: 20px 24px;
        }

        .empty p {
          margin: 0;
          line-height: 1.7;
        }

        @media (max-width: 768px) {
          .empty {
            margin: 24px 16px;
          }
        }
      `,
    ]
  }

  static get properties() {
    return {
      grampsId: {type: String},
      view: {type: String},
      _history: {type: Array},
    }
  }

  constructor() {
    super()
    this.grampsId = ''
    this.view = DEFAULT_TREE_VIEW
    this._history = []
    this._appliedTreeDefaultView = null
    this._boundSelectPerson = this._selectPerson.bind(this)
  }

  shouldUpdate(changed) {
    // Allow one render when active changes so child chart views receive
    // the updated active value — the base class blocks renders when inactive.
    if (changed.has('active')) {
      return true
    }
    return super.shouldUpdate(changed)
  }

  updated(changed) {
    super.updated(changed)
    if (changed.has('view')) {
      fireEvent(this, 'edit-mode:off', {})
    }
  }

  renderContent() {
    if (this.grampsId === '') {
      return html`
        <div class="empty heritage-frame">
          <p class="section-label">Phả đồ</p>
          <p>
            ${this._('No Home Person set.')}
            <a href="/">${this._('Home')}</a>
          </p>
        </div>
      `
    }
    return html`<div class="stage">
      ${this.view === 'main'
        ? this._renderPedigree()
        : this._renderRelationshipChart()}
    </div>`
  }

  _handleViewChange(e) {
    this.view = normalizeTreeView(e.detail.view)
  }

  // Dải nút nhánh: đổi cả người gốc (đầu chi hay thủy tổ) và cách xem.
  _handleScope(e) {
    const {view, grampsId} = e.detail ?? {}
    if (grampsId && grampsId !== this.grampsId) this.grampsId = grampsId
    this.view = normalizeTreeView(view)
  }

  _openBranch(event) {
    this.grampsId = event.detail.grampsId
    this.view = 'descendants'
  }

  openSearch() {
    this.renderRoot
      .querySelector(
        'grampsjs-view-tree-chart, grampsjs-view-relationship-chart'
      )
      ?._openPersonPicker()
  }

  _renderRelationshipChart() {
    return html`
      <grampsjs-view-relationship-chart
        scope=${this.view}
        treeView=${this.view}
        @tree:scope=${this._handleScope}
        @tree:view=${this._handleViewChange}
        @tree:back="${this._prevPerson}"
        @tree:person="${this._goToPerson}"
        @tree:home="${this._backToHomePerson}"
        grampsId=${this.grampsId}
        ?active=${this.active}
        .appState="${this.appState}"
        .settings=${this.settings}
        ?disableBack=${this._history.length < 2}
        ?disableHome=${this._isHome()}
      >
      </grampsjs-view-relationship-chart>
    `
  }

  _renderPedigree() {
    return html`
      <grampsjs-view-tree-chart
        treeView=${this.view}
        @tree:scope=${this._handleScope}
        @tree:view=${this._handleViewChange}
        @tree:show-branch=${this._openBranch}
        @tree:back="${this._prevPerson}"
        @tree:person="${this._goToPerson}"
        @tree:home="${this._backToHomePerson}"
        grampsId=${this.grampsId}
        ?active=${this.active}
        .appState="${this.appState}"
        .settings=${this.settings}
        ?disableBack=${this._history.length < 2}
        ?disableHome=${this._isHome()}
      >
      </grampsjs-view-tree-chart>
    `
  }

  _prevPerson() {
    if (this._history.length < 2) return
    this._history = this._history.slice(0, -1)
    const previous = this._history.at(-1)
    this.grampsId = previous.grampsId
    this.view = previous.view
  }

  _isHome() {
    return (
      !this.settings.homePerson ||
      (this.grampsId === this.settings.homePerson && this.view === 'main')
    )
  }

  _backToHomePerson() {
    if (!this.settings.homePerson) return
    this.grampsId = this.settings.homePerson
    this.view = 'main'
  }

  _goToPerson() {
    fireEvent(this, 'nav', {path: `person/${this.grampsId}`})
  }

  connectedCallback() {
    super.connectedCallback()
    window.addEventListener('pedigree:person-selected', this._boundSelectPerson)
  }

  disconnectedCallback() {
    super.disconnectedCallback()
    window.removeEventListener(
      'pedigree:person-selected',
      this._boundSelectPerson
    )
  }

  willUpdate(changed) {
    super.willUpdate(changed)
    if (this.active && (changed.has('active') || changed.has('settings'))) {
      this._applyPreferredViewIfNeeded()
    }
    // Lưu cả phạm vi xem; đổi nhánh có thể giữ nguyên người gốc.
    // Ghi trước render để trạng thái nút luôn khớp với màn hình hiện tại.
    const current = {grampsId: this.grampsId, view: this.view}
    const previous = this._history.at(-1)
    if (
      current.grampsId &&
      (current.grampsId !== previous?.grampsId ||
        current.view !== previous?.view)
    ) {
      this._history = [...this._history, current].slice(-100)
    }
  }

  _applyPreferredViewIfNeeded() {
    const preferredView = normalizeTreeView(this.settings?.treeDefaultView)
    if (preferredView === this._appliedTreeDefaultView) {
      return
    }
    this._appliedTreeDefaultView = preferredView
    if (this.view !== preferredView) {
      this.view = preferredView
    }
  }

  async _selectPerson(event) {
    const {grampsId} = event.detail
    if (!this.active || !grampsId) return
    this.grampsId = grampsId
  }
}

window.customElements.define('grampsjs-view-tree', GrampsjsViewTree)
