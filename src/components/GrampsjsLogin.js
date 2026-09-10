/* eslint-disable lit-a11y/click-events-have-key-events */
import {html, css, LitElement} from 'lit'

import '@material/mwc-circular-progress'
import '@material/web/button/filled-button'
import '@material/web/button/outlined-button'

import {mdiCheckCircle} from '@mdi/js'

import './GrampsjsIcon.js'
import './GrampsjsSiteFooter.js'
import {APP_NAME, PLACE_SHORT} from '../branding.js'
import './GrampsjsOidcButton.js'
import {sharedStyles} from '../SharedStyles.js'
import {heritageFrameStyles} from '../HeritageStyles.js'
import {
  apiGetTokens,
  apiGetFamilyCodeTokens,
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
        :host {
          display: block;
        }
        .entrance {
          background: transparent;
          color: var(--heritage-ink);
          min-height: 100dvh;
        }
        .masthead {
          max-width: 1400px;
          margin: auto;
          padding: 18px 40px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          border-bottom: 1px solid var(--heritage-rule);
          box-sizing: border-box;
        }
        .login-logo {
          background: #fbf7ef;
          border-radius: 4px;
          display: block;
          width: 180px;
          height: 60px;
          object-fit: contain;
        }
        .masthead-copy {
          text-align: right;
          color: var(--heritage-muted);
          font-size: 12px;
          line-height: 1.8;
        }
        .masthead-copy strong {
          display: block;
          color: var(--heritage-accent);
          font-size: 13px;
          font-weight: 500;
        }
        .login-layout {
          max-width: 1400px;
          margin: auto;
          padding: 40px;
          display: grid;
          grid-template-columns: minmax(0, 1.65fr) minmax(350px, 1fr);
          gap: clamp(28px, 4vw, 64px);
          align-items: center;
          box-sizing: border-box;
        }
        .welcome {
          min-width: 0;
        }
        .temple {
          margin: 0;
        }
        .temple img {
          display: block;
          width: 100%;
          height: auto;
          border-radius: 5px;
        }
        .temple figcaption {
          margin-top: 12px;
          font-size: 11px;
          color: var(--heritage-muted);
          letter-spacing: 0.03em;
        }
        .welcome-copy {
          margin-top: 30px;
        }
        .eyebrow {
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.18em;
          color: var(--heritage-accent);
          margin: 0 0 10px;
        }
        .welcome-copy h2 {
          font-size: clamp(30px, 3vw, 44px);
          font-weight: 500;
          line-height: 1.25;
          color: var(--heritage-ink);
          margin: 0 0 14px;
        }
        .welcome-copy > p:last-child {
          max-width: 36em;
          color: var(--heritage-muted);
          font-size: 14px;
          line-height: 1.8;
          margin: 0;
        }
        .lineage {
          display: flex;
          gap: 28px;
          margin-top: 24px;
          padding-top: 20px;
          border-top: 1px solid var(--heritage-rule);
        }
        .lineage span {
          display: flex;
          align-items: baseline;
          gap: 8px;
          font-size: 12px;
          color: var(--heritage-muted);
        }
        .lineage strong {
          font: 500 28px/1.2 var(--grampsjs-heading-font-family);
          color: var(--heritage-accent);
        }
        .login-panel {
          min-width: 0;
        }
        #login-container {
          width: 100%;
          box-sizing: border-box;
        }
        .entry-card {
          padding: 32px;
          background: var(--md-sys-color-surface);
          color: var(--md-sys-color-on-surface);
          border: 1px solid var(--heritage-rule);
          border-top: 3px solid #b99759;
          border-radius: 24px;
          box-shadow: 0 16px 48px #482d2510;
        }
        .brand {
          margin-bottom: 24px;
        }
        .brand h1 {
          font-size: 30px;
          font-weight: 500;
          line-height: 1.3;
          margin: 0 0 12px;
          color: var(--md-sys-color-on-surface);
        }
        .brand p {
          font-size: 14px;
          line-height: 1.75;
          color: var(--md-sys-color-on-surface-variant);
          margin: 0;
        }
        #login-form,
        #family-code-form {
          padding: 0;
          margin: 0;
        }
        #login-form > h2 {
          font-size: 22px;
          margin: 0 0 20px;
        }
        #family-code-form > h2 {
          font: 500 14px/1.5 var(--grampsjs-body-font-family);
          margin: 0 0 14px;
        }
        #login-form md-filled-button,
        #family-code-form md-filled-button {
          --md-filled-button-container-shape: 14px;
          --md-filled-button-container-height: 52px;
          width: 100%;
          min-height: 52px;
        }
        .editor-entry {
          border-top: 1px solid var(--heritage-rule);
          margin-top: 24px;
          padding-top: 4px;
        }
        .editor-entry summary {
          cursor: pointer;
          padding: 16px 0;
          min-height: 44px;
          box-sizing: border-box;
          font-size: 13px;
          color: var(--md-sys-color-primary);
        }
        .editor-entry summary:focus-visible,
        .text-button:focus-visible {
          outline: 2px solid var(--md-sys-color-primary);
          outline-offset: 3px;
        }
        .text-button {
          border: 0;
          background: none;
          color: var(--md-sys-color-primary);
          cursor: pointer;
          font: inherit;
          min-height: 44px;
          padding: 8px;
          text-decoration: underline;
        }
        .entry-note {
          margin: 20px 12px 0;
          text-align: center;
          font: italic 16px/1.6 var(--grampsjs-heading-font-family);
          color: var(--heritage-muted);
        }
        @media (max-width: 1000px) {
          .masthead {
            padding: 12px 24px;
          }
          .login-layout {
            padding: 28px 24px;
            gap: 24px;
            grid-template-columns: minmax(0, 1fr) minmax(320px, 1fr);
          }
          .entry-card {
            padding: 24px;
          }
        }
        @media (max-width: 760px) {
          .masthead {
            padding: 8px 20px;
          }
          .login-logo {
            width: 144px;
            height: 48px;
          }
          .masthead-copy {
            font-size: 10px;
          }
          .masthead-copy strong {
            font-size: 11px;
          }
          .login-layout {
            display: flex;
            flex-direction: column;
            padding: 24px 16px 28px;
            gap: 28px;
          }
          .temple img {
            border-radius: 16px;
          }
          .temple figcaption {
            margin: 8px 0 0;
            font-size: 10px;
          }
          .welcome-copy {
            display: none;
          }
          .login-panel {
            order: -1;
            width: 100%;
            max-width: 460px;
            align-self: center;
          }
          .welcome {
            max-width: 460px;
            align-self: center;
          }
          .entry-card {
            padding: 22px;
          }
          .brand {
            margin-bottom: 20px;
          }
          .brand h1 {
            font-size: 28px;
            margin-bottom: 8px;
          }
          .brand p {
            font-size: 13px;
          }
          .entry-note {
            display: none;
          }
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
          border-radius: 12px;
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
          color: var(--heritage-muted);
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

        .field-error {
          color: var(--md-sys-color-error);
          font-size: 13px;
          line-height: 1.6;
          margin: 0 0 14px;
        }
        .field-error[hidden] {
          display: none;
        }
        .code-help summary {
          color: var(--heritage-accent);
          cursor: pointer;
          min-height: 44px;
          align-content: center;
          font-size: 13px;
        }
        .code-help p {
          margin: 0 0 12px;
          font-size: 13px;
          line-height: 1.7;
          color: var(--heritage-muted);
        }
        .code-help summary:focus-visible {
          outline: 2px solid var(--heritage-accent);
          outline-offset: 3px;
        }
        @media (prefers-reduced-motion: reduce) {
          .text-field-wrapper input,
          .text-field-wrapper label {
            transition: none;
          }
        }

        .family-code p.hint {
          font-size: 0.9em;
          line-height: 1.6;
          color: var(--grampsjs-body-font-color-70);
          margin: 0 0 1em;
        }

        .family-code md-filled-button + p.hint {
          margin: 0.6em 0 0;
        }
        /* Chữ và vùng bấm cho người lớn tuổi, kể cả ở bố cục điện thoại. */
        .brand p,
        .family-code p.hint,
        .family-code p,
        #family-code-form > h2,
        .editor-entry summary,
        .forgot-password,
        .reset-link,
        .welcome-copy > p:last-child {
          font-size: 17px;
          line-height: 1.7;
        }
        .masthead-copy,
        .masthead-copy strong,
        .temple figcaption,
        .eyebrow,
        .lineage span {
          font-size: 14px;
        }
        .text-field-wrapper input {
          font-size: 18px;
        }
        .text-field-wrapper label {
          font-size: 17px;
        }
        .text-field-wrapper input:focus ~ label,
        .text-field-wrapper input:not(:placeholder-shown) ~ label {
          font-size: 14px;
        }
        .editor-entry summary,
        .text-button {
          min-height: 48px;
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
      _familyBusy: {state: true},
      _familyError: {state: true},
    }
  }

  constructor() {
    super()
    this.resetpw = false
    this.isFormValid = false
    this.credentials = {}
    this.tree = ''
    this.oidcConfig = {}
    this._familyBusy = false
    this._familyError = ''
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
    return html`<div class="entrance">
        <header class="masthead">
          <img
            class="login-logo"
            src="images/logo-bui-huu-ngang-v2.png"
            width="180"
            height="60"
            alt="Phả hệ Bùi Hữu"
          />
          <div class="masthead-copy">
            <strong>Gia phả dòng họ</strong>${PLACE_SHORT}
          </div>
        </header>
        <main class="login-layout">
          <section class="welcome" aria-label="Cội nguồn dòng họ">
            <figure class="temple">
              <img
                src="images/nha-tho-to-1600-4737852c.jpg"
                srcset="
                  images/nha-tho-to-800-4737852c.jpg   800w,
                  images/nha-tho-to-1600-4737852c.jpg 1600w
                "
                sizes="(max-width: 760px) 100vw, 60vw"
                width="1672"
                height="941"
                fetchpriority="high"
                alt="Toàn cảnh nhà thờ họ Bùi Hữu tại thôn Chỉ Bồ, mái ngói đỏ và hai cột đá trước sân"
              />
              <figcaption>Nhà thờ họ Bùi Hữu · Thôn Chỉ Bồ</figcaption>
            </figure>
            <div class="welcome-copy">
              <p class="eyebrow">Gìn giữ gia phả · Kết nối cháu con</p>
              <h2>Một cội nguồn.<br />Muôn đời tiếp nối.</h2>
              <p>
                Từ mái nhà thờ tổ, những câu chuyện được gìn giữ và trao lại.
                Cùng tìm về gốc rễ, hiểu thêm về ông bà và nối gần các thế hệ.
              </p>
              <div class="lineage" aria-label="17 đời, 3 ngành, 5 chi">
                <span><strong>17</strong>đời tiếp nối</span
                ><span><strong>3</strong>ngành</span
                ><span><strong>5</strong>chi</span>
              </div>
            </div>
          </section>
          <section class="login-panel" aria-label="Mở gia phả">
            ${this.resetpw ? this._renderResetPw() : this._renderLogin()}
            <p class="entry-note">Có tổ có tông, có cội có nguồn.</p>
          </section>
        </main>
      </div>
      <grampsjs-site-footer .public=${true}></grampsjs-site-footer>`
  }

  _renderLogin() {
    const localAuthDisabled =
      this.oidcConfig?.enabled && this.oidcConfig?.disable_local_auth

    return html`
      <div id="login-container" class="entry-card">
        <header class="brand">
          <p class="eyebrow">${APP_NAME}</p>
          <h1>Mở gia phả</h1>
          <p>Tìm người thân, lần theo các đời và tra ngày giỗ.</p>
        </header>
        ${this._renderFamilyCode()}
        <details
          class="editor-entry"
          ?open=${localAuthDisabled ||
          !(
            window.grampsjsConfig?.familyCodeLogin ||
            window.grampsjsConfig?.guestUsername
          )}
        >
          <summary>Đăng nhập bằng tài khoản</summary>
          <form
            id="login-form"
            @submit="${this._submitLogin}"
            @keydown="${this._handleFormKeydown}"
          >
            <h2>Đăng nhập tài khoản</h2>
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
                    <button
                      type="button"
                      class="text-button"
                      @click="${() => {
                        this.resetpw = true
                      }}"
                    >
                      ${this._('Lost password?')}
                    </button>
                  </p>
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
        </details>
      </div>
    `
  }

  _handleNav(path) {
    fireEvent(this, 'nav', {path})
  }

  /*
  Xem bằng mã dòng họ.

  Các trang dòng họ ở Việt Nam đều mở phả đồ bằng một mã chung cả họ biết, không
  bắt từng người lập tài khoản. Ở đây mã là mã chung cả họ (cấu hình
  GRAMPSWEB_FAMILY_CODE_DEFAULT của API, mặc định "buihuu") hoặc họ tên đầy đủ
  của một người trong cây, viết liền, không phân biệt hoa thường; máy chủ so mã
  (POST /api/token/family-code/) rồi cấp token cho tài khoản khách chỉ xem, nên
  trình duyệt không cần biết tài khoản đó. Tắt bằng familyCodeLogin trong
  config.js thì khối này không hiện. Không nói luật của mã ở trang công khai
  này: ai trong họ được truyền miệng, người ngoài không đọc được ở đây.
  */
  _renderFamilyCode() {
    const config = window.grampsjsConfig ?? {}
    if (!config.familyCodeLogin && !config.guestUsername) return ''
    // Đây là lối vào của đa số người trong họ nên đứng trước form tài khoản.
    return html`
      <form
        id="family-code-form"
        class="family-code"
        @submit="${this._submitFamilyCode}"
        @keydown="${this._handleFormKeydown}"
      >
        <div class="text-field-wrapper">
          <input
            id="family-code"
            name="family-code"
            required
            aria-describedby="family-code-help family-code-error"
            aria-invalid=${this._familyError ? 'true' : 'false'}
            enterkeyhint="go"
            ?readonly=${this._familyBusy}
            @input=${() => {
              this._familyError = ''
            }}
            type="text"
            autocomplete="off"
            autocapitalize="off"
            autocorrect="off"
            spellcheck="false"
            placeholder=" "
          />
          <label for="family-code">${this._('Family code')}</label>
        </div>
        <p
          id="family-code-error"
          class="field-error"
          role="alert"
          ?hidden=${!this._familyError}
        >
          ${this._familyError}
        </p>
        <md-filled-button
          type="button"
          style="width: 100%;"
          ?disabled=${this._familyBusy}
          aria-busy=${this._familyBusy ? 'true' : 'false'}
          @click="${this._submitFamilyCode}"
        >
          ${this._familyBusy ? 'Đang mở gia phả…' : 'Vào xem gia phả'}
        </md-filled-button>
        <p class="hint" id="family-code-help">
          Dùng mã được chia sẻ trong dòng họ, không cần tạo tài khoản.
        </p>
        <details class="code-help">
          <summary>Chưa có mã dòng họ?</summary>
          <p>
            Hỏi trưởng chi hoặc người giữ gia phả để nhận mã. Chỉ chia sẻ mã với
            người trong họ.
          </p>
        </details>
      </form>
    `
  }

  async _submitFamilyCode(e) {
    e?.preventDefault?.()
    if (this._familyBusy) return
    const field = this.shadowRoot.getElementById('family-code')
    if (!field?.reportValidity()) return
    const code = field.value.trim()
    if (!code) {
      this._familyError = 'Vui lòng nhập mã dòng họ.'
      field.focus()
      return
    }
    this._familyBusy = true
    this._familyError = ''
    try {
      const res = await apiGetFamilyCodeTokens(code)
      if ('error' in res) {
        this._familyError =
          res.error === 'Too many attempts'
            ? 'Bạn đã thử nhiều lần. Vui lòng đợi một lúc rồi thử lại.'
            : res.error === 'Wrong family code'
            ? 'Mã chưa đúng. Kiểm tra lại hoặc hỏi người giữ gia phả.'
            : 'Chưa kết nối được. Kiểm tra mạng rồi thử lại.'
      } else {
        document.location.href = '/'
      }
    } catch {
      this._familyError = 'Chưa kết nối được. Kiểm tra mạng rồi thử lại.'
    } finally {
      this._familyBusy = false
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
      <div id="login-container" class="entry-card">
        <form
          id="login-form"
          @submit="${this._resetPw}"
          @keydown="${this._handleFormKeydown}"
        >
          <h1>Khôi phục mật khẩu</h1>
          <p>Nhập tên tài khoản để nhận liên kết đặt lại mật khẩu qua email.</p>
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
              Gửi liên kết đặt lại
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
            <button
              type="button"
              class="text-button"
              @click="${() => {
                this.resetpw = false
              }}"
            >
              Quay lại đăng nhập
            </button>
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
        // Thông báo của api.js là tiếng Anh; lang/vi.json có bản dịch cho nó.
        this._showError(this._(res.error))
      } else {
        document.location.href = '/'
      }
    })
  }

  async _submitOIDCLogin(providerId) {
    if (!providerId) {
      this._showError('Chưa cấu hình nhà cung cấp đăng nhập.')
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
      this._showError('Chưa nhập tên người dùng.')
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
