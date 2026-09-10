import {LitElement, css, html} from 'lit'
import '@material/web/button/filled-button'
import {mdiMagnify} from '@mdi/js'

import {heritageFrameStyles} from '../HeritageStyles.js'
import {GrampsjsAppStateMixin} from '../mixins/GrampsjsAppStateMixin.js'
import {openPeopleSearch} from '../pageSearch.js'
import './GrampsjsIcon.js'

/*
Khối "không có trang này" hoặc "không có hồ sơ này".

Bản gốc để trắng khi đường dẫn không khớp trang nào, hay khi mã hồ sơ không có
trong cây; con cháu quét mã QR in trên sổ cũ, bấm liên kết đã gửi qua Zalo từ
lâu, hay gõ nhầm một chữ số thì chỉ thấy đầu trang và chân trang, không biết
mình sai ở đâu và đi tiếp thế nào. Khối này nói rõ chuyện gì xảy ra, và đưa
ngay ô tìm tên vì gần như mọi lần tra đều bắt đầu từ một cái tên.
*/

// Lối đi tiếp, theo thứ tự con cháu hay dùng.
const LINKS = [
  {href: '/', label: 'Trang chủ'},
  {href: '/people', label: 'Dòng họ'},
  {href: '/tree', label: 'Phả đồ'},
  {href: '/lich-gio', label: 'Lịch giỗ'},
  {href: '/blog', label: 'Kho sử'},
]

export class GrampsjsNotFound extends GrampsjsAppStateMixin(LitElement) {
  static get styles() {
    return [
      heritageFrameStyles,
      css`
        :host {
          display: block;
        }
        section {
          max-width: 640px;
          padding: 28px;
        }
        h2 {
          margin: 0 0 10px;
          font-size: 26px;
          line-height: 1.3;
          color: var(--md-sys-color-primary);
        }
        p {
          margin: 0 0 12px;
          font: 400 15px/1.7 var(--grampsjs-body-font-family, sans-serif);
          color: var(--md-sys-color-on-surface);
        }
        p.detail {
          color: var(--md-sys-color-on-surface-variant);
        }
        code {
          font-size: 14px;
          overflow-wrap: anywhere;
        }
        form {
          display: flex;
          align-items: center;
          gap: 8px;
          margin: 18px 0 16px;
        }
        .name-search {
          display: flex;
          align-items: center;
          flex: 1 1 auto;
          gap: 8px;
          min-width: 0;
          min-height: 48px;
          padding: 0 14px;
          border: 1px solid var(--md-sys-color-outline);
          border-radius: var(--grampsjs-frame-radius);
          background: var(--grampsjs-frame-paper);
        }
        .name-search:focus-within {
          border-color: var(--md-sys-color-primary);
          outline: 2px solid var(--md-sys-color-primary);
          outline-offset: -2px;
        }
        .name-search input {
          flex: 1;
          min-width: 0;
          border: 0;
          background: transparent;
          color: var(--md-sys-color-on-surface);
          font: inherit;
          font-size: 16px;
          outline: none;
        }
        .name-search input::placeholder {
          color: var(--md-sys-color-on-surface-variant);
        }
        .links {
          display: flex;
          flex-wrap: wrap;
          gap: 4px 0;
          margin: 0;
          font-size: 15px;
          color: var(--md-sys-color-on-surface-variant);
        }
        .links a {
          color: var(--md-sys-color-primary);
          font-weight: 500;
          text-decoration: none;
        }
        .links a:hover,
        .links a:focus-visible {
          text-decoration: underline;
        }
        .links .sep {
          margin: 0 8px;
        }
        /* Khoảng trắng giữa các phần tử con của flex bị bỏ, nên cách bằng lề. */
        .links > span:first-child {
          margin-right: 6px;
        }
        @media (max-width: 600px) {
          section {
            padding: 22px 18px;
          }
          h2 {
            font-size: 23px;
          }
        }
      `,
    ]
  }

  static get properties() {
    return {
      heading: {type: String},
      detail: {type: String},
      path: {type: String},
    }
  }

  constructor() {
    super()
    this.heading = 'Không có trang này'
    this.detail = ''
    this.path = ''
  }

  _submit(event) {
    event.preventDefault()
    const query = this.renderRoot.querySelector('input')?.value ?? ''
    openPeopleSearch(this, query)
  }

  render() {
    return html`<section class="heritage-frame" role="alert">
      <p class="section-label">Không tìm thấy</p>
      <h2>${this.heading}</h2>
      ${this.detail ? html`<p class="detail">${this.detail}</p>` : ''}
      ${this.path
        ? html`<p class="detail">Đường dẫn đã mở: <code>${this.path}</code></p>`
        : ''}
      <p>Muốn tìm một người trong họ thì gõ tên, không cần dấu:</p>
      <form @submit=${this._submit}>
        <label class="name-search">
          <grampsjs-icon
            .path="${mdiMagnify}"
            height="22"
            color="var(--md-sys-color-on-surface-variant)"
          ></grampsjs-icon>
          <input
            type="search"
            autocomplete="off"
            spellcheck="false"
            enterkeyhint="search"
            aria-label="Tìm theo tên"
            placeholder="Tên người cần tìm"
          />
        </label>
        <md-filled-button type="submit">Tìm</md-filled-button>
      </form>
      <p class="links">
        <span>Hoặc mở:</span>
        ${LINKS.map(
          ({href, label}, index) =>
            html`${index ? html`<span class="sep">·</span>` : ' '}<a
                href="${href}"
                >${label}</a
              >`
        )}
      </p>
    </section>`
  }
}

window.customElements.define('grampsjs-not-found', GrampsjsNotFound)
