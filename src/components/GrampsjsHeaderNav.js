/*
Điều hướng chính trên header và bảng Danh mục.

Năm mục chính nằm cạnh tên trang trên màn hình rộng; nút Danh mục mở một bảng
giấy gom mọi trang tra cứu, tư liệu nghiên cứu và ba bài viết về dòng họ. Các
mục theo dõi và biên soạn (công việc, xuất, bản sửa đổi, thông báo...) nằm ở
menu tài khoản (GrampsjsSettingsMenu), vì đó là việc của người có tài khoản
biên soạn, không phải của con cháu vào tra cứu.
*/

import {LitElement, html, css} from 'lit'
import {
  mdiHome,
  mdiFamilyTree,
  mdiAccountGroup,
  mdiCandle,
  mdiRss,
  mdiMap,
  mdiMagnify,
  mdiTimelineOutline,
  mdiImage,
  mdiDna,
  mdiCreation,
  mdiFileDocumentOutline,
  mdiBookOpenPageVariant,
  mdiHelpCircleOutline,
  mdiMessageTextOutline,
  mdiChevronDown,
  mdiClose,
} from '@mdi/js'
import {sharedStyles} from '../SharedStyles.js'
import {GrampsjsAppStateMixin} from '../mixins/GrampsjsAppStateMixin.js'
import {handleSearchLink} from '../pageSearch.js'
import {
  ARTICLE_GIOI_THIEU,
  ARTICLE_HUONG_DAN,
  ARTICLE_GOP_Y,
} from './GrampsjsSiteFooter.js'
import './GrampsjsIcon.js'

const PEOPLE_PAGES = [
  'people',
  'person',
  'families',
  'family',
  'events',
  'event',
  'places',
  'place',
  'sources',
  'source',
  'citations',
  'citation',
  'repositories',
  'repository',
  'notes',
  'note',
]

class GrampsjsHeaderNav extends GrampsjsAppStateMixin(LitElement) {
  static get properties() {
    return {open: {state: true}}
  }

