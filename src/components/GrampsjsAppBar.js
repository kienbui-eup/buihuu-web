/*
The dropdown menu for adding objects in the top app bar
*/

import {html, css, LitElement} from 'lit'
import {classMap} from 'lit/directives/class-map.js'
import {APP_NAME} from '../branding.js'
import '@material/mwc-top-app-bar'
import '@material/web/iconbutton/icon-button.js'
import '@material/web/progress/circular-progress.js'
import {
  mdiCheck,
  mdiClose,
  mdiContentSave,
  mdiDelete,
  mdiMagnify,
  mdiMenu,
} from '@mdi/js'
import './GrampsjsIcon.js'
import '@material/web/dialog/dialog.js'
import '@material/web/button/text-button.js'

import './GrampsjsAddMenu.js'
import './GrampsjsSettingsMenu.js'
import './GrampsjsTooltip.js'
import './GrampsjsTreeToolbar.js'
import './GrampsjsHeritageMark.js'
import {requestPageSearch, pageSearchLabel} from '../pageSearch.js'

import {fireEvent} from '../util.js'
import {TREE_CONFIG_APP_TITLE} from '../api.js'
import {sharedStyles, appBarIconButtonStyles} from '../SharedStyles.js'
import {GrampsjsAppStateMixin} from '../mixins/GrampsjsAppStateMixin.js'

class GrampsjsAppBar extends GrampsjsAppStateMixin(LitElement) {
  static get styles() {
    return [
      sharedStyles,
      appBarIconButtonStyles,
      css`
        :host {
          display: block;
        }
        #app-title {
          min-width: 0;
        }
        .brand-title {
          display: flex;
          align-items: center;
          gap: 8px;
          min-width: 0;
        }
        .brand-title grampsjs-heritage-mark {
          --grampsjs-mark-size: 36px;
          flex: 0 0 36px;
        }
        .primary-nav {
          display: flex;
          gap: 6px;
          margin-right: 24px;
          align-items: center;
        }
        .primary-nav a {
          display: flex;
          align-items: center;
          min-height: 48px;
          padding: 0 14px;
          color: var(--grampsjs-top-app-bar-font-color);
          font: 500 14px/1.4 var(--grampsjs-body-font-family);
          text-decoration: none;
          border-bottom: 2px solid transparent;
          box-sizing: border-box;
        }
        .primary-nav a:hover,
        .primary-nav a[aria-current='page'] {
          color: #e2c891;
          border-bottom-color: #d1af70;
        }
        .primary-nav a:focus-visible {
          outline-color: #e2c891;
        }
        .tree-header .primary-nav {
          order: 2;
          flex: 1 1 100%;
          margin: 0 0 0 44px;
          border-top: 1px solid #65503c;
        }
        .tree-header .primary-nav a {
          min-height: 40px;
        }
        @media (max-width: 1199px) {
          .primary-nav {
            display: none;
          }
        }
        .brand-name {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .brand-short {
          display: none;
        }
        @media (max-width: 600px) {
          .brand-title grampsjs-heritage-mark {
            --grampsjs-mark-size: 32px;
            flex-basis: 32px;
          }
          .brand-full {
            display: none;
          }
          .brand-short {
            display: inline;
          }
        }
        :host([tree-page]) {
          position: sticky;
          top: 0;
          z-index: 21;
        }
        .tree-header {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 0 4px;
          padding: 0 8px;
          min-height: 64px;
          background: var(--grampsjs-top-app-bar-background-color);
          color: var(--grampsjs-top-app-bar-font-color);
        }
        .tree-header #app-title {
          font: 600 18px var(--grampsjs-heading-font-family);
          margin-right: 8px;
        }
        .tree-header md-icon-button {
          width: 44px;
          height: 44px;
          flex: 0 0 44px;
        }
        .tree-header grampsjs-tree-toolbar {
          flex: 1;
          min-width: 440px;
        }
        @media (max-width: 991px) {
          .tree-header {
            min-height: 56px;
            gap: 0;
            padding: 4px 8px;
          }
          .tree-header #app-title {
            flex: 1;
            font-size: 18px;
          }
          .tree-header grampsjs-tree-toolbar {
            order: 2;
            flex: 1 1 100%;
            min-width: 0;
            padding-top: 4px;
          }
        }
        mwc-top-app-bar {
          --mdc-typography-headline6-font-family: var(
            --grampsjs-heading-font-family
          );
          --mdc-typography-headline6-font-weight: 600;
          --mdc-typography-headline6-font-size: 18px;
          --mdc-theme-primary: var(--grampsjs-top-app-bar-background-color);
          --mdc-theme-on-primary: var(--grampsjs-top-app-bar-font-color);
        }

        mwc-top-app-bar.edit {
          --mdc-theme-primary: var(--mdc-theme-secondary);
          --mdc-theme-on-primary: var(--mdc-theme-on-secondary);
        }

        @media (max-width: 360px) {
          mwc-top-app-bar {
            --mdc-typography-headline6-font-size: 16px;
          }

          #button-add {
            display: none;
          }
        }

        .action-icon-wrapper {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 48px;
          height: 48px;
        }

        .action-icon-wrapper md-circular-progress {
          --md-circular-progress-size: 24px;
          --md-circular-progress-active-indicator-width: 14;
          --md-circular-progress-active-indicator-color: var(
            --grampsjs-top-app-bar-font-color
          );
        }

        @keyframes save-complete {
          0% {
            opacity: 0;
          }
          25% {
            opacity: 1;
          }
          85% {
            opacity: 1;
          }
          100% {
            opacity: 0;
          }
        }

        .save-done-icon {
          animation: save-complete 3s ease-out forwards;
        }
      `,
    ]
  }

