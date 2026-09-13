import {LitElement, html, css} from 'lit'
import {sharedStyles} from '../SharedStyles.js'
import './GrampsjsHeritageMark.js'
import {APP_NAME, PLACE_FULL, PLACE_NOW} from '../branding.js'

// Ba bài giới thiệu, hướng dẫn và góp ý là bài viết trong cây (sửa được trên
// trang), mã cố định để footer, menu tài khoản và trang chủ cùng trỏ tới.
export const ARTICLE_GIOI_THIEU = '/blog/SBHNC19'
export const ARTICLE_HUONG_DAN = '/blog/SBHNC17'
export const ARTICLE_GOP_Y = '/blog/SBHNC18'

class GrampsjsSiteFooter extends LitElement {
  static properties = {
    compact: {type: Boolean, reflect: true},
    public: {type: Boolean},
  }

  static styles = [
    sharedStyles,
    css`
      :host {
        display: block;
      }
      footer {
        position: relative;
        isolation: isolate;
        background: var(--heritage-paper);
        color: var(--heritage-ink);
        border-top: 1px solid var(--heritage-rule);
      }
      footer::before {
        content: '';
        position: absolute;
        inset: 0 0 auto;
        height: 360px;
        z-index: -1;
        pointer-events: none;
        background: linear-gradient(
            90deg,
            var(--heritage-paper),
            transparent 75%
          ),
          url('images/chi-bo-tree-landscape-v2.png') center 72% / cover
            no-repeat;
        mask-image: linear-gradient(#000 45%, transparent 100%);
      }
      .body,
      .base {
        max-width: 1280px;
        margin: 0 auto;
        box-sizing: border-box;
      }
      .body {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 24px 56px;
        padding: 32px var(--heritage-gutter) 24px;
      }
      .identity {
        grid-column: 1 / -1;
        min-height: 235px;
        display: flex;
        align-items: flex-start;
        gap: 18px;
      }
      grampsjs-heritage-mark {
        --grampsjs-mark-size: 52px;
      }
      .identity strong {
        display: block;
        font-size: 14px;
        font-weight: 600;
        color: var(--heritage-accent);
      }
      .identity h2 {
        font: 500 clamp(30px, 3.4vw, 44px) / 1.2
          var(--grampsjs-heading-font-family);
        color: var(--heritage-ink);
        text-transform: none;
        letter-spacing: -0.025em;
        margin: 12px 0 0;
      }
      h2 {
        font-size: 12px;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        color: var(--heritage-accent);
        margin: 0 0 12px;
      }
      p {
        font-size: 14px;
        line-height: 1.8;
        margin: 8px 0 0;
      }
      nav {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 0 20px;
      }
      a:link,
      a:visited {
        color: var(--heritage-accent);
        font-size: 14px;
        display: inline-flex;
        align-items: center;
        min-height: 44px;
        text-decoration: none;
        border-bottom: 1px solid var(--heritage-rule);
      }
      a:hover {
        text-decoration: underline;
      }
      a:focus-visible {
        outline: 2px solid var(--heritage-gold);
        outline-offset: 3px;
      }
      .base {
        border-top: 1px solid var(--heritage-rule);
        padding: 16px var(--heritage-gutter);
        font-size: 11px;
        line-height: 1.8;
      }
      .base a {
        font-size: inherit;
        min-height: 32px;
        border: 0;
        text-decoration: underline;
        text-underline-offset: 3px;
      }
      :host([compact]) .base a {
        min-height: 26px;
      }
      .credit + .credit::before {
        content: ' · ';
      }
      :host([compact]) .body,
      :host([compact]) footer::before {
        display: none;
      }
      :host([compact]) .base {
        height: 39px;
        padding-block: 6px;
        border: 0;
      }
      @media (max-width: 760px) {
        footer::before {
          background-position: center, 78% 74%;
          background-size: auto, max(100%, 600px) auto;
        }
        .body {
          grid-template-columns: 1fr;
          gap: 24px;
          padding-top: 24px;
        }
        .identity {
          min-height: 250px;
          gap: 12px;
        }
        grampsjs-heritage-mark {
          --grampsjs-mark-size: 44px;
        }
        .identity h2 {
          font-size: 30px;
        }
        .credit {
          display: block;
        }
        .credit + .credit::before {
          content: none;
        }
        :host([compact]) .credit.extra {
          display: none;
        }
      }
      @media print {
        .body,
        footer::before {
          display: none;
        }
        footer {
          background: none;
          color: #222;
        }
      }
    `,
  ]

  render() {
    return html`<footer>
      <div class="body">
        <div class="identity">
          <grampsjs-heritage-mark></grampsjs-heritage-mark>
          <div>
            <strong>${APP_NAME}</strong>
            <h2>Nơi con cháu<br />hướng về</h2>
          </div>
        </div>
        <div>
          <h2>Quê hương & cội nguồn</h2>
          <p>${PLACE_FULL}<br />(${PLACE_NOW})</p>
          <p>Thủy tổ Bùi Công tự Huyền Nhân · 17 đời · 3 ngành, 5 chi</p>
        </div>
        <div>
          <h2>${this.public ? 'Xem và góp ý' : 'Tra cứu và tìm hiểu'}</h2>
          ${this.public
            ? html`<p>
                Con cháu trong họ xem bằng mã dòng họ ở ô trên.<br />Thấy sai
                tên, đời, ngày giỗ hay thiếu người, báo cho người giữ gia phả
                của chi mình.
              </p>`
            : html`<nav aria-label="Điều hướng cuối trang">
                <a href="/tree">Phả đồ</a><a href="/people">Dòng họ</a
                ><a href="/lich-gio">Lịch giỗ</a><a href="/blog">Kho sử</a
                ><a href="${ARTICLE_GIOI_THIEU}">Giới thiệu dòng họ</a
                ><a href="${ARTICLE_HUONG_DAN}">Hướng dẫn tra cứu</a
                ><a href="${ARTICLE_GOP_Y}">Góp ý, sửa sai</a
                ><a href="/map">Bản đồ</a>
              </nav>`}
        </div>
      </div>
      <div class="base">
        <span class="credits"
          ><span class="credit extra"
            >Lời tựa: <a href="/person/I0362">Bùi Hữu Đặng</a>, 2020</span
          ><span class="credit extra"
            >Biên soạn: <a href="/person/I0417">Bùi Hữu Lương</a></span
          ><span class="credit"
            >Số hóa: © 2026 <a href="/person/I0840">Bùi Hữu Kiên</a></span
          ></span
        >
      </div>
    </footer>`
  }
}
window.customElements.define('grampsjs-site-footer', GrampsjsSiteFooter)
