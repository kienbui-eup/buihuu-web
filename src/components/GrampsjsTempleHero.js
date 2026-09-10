import {LitElement, html, css} from 'lit'
import {sharedStyles} from '../SharedStyles.js'
import {fireEvent} from '../util.js'
import {PLACE_SHORT} from '../branding.js'

// Dùng bản ảnh nhà thờ đã phục dựng và được người dùng chọn cho giao diện.
class GrampsjsTempleHero extends LitElement {
  static properties = {
    welcome: {type: Boolean, reflect: true},
    // Số người trong gia phả, trang chủ truyền từ dbInfo; 0 là chưa biết.
    people: {type: Number},
    // Trích đoạn mở đầu lời tựa, trang chủ truyền từ grampsjs-home-preface;
    // rỗng khi chưa tải thì không hiện khối trích.
    prefaceExcerpt: {type: String},
    // Người gốc đưa lên hero (mặc định là thủy tổ): {label, name, generation,
    // href}; null khi trang chủ chưa tải xong hồ sơ.
    founder: {type: Object},
  }

  constructor() {
    super()
    this.welcome = false
    this.people = 0
    this.prefaceExcerpt = ''
    this.founder = null
  }

  static styles = [
    sharedStyles,
    css`
      :host {
        display: block;
      }
      .hero {
        background: transparent;
        color: var(--heritage-ink);
        position: relative;
        isolation: isolate;
        overflow: hidden;
        padding: 28px clamp(16px, 4vw, 64px) 40px;
        border-bottom: 1px solid var(--heritage-rule);
      }
      .hero-content {
        max-width: 1280px;
        margin: 0 auto;
        overflow: hidden;
        border: 1px solid var(--heritage-rule);
        border-radius: 24px;
        background: var(--heritage-paper);
        box-shadow: 0 16px 48px var(--grampsjs-body-font-color-10);
      }
      figure {
        margin: 0 auto;
        max-width: 1280px;
        position: relative;
      }
      picture,
      img {
        display: block;
        width: 100%;
      }
      img {
        height: auto;
        border-radius: 0;
      }
      figcaption {
        display: flex;
        justify-content: space-between;
        gap: 12px;
        padding: 16px 32px;
        border-bottom: 1px solid var(--heritage-rule);
        color: var(--heritage-muted);
        font-size: 13px;
        line-height: 1.5;
      }
      figcaption strong {
        color: var(--heritage-accent);
        font-weight: 500;
      }
      .intro {
        max-width: 1280px;
        margin: 0 auto;
        padding: 32px;
        box-sizing: border-box;
        background: radial-gradient(
          ellipse at right bottom,
          color-mix(in srgb, var(--heritage-gold) 13%, transparent),
          transparent 75%
        );
        display: grid;
        grid-template-columns: minmax(0, 1.15fr) minmax(0, 0.85fr);
        column-gap: clamp(24px, 4vw, 56px);
        row-gap: 24px;
        align-items: start;
      }
      .heritage-aside {
        grid-column: 2;
        grid-row: 1 / span 2;
        align-self: stretch;
        display: flex;
        flex-direction: column;
        justify-content: center;
        gap: 24px;
        padding-left: 28px;
        border-left: 1px solid var(--heritage-gold);
      }
      .eyebrow {
        color: var(--heritage-accent);
        text-transform: uppercase;
        letter-spacing: 0.16em;
        font-size: 16px;
        line-height: 1.8;
        margin: 0 0 10px;
      }
      h1,
      h2 {
        color: var(--heritage-ink);
        font-size: clamp(30px, 3.2vw, 46px);
        line-height: 1.2;
        margin: 0 0 16px;
        font-weight: 500;
      }
      h1 strong,
      h2 strong {
        font-weight: 600;
      }
      .description {
        color: var(--heritage-muted);
        font-size: 16px;
        line-height: 1.8;
        margin: 0;
        max-width: 42em;
      }
      .preface {
        display: grid;
        grid-template-columns: auto minmax(0, 1fr);
        gap: 10px;
        width: 100%;
        box-sizing: border-box;
        padding: 0;
        margin: 0;
        border: 0;
        border-left: 0;
        background: transparent;
        text-align: left;
        color: var(--heritage-ink);
        cursor: pointer;
      }
      .quote-mark {
        font: 48px/1 var(--grampsjs-heading-font-family);
        color: #a78348;
      }
      .quote-text {
        display: -webkit-box;
        -webkit-line-clamp: 3;
        -webkit-box-orient: vertical;
        overflow: hidden;
        font: italic 400 19px/1.6 'EB Garamond x', 'Noto Serif', serif;
      }
      .quote-source {
        display: block;
        margin-top: 10px;
        font-size: 16px;
        color: var(--heritage-muted);
      }
      .quote-action {
        grid-column: 2;
        font-size: 16px;
        color: var(--heritage-accent);
      }
      .preface:hover .quote-action {
        text-decoration: underline;
      }
      .actions {
        grid-column: 1;
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 12px 20px;
        margin-top: 0;
      }
      .actions a {
        box-sizing: border-box;
        min-height: 48px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 12px 22px;
        border-radius: 12px;
        background: var(--md-sys-color-primary);
        color: var(--md-sys-color-on-primary);
        text-decoration: none;
        font: 500 16px/1.4 var(--grampsjs-body-font-family);
      }
      .actions a:hover {
        background: color-mix(in srgb, var(--md-sys-color-primary) 90%, black);
      }
      .action-note {
        font-size: 16px;
        color: var(--heritage-muted);
      }
      .founder {
        display: flex;
        align-items: center;
        min-height: 56px;
        text-decoration: none;
        border-top: 1px solid var(--heritage-rule);
        gap: 12px;
        background: transparent;
        color: var(--heritage-ink);
        padding: 20px 0 0;
        margin-left: 0;
        text-align: left;
      }
      .founder:hover {
        color: var(--heritage-accent);
      }
      .founder-mark {
        flex-shrink: 0;
        width: 40px;
        height: 40px;
        display: grid;
        place-items: center;
        border: 1px solid var(--heritage-rule);
        border-radius: 50%;
        color: var(--heritage-accent);
      }
      .founder-copy {
        display: grid;
        gap: 2px;
      }
      .founder-copy small,
      .founder-copy span {
        font-size: 16px;
        color: var(--heritage-muted);
      }
      .founder-copy strong {
        font: 600 16px/1.4 var(--grampsjs-heading-font-family);
      }
      a:focus-visible,
      button:focus-visible {
        outline: 2px solid var(--heritage-accent);
        outline-offset: 4px;
      }
      :host([welcome]) .heritage-aside {
        display: none;
      }
      :host([welcome]) .intro {
        grid-template-columns: 1fr;
        padding-bottom: 28px;
      }
      @media (max-width: 760px) {
        .hero {
          padding: 12px 12px 24px;
        }
        .hero-content {
          border-radius: 18px;
        }
        .hero::before {
          opacity: 0.2;
        }
        .heritage-aside {
          order: 1;
          margin-top: 24px;
          padding: 20px 0 0;
          border-left: 0;
          border-top: 1px solid var(--heritage-rule);
          gap: 18px;
        }
        img {
          border-radius: 0;
        }
        figcaption {
          margin: 0;
          font-size: 11px;
          padding: 12px 16px;
        }
        .intro {
          display: flex;
          flex-direction: column;
          padding: 24px 20px 28px;
          gap: 0;
        }
        .eyebrow {
          font-size: 16px;
        }
        h1,
        h2 {
          font-size: 32px;
          margin-bottom: 12px;
        }
        .description {
          font-size: 16px;
        }
        .preface {
          margin-top: 0;
          padding-left: 0;
        }
        .quote-text {
          font-size: 17px;
          -webkit-line-clamp: 2;
        }
        .actions {
          order: 0;
          gap: 14px;
          margin-top: 22px;
        }
        .founder {
          width: 100%;
          justify-content: flex-start;
          margin-left: 0;
        }
        :host([welcome]) .intro {
          padding: 20px;
        }
      }
      @media (max-width: 900px) {
        :host([welcome]) .intro {
          display: none;
        }
      }
    `,
  ]