  static get properties() {
    return {
      editMode: {type: Boolean},
      editTitle: {type: String},
      editDialogContent: {type: String},
      saveButton: {type: Boolean},
      hideDeleteButton: {type: Boolean},
      saving: {type: Boolean},
      saveComplete: {type: Boolean},
      treePage: {type: Boolean, attribute: 'tree-page', reflect: true},
      _treeTools: {state: true},
    }
  }

  constructor() {
    super()
    this.editMode = false
    this.editTitle = ''
    this.editDialogContent = ''
    this.saveButton = false
    this.hideDeleteButton = false
    this.saving = false
    this.saveComplete = false
    this.treePage = false
    this._treeTools = null
    this._boundTreeTools = event => {
      this._treeTools = event.detail
    }
    this._boundTreeToolsClear = event => {
      if (this._treeTools?.owner === event.detail.owner) this._treeTools = null
    }
    this._boundEditOn = event => this._enableEditMode(event)
    this._boundEditOff = () => this._disableEditMode()
    this._boundCloseRequest = () => this._handleCloseRequest()
  }

  willUpdate() {
    this.treePage = this.appState.path.page === 'tree'
  }

  updated(changed) {
    super.updated(changed)
    if (this.treePage && changed.has('treePage'))
      fireEvent(window, 'tree:tools-request')
    fireEvent(window, 'page-header:resize')
  }

  _renderTreeHeader(savingIndicator) {
    const searchLabel = pageSearchLabel('tree')
    return html`<header class="tree-header" aria-label="Gia phả">
      <md-icon-button aria-label=${this._('Menu')} @click=${this._toggleDrawer}
        ><grampsjs-icon path=${mdiMenu} color="currentColor"></grampsjs-icon
      ></md-icon-button>
      <div id="app-title" class="brand-title">
        <grampsjs-heritage-mark></grampsjs-heritage-mark>
        <span class="brand-name">Gia phả</span>
      </div>
      <grampsjs-tree-toolbar
        .state=${this._treeTools || {view: 'main'}}
      ></grampsjs-tree-toolbar>
      ${savingIndicator}
      <md-icon-button
        id="button-search"
        title=${searchLabel}
        aria-label=${searchLabel}
        @click=${() => requestPageSearch(this)}
        ><grampsjs-icon path=${mdiMagnify} color="currentColor"></grampsjs-icon
      ></md-icon-button>
      <grampsjs-settings-menu
        id="button-settings"
        .appState=${this.appState}
      ></grampsjs-settings-menu>
      ${this._renderPrimaryNav()}
    </header>`
  }

