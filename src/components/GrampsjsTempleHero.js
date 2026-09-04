import {LitElement, html, css} from 'lit'
import {sharedStyles} from '../SharedStyles.js'
import {fireEvent} from '../util.js'
import {PLACE_SHORT} from '../branding.js'
import './GrampsjsHeritageMark.js'

// Dùng bản ảnh nhà thờ đã phục dựng và được người dùng chọn cho giao diện.
class GrampsjsTempleHero extends LitElement {
  static properties = {
    welcome: {type: Boolean, reflect: true},
    // Số người trong gia phả, trang chủ truyền từ dbInfo; 0 là chưa biết.
    people: {type: Number},
    // Trích đoạn mở đầu lời tựa, trang chủ truyền từ grampsjs-home-preface;
    // rỗng khi chưa tải thì không hiện khối trích.
    prefaceExcerpt: {type: String},
  }

  constructor() {
    super()
    this.welcome = false
    this.people = 0
    this.prefaceExcerpt = ''
  }

  static styles = [
    sharedStyles,
    css`
      :host {
        display: block;
      }
      .hero {
        display: grid;
        grid-template-columns: minmax(300px, 0.8fr) minmax(0, 1.4fr);
        background: var(--heritage-wood);
        color: #fff9e9;
        border-bottom: 4px solid var(--heritage-gold);
      }
      .intro {
        padding: clamp(28px, 4vw, 64px);
        align-content: center;
      }
      .eyebrow {
        color: #e2c891;
        text-transform: uppercase;
        letter-spacing: 0.16em;
        font-size: 11px;
        line-height: 1.8;
        margin: 0 0 20px;
      }
      h1,
      h2 {
        color: #fff9e9;
        font-size: clamp(36px, 4vw, 62px);
        line-height: 1.2;
        margin: 0 0 22px;
        font-weight: 500;
      }
      h1 strong,
      h2 strong {
        display: block;
        font-weight: 600;
      }
      .description {
        max-width: 32em;
        color: #e5d9c9;
        font-size: 15px;
        line-height: 1.85;
        margin: 0;
      }
      /* Trích đoạn như một thẻ thư tịch đặt trên nền gỗ. Toàn bộ thẻ là nút
         mở lời tựa, giúp người dùng điện thoại không phải tìm một CTA nhỏ. */
      .preface {
        position: relative;
        display: grid;
        grid-template-columns: auto minmax(0, 1fr) auto;
        align-items: center;
        gap: 14px;
        width: min(100%, 38em);
        margin: 24px 0 0;
        padding: 16px 18px;
        border: 1px solid rgba(226, 200, 145, 0.52);
        border-radius: 3px;
        background: linear-gradient(
          115deg,
          rgba(255, 249, 233, 0.1),
          rgba(226, 200, 145, 0.04)
        );
        color: inherit;
        text-align: left;
        overflow: hidden;
        isolation: isolate;
      }
      .preface::before,
      .preface::after {
        content: '';
        position: absolute;
        pointer-events: none;
      }
      .preface::before {
        inset: 5px;
        border: 1px solid rgba(226, 200, 145, 0.17);
        z-index: -1;
      }
      .preface::after {
        width: 120px;
        height: 120px;
        right: -64px;
        bottom: -72px;
        border: 1px solid rgba(226, 200, 145, 0.28);
        border-radius: 50%;
        box-shadow: 0 0 0 10px rgba(226, 200, 145, 0.04),
          0 0 0 20px rgba(226, 200, 145, 0.03);
      }
      .preface:hover {
        border-color: #e2c891;
        background: rgba(226, 200, 145, 0.13);
        transform: translateY(-1px);
      }
      .preface:focus-visible {
        outline: 2px solid #fff9e9;
        outline-offset: 3px;
      }
      .quote-mark {
        align-self: start;
        font: 500 54px/0.9 var(--grampsjs-heading-font-family);
        color: #e2c891;
        opacity: 0.9;
      }
      .quote-copy {
        min-width: 0;
      }
      .quote-text {
        display: -webkit-box;
        -webkit-line-clamp: 4;
        -webkit-box-orient: vertical;
        overflow: hidden;
        font: italic 400 17px/1.7 'EB Garamond x', 'Noto Serif', serif;
        color: #f1e6cf;
      }
      .quote-source {
        display: block;
        margin-top: 9px;
        font-size: 11px;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: #e2c891;
      }
      .quote-action {
        align-self: end;
        padding-left: 12px;
        border-left: 1px solid rgba(226, 200, 145, 0.38);
        font-size: 12px;
        line-height: 1.5;
        color: #fff9e9;
        white-space: nowrap;
      }
      .actions {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 12px 20px;
        margin-top: 28px;
      }
      a,
      .actions button {
        min-height: 44px;
        box-sizing: border-box;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font: 500 14px/1.4 var(--grampsjs-body-font-family);
        cursor: pointer;
      }
      a:link,
      a:visited {
        background: #e2c891;
        color: #35261d;
        padding: 12px 20px;
        border-radius: 3px;
        text-decoration: none;
      }
      a:hover {
        background: #f0dbac;
      }
      .actions button {
        background: transparent;
        color: #fff9e9;
        border: 1px solid #a58b62;
        border-radius: 3px;
        padding: 12px 20px;
      }
      .actions button:hover {
        border-color: #e2c891;
        background: rgba(226, 200, 145, 0.12);
      }
      a:focus-visible,
      .actions button:focus-visible {
        outline-color: #fff9e9;
      }
      figure {
        margin: 0;
        min-width: 0;
        align-self: center;
        position: relative;
        overflow: hidden;
      }
      picture {
        display: block;
        height: 100%;
      }
      img {
        display: block;
        width: 100%;
        height: auto;
        min-height: 0;
        object-fit: contain;
        object-position: center 56%;
      }
      figcaption {
        position: absolute;
        right: 20px;
        bottom: 18px;
        background: #241b16e8;
        color: #fff9e9;
        border-left: 2px solid #d4b16e;
        font-size: 11px;
        letter-spacing: 0.04em;
        line-height: 1.7;
        padding: 8px 14px;
      }
      :host([welcome]) .hero {
        grid-template-columns: 1fr;
        grid-template-rows: auto 1fr;
        height: 100%;
      }
      :host([welcome]) figure {
        order: -1;
      }
      :host([welcome]) img {
        min-height: 0;
        aspect-ratio: 16 / 9;
      }
      :host([welcome]) .intro {
        padding: 36px 40px;
      }
      :host([welcome]) h2 {
        font-size: clamp(32px, 3.5vw, 48px);
      }
      @media (max-width: 760px) {
        .hero {
          grid-template-columns: 1fr;
        }
        figure {
          order: -1;
        }
        img {
          min-height: 0;
          height: auto;
          aspect-ratio: 16 / 9;
          object-fit: cover;
        }
        .intro {
          padding: 26px 24px 30px;
        }
        .eyebrow {
          font-size: 10px;
          margin-bottom: 12px;
        }
        h1,
        h2 {
          font-size: 38px;
          margin-bottom: 14px;
        }
        h1 strong,
        h2 strong {
          display: inline;
        }
        .description {
          font-size: 14px;
          line-height: 1.75;
        }
        .preface {
          margin-top: 18px;
          grid-template-columns: auto minmax(0, 1fr);
          gap: 10px;
          padding: 14px;
        }
        .quote-mark {
          font-size: 42px;
        }
        .quote-text {
          -webkit-line-clamp: 2;
          font-size: 16px;
          line-height: 1.65;
        }
        .quote-source {
          margin-top: 6px;
          font-size: 10px;
        }
        .quote-action {
          grid-column: 2;
          justify-self: start;
          padding: 0;
          border: 0;
        }
        .actions {
          margin-top: 20px;
        }
        figcaption {
          right: 10px;
          bottom: 10px;
          font-size: 9px;
          padding: 5px 9px;
        }
      }
      @media (max-width: 900px) {
        :host([welcome]) .intro {
          display: none;
        }
      }
    `,
  ]

