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

        .with-margin {
          margin: 25px 40px;
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
    this._history = this.grampsId ? [this.grampsId] : []
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
        <div class="with-margin">
          <p>
            ${this._('No Home Person set.')}
            <a href="/">${this._('Home')}</a>
          </p>
        </div>
      `
    }
    return this.view === 'main'
      ? this._renderPedigree()
      : this._renderRelationshipChart()
  }

  _handleViewChange(e) {
    this.view = normalizeTreeView(e.detail.view)
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
        @tree:view=${this._handleViewChange}
        @tree:back="${this._prevPerson}"
        @tree:person="${this._goToPerson}"
        @tree:home="${this._backToHomePerson}"
        grampsId=${this.grampsId}
        ?active=${this.active}
        .appState="${this.appState}"
        .settings=${this.settings}
        ?disableBack=${this._history.length < 2}
        ?disableHome=${this.grampsId === this.settings.homePerson}
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
        ?disableBack=${this._history.length < 2}
        ?disableHome=${this.grampsId === this.settings.homePerson}
      >
      </grampsjs-view-tree-chart>
    `
  }

  _prevPerson() {
    this._history.pop()
    this.grampsId = this._history.pop()
  }

  _backToHomePerson() {
    this.grampsId = this.settings.homePerson
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

  update(changed) {
    super.update(changed)
    if (changed.has('grampsId')) {
      this._history.push(this.grampsId)
      // limit history to 100 people
      this._history = this._history.slice(-100)
    }
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
