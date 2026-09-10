import {LitElement, html, css} from 'lit'
import {sharedStyles} from '../SharedStyles.js'
import './GrampsjsHeritageMark.js'
import {APP_NAME, PLACE_SHORT, PLACE_FULL, PLACE_NOW} from '../branding.js'

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
        background: #542923;
        color: #ebdbc3;
        border-top: 1px solid #c6a064;
        --heritage-ink: #fff3db;
        --heritage-muted: #ebdbc3;
        --heritage-accent: #f0d6a4;
        --heritage-rule: #e0bd7b38;
      }
      .homecoming {
        position: relative;
        isolation: isolate;
        overflow: hidden;
        min-height: 270px;
        display: flex;
        align-items: center;
        background: #f7ecd8;
      }
      .homecoming::before {
        content: '';
        position: absolute;
        inset: 0;
        z-index: -1;
        background: linear-gradient(
            90deg,
            #faf0db 0%,
            #faf0dbdb 26%,
            #faf0db00 63%
          ),
          url('images/chi-bo-tree-landscape-v2.png') center 72% / cover;
      }
      .homecoming-copy {
        width: 100%;
        max-width: 1280px;
        margin: 0 auto;
        padding: 34px var(--heritage-gutter);
        box-sizing: border-box;
        color: #633028;
      }
      .homecoming .eyebrow {
        font-size: 11px;
        font-weight: 600;
        letter-spacing: 0.18em;
        text-transform: uppercase;
        margin: 0 0 14px;
      }
      .homecoming h2 {
        color: #633028;
        font: 500 clamp(32px, 3.4vw, 46px) / 1.18
          var(--grampsjs-heading-font-family);
        letter-spacing: -0.025em;
        text-transform: none;
        margin: 0;
      }
      .homecoming .signature {
        display: block;
        width: 52px;
        height: 2px;
        background: #b68c4d;
        margin-top: 22px;
      }
      :host([compact]) .homecoming {
        display: none;
      }
      .body {
        display: grid;
        grid-template-columns: 1.3fr 1fr 1fr;
        gap: 36px;
        padding: 40px var(--heritage-gutter);
        max-width: 1280px;
        margin: 0 auto;
      }
      .identity {
        display: flex;
        align-items: flex-start;
        gap: 18px;
      }
      grampsjs-heritage-mark {
        --grampsjs-mark-size: 56px;
      }
      strong {
        display: block;
        font: 500 24px/1.5 var(--grampsjs-heading-font-family);
        color: var(--heritage-ink);
      }
      p {
        font-size: 14px;
        line-height: 1.9;
        margin: 8px 0 0;
      }
      h2 {
        font: 600 12px/1.6 var(--grampsjs-body-font-family);
        color: var(--heritage-accent);
        letter-spacing: 0.15em;
        text-transform: uppercase;
        margin: 0 0 12px;
      }
      nav {
        display: grid;
        grid-template-columns: 1fr 1fr;
      }
      a:link,
      a:visited {
        color: var(--heritage-accent);
        font-size: 14px;
        display: inline-flex;
        align-items: center;
        min-height: 44px;
      }
      nav a {
        text-decoration: none;
        border-bottom: 1px solid #e0bd7b26;
        margin-right: 20px;
      }
      nav a:hover {
        color: #fff;
        border-bottom-color: #d9b77d;
      }
      a:focus-visible {
        outline: 2px solid #d9b77d;
        outline-offset: 3px;
      }
      .base {
        background: #361e1a;
        border-top: 1px solid var(--heritage-rule);
        padding: 16px var(--heritage-gutter);
        display: flex;
        justify-content: space-between;
        gap: 16px;
        font-size: 11px;
        line-height: 1.6;
      }
      /* Ba dòng ghi công nối bằng dấu chấm giữa trên màn hình rộng. */
      .credit + .credit::before {
        content: ' · ';
      }
      :host([compact]) .body {
        display: none;
      }
      :host([compact]) footer {
        border-top-width: 1px;
      }
      :host([compact]) .base {
        height: 39px;
        box-sizing: border-box;
        align-items: center;
        padding-block: 6px;
        border: 0;
      }
      @media (max-width: 760px) {
        .homecoming {
          min-height: 250px;
          align-items: flex-start;
        }
        .homecoming::before {
          background: linear-gradient(
              180deg,
              #faf0db 0%,
              #faf0db99 26%,
              #faf0db00 70%
            ),
            url('images/chi-bo-tree-landscape-v2.png') 78% 74% / auto 400px;
        }
        .homecoming-copy {
          padding: 24px var(--heritage-gutter);
        }
        .homecoming .eyebrow {
          margin-bottom: 10px;
        }
        .homecoming h2 {
          font-size: 32px;
          max-width: 240px;
        }
        .homecoming .signature {
          display: none;
        }
        .body {
          grid-template-columns: 1fr;
          padding-block: 32px;
          gap: 24px;
        }
        .base {
          flex-wrap: wrap;
          gap: 4px;
        }
        /* Footer đầy đủ trên điện thoại: tên trang một dòng, rồi mỗi người
           một dòng ngắn bên trái, để nút thêm hoặc sửa nổi ở góc phải không
           che tên ai. */
        :host(:not([compact])) .base {
          flex-direction: column;
          align-items: flex-start;
        }
        .credit {
          display: block;
        }
        .credit + .credit::before {
          content: none;
        }
        /* Footer gọn trên điện thoại chỉ đủ một dòng ngắn: bỏ tên trang vì
           header đã có, bỏ lời tựa và người biên soạn để dòng bản quyền số
           hóa không bị nút sửa nổi ở góc phải che mất; footer đầy đủ vẫn ghi
           cả ba tên. */
        :host([compact]) .base span:first-child,
        :host([compact]) .base .credit.extra {
          display: none;
        }
        :host([compact]) .base .credits {
          min-width: 0;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      }
      @media print {
        .homecoming {
          display: none;
        }
        .base {
          background: none;
        }
        .body {
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
      <section class="homecoming" aria-label="Quê hương Chỉ Bồ">
        <div class="homecoming-copy">
          <p class="eyebrow">Bùi Hữu · Chỉ Bồ · Thụy Trường</p>
          <h2>Nơi con cháu<br />hướng về</h2>
          <span class="signature" aria-hidden="true"></span>
        </div>
      </section>
      <div class="body">
        <div class="identity">
          <grampsjs-heritage-mark></grampsjs-heritage-mark>
          <div>
            <strong>${APP_NAME}</strong>
            <p>
              ${PLACE_SHORT}<br />Thủy tổ Bùi Công tự Huyền Nhân · 17 đời · 3
              ngành, 5 chi
            </p>
          </div>
        </div>
        <div>
          <h2>Nhà thờ tổ họ Bùi Hữu</h2>
          <p>${PLACE_FULL}<br />(${PLACE_NOW})</p>
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
        <span>${APP_NAME} · Thôn Chỉ Bồ</span
        ><span class="credits"
          ><span class="credit extra">Lời tựa: Bùi Hữu Đặng, 2020</span
          ><span class="credit extra">Biên soạn đương thời: Bùi Hữu Lương</span
          ><span class="credit">Số hóa: © 2026 Bùi Hữu Kiên</span></span
        >
      </div>
    </footer>`
  }
}
window.customElements.define('grampsjs-site-footer', GrampsjsSiteFooter)
