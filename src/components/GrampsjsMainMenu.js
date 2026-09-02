/*
Menu chính trong ngăn kéo bên trái.

Bản gốc xếp 14 mục ngang hàng, vì nó dựng cho người nghiên cứu phả hệ. Người
trong họ chỉ dùng bảy chỗ: trang chủ, gia phả, danh sách người, ngày giỗ, bài
viết, bản đồ, tìm kiếm. Những mục còn lại là công cụ biên tập và nghiên cứu, gom
vào nhóm "Công cụ" gập lại được; nhóm tự mở khi đang đứng ở một trang trong đó.
*/

import {html, css, LitElement} from 'lit'
import '@material/web/list/list'
import '@material/web/list/list-item'
import '@material/web/divider/divider'

import {
  mdiFamilyTree,
  mdiCreation,
  mdiDna,
  mdiHome,
  mdiImage,
  mdiRss,
  mdiAccountGroup,
  mdiMap,
  mdiHistory,
  mdiBookmark,
  mdiFormatListChecks,
  mdiDownload,
  mdiFileExportOutline,
  mdiSourceCommit,
  mdiBell,
  mdiBellBadge,
  mdiTimelineOutline,
  mdiCandle,
  mdiMagnify,
  mdiChevronDown,
  mdiChevronUp,
} from '@mdi/js'
import {sharedStyles} from '../SharedStyles.js'
import {GrampsjsAppStateMixin} from '../mixins/GrampsjsAppStateMixin.js'
import './GrampsjsIcon.js'

const BASE_DIR = ''

const selectedColor = 'var(--grampsjs-color-icon-selected)'
const defaultColor = 'var(--grampsjs-color-icon-default)'

const LIST_PAGES = [
  'people',
  'families',
  'events',
  'places',
  'citations',
  'sources',
  'repositories',
  'notes',
]

const TOOL_PAGES = [
  'timeline',
  'medialist',
  'dna-matches',
  'dna-chromosome',
  'ydna',
  'chat',
  'recent',
  'bookmarks',
  'tasks',
  'reports',
  'report',
  'export',
  'revisions',
  'revision',
  'notifications',
]

class GrampsjsMainMenu extends GrampsjsAppStateMixin(LitElement) {
  static get styles() {
    return [
      sharedStyles,
      css`
        md-list-item {
          --md-list-item-label-text-color: var(--grampsjs-color-drawer-text);
          --md-list-item-label-text-size: 1rem;
          --md-list-item-label-text-weight: 400;
          --md-list-item-one-line-container-height: 40px;
        }

        md-list-item[selected] {
          --md-list-item-label-text-color: var(--grampsjs-color-icon-selected);
          --md-list-item-label-text-weight: 500;
        }

        md-list-item.group-toggle {
          --md-list-item-label-text-size: 0.85rem;
          --md-list-item-label-text-weight: 500;
          --md-list-item-label-text-color: var(--grampsjs-body-font-color-70);
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        md-divider {
          --md-divider-thickness: 1px;
          --md-divider-color: rgba(0, 0, 0, 0.12);
          padding: 0 20px;
          margin: 4px 0;
        }

        .unread-badge {
          min-width: 18px;
          height: 18px;
          padding: 0 4px;
          border-radius: 9px;
          background: var(--md-sys-color-error, #b00020);
          color: #fff;
          font-size: 11px;
          font-weight: 700;
          line-height: 18px;
          text-align: center;
          box-sizing: border-box;
        }
      `,
    ]
  }

  static get properties() {
    return {
      unreadCount: {type: Number},
      _toolsOpen: {type: Boolean},
    }
  }

  constructor() {
    super()
    this.unreadCount = 0
    this._toolsOpen = false
    this._boundHandleNotifications = this._handleNotificationsChanged.bind(this)
  }

  connectedCallback() {
    super.connectedCallback()
    const existing = this.appState?.getNotifications?.() ?? []
    this.unreadCount = existing.filter(n => n?.read === false).length
    window.addEventListener(
      'notifications:changed',
      this._boundHandleNotifications
    )
  }

  disconnectedCallback() {
    super.disconnectedCallback()
    window.removeEventListener(
      'notifications:changed',
      this._boundHandleNotifications
    )
  }

