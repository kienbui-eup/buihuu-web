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
} from '@mdi/js'
import './GrampsjsIcon.js'
import '@material/web/dialog/dialog.js'
import '@material/web/button/text-button.js'

import './GrampsjsAddMenu.js'
import './GrampsjsSettingsMenu.js'
import './GrampsjsTooltip.js'
import './GrampsjsHeaderNav.js'
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
          --grampsjs-top-app-bar-font-color: #fff4df;
        }
        .brand-logo {
          display: block;
          width: 180px;
          height: 50px;
          object-fit: contain;
          background: #fbf7ef;
          border-radius: 8px;
          padding: 0 8px;
          box-sizing: border-box;
          box-shadow: 0 0 0 1px #d9b77d;
        }
        @media (max-width: 600px) {
          .brand-logo {
            width: 138px;
            height: 42px;
          }
        }
        mwc-top-app-bar {
          border-bottom: 1px solid var(--heritage-rule);
        }
        mwc-top-app-bar::before {
          content: '';
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          height: 64px;
          z-index: 3;
          pointer-events: none;
          background-color: #632d27;
          background-image: linear-gradient(
              90deg,
              #54241ff2 0%,
              #74372bd9 52%,
              #54241fe8 100%
            ),
            url('images/chi-bo-tree-landscape-v2.png');
          background-size: cover;
          background-position: center 72%;
          border-bottom: 1px solid #c7a568;
          box-shadow: 0 4px 18px #36201826;
        }
        @media (max-width: 599px) {
          mwc-top-app-bar::before {
            height: 56px;
          }
        }
        #app-title {
          min-width: 0;
        }
        .brand-title {
          display: flex;
          align-items: center;
          min-width: 0;
        }
        /* Logo ngang và tên trang là liên kết về trang chủ, nên dải điều hướng
           không có mục "Trang chủ" riêng. Màu chữ và màu khi rê chuột lấy
           theo các mục của GrampsjsHeaderNav để cả hàng cùng một lối. */
        .brand-link {
          display: flex;
          align-items: center;
          gap: 8px;
          min-width: 0;
          min-height: 44px;
          color: inherit;
          text-decoration: none;
          border-radius: 4px;
        }
        .brand-link:hover .brand-name {
          color: inherit;
        }
        .brand-link:focus-visible {
          outline: 2px solid currentColor;
          outline-offset: 2px;
        }
        grampsjs-header-nav {
          margin-right: 8px;
        }
        .brand-name {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        :host([tree-page]) {
          position: sticky;
          top: 0;
          z-index: 21;
        }
        /* Trang Cây dùng đúng thanh đầu trang chung như mọi trang khác; công cụ
           của cây nổi ngay trên vùng vẽ (GrampsjsTreeToolbar trong view). */
        mwc-top-app-bar {
          --mdc-typography-headline6-font-family: var(
            --grampsjs-heading-font-family
          );
          --mdc-typography-headline6-font-weight: 600;
          --mdc-typography-headline6-font-size: 18px;
          --mdc-theme-primary: transparent;
          --mdc-theme-on-primary: var(--grampsjs-top-app-bar-font-color);
        }

        mwc-top-app-bar.edit {
          --mdc-theme-primary: var(--mdc-theme-secondary);
          --mdc-theme-on-primary: var(--mdc-theme-on-secondary);
        }

        @media (max-width: 760px) {
          #button-add {
            display: none;
          }
        }
        @media (max-width: 360px) {
          .brand-link {
            gap: 4px;
          }
          grampsjs-header-nav {
            margin-right: 4px;
          }
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
    this._boundEditOn = event => this._enableEditMode(event)
    this._boundEditOff = () => this._disableEditMode()
    this._boundCloseRequest = () => this._handleCloseRequest()
  }

  willUpdate() {
    this.treePage = this.appState.path.page === 'tree'
  }

  updated(changed) {
    super.updated(changed)
    fireEvent(window, 'page-header:resize')
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
          : ''}
        <div id="app-title" class="brand-title" slot="title">
          ${this.editMode && this.editTitle
            ? this.editTitle
            : html`<a
                  id="brand-home"
                  class="brand-link"
                  href="/"
                  aria-current=${this.appState.path.page === 'home'
                    ? 'page'
                    : 'false'}
                >
                  ${this._renderBrandName()}
                </a>
                <grampsjs-tooltip for="brand-home" .appState="${this.appState}"
                  >Về trang chủ</grampsjs-tooltip
                >`}
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
              <grampsjs-settings-menu
                slot="actionItems"
                .appState="${this.appState}"
                id="button-settings"
              ></grampsjs-settings-menu>
              <grampsjs-tooltip
                for="button-settings"
                .appState="${this.appState}"
                >Danh mục và tài khoản</grampsjs-tooltip
              >
            `}
      </mwc-top-app-bar>
      ${this.editDialogContent}
    `
  }

  _renderBrandName() {
    const title = this.appState.treeConfig?.[TREE_CONFIG_APP_TITLE] || APP_NAME
    if (title !== APP_NAME)
      return html`<span class="brand-name">${title}</span>`
    return html`<img
      class="brand-logo"
      src="images/logo-bui-huu-ngang-v2.png"
      width="180"
      height="60"
      alt="Phả hệ họ Bùi Hữu — Trang chủ"
    />`
  }

  _renderPrimaryNav() {
    return html`<grampsjs-header-nav
      slot="actionItems"
      .appState=${this.appState}
    ></grampsjs-header-nav>`
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
    this._headerObserver?.disconnect()
  }
}

window.customElements.define('grampsjs-app-bar', GrampsjsAppBar)
