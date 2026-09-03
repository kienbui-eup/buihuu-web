import {LitElement, html, css} from 'lit'
import {sharedStyles} from '../SharedStyles.js'
import {fireEvent} from '../util.js'

// Dùng ảnh nguyên gốc của nhà thờ tổ; không dựng lại kiến trúc bằng AI.
class GrampsjsTempleHero extends LitElement {
  static properties = {welcome: {type: Boolean, reflect: true}}

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
        border: 0;
        border-bottom: 1px solid #a58b62;
        padding: 4px 0;
      }
      a:focus-visible,
      button:focus-visible {
        outline-color: #fff9e9;
      }
      figure {
        margin: 0;
        min-width: 0;
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
        height: 100%;
        min-height: 400px;
        object-fit: cover;
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
        <p class="eyebrow">Thôn Chỉ Bồ · Nơi trở về của con cháu</p>
        ${this.welcome
          ? html`<h2>Nhà thờ tổ <strong>Họ Bùi Hữu</strong></h2>`
          : html`<h1>Gia phả <strong>Bùi Hữu</strong></h1>`}
        <p class="description">
          Gìn giữ cội nguồn, kết nối các thế hệ. Cùng tra cứu gia phả, tưởng nhớ
          tổ tiên và tiếp nối những câu chuyện của dòng họ.
        </p>
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
            src="images/nha-tho-to-1600.jpg"
            srcset="
              images/nha-tho-to-800.jpg   800w,
              images/nha-tho-to-1600.jpg 1600w
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
