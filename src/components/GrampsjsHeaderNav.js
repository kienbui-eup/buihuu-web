import {LitElement, html, css} from 'lit'
import {sharedStyles} from '../SharedStyles.js'
import {GrampsjsAppStateMixin} from '../mixins/GrampsjsAppStateMixin.js'
import {handleSearchLink} from '../pageSearch.js'

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
    return {open: {state: true}, unreadCount: {state: true}}
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
        position: relative;
        min-height: 44px;
        padding: 0 10px;
        color: #fff8e9;
        background: transparent;
        border: 1px solid #93784e;
        border-radius: 3px;
        font-size: 13px;
        white-space: nowrap;
      }
      #catalog-trigger[aria-expanded='true'],
      #catalog-trigger:hover {
        background: #65503c;
      }
      .caret {
        margin-left: 6px;
      }
      .badge {
        display: inline-block;
        border-radius: 10px;
        background: var(--md-sys-color-error);
        color: var(--md-sys-color-on-error);
        min-width: 18px;
        text-align: center;
        font: 600 11px/18px var(--grampsjs-body-font-family);
        padding: 0 3px;
        margin-left: 6px;
      }
      #catalog-trigger .badge {
        position: absolute;
        top: -5px;
        right: -5px;
        margin: 0;
      }
      #catalog {
        position: fixed;
        inset: auto 16px auto auto;
        top: var(--catalog-top, 64px);
        width: min(740px, calc(100vw - 32px));
        max-height: calc(100dvh - var(--catalog-top, 64px) - 16px);
        box-sizing: border-box;
        margin: 0;
        padding: 20px 24px 24px;
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
        border-bottom: 1px solid var(--heritage-rule);
        margin-bottom: 16px;
        padding-bottom: 8px;
      }
      .heading h2 {
        font-size: 22px;
        margin: 0;
      }
      .close {
        color: var(--md-sys-color-primary);
        border: 0;
        background: transparent;
        min-height: 44px;
        padding: 0 12px;
        font-size: 14px;
      }
      .groups {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 24px;
      }
      h3 {
        font: 600 11px/1.7 var(--grampsjs-body-font-family);
        text-transform: uppercase;
        letter-spacing: 0.08em;
        margin: 0 0 8px;
        color: var(--md-sys-color-on-surface-variant);
      }
      .group a {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        min-height: 44px;
        padding: 4px 10px;
        box-sizing: border-box;
        color: var(--heritage-ink);
        text-decoration: none;
        font-size: 14px;
        border-radius: 3px;
      }
      .group a:hover,
      .group a[aria-current='page'] {
        color: var(--md-sys-color-primary);
        background: color-mix(in srgb, var(--heritage-gold) 16%, transparent);
      }
      /* Dưới 1100 px, năm mục chính không còn chỗ cạnh tên trang và ba nút bên
         phải; mọi thứ nằm trong Danh mục. Máy tính bảng nằm ngang (1024 px) vì
         thế cũng chỉ thấy nút Danh mục, giống điện thoại. */
      @media (max-width: 1099px) {
        .primary {
          display: none;
        }
      }
      @media (max-width: 599px) {
        .heading h2 {
          font-size: 20px;
        }
        #catalog {
          padding: 12px 16px 20px;
        }
        .groups {
          grid-template-columns: 1fr 1fr;
          gap: 20px 12px;
        }
        .group:last-child {
          grid-column: 1 / -1;
        }
        .group:last-child .links {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0 12px;
        }
        .group a {
          padding-inline: 4px;
        }
        #catalog-trigger {
          padding-inline: 6px;
          font-size: 12px;
        }
        .caret {
          margin-left: 3px;
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
    this.unreadCount = 0
    this._onNotifications = event => {
      this.unreadCount = event.detail.unreadCount
    }
    this._onResize = () => this._positionPanel()
  }

  connectedCallback() {
    super.connectedCallback()
    window.addEventListener('notifications:changed', this._onNotifications)
    window.addEventListener('resize', this._onResize)
  }

  disconnectedCallback() {
    super.disconnectedCallback()
    window.removeEventListener('notifications:changed', this._onNotifications)
    window.removeEventListener('resize', this._onResize)
  }

  updated(changed) {
    if (changed.has('appState')) {
      this.unreadCount = (this.appState.getNotifications?.() ?? []).filter(
        n => n?.read === false
      ).length
      const route = JSON.stringify(this.appState.path)
      if (this._route !== route) this._close()
      this._route = route
    }
  }

  _positionPanel() {
    const header = this.getRootNode().host
    const fixedBar = header.shadowRoot
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

  _selected(key) {
    const page = this.appState.path?.page
    if (key === 'people') return PEOPLE_PAGES.includes(page)
    if (key === 'dna-matches')
      return ['dna-matches', 'dna-chromosome', 'ydna'].includes(page)
    if (key === 'reports') return ['reports', 'report'].includes(page)
    if (key === 'revisions') return ['revisions', 'revision'].includes(page)
    return key === page
  }

  _link([key, href, label]) {
    return html`<a
      href=${href}
      aria-current=${this._selected(key) ? 'page' : 'false'}
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
      >${label}${key === 'notifications' && this.unreadCount > 0
        ? html`<span
            class="badge"
            aria-label=${`${this.unreadCount} thông báo chưa đọc`}
            >${this.unreadCount}</span
          >`
        : ''}</a
    >`
  }

  render() {
    const main = [
      ['home', '/', 'Trang chủ'],
      ['tree', '/tree', 'Cây gia phả'],
      ['people', '/people', 'Người trong họ'],
      ['lich-gio', '/lich-gio', 'Lịch giỗ'],
      ['blog', '/blog', 'Bài viết'],
      ['map', '/map', this._('Map')],
      ['search', '/search', this._('Search')],
    ]
    const research = [
      ['timeline', '/timeline', this._('Timeline')],
      ['medialist', '/medialist', this._('Media')],
      ...(!this.appState.frontendConfig?.hideDNALink
        ? [['dna-matches', '/dna-matches', this._('DNA')]]
        : []),
      ...(this.canUseChat ? [['chat', '/chat', this._('Assistant')]] : []),
      ['reports', '/reports', this._('_Reports')],
    ]
    const tools = [
      ['recent', '/recent', this._('History')],
      ['bookmarks', '/bookmarks', this._('_Bookmarks')],
      ['tasks', '/tasks', this._('Tasks')],
      ['export', '/export', this._('Export')],
      ...(this.appState.permissions.canViewPrivate
        ? [['revisions', '/revisions', this._('Revisions')]]
        : []),
      ['notifications', '/notifications', this._('Notifications')],
    ]
    return html`<div class="bar">
        <nav class="primary" aria-label="Điều hướng chính">
          ${main.slice(0, 5).map(item => this._link(item))}
        </nav>
        <button
          id="catalog-trigger"
          popovertarget="catalog"
          aria-expanded=${this.open ? 'true' : 'false'}
          aria-controls="catalog"
          @click=${this._positionPanel}
        >
          Danh mục<span class="caret" aria-hidden="true">⌄</span>${this
            .unreadCount > 0
            ? html`<span
                class="badge"
                aria-label=${`${this.unreadCount} thông báo chưa đọc`}
                >${this.unreadCount}</span
              >`
            : ''}
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
          <h2>Danh mục gia phả</h2>
          <button
            class="close"
            popovertarget="catalog"
            popovertargetaction="hide"
          >
            Đóng
          </button>
        </div>
        <nav class="groups" aria-label="Toàn bộ danh mục">
          ${[
            ['Tra cứu', main],
            ['Tư liệu & nghiên cứu', research],
            ['Theo dõi & biên soạn', tools],
          ].map(
            ([label, items]) =>
              html`<section class="group">
                <h3>${label}</h3>
                <div class="links">${items.map(item => this._link(item))}</div>
              </section>`
          )}
        </nav>
      </div>`
  }
}

window.customElements.define('grampsjs-header-nav', GrampsjsHeaderNav)
