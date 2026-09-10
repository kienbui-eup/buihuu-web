/*
Điều hướng chính trên header.

Bốn mục chính (phả đồ, dòng họ, lịch giỗ, kho sử) nằm cạnh tên trang trên
màn hình rộng. Trang chủ không có mục riêng: ấn son và tên trang ở đầu thanh
(GrampsjsAppBar) đã là liên kết về trang chủ. Dưới 1100 px dải này ẩn đi; mọi
trang khi ấy mở từ nút tài khoản (GrampsjsSettingsMenu), nơi gom cả ba nhóm
Danh mục và các mục theo quyền của người đăng nhập.
*/

import {LitElement, html, css} from 'lit'
import {sharedStyles} from '../SharedStyles.js'
import {GrampsjsAppStateMixin} from '../mixins/GrampsjsAppStateMixin.js'
import {mainLinks, isCurrentLink} from '../siteNav.js'

class GrampsjsHeaderNav extends GrampsjsAppStateMixin(LitElement) {
  static styles = [
    sharedStyles,
    css`
      :host {
        display: block;
        min-width: 0;
      }
      nav {
        display: flex;
        gap: 6px;
        align-items: center;
      }
      nav a:link,
      nav a:visited {
        display: flex;
        align-items: center;
        min-height: 44px;
        padding: 0 12px;
        color: var(--grampsjs-top-app-bar-font-color);
        font-size: 16px;
        font-weight: 500;
        white-space: nowrap;
        text-decoration: none;
        border: 1px solid transparent;
        border-radius: 8px;
      }
      nav a:hover,
      nav a[aria-current='page'] {
        color: var(--grampsjs-top-app-bar-font-color);
        background: #fff4df12;
        border-color: #d1af7070;
      }
      /* Dưới 1100 px, các mục chính không còn chỗ cạnh tên trang và các nút
         bên phải; máy tính bảng nằm ngang (1024 px) vì thế cũng dùng bảng
         trong nút tài khoản, giống điện thoại. */
      @media (max-width: 1099px), print {
        :host {
          display: none;
        }
      }
    `,
  ]

  render() {
    // Bỏ Trang chủ (đã là logo) và dừng trước Bản đồ, mục này chỉ ở bảng
    // Danh mục.
    return html`<nav aria-label="Điều hướng chính">
      ${mainLinks(this)
        .filter(link => link.key !== 'home')
        .slice(0, 4)
        .map(
          link => html`<a
            href=${link.href}
            aria-current=${isCurrentLink(this.appState.path, link)
              ? 'page'
              : 'false'}
            >${link.label}</a
          >`
        )}
    </nav>`
  }
}

window.customElements.define('grampsjs-header-nav', GrampsjsHeaderNav)
