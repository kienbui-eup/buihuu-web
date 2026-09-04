/*
Điều hướng chính trên header.

Năm mục chính (trang chủ, cây, người trong họ, lịch giỗ, kho sử) nằm cạnh
tên trang trên màn hình rộng. Dưới 1100 px chúng ẩn đi; mọi trang khi ấy mở
từ nút tài khoản (GrampsjsSettingsMenu), nơi gom cả ba nhóm Danh mục và các
mục theo quyền của người đăng nhập.
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
        gap: 2px;
        align-items: center;
      }
      nav a:link,
      nav a:visited {
        display: flex;
        align-items: center;
        min-height: 44px;
        padding: 0 12px;
        color: #fff8e9;
        font-size: 14px;
        font-weight: 500;
        white-space: nowrap;
        text-decoration: none;
        border-bottom: 2px solid transparent;
      }
      nav a:hover,
      nav a[aria-current='page'] {
        color: #e2c891;
        border-bottom-color: #d1af70;
      }
      /* Dưới 1100 px, năm mục chính không còn chỗ cạnh tên trang và các nút
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
    return html`<nav aria-label="Điều hướng chính">
      ${mainLinks(this)
        .slice(0, 5)
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