  render() {
    const savingIndicator = this.saving
      ? html`<span
            slot="actionItems"
            class="action-icon-wrapper"
            id="button-saving"
          >
            <md-circular-progress indeterminate></md-circular-progress>
          </span>
          <grampsjs-tooltip for="button-saving" .appState="${this.appState}"
            >${this._('Saving...')}</grampsjs-tooltip
          >`
      : this.saveComplete
      ? html`<span
            slot="actionItems"
            class="action-icon-wrapper save-done-icon"
            id="button-saved"
          >
            <grampsjs-icon
              path="${mdiCheck}"
              color="var(--grampsjs-top-app-bar-font-color)"
              height="20"
              width="20"
            ></grampsjs-icon>
          </span>
          <grampsjs-tooltip for="button-saved" .appState="${this.appState}"
            >${this._('Saved')}</grampsjs-tooltip
          >`
      : ''

    if (this.treePage && !this.editMode)
      return this._renderTreeHeader(savingIndicator)

    return html`
      <mwc-top-app-bar class="${classMap({edit: this.editMode})}">
        ${this.editMode
          ? html`<md-icon-button
                slot="navigationIcon"
                id="button-close"
                aria-label="${this._('Stop editing')}"
                @click="${this._handleCloseRequest}"
              >
                <grampsjs-icon
                  path="${mdiClose}"
                  color="currentColor"
                ></grampsjs-icon>
              </md-icon-button>
              <grampsjs-tooltip for="button-close" .appState="${this.appState}"
                >${this._('Stop editing')}</grampsjs-tooltip
              >`
          : html`<md-icon-button
              slot="navigationIcon"
              aria-label="${this._('Menu')}"
              @click="${this._toggleDrawer}"
            >
              <grampsjs-icon
                path="${mdiMenu}"
                color="currentColor"
              ></grampsjs-icon>
            </md-icon-button>`}
        <div id="app-title" class="brand-title" slot="title">
          ${this.editMode && this.editTitle
            ? this.editTitle
            : html`<grampsjs-heritage-mark></grampsjs-heritage-mark>
                <span class="brand-name">${this._renderBrandName()}</span>`}
        </div>
        ${this.editMode ? '' : this._renderPrimaryNav()} ${savingIndicator}
        ${this.editMode
          ? html`
              ${this.saveButton
                ? html`<md-icon-button
                      slot="actionItems"
                      id="button-save"
                      aria-label="${this._('_Save')}"
                      @click="${this._handleSaveIcon}"
                    >
                      <grampsjs-icon
                        path="${mdiContentSave}"
                        color="currentColor"
                      ></grampsjs-icon>
                    </md-icon-button>
                    <grampsjs-tooltip
                      for="button-save"
                      .appState="${this.appState}"
                      >${this._('_Save')}</grampsjs-tooltip
                    >`
                : ''}
              ${!this.hideDeleteButton
                ? html`<md-icon-button
                      slot="actionItems"
                      id="button-delete"
                      aria-label="${this._('_Delete')}"
                      @click="${this._handleDeleteIcon}"
                    >
                      <grampsjs-icon
                        path="${mdiDelete}"
                        color="currentColor"
                      ></grampsjs-icon>
                    </md-icon-button>
                    <grampsjs-tooltip
                      for="button-delete"
                      .appState="${this.appState}"
                      >${this._('_Delete')}</grampsjs-tooltip
                    >`
                : ''}
            `
          : html`
              ${this.appState.permissions.canAdd
                ? html`<grampsjs-add-menu
                      slot="actionItems"
                      .appState="${this.appState}"
                      id="button-add"
                    ></grampsjs-add-menu>
                    <grampsjs-tooltip
                      for="button-add"
                      .appState="${this.appState}"
                      >${this._('Add')}</grampsjs-tooltip
                    >`
                : ''}
              <grampsjs-settings-menu
                slot="actionItems"
                .appState="${this.appState}"
                id="button-settings"
              ></grampsjs-settings-menu>
              <grampsjs-tooltip
                for="button-settings"
                .appState="${this.appState}"
                >${this._('Preferences')}</grampsjs-tooltip
              >
              <md-icon-button
                slot="actionItems"
                id="button-search"
                aria-label=${pageSearchLabel(this.appState.path.page)}
                @click=${() => requestPageSearch(this)}
              >
                <grampsjs-icon
                  path="${mdiMagnify}"
                  color="currentColor"
                ></grampsjs-icon>
              </md-icon-button>
              <grampsjs-tooltip
                for="button-search"
                .appState="${this.appState}"
                .content=${pageSearchLabel(this.appState.path.page)}
                >${pageSearchLabel(this.appState.path.page)}</grampsjs-tooltip
              >
            `}
      </mwc-top-app-bar>
      ${this.editDialogContent}
    `
  }

