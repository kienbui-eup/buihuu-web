import {css, html} from 'lit'

import '@material/web/tabs/tabs'
import '@material/web/tabs/primary-tab'

import {mdiFamilyTree} from '@mdi/js'
import {GrampsjsView} from './GrampsjsView.js'

import './GrampsjsViewTreeChart.js'

import './GrampsjsViewRelationshipChart.js'
import {fireEvent} from '../util.js'
import {renderIconSvg, relationshipGraphIconPath} from '../icons.js'
import {DEFAULT_TREE_VIEW, getTreeViewTabIndex} from '../treeDefaults.js'

export class GrampsjsViewTree extends GrampsjsView {
  static get styles() {
    return [
      super.styles,
      css`
        .with-margin {
          margin: 25px 40px;
        }

        md-primary-tab {
          opacity: 0.8;
        }

        md-primary-tab[active] {
          opacity: 1;
        }

        #tabs {
          height: 85px;
        }
      `,
    ]
  }

  static get properties() {
    return {
      grampsId: {type: String},
      view: {type: String},
      _history: {type: Array},
      _currentTabId: {type: Number},
    }
  }

  constructor() {
    super()
    this.grampsId = ''
    this.view = 'ancestor'
    this._history = this.grampsId ? [this.grampsId] : []
    this._currentTabId = getTreeViewTabIndex(DEFAULT_TREE_VIEW)
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
    if (changed.has('_currentTabId')) {
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
    return html`
      <div id="tabs">${this.renderTabs()}</div>
      ${this._currentTabId === 0 ? this._renderPedigree() : ''}
      ${this._currentTabId === 1 ? this._renderRelationshipChart() : ''}
    `
  }

  _handleTabChange(e) {
    this._currentTabId = e.target.activeTabIndex
  }

  renderTabs() {
    return html`
      <md-tabs
        .activeTabIndex=${this._currentTabId}
        @change=${this._handleTabChange}
      >
        <md-primary-tab has-icon
          >${this._('Ancestor Tree')}
          <span slot="icon"
            >${renderIconSvg(
              mdiFamilyTree,
              '--md-sys-color-primary',
              180
            )}</span
          >
        </md-primary-tab>

        <md-primary-tab has-icon>
          ${this._('Relationship Graph')}
          <span slot="icon"
            >${renderIconSvg(
              relationshipGraphIconPath,
              '--md-sys-color-primary'
            )}</span
          >
        </md-primary-tab>
      </md-tabs>
    `
  }

  _renderRelationshipChart() {
    return html`
      <grampsjs-view-relationship-chart
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
      this._applyPreferredTabIfNeeded()
    }
  }

  _applyPreferredTabIfNeeded() {
    const preferredView = this.settings?.treeDefaultView ?? DEFAULT_TREE_VIEW
    if (preferredView === this._appliedTreeDefaultView) {
      return
    }
    const preferredIndex = getTreeViewTabIndex(preferredView)
    this._appliedTreeDefaultView = preferredView
    if (this._currentTabId !== preferredIndex) {
      this._currentTabId = preferredIndex
    }
  }

  async _selectPerson(event) {
    const {grampsId} = event.detail
    if (!this.active || !grampsId) return
    this.grampsId = grampsId
  }
}

window.customElements.define('grampsjs-view-tree', GrampsjsViewTree)
