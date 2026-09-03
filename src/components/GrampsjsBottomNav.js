/*
Thanh điều hướng dưới cùng cho điện thoại.

Bản gốc bắt người dùng mở ngăn kéo cho mọi lần chuyển trang. Người trong họ
chỉ đi lại giữa năm chỗ, nên năm chỗ đó nằm sẵn dưới ngón tay cái. Chỉ hiện ở
màn hình nhỏ; máy tính dùng điều hướng ngang và menu bổ sung.
*/

import {html, css, LitElement} from 'lit'
import {
  mdiHome,
  mdiFamilyTree,
  mdiAccountGroup,
  mdiCandle,
  mdiMagnify,
} from '@mdi/js'
import {sharedStyles} from '../SharedStyles.js'
import {GrampsjsAppStateMixin} from '../mixins/GrampsjsAppStateMixin.js'
import './GrampsjsIcon.js'
import {handleSearchLink, pageSearchLabel} from '../pageSearch.js'

const LIST_PAGES = new Set([
  'people',
  'families',
  'events',
  'places',
  'citations',
  'sources',
  'repositories',
  'notes',
])

class GrampsjsBottomNav extends GrampsjsAppStateMixin(LitElement) {
  static get styles() {
    return [
      sharedStyles,
      css`
        :host {
          position: fixed;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 20;
          display: flex;
          justify-content: space-around;
          align-items: stretch;
          background: var(--md-sys-color-surface);
          border-top: 2px solid var(--heritage-gold);
          box-shadow: 0 -4px 20px var(--grampsjs-body-font-color-5);
          padding-bottom: env(safe-area-inset-bottom, 0px);
          font-family: var(--grampsjs-body-font-family);
        }

        a {
          flex: 1 1 0;
          min-width: 0;
          height: 64px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 2px;
          text-decoration: none;
          color: var(--grampsjs-color-drawer-text, #333);
          font-size: 12px;
          font-weight: 400;
          line-height: 1.2;
        }

        a[aria-current='page'] {
          color: var(--grampsjs-color-icon-selected);
          font-weight: 600;
        }

        a[aria-current='page'] .pill {
          background: color-mix(
            in srgb,
            var(--heritage-gold) 20%,
            var(--md-sys-color-surface)
          );
        }

        a:focus-visible {
          outline: 2px solid var(--grampsjs-color-icon-selected);
          outline-offset: -2px;
        }

        .pill {
          height: 28px;
          width: 52px;
          border-radius: 3px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        span.label {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 100%;
        }

        @media print {
          :host {
            display: none;
          }
        }
      `,
    ]
  }

  render() {
    const page = this.appState.path.page
    const items = [
      {
        href: '/',
        label: this._('Home'),
        icon: mdiHome,
        active: page === 'home',
      },
      {
        href: '/tree',
        label: this._('Family Tree'),
        icon: mdiFamilyTree,
        active: page === 'tree',
      },
      {
        href: '/people',
        label: this._('People'),
        icon: mdiAccountGroup,
        active: LIST_PAGES.has(page) || page === 'person',
      },
      {
        href: '/lich-gio',
        label: this._('Death anniversaries'),
        icon: mdiCandle,
        active: page === 'lich-gio',
      },
      {
        href: '/search',
        label: this._('Search'),
        icon: mdiMagnify,
        active: page === 'search',
      },
    ]
    return html`${items.map(
      item => html`<a
        href="${item.href}"
        aria-label=${item.href === '/search'
          ? pageSearchLabel(page)
          : item.label}
        @click=${event => {
          if (item.href === '/search') handleSearchLink(event, this)
        }}
        aria-current="${item.active ? 'page' : 'false'}"
      >
        <span class="pill">
          <grampsjs-icon
            path="${item.icon}"
            color="${item.active
              ? 'var(--grampsjs-color-icon-selected)'
              : 'var(--grampsjs-color-icon-default)'}"
          ></grampsjs-icon>
        </span>
        <span class="label">${item.label}</span>
      </a>`
    )}`
  }
}

window.customElements.define('grampsjs-bottom-nav', GrampsjsBottomNav)