  willUpdate(changed) {
    super.willUpdate(changed)
    // Đang đứng trong một trang công cụ thì nhóm phải mở để mục đó hiện ra.
    if (TOOL_PAGES.includes(this.appState?.path?.page)) {
      this._toolsOpen = true
    }
  }

  _handleNotificationsChanged(e) {
    this.unreadCount = e.detail.unreadCount
  }

  _icon(path, isSelected) {
    return html`<grampsjs-icon
      slot="start"
      path="${path}"
      color="${isSelected ? selectedColor : defaultColor}"
    ></grampsjs-icon>`
  }

  _item(href, label, icon, selected) {
    return html`<md-list-item
      type="link"
      href="${BASE_DIR}${href}"
      ?selected="${selected}"
    >
      ${this._icon(icon, selected)} ${label}
    </md-list-item>`
  }

  _toggleTools() {
    this._toolsOpen = !this._toolsOpen
  }

  render() {
    const p = this.appState.path.page
    const dnaPages = ['dna-matches', 'dna-chromosome', 'ydna']
    return html` <md-list>
      ${this._item('/', this._('Home'), mdiHome, p === 'home')}
      ${this._item('/tree', this._('Family Tree'), mdiFamilyTree, p === 'tree')}
      ${this._item(
        '/people',
        this._('People'),
        mdiAccountGroup,
        LIST_PAGES.includes(p)
      )}
      ${this._item(
        '/lich-gio',
        this._('Death anniversaries'),
        mdiCandle,
        p === 'lich-gio'
      )}
      ${this._item('/blog', this._('Blog'), mdiRss, p === 'blog')}
      ${this._item('/map', this._('Map'), mdiMap, p === 'map')}
      ${this._item('/search', this._('Search'), mdiMagnify, p === 'search')}
      <md-divider inset></md-divider>
      <md-list-item
        type="button"
        class="group-toggle"
        @click="${this._toggleTools}"
        aria-expanded="${this._toolsOpen ? 'true' : 'false'}"
      >
        ${this._('Tools')}
        <grampsjs-icon
          slot="end"
          path="${this._toolsOpen ? mdiChevronUp : mdiChevronDown}"
          color="${defaultColor}"
        ></grampsjs-icon>
      </md-list-item>
      ${this._toolsOpen
        ? html`
            ${this._item(
              '/timeline',
              this._('Timeline'),
              mdiTimelineOutline,
              p === 'timeline'
            )}
            ${this._item(
              '/medialist',
              this._('Media'),
              mdiImage,
              p === 'medialist'
            )}
            ${this.appState.frontendConfig.hideDNALink
              ? ''
              : this._item(
                  '/dna-matches',
                  this._('DNA'),
                  mdiDna,
                  dnaPages.includes(p)
                )}
            ${this.canUseChat
              ? this._item(
                  '/chat',
                  this._('Assistant'),
                  mdiCreation,
                  p === 'chat'
                )
              : ''}
            ${this._item(
              '/recent',
              this._('History'),
              mdiHistory,
              p === 'recent'
            )}
            ${this._item(
              '/bookmarks',
              this._('_Bookmarks'),
              mdiBookmark,
              p === 'bookmarks'
            )}
            ${this._item(
              '/tasks',
              this._('Tasks'),
              mdiFormatListChecks,
              p === 'tasks'
            )}
            ${this._item(
              '/reports',
              this._('_Reports').replace('_', ''),
              mdiFileExportOutline,
              p === 'reports'
            )}
            ${this._item(
              '/export',
              this._('Export'),
              mdiDownload,
              p === 'export'
            )}
            ${this.appState.permissions.canViewPrivate
              ? this._item(
                  '/revisions',
                  this._('Revisions'),
                  mdiSourceCommit,
                  p === 'revisions'
                )
              : ''}
            <md-list-item
              type="link"
              href="${BASE_DIR}/notifications"
              ?selected="${p === 'notifications'}"
            >
              ${this._icon(
                this.unreadCount > 0 ? mdiBellBadge : mdiBell,
                p === 'notifications'
              )}
              ${this._('Notifications')}
              ${this.unreadCount > 0
                ? html`<span class="unread-badge" slot="end"
                    >${this.unreadCount}</span
                  >`
                : ''}
            </md-list-item>
          `
        : ''}
    </md-list>`
  }
}

window.customElements.define('grampsjs-main-menu', GrampsjsMainMenu)
