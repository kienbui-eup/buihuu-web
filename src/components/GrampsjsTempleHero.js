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
      /* Lời tựa gộp vào phần giới thiệu: một trích đoạn mở đầu, chữ có chân
         nghiêng như bản chép, tối đa bốn dòng; toàn văn mở bằng nút bên dưới. */
      .preface {
        max-width: 34em;
        margin: 22px 0 0;
        padding: 2px 0 2px 18px;
        border-left: 2px solid #a58b62;
      }
      .preface p {
        display: -webkit-box;
        -webkit-line-clamp: 4;
        -webkit-box-orient: vertical;
        overflow: hidden;
        margin: 0;
        font: italic 400 17px/1.7 'EB Garamond x', 'Noto Serif', serif;
        color: #f1e6cf;
      }
      .preface footer {
        margin-top: 8px;
        font-size: 12px;
        letter-spacing: 0.08em;
        color: #e2c891;
      }
      .actions {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 12px 20px;
        margin-top: 28px;
      }
      a,
      button {
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
      button {
        background: transparent;
        color: #fff9e9;
        border: 1px solid #a58b62;
        border-radius: 3px;
        padding: 12px 20px;
      }
      button:hover {
        border-color: #e2c891;
        background: rgba(226, 200, 145, 0.12);
      }
      a:focus-visible,
      button:focus-visible {
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
          padding-left: 14px;
        }
        .preface p {
          -webkit-line-clamp: 3;
          font-size: 16px;
          line-height: 1.65;
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
          : html`<blockquote class="preface">
              <p>${this.prefaceExcerpt}</p>
              <footer>Trích lời tựa gia phả</footer>
            </blockquote>`}
        ${this.welcome
          ? ''
          : html`<div class="actions">
              <a href="/tree"
                >Mở cây gia phả <span aria-hidden="true">&nbsp;→</span></a
              ><button @click=${() => fireEvent(this, 'preface:open')}>
                Đọc lời tựa
              </button>
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