  static styles = [
    sharedStyles,
    css`
      :host {
        display: block;
        min-width: 0;
      }
      .bar {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .primary {
        display: flex;
        gap: 2px;
        align-items: center;
      }
      .primary a {
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
      .primary a:hover,
      .primary a[aria-current='page'] {
        color: #e2c891;
        border-bottom-color: #d1af70;
      }
      button {
        font: inherit;
        cursor: pointer;
      }
      #catalog-trigger {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        min-height: 40px;
        padding: 0 8px 0 12px;
        color: #fff8e9;
        background: transparent;
        border: 1px solid
          color-mix(in srgb, var(--heritage-gold) 55%, transparent);
        border-radius: var(--grampsjs-frame-radius);
        font: 500 13px/1 var(--grampsjs-body-font-family);
        white-space: nowrap;
      }
      #catalog-trigger grampsjs-icon {
        transition: transform 150ms;
      }
      #catalog-trigger[aria-expanded='true'],
      #catalog-trigger:hover {
        color: #f3dfae;
        border-color: var(--heritage-gold);
        background: color-mix(in srgb, var(--heritage-gold) 22%, transparent);
      }
      #catalog-trigger[aria-expanded='true'] grampsjs-icon {
        transform: rotate(180deg);
      }
      #catalog {
        position: fixed;
        inset: auto 16px auto auto;
        top: var(--catalog-top, 64px);
        width: min(880px, calc(100vw - 32px));
        max-height: calc(100dvh - var(--catalog-top, 64px) - 16px);
        box-sizing: border-box;
        margin: 0;
        padding: 0;
        overflow-y: auto;
        overscroll-behavior: contain;
        border: 1px solid var(--heritage-rule);
        border-top: 3px solid var(--heritage-gold);
        border-radius: 0 0 4px 4px;
        background: var(--md-sys-color-surface);
        color: var(--heritage-ink);
        box-shadow: 0 12px 36px #1d140e40;
      }
      .heading {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 12px;
        padding: 14px 12px 12px 24px;
        border-bottom: 1px solid var(--heritage-rule);
      }
      .heading h2 {
        font-size: 20px;
        margin: 0;
      }
      .heading p {
        margin: 2px 0 0;
        font-size: 13px;
        color: var(--md-sys-color-on-surface-variant);
      }
      .close {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        flex: 0 0 44px;
        width: 44px;
        height: 44px;
        border: 0;
        background: transparent;
        color: var(--md-sys-color-on-surface-variant);
        border-radius: var(--grampsjs-frame-radius);
      }
      .close:hover {
        color: var(--md-sys-color-primary);
        background: color-mix(in srgb, var(--heritage-gold) 16%, transparent);
      }
      .groups {
        display: grid;
        grid-template-columns: 1.6fr 1fr 1fr;
        gap: 20px 28px;
        padding: 18px 24px 22px;
      }
      h3 {
        margin: 0 0 6px 10px;
        font: 500 11px/1.6 var(--grampsjs-body-font-family);
        letter-spacing: 0.16em;
        text-transform: uppercase;
        color: var(--md-sys-color-primary);
      }
      .links {
        display: flex;
        flex-direction: column;
      }
      .group.lookup .links {
        display: grid;
        grid-template-columns: 1fr 1fr;
        column-gap: 4px;
      }
      .group a {
        display: flex;
        align-items: center;
        gap: 10px;
        min-height: 44px;
        padding: 4px 10px;
        box-sizing: border-box;
        color: var(--heritage-ink);
        text-decoration: none;
        font-size: 14px;
        border-radius: var(--grampsjs-frame-radius);
      }
      .group a grampsjs-icon {
        flex: 0 0 auto;
        color: var(--md-sys-color-on-surface-variant);
      }
      .group a:hover,
      .group a[aria-current='page'] {
        color: var(--md-sys-color-primary);
        background: color-mix(in srgb, var(--heritage-gold) 16%, transparent);
      }
      .group a:hover grampsjs-icon,
      .group a[aria-current='page'] grampsjs-icon {
        color: var(--md-sys-color-primary);
      }
      .group a[aria-current='page'] {
        font-weight: 600;
        box-shadow: inset 3px 0 var(--heritage-gold);
      }
      /* Dưới 1100 px, năm mục chính không còn chỗ cạnh tên trang và ba nút bên
         phải; mọi thứ nằm trong Danh mục. Máy tính bảng nằm ngang (1024 px) vì
         thế cũng chỉ thấy nút Danh mục, giống điện thoại. */
      @media (max-width: 1099px) {
        .primary {
          display: none;
        }
      }
      @media (max-width: 760px) {
        /* Chỉ đổi lề trái/phải; không dùng inset để không đặt lại top. */
        #catalog {
          left: 8px;
          right: 8px;
          width: auto;
        }
        .heading {
          padding: 12px 8px 10px 16px;
        }
        .heading h2 {
          font-size: 18px;
        }
        .heading p {
          display: none;
        }
        .groups {
          grid-template-columns: 1fr;
          gap: 14px;
          padding: 12px 10px 16px;
        }
        .group .links {
          display: grid;
          grid-template-columns: 1fr 1fr;
          column-gap: 4px;
        }
        .group a {
          padding-inline: 6px;
        }
        #catalog-trigger {
          padding: 0 4px 0 10px;
          font-size: 12px;
        }
      }
      @media print {
        :host {
          display: none;
        }
      }
    `,
  ]

  constructor() {
    super()
    this.open = false
    this._onResize = () => this._positionPanel()
  }

  connectedCallback() {
    super.connectedCallback()
    window.addEventListener('resize', this._onResize)
  }

  disconnectedCallback() {
    super.disconnectedCallback()
    window.removeEventListener('resize', this._onResize)
  }

  updated(changed) {
    if (changed.has('appState')) {
      const route = JSON.stringify(this.appState.path)
      if (this._route !== route) this._close()
      this._route = route
    }
  }

  _positionPanel() {
    const header = this.getRootNode().host
    const fixedBar = header?.shadowRoot
      ?.querySelector('mwc-top-app-bar')
      ?.shadowRoot?.querySelector('header')
    const top = Math.max(0, (fixedBar || header).getBoundingClientRect().bottom)
    this.style.setProperty(
      '--catalog-top',
      `${Math.min(top, window.innerHeight - 160)}px`
    )
  }

  _close() {
    const panel = this.renderRoot.querySelector('#catalog')
    if (panel?.matches(':popover-open')) panel.hidePopover()
  }

