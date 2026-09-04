import {css, html} from 'lit'

import {GrampsjsView} from './GrampsjsView.js'

import './GrampsjsViewTreeChart.js'

import './GrampsjsViewRelationshipChart.js'
import '../components/GrampsjsTreeBranchBar.js'
import {fireEvent} from '../util.js'
import {DEFAULT_TREE_VIEW, normalizeTreeView} from '../treeDefaults.js'
import {TreeNavigationHistory} from '../treeNavigation.js'

export class GrampsjsViewTree extends GrampsjsView {
  static get styles() {
    return [
      super.styles,
      css`
        :host {
          margin: 0;
        }

        /* Khung để dải nút nhánh nổi lên trên vùng vẽ của view con. */
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
      _editMode: {state: true},
    }
  }

  constructor() {
    super()
    this.grampsId = ''
    this.view = DEFAULT_TREE_VIEW
    this._navigation = new TreeNavigationHistory()
    this._appliedTreeDefaultView = null
    this._editMode = false
    this._boundSelectPerson = this._selectPerson.bind(this)
    // Đang sửa cây thì công cụ nổi ẩn hết, dải nút nhánh ẩn theo.
    this._boundEditOn = () => {
      this._editMode = true
    }
    this._boundEditOff = () => {
      this._editMode = false
    }
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

  willUpdate(changed) {
    super.willUpdate(changed)
    if (this.grampsId && (changed.has('grampsId') || changed.has('view'))) {
      this._navigation.observe(this.grampsId, this.view)
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
      ${this._editMode
        ? ''
        : html`<grampsjs-tree-branch-bar
            .appState=${this.appState}
            view=${this.view}
            grampsId=${this.grampsId}
            homePerson=${this.settings?.homePerson ?? ''}
            @tree:scope=${this._handleScope}
          ></grampsjs-tree-branch-bar>`}
    </div>`
  }

  _handleViewChange(e) {
    this._navigate(this.grampsId, e.detail.view)
  }

  _navigate(grampsId, view) {
    this.grampsId = grampsId || this.grampsId
    this.view = normalizeTreeView(view)
  }

  // Dải xem nhanh đổi cả người được chọn và phạm vi trong cùng một lượt.
  _handleScope(e) {
    const {view, grampsId} = e.detail ?? {}
    this._navigate(grampsId, view)
  }

  _openBranch(event) {
    this._navigate(event.detail.grampsId, 'descendants')
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
        @tree:view=${this._handleViewChange}
        @tree:back="${this._prevPerson}"
        @tree:person="${this._goToPerson}"
        @tree:home="${this._backToHomePerson}"
        grampsId=${this.grampsId}
        ?active=${this.active}
        .appState="${this.appState}"
        .settings=${this.settings}
        ?disableBack=${!this._navigation.canBack}
        ?disableHome=${this.grampsId === this.settings.homePerson &&
        this.view === 'main'}
      >
      </grampsjs-view-relationship-chart>
    `
  }

  _renderPedigree() {
    return html`
      <grampsjs-view-tree-chart
        treeView=${this.view}
        @tree:view=${this._handleViewChange}
        @tree:show-branch=${this._openBranch}
        @tree:back="${this._prevPerson}"
        @tree:person="${this._goToPerson}"
        @tree:home="${this._backToHomePerson}"
        grampsId=${this.grampsId}
        ?active=${this.active}
        .appState="${this.appState}"
        .settings=${this.settings}
        ?disableBack=${!this._navigation.canBack}
        ?disableHome=${this.grampsId === this.settings.homePerson &&
        this.view === 'main'}
      >
      </grampsjs-view-tree-chart>
    `
  }

  _prevPerson() {
    const previous = this._navigation.back()
    if (!previous) return
    this.grampsId = previous.grampsId
    this.view = previous.view
  }

  _backToHomePerson() {
    this._navigate(this.settings.homePerson, 'main')
  }

  _goToPerson() {
    fireEvent(this, 'nav', {path: `person/${this.grampsId}`})
  }

  connectedCallback() {
    super.connectedCallback()
    window.addEventListener('pedigree:person-selected', this._boundSelectPerson)
    window.addEventListener('edit-mode:on', this._boundEditOn)
    window.addEventListener('edit-mode:off', this._boundEditOff)
  }

  disconnectedCallback() {
    super.disconnectedCallback()
    window.removeEventListener(
      'pedigree:person-selected',
      this._boundSelectPerson
    )
    window.removeEventListener('edit-mode:on', this._boundEditOn)
    window.removeEventListener('edit-mode:off', this._boundEditOff)
  }

  update(changed) {
    super.update(changed)
    if (this.active && (changed.has('active') || changed.has('settings'))) {
      this._applyPreferredViewIfNeeded()
    }
  }

  _applyPreferredViewIfNeeded() {
    const preferredView = normalizeTreeView(this.settings?.treeDefaultView)
    if (preferredView === this._appliedTreeDefaultView) {
      return
    }
    this._appliedTreeDefaultView = preferredView
    if (this.view !== preferredView) {
      this._navigate(this.grampsId, preferredView)
    }
  }

  async _selectPerson(event) {
    const {grampsId} = event.detail
    if (!this.active || !grampsId) return
    this._navigate(grampsId, this.view)
  }
}

window.customElements.define('grampsjs-view-tree', GrampsjsViewTree)
