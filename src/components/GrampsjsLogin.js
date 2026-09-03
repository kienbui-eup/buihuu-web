/* eslint-disable lit-a11y/click-events-have-key-events */
import {html, css, LitElement} from 'lit'

import '@material/mwc-circular-progress'
import '@material/web/button/filled-button'
import '@material/web/button/outlined-button'

import {mdiCheckCircle} from '@mdi/js'

import './GrampsjsIcon.js'
import './GrampsjsHeritageMark.js'
import './GrampsjsTempleHero.js'
import './GrampsjsSiteFooter.js'
import {APP_NAME} from '../branding.js'
import './GrampsjsOidcButton.js'
import {sharedStyles} from '../SharedStyles.js'
import {heritageFrameStyles} from '../HeritageStyles.js'
import {
  apiGetTokens,
  apiResetPassword,
  apiGetOIDCConfig,
  apiOIDCLogin,
} from '../api.js'
import {fireEvent} from '../util.js'
import {GrampsjsAppStateMixin} from '../mixins/GrampsjsAppStateMixin.js'

class GrampsjsLogin extends GrampsjsAppStateMixin(LitElement) {
  static get styles() {
    return [
      sharedStyles,
      heritageFrameStyles,
      css`
        #login-container {
          margin: auto;
          height: 100%;
          width: 100%;
          max-width: 30em;
          padding: 32px 24px;
          box-sizing: border-box;
        }
        .login-layout {
          display: grid;
          grid-template-columns: minmax(0, 1.2fr) minmax(400px, 1fr);
          min-height: 100dvh;
          background: var(--md-sys-color-surface);
        }
        .login-layout > grampsjs-temple-hero {
          background: var(--heritage-wood);
        }
        .login-panel {
          align-content: center;
        }
        .brand grampsjs-heritage-mark {
          --grampsjs-mark-size: 60px;
        }
        @media (max-width: 900px) {
          .login-layout {
            grid-template-columns: minmax(0, 1fr);
          }
        }
        @media (max-width: 600px) {
        }

        #login-form {
          margin: auto;
          padding: 32px;
        }

        .brand {
          text-align: center;
          margin-bottom: 28px;
        }
        .brand h1 {
          color: var(--md-sys-color-primary);
          font-size: 32px;
          margin: 16px 0 8px;
          line-height: 1.3;
        }
        .brand p {
          font-size: 14px;
          color: var(--md-sys-color-on-surface-variant);
          margin: 0;
        }
        #login-form > h2 {
          font-size: 23px;
          margin: 0 0 24px;
        }
        @media (max-width: 600px) {
          .brand h1 {
            font-size: 27px;
          }
          #login-container {
            padding: 28px 16px;
          }
          #login-form {
            padding: 24px 20px;
          }
        }

        #login-form md-filled-button {
          --md-filled-button-container-shape: 3px;
          width: 100%;
          margin-bottom: 0.5em;
        }

        /* Native outlined text field */
        .text-field-wrapper {
          position: relative;
          width: 100%;
          margin-bottom: 0.7em;
        }

        .text-field-wrapper input {
          width: 100%;
          height: 56px;
          padding: 20px 16px 8px;
          border: 1px solid var(--md-sys-color-outline);
          border-radius: var(--grampsjs-frame-radius);
          background: transparent;
          color: var(--md-sys-color-on-surface);
          font-family: var(--grampsjs-body-font-family);
          font-size: 16px;
          font-weight: 400;
          box-sizing: border-box;
          outline: none;
          transition: border-color 0.15s ease;
          caret-color: var(--md-sys-color-primary);
        }

        .text-field-wrapper input:hover:not(:focus) {
          border-color: var(--md-sys-color-on-surface);
        }

        .text-field-wrapper input:focus {
          border: 2px solid var(--md-sys-color-primary);
          /* keep text position stable when border widens */
          padding: 19px 15px 7px;
        }

        .text-field-wrapper label {
          /* override sharedStyles label rules */
          display: block;
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--md-sys-color-on-surface-variant);
          font-size: 16px;
          font-weight: 400;
          line-height: 1;
          padding: 0 4px;
          pointer-events: none;
          background: transparent;
          transition: top 0.15s ease, font-size 0.15s ease, color 0.15s ease;
          gap: 0;
          place-items: initial;
        }

        /* Float label when focused or filled */
        .text-field-wrapper input:focus ~ label,
        .text-field-wrapper input:not(:placeholder-shown) ~ label {
          top: 0;
          font-size: 12px;
          background: var(--md-sys-color-surface);
        }

        .text-field-wrapper input:focus ~ label {
          color: var(--md-sys-color-primary);
        }

        .button-container {
          display: flex;
          gap: 0.5em;
          margin-top: 1em;
          margin-bottom: 0.5em;
          --button-height: 48px;
        }

        .button-container md-outlined-button,
        .button-container md-filled-button {
          flex: 1;
          height: var(--button-height);
        }

        .button-container md-outlined-button {
          --md-outlined-button-container-height: var(--button-height);
          --md-outlined-button-leading-space: 8px;
          --md-outlined-button-trailing-space: 8px;
          --md-outlined-button-top-space: 0px;
          --md-outlined-button-bottom-space: 0px;
          min-height: var(--button-height);
          max-height: var(--button-height);
        }

        .button-container md-outlined-button::part(outline) {
          height: var(--button-height);
        }

        .button-container md-filled-button {
          --md-filled-button-container-height: var(--button-height);
          --md-filled-button-leading-space: 8px;
          --md-filled-button-trailing-space: 8px;
          --md-filled-button-top-space: 0px;
          --md-filled-button-bottom-space: 0px;
          min-height: var(--button-height);
          max-height: var(--button-height);
        }

        .button-container md-filled-button::part(container) {
          height: var(--button-height);
        }

        p.reset-link {
          padding-top: 1em;
          font-size: 0.9em;
        }

        p.forgot-password {
          text-align: center;
          font-size: 0.85em;
          margin-top: 0.75em;
          margin-bottom: 1.5em;
        }

        p.success {
          padding-top: 1em;
          color: var(--grampsjs-alert-success-font-color);
          font-size: 1.2em;
          font-weight: 400;
          --mdc-icon-size: 1.6em;
          line-height: 1.4em;
          text-align: center;
        }

        mwc-circular-progress {
          --mdc-theme-primary: var(--mdc-theme-on-primary);
        }

        hr {
          margin-top: 2em;
          margin-bottom: 2em;
        }

        .family-code h3 {
          margin: 0 0 0.3em;
          font-size: 1.05em;
        }

        .family-code p.hint {
          font-size: 0.9em;
          color: var(--grampsjs-body-font-color-70);
          margin: 0 0 1em;
        }

        .family-code md-outlined-button {
          width: 100%;
          height: 48px;
        }
      `,
    ]
  }