  _selected(key, href) {
    const {page, pageId} = this.appState.path ?? {}
    if (href.startsWith('/blog/')) return `/${page}/${pageId}` === href
    if (key === 'people') return PEOPLE_PAGES.includes(page)
    if (key === 'dna-matches')
      return ['dna-matches', 'dna-chromosome', 'ydna'].includes(page)
    if (key === 'reports') return ['reports', 'report'].includes(page)
    return key === page
  }

  _link([key, href, label, icon]) {
    return html`<a
      href=${href}
      aria-current=${this._selected(key, href) ? 'page' : 'false'}
      @click=${event => {
        if (href === '/search') handleSearchLink(event, this)
        if (
          !event.ctrlKey &&
          !event.metaKey &&
          !event.shiftKey &&
          !event.altKey &&
          event.button === 0
        )
          this._close()
      }}
      >${icon
        ? html`<grampsjs-icon
            path=${icon}
            color="currentColor"
            width="20"
            height="20"
          ></grampsjs-icon>`
        : ''}<span>${label}</span></a
    >`
  }

  render() {
    const main = [
      ['home', '/', 'Trang chủ', mdiHome],
      ['tree', '/tree', 'Cây gia phả', mdiFamilyTree],
      ['people', '/people', 'Người trong họ', mdiAccountGroup],
      ['lich-gio', '/lich-gio', 'Lịch giỗ', mdiCandle],
      ['blog', '/blog', 'Bài viết', mdiRss],
      ['map', '/map', this._('Map'), mdiMap],
      ['search', '/search', this._('Search'), mdiMagnify],
    ]
    const research = [
      ['timeline', '/timeline', this._('Timeline'), mdiTimelineOutline],
      ['medialist', '/medialist', this._('Media'), mdiImage],
      ...(!this.appState.frontendConfig?.hideDNALink
        ? [['dna-matches', '/dna-matches', this._('DNA'), mdiDna]]
        : []),
      ...(this.canUseChat
        ? [['chat', '/chat', this._('Assistant'), mdiCreation]]
        : []),
      ['reports', '/reports', this._('_Reports'), mdiFileDocumentOutline],
    ]
    const about = [
      [
        'gioi-thieu',
        ARTICLE_GIOI_THIEU,
        'Giới thiệu dòng họ',
        mdiBookOpenPageVariant,
      ],
      [
        'huong-dan',
        ARTICLE_HUONG_DAN,
        'Hướng dẫn tra cứu',
        mdiHelpCircleOutline,
      ],
      ['gop-y', ARTICLE_GOP_Y, 'Góp ý, sửa sai', mdiMessageTextOutline],
    ]
    return html`<div class="bar">
        <nav class="primary" aria-label="Điều hướng chính">
          ${main
            .slice(0, 5)
            .map(([key, href, label]) => this._link([key, href, label]))}
        </nav>
        <button
          id="catalog-trigger"
          popovertarget="catalog"
          aria-expanded=${this.open ? 'true' : 'false'}
          aria-controls="catalog"
          @click=${this._positionPanel}
        >
          Danh mục<grampsjs-icon
            path=${mdiChevronDown}
            color="currentColor"
            width="18"
            height="18"
          ></grampsjs-icon>
        </button>
      </div>
      <div
        id="catalog"
        popover="auto"
        @toggle=${event => {
          this.open = event.newState === 'open'
        }}
      >
        <div class="heading">
          <div>
            <h2>Danh mục gia phả</h2>
            <p>Trang tra cứu, tư liệu nghiên cứu và bài viết về dòng họ</p>
          </div>
          <button
            class="close"
            popovertarget="catalog"
            popovertargetaction="hide"
            aria-label="Đóng danh mục"
          >
            <grampsjs-icon
              path=${mdiClose}
              color="currentColor"
            ></grampsjs-icon>
          </button>
        </div>
        <nav class="groups" aria-label="Toàn bộ danh mục">
          ${[
            ['Tra cứu', main, 'lookup'],
            ['Tư liệu & nghiên cứu', research, 'research'],
            ['Về dòng họ', about, 'about'],
          ].map(
            ([label, items, cls]) =>
              html`<section class="group ${cls}">
                <h3>${label}</h3>
                <div class="links">${items.map(item => this._link(item))}</div>
              </section>`
          )}
        </nav>
      </div>`
  }
}

window.customElements.define('grampsjs-header-nav', GrampsjsHeaderNav)
