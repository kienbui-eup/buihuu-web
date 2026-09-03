import {LitElement, html, css} from 'lit'
import {sharedStyles} from '../SharedStyles.js'
import './GrampsjsHeritageMark.js'

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
        :host([compact]) .base span:last-child {
          display: none;
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
            <strong>Gia phả Bùi Hữu</strong>
            <p>Gìn giữ cội nguồn<br />Kết nối cháu con</p>
          </div>
        </div>
        <div>
          <h2>Nhà thờ tổ</h2>
          <p>
            Thôn Chỉ Bồ · Thụy Trường<br />Thái Bình<br />Nơi con cháu hướng về
            nguồn cội.
          </p>
        </div>
        <div>
          <h2>${this.public ? 'Nếp nhà còn mãi' : 'Tra cứu & tìm hiểu'}</h2>
          ${this.public
            ? html`<p>
                Mỗi thế hệ tiếp nối một câu chuyện.<br />Cùng lưu giữ cho những
                đời sau.
              </p>`
            : html`<nav aria-label="Điều hướng cuối trang">
                <a href="/tree">Cây gia phả</a
                ><a href="/people">Người trong họ</a
                ><a href="/lich-gio">Lịch giỗ</a><a href="/blog">Bài viết</a
                ><a href="/map">Bản đồ</a><a href="/search">Tìm kiếm</a>
              </nav>`}
        </div>
      </div>
      <div class="base">
        <span>Phả hệ Bùi Hữu · Thôn Chỉ Bồ</span
        ><span>Cùng gìn giữ và tiếp nối</span>
      </div>
    </footer>`
  }
}
window.customElements.define('grampsjs-site-footer', GrampsjsSiteFooter)
