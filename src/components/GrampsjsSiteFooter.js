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
        background: var(--heritage-wood);
        color: #e7ddcf;
        border-top: 3px solid var(--heritage-gold);
      }
      .body {
        display: grid;
        grid-template-columns: 1.3fr 1fr 1fr;
        gap: 36px;
        padding: 48px var(--heritage-gutter);
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
        color: #fff8e9;
      }
      p {
        font-size: 13px;
        line-height: 1.9;
        margin: 8px 0 0;
      }
      h2 {
        font: 500 11px/1.6 var(--grampsjs-body-font-family);
        color: #dcbf83;
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
        color: #f0e4d3;
        font-size: 13px;
        display: inline-flex;
        align-items: center;
        min-height: 44px;
      }
      .base {
        border-top: 1px solid #79664e;
        padding: 16px var(--heritage-gutter);
        display: flex;
        justify-content: space-between;
        gap: 16px;
        font-size: 11px;
        line-height: 1.6;
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
        .body {
          grid-template-columns: 1fr;
          padding-block: 32px;
          gap: 24px;
        }
        .base {
          flex-wrap: wrap;
          gap: 4px;
        }
        /* Footer gọn trên điện thoại chỉ đủ một dòng ngắn: bỏ tên trang vì
           header đã có, bỏ phần lời tựa để dòng bản quyền số hóa không bị nút
           sửa nổi ở góc phải che mất; footer đầy đủ vẫn ghi cả hai tên. */
        :host([compact]) .base span:first-child,
        :host([compact]) .base .preface-credit {
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
                <a href="/tree">Cây gia phả</a><a href="/people">Dòng họ</a
                ><a href="/lich-gio">Lịch giỗ</a><a href="/blog">Bài viết</a
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
          ><span class="preface-credit">Lời tựa: Bùi Hữu Đặng, 2020 · </span>Số
          hóa: © 2026 Bùi Hữu Kiên</span
        >
      </div>
    </footer>`
  }
}
window.customElements.define('grampsjs-site-footer', GrampsjsSiteFooter)
