/*
Thanh điều hướng dưới cùng cho điện thoại.

Bản gốc bắt người dùng mở ngăn kéo cho mọi lần chuyển trang. Người trong họ
chỉ đi lại giữa năm chỗ, nên năm chỗ đó nằm sẵn dưới ngón tay cái. Chỉ hiện ở
màn hình nhỏ; máy tính dùng điều hướng ngang và menu bổ sung.
*/

import {html, svg, css, LitElement} from 'lit'
import {sharedStyles} from '../SharedStyles.js'
import {GrampsjsAppStateMixin} from '../mixins/GrampsjsAppStateMixin.js'

// Bộ nét riêng 24 × 24: nhà thờ, phả hệ, người thân, lịch giỗ, kho sử.
// Dùng cùng độ dày và khoảng trống để rõ khi thu nhỏ trên điện thoại.
const NAV_ICONS = {
  home: 'M3 10 Q6 9 12 3 Q18 9 21 10 M5 10 V20 H19 V10 M9 20 V13 H15 V20 M3 21 H21',
  tree: 'M12 8 V12 M5 16 V12 H19 V16 M9 3 H15 V8 H9 Z M2 16 H8 V21 H2 Z M16 16 H22 V21 H16 Z M12 12 V20',
  people:
    'M15 6 A3 3 0 1 1 9 6 A3 3 0 1 1 15 6 M6 21 V17 A6 6 0 0 1 18 17 V21 M5 7 A2.5 2.5 0 0 0 5 12 M3 20 V17 A4 4 0 0 1 5 13 M19 7 A2.5 2.5 0 0 1 19 12 M21 20 V17 A4 4 0 0 0 19 13',
  calendar:
    'M7 3 V7 M17 3 V7 M5 5 H19 Q21 5 21 7 V19 Q21 21 19 21 H5 Q3 21 3 19 V7 Q3 5 5 5 M3 10 H21 M9 18 H15 M10 18 V14 H14 V18 M12 14 V12',
  archive:
    'M12 5 Q7 2 3 4 V20 Q7 18 12 21 Q17 18 21 20 V4 Q17 2 12 5 V21 M6 8 L9 9 M6 12 L9 13 M15 9 L18 8 M15 13 L18 12',
}

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
          left: 6px;
          right: 6px;
          bottom: calc(12px + env(safe-area-inset-bottom, 0px));
          z-index: 20;
          display: block;
          max-width: 540px;
          margin: 0 auto;
          padding: 6px;
          background: var(--md-sys-color-surface);
          border: 1px solid
            color-mix(in srgb, var(--heritage-gold) 55%, var(--heritage-rule));
          border-radius: 28px;
          box-shadow: 0 12px 32px var(--grampsjs-body-font-color-20),
            0 2px 6px var(--grampsjs-body-font-color-10),
            inset 0 1px 0
              color-mix(
                in srgb,
                var(--heritage-gold) 12%,
                var(--md-sys-color-surface)
              );
          font-family: var(--grampsjs-body-font-family);
        }

        nav {
          display: grid;
          grid-template-columns: repeat(5, minmax(0, 1fr));
          gap: 2px;
        }

        a {
          position: relative;
          min-width: 0;
          min-height: 66px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 5px;
          text-decoration: none;
          color: var(--heritage-muted);
          font-size: 14px;
          font-weight: 500;
          line-height: 1.2;
          border-radius: 19px;
          transition: background 180ms, color 180ms, transform 180ms;
          -webkit-tap-highlight-color: transparent;
        }

        a[aria-current='page'] {
          color: #fff8ec;
          background: linear-gradient(155deg, #9b4b3b, #783529);
          box-shadow: 0 3px 8px #78352930, inset 0 1px 0 #d4ae7180;
          font-weight: 600;
        }

        a:hover,
        a:focus-visible {
          text-decoration: none;
        }

        @media (hover: hover) {
          a:not([aria-current='page']):hover {
            color: var(--heritage-accent);
            background: color-mix(
              in srgb,
              var(--heritage-gold) 15%,
              transparent
            );
          }
        }

        a:active {
          transform: scale(0.94);
        }

        a:focus-visible {
          outline: 2px solid var(--heritage-gold);
          outline-offset: 2px;
        }

        .pill {
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .nav-icon {
          display: block;
          fill: none;
          stroke: currentColor;
          stroke-width: 1.8;
          stroke-linecap: round;
          stroke-linejoin: round;
        }
        a[aria-current='page'] .nav-icon {
          stroke-width: 2.1;
        }

        span.label {
          white-space: normal;
          text-align: center;
          max-width: 100%;
        }

        @media (orientation: landscape) and (max-height: 500px) {
          :host {
            bottom: calc(6px + env(safe-area-inset-bottom, 0px));
            max-width: 680px;
            padding: 4px;
            border-radius: 18px;
          }
          a {
            flex-direction: row;
            gap: 6px;
            min-height: 44px;
            border-radius: 13px;
          }
          .nav-icon {
            width: 23px;
            height: 23px;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          a {
            transition: none;
          }
          a:active {
            transform: none;
          }
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
        icon: 'home',
        active: page === 'home',
      },
      {
        href: '/tree',
        // Năm ô chia 320 px thì mỗi ô 64 px, "Phả đồ" vừa một dòng.
        label: 'Phả đồ',
        icon: 'tree',
        active: page === 'tree',
      },
      {
        href: '/people',
        label: 'Dòng họ',
        icon: 'people',
        active: LIST_PAGES.has(page) || page === 'person',
      },
      {
        href: '/lich-gio',
        label: this._('Death anniversaries'),
        icon: 'calendar',
        active: page === 'lich-gio',
      },
      {
        href: '/blog',
        label: 'Kho sử',
        icon: 'archive',
        active: page === 'blog',
      },
    ]
    return html`<nav aria-label="Điều hướng chính trên điện thoại">
      ${items.map(
        item => html`<a
          href="${item.href}"
          aria-label=${item.label}
          aria-current="${item.active ? 'page' : 'false'}"
        >
          <span class="pill">
            ${svg`<svg class="nav-icon" viewBox="0 0 24 24"
              width="28" height="28" aria-hidden="true" focusable="false">
              <path d=${NAV_ICONS[item.icon]} />
            </svg>`}
          </span>
          <span class="label">${item.label}</span>
        </a>`
      )}
    </nav>`
  }
}

window.customElements.define('grampsjs-bottom-nav', GrampsjsBottomNav)