  static get properties() {
    return {
      resetpw: {type: Boolean},
      isFormValid: {type: Boolean},
      credentials: {type: Object},
      tree: {type: String},
      oidcConfig: {type: Object},
    }
  }

  constructor() {
    super()
    this.resetpw = false
    this.isFormValid = false
    this.credentials = {}
    this.tree = ''
    this.oidcConfig = {}
  }

  async connectedCallback() {
    super.connectedCallback()
    const config = await apiGetOIDCConfig()
    if (!config.error) {
      this.oidcConfig = config

      if (
        config.enabled &&
        config.disable_local_auth &&
        config.auto_redirect &&
        config.providers &&
        config.providers.length === 1
      ) {
        requestAnimationFrame(() =>
          this._submitOIDCLogin(config.providers[0].id)
        )
      }
    }
  }

  render() {
    return html`<div class="login-layout">
        <grampsjs-temple-hero welcome></grampsjs-temple-hero>
        <div class="login-panel">
          ${this.resetpw ? this._renderResetPw() : this._renderLogin()}
        </div>
      </div>
      <grampsjs-site-footer .public=${true}></grampsjs-site-footer>`
  }

  _renderLogin() {
    const localAuthDisabled =
      this.oidcConfig?.enabled && this.oidcConfig?.disable_local_auth

    return html`
      <div id="login-container">
        <header class="brand">
          <grampsjs-heritage-mark></grampsjs-heritage-mark>
          <h1>${APP_NAME}</h1>
          <p>Gìn giữ cội nguồn · Kết nối cháu con</p>
          <p>Chỉ Bồ · Thụy Trường · Thái Bình</p>
        </header>
        <form
          id="login-form"
          class="heritage-frame"
          @submit="${this._submitLogin}"
          @keydown="${this._handleFormKeydown}"
        >
          <h2>${this._('login')}</h2>
          ${localAuthDisabled
            ? ''
            : html`
                <div class="text-field-wrapper">
                  <input
                    id="username"
                    name="username"
                    type="text"
                    autocomplete="username"
                    autocapitalize="off"
                    placeholder=" "
                    required
                    .value="${this.credentials.username || ''}"
                    @input="${this._credChanged}"
                    @change="${this._credChanged}"
                  />
                  <label for="username">${this._('Username')}</label>
                </div>
                <div class="text-field-wrapper">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autocomplete="current-password"
                    placeholder=" "
                    required
                    .value="${this.credentials.password || ''}"
                    @input="${this._credChanged}"
                    @change="${this._credChanged}"
                  />
                  <label for="password">${this._('Password')}</label>
                </div>
                <div class="button-container">
                  ${window.grampsjsConfig.hideRegisterLink
                    ? ''
                    : html`
                        <md-outlined-button
                          @click="${() => this._handleNav('register')}"
                        >
                          ${this._('Register new account')}
                        </md-outlined-button>
                      `}
                  <md-filled-button type="submit">
                    ${this._('login')}
                  </md-filled-button>
                </div>
                <mwc-circular-progress
                  indeterminate
                  density="-7"
                  closed
                  id="login-progress"
                  style="display:none; margin-top: 0.5em;"
                >
                </mwc-circular-progress>
                <p class="forgot-password">
                  <span
                    class="link"
                    @click="${() => {
                      this.resetpw = true
                    }}"
                    >${this._('Lost password?')}</span
                  >
                </p>
                ${this._renderFamilyCode()}
              `}
          ${this.oidcConfig?.enabled &&
          this.oidcConfig?.providers &&
          !localAuthDisabled
            ? html`<hr />`
            : ''}
          ${this.oidcConfig?.enabled && this.oidcConfig?.providers
            ? this.oidcConfig.providers.map(
                provider => html`
                  <grampsjs-oidc-button
                    .provider="${provider.id}"
                    .providerName="${provider.name}"
                    .onClick="${() => this._submitOIDCLogin(provider.id)}"
                    .buttonText="${this._getOIDCButtonText(
                      provider.id,
                      provider.name
                    )}"
                    .signingInText="${this._('Signing in...')}"
                  ></grampsjs-oidc-button>
                `
              )
            : ''}
        </form>
      </div>
    `
  }

  _handleNav(path) {
    fireEvent(this, 'nav', {path})
  }

  /*
  Xem bằng mã dòng họ.

  Các trang dòng họ ở Việt Nam đều mở phả đồ bằng một mã chung cả họ biết, không
  bắt từng người lập tài khoản. Ở đây mã đó là mật khẩu của một tài khoản khách
  chỉ xem (vai trò Guest), tên tài khoản đặt trong config.js. Không cấu hình thì
  khối này không hiện.
  */
  _renderFamilyCode() {
    if (!window.grampsjsConfig?.guestUsername) return ''
    return html`
      <hr />
      <div class="family-code">
        <h3>${this._('View with the family code')}</h3>
        <p class="hint">
          ${this._(
            'People in the clan do not need an account. Enter the code the clan shares to open the family tree.'
          )}
        </p>
        <div class="text-field-wrapper">
          <input
            id="family-code"
            name="family-code"
            type="password"
            autocomplete="off"
            autocapitalize="off"
            placeholder=" "
          />
          <label for="family-code">${this._('Family code')}</label>
        </div>
        <md-outlined-button @click="${this._submitFamilyCode}">
          ${this._('Open the family tree')}
        </md-outlined-button>
      </div>
    `
  }

  async _submitFamilyCode() {
    const code = this.shadowRoot.getElementById('family-code')?.value
    if (!code) return
    const res = await apiGetTokens(window.grampsjsConfig.guestUsername, code)
    if ('error' in res) {
      this._showError(res.error)
    } else {
      document.location.href = '/'
    }
  }

  _getOIDCButtonText(providerId, providerName) {
    return `${this._('Continue with %s', providerName)}`
  }

  _credChanged(e) {
    this.credentials = {...this.credentials, [e.target.id]: e.target.value}
  }

  // md-filled-button[type="submit"] is not recognized by browsers as the
  // form's default submit button, so pressing Enter in an input does not
  // implicitly submit. Bridge it to a real submit event.
  // eslint-disable-next-line class-methods-use-this
  _handleFormKeydown(event) {
    if (event.key === 'Enter' && event.target.tagName === 'INPUT') {
      event.preventDefault()
      if (event.target.id === 'family-code') {
        this._submitFamilyCode()
        return
      }
      event.currentTarget.requestSubmit()
    }
  }

  _renderResetPw() {
    return html`
      <div id="login-container">
        <form
          id="login-form"
          @submit="${this._resetPw}"
          @keydown="${this._handleFormKeydown}"
        >
          <h2>${this._('reset password')}</h2>
          <div id="inner-form">
            <div class="text-field-wrapper">
              <input
                id="username"
                name="username"
                type="text"
                autocomplete="username"
                autocapitalize="off"
                placeholder=" "
              />
              <label for="username">${this._('Username')}</label>
            </div>
            <md-filled-button type="submit" style="width: 100%;">
              ${this._('reset password')}
            </md-filled-button>
          </div>
          <p class="success" id="reset-success" style="display:none;">
            <grampsjs-icon
              path="${mdiCheckCircle}"
              color="currentColor"
            ></grampsjs-icon
            ><br />
            ${this._('A password reset link has been sent by e-mail.')}
          </p>
          <p class="reset-link">
            <span
              class="link"
              @click="${() => {
                this.resetpw = false
              }}"
              >${this._('_Back')}</span
            >
          </p>
        </form>
      </div>
    `
  }

  async _submitLogin(e) {
    // Prevent the native form submit/navigation
    e?.preventDefault()
    e?.stopPropagation()

    // Read directly from the DOM rather than this.credentials: autofill
    // doesn't always fire input/change events, which could otherwise leave
    // stale (empty) values in reactive state.
    const username = this.shadowRoot.getElementById('username')?.value
    const password = this.shadowRoot.getElementById('password')?.value

    if (!username || !password) {
      return
    }

    const submitProgress = this.shadowRoot.getElementById('login-progress')
    submitProgress.style.display = 'block'
    submitProgress.closed = false
    apiGetTokens(username, password).then(res => {
      if ('error' in res) {
        submitProgress.style.display = 'none'
        submitProgress.closed = true
        this._showError(res.error)
      } else {
        document.location.href = '/'
      }
    })
  }

  async _submitOIDCLogin(providerId) {
    if (!providerId) {
      this._showError('No OIDC provider specified')
      return
    }
    const res = await apiOIDCLogin(providerId)
    if ('error' in res) {
      this._showError(res.error)
    }
  }

  async _resetPw(e) {
    e?.preventDefault()
    e?.stopPropagation()

    const userField = this.shadowRoot.getElementById('username')
    if (userField.value === '') {
      this._showError('Username must not be empty.')
      return
    }
    const res = await apiResetPassword(userField.value)
    const innerForm = this.shadowRoot.getElementById('inner-form')
    const divSuccess = this.shadowRoot.getElementById('reset-success')
    if ('error' in res) {
      this._showError(res.error)
    } else {
      divSuccess.style.display = 'block'
      innerForm.style.display = 'none'
    }
  }

  _showError(message) {
    fireEvent(this, 'grampsjs:error', {message})
  }
}

window.customElements.define('grampsjs-login', GrampsjsLogin)