  _renderFounder() {
    const founder = this.founder
    if (!founder?.name) return ''
    const initial = founder.name.trim().split(/\s+/).pop()?.[0] ?? ''
    return html`<a class="founder" href=${founder.href}>
      <span class="founder-mark" aria-hidden="true">${initial}</span>
      <span class="founder-copy">
        <small>${founder.label}</small>
        <strong>${founder.name}</strong>
        <span
          >${founder.generation ? `Đời ${founder.generation} · ` : ''}Xem hồ
          sơ</span
        >
      </span>
    </a>`
  }

  render() {
    return html`<section class="hero" aria-label="Nhà thờ tổ họ Bùi Hữu">
      <div class="hero-content">
        <figure>
          <picture
            ><img
              src="images/nha-tho-to-1600-4737852c.jpg"
              srcset="
                images/nha-tho-to-800-4737852c.jpg   800w,
                images/nha-tho-to-1600-4737852c.jpg 1600w
              "
              sizes="(max-width: 760px) calc(100vw - 26px), (max-width: 1408px) 92vw, 1280px"
              width="1672"
              height="941"
              fetchpriority="high"
              alt="Nhà thờ tổ họ Bùi Hữu tại thôn Chỉ Bồ, mái ngói đỏ, cửa gỗ và hai cột đá trước sân"
          /></picture>
          <figcaption>
            <strong>Nhà thờ họ Bùi Hữu</strong
            ><span>Thôn Chỉ Bồ · Nơi con cháu hướng về</span>
          </figcaption>
        </figure>
        <div class="intro">
          <div class="intro-copy">
            <p class="eyebrow">${PLACE_SHORT}</p>
            ${this.welcome
              ? html`<h2>Nhà thờ tổ <strong>họ Bùi Hữu</strong></h2>`
              : html`<h1>Phả hệ <strong>họ Bùi Hữu</strong></h1>`}
            <p class="description">
              Chép từ thủy tổ Bùi Công tự Huyền Nhân đến nay đã 17 đời, chia 3
              ngành, 5 chi.
              ${this.welcome
                ? 'Con cháu trong họ mở bằng mã dòng họ; người biên soạn đăng nhập tài khoản.'
                : html`Bản số hóa này ghi
                  ${this.people
                    ? `${this.people.toLocaleString('vi-VN')} người`
                    : 'từng người'},
                  để con cháu tra được một người thuộc chi nào, đời mấy, con ai,
                  giỗ ngày nào.`}
            </p>
          </div>
          <div class="heritage-aside">
            ${this.welcome || !this.prefaceExcerpt
              ? ''
              : html`<button
                  class="preface"
                  type="button"
                  aria-label="Đọc toàn văn lời tựa gia phả"
                  @click=${() => fireEvent(this, 'preface:open')}
                >
                  <span class="quote-mark" aria-hidden="true">“</span>
                  <span class="quote-copy">
                    <span class="quote-text">${this.prefaceExcerpt}</span>
                    <span class="quote-source">Trích lời tựa gia phả</span>
                  </span>
                  <span class="quote-action"
                    >Đọc toàn văn <span aria-hidden="true">→</span></span
                  >
                </button>`}
            ${this.welcome ? '' : this._renderFounder()}
          </div>
          ${this.welcome
            ? ''
            : html`<div class="actions">
                <a href="/tree"
                  >Mở phả đồ <span aria-hidden="true">&nbsp;→</span></a
                ><span class="action-note">17 đời · 3 ngành · 5 chi</span>
              </div>`}
        </div>
      </div>
    </section>`
  }
}
window.customElements.define('grampsjs-temple-hero', GrampsjsTempleHero)