  _renderBrandName() {
    const title = this.appState.treeConfig?.[TREE_CONFIG_APP_TITLE] || APP_NAME
    if (title !== APP_NAME) return title
    return html`<span class="brand-full">${APP_NAME}</span
      ><span class="brand-short">Bùi Hữu</span>`
  }

  _renderPrimaryNav() {
    const page = this.appState.path.page
    const items = [
      ['home', '/', 'Trang chủ'],
      ['tree', '/tree', 'Gia phả'],
      ['people', '/people', 'Người trong họ'],
      ['lich-gio', '/lich-gio', 'Lịch giỗ'],
      ['blog', '/blog', 'Bài viết'],
    ]
    return html`<nav
      class="primary-nav"
      slot="actionItems"
      aria-label="Điều hướng chính"
    >
      ${items.map(
        ([key, href, label]) =>
          html`<a
            href=${href}
            aria-current=${page === key ||
            (key === 'people' && page === 'person')
              ? 'page'
              : 'false'}
            >${label}</a
          >`
      )}
    </nav>`
  }

  _toggleDrawer() {
    fireEvent(this, 'drawer:toggle')
  }

  _handleNav(path) {
    fireEvent(this, 'nav', {path})
  }

  _handleCloseRequest() {
    if (this.saveButton) {
      this.editDialogContent = html`
        <md-dialog open @cancel="${e => e.preventDefault()}">
          <div slot="content">${this._('Abort changes?')}</div>
          <div slot="actions">
            <md-text-button @click="${() => this._handleDialogCancel()}">
              ${this._('Cancel')}
            </md-text-button>
            <md-text-button @click="${() => this._handleDialogDiscard()}">
              ${this._('Discard')}
            </md-text-button>
          </div>
        </md-dialog>
      `
    } else {
      this._editModeOff()
    }
  }

  _handleDeleteIcon() {
    this.editDialogContent = html`
      <md-dialog open @cancel="${e => e.preventDefault()}">
        <div slot="content">${this._('Delete this object?')}</div>
        <div slot="actions">
          <md-text-button @click="${() => this._handleDialogCancel()}">
            ${this._('Cancel')}
          </md-text-button>
          <md-text-button @click="${() => this._handleDialogDelete()}">
            ${this._('_Delete')}
          </md-text-button>
        </div>
      </md-dialog>
    `
  }

  _handleDialogCancel() {
    this.editDialogContent = ''
  }

  _handleDialogDiscard() {
    fireEvent(this, 'edit:cancel', {})
    this._editModeOff()
    this.editDialogContent = ''
  }

  _handleDialogDelete() {
    this._deleteObject()
    this.editDialogContent = ''
  }

  _editModeOff() {
    fireEvent(this, 'edit-mode:off', {})
  }

  _handleSaveIcon() {
    fireEvent(this, 'edit-mode:save')
  }

  _disableEditMode() {
    this.editMode = false
  }

  _enableEditMode(e) {
    this.editMode = true
    this.editTitle = e.detail.title
    this.saveButton = e.detail?.saveButton || false
    this.hideDeleteButton = e.detail?.hideDeleteButton || false
  }

  _deleteObject() {
    fireEvent(this, 'edit-mode:delete')
  }

  connectedCallback() {
    super.connectedCallback()
    window.addEventListener('edit-mode:on', this._boundEditOn)
    window.addEventListener('edit-mode:off', this._boundEditOff)
    window.addEventListener('edit-mode:close-request', this._boundCloseRequest)
    window.addEventListener('tree:tools', this._boundTreeTools)
    window.addEventListener('tree:tools-clear', this._boundTreeToolsClear)
    this._headerObserver = new ResizeObserver(() =>
      fireEvent(window, 'page-header:resize')
    )
    this._headerObserver.observe(this)
  }

  disconnectedCallback() {
    super.disconnectedCallback()
    window.removeEventListener('edit-mode:on', this._boundEditOn)
    window.removeEventListener('edit-mode:off', this._boundEditOff)
    window.removeEventListener(
      'edit-mode:close-request',
      this._boundCloseRequest
    )
    window.removeEventListener('tree:tools', this._boundTreeTools)
    window.removeEventListener('tree:tools-clear', this._boundTreeToolsClear)
    this._headerObserver?.disconnect()
  }
}

window.customElements.define('grampsjs-app-bar', GrampsjsAppBar)