  render() {
    return html`<section class="hero" aria-label="Nhà thờ tổ họ Bùi Hữu">
      <div class="intro">
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
              để con cháu tra được một người thuộc chi nào, đời mấy, con ai, giỗ
              ngày nào.`}
        </p>
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
        ${this.welcome
          ? ''
          : html`<div class="actions">
              <a href="/tree"
                >Mở cây gia phả <span aria-hidden="true">&nbsp;→</span></a
              ><span class="action-note">17 đời · 3 ngành · 5 chi</span>
            </div>`}
      </div>
      <figure>
        <picture
          ><img
            src="images/nha-tho-to-1600-4737852c.jpg"
            srcset="
              images/nha-tho-to-800-4737852c.jpg   800w,
              images/nha-tho-to-1600-4737852c.jpg 1600w
            "
            sizes="(max-width: 760px) 100vw, 65vw"
            width="1672"
            height="941"
            fetchpriority="high"
            alt="Nhà thờ tổ họ Bùi Hữu tại thôn Chỉ Bồ, mái ngói đỏ, cửa gỗ và hai cột đá trước sân"
        /></picture>
        <figcaption>Nhà thờ họ Bùi Hữu<br />Thôn Chỉ Bồ</figcaption>
      </figure>
    </section>`
  }
}
window.customElements.define('grampsjs-temple-hero', GrampsjsTempleHero)
