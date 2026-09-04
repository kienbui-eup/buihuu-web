/*
Menu tài khoản trên header, kiêm bảng Danh mục.

Bấm biểu tượng tài khoản mở một bảng giấy: tên và vai trò người đang đăng
nhập; ba nhóm Danh mục (Tra cứu, Tư liệu & nghiên cứu, Về dòng họ) lấy từ
siteNav.js; rồi các mục theo quyền. Con cháu vào tra cứu chỉ thấy phần Tài
khoản; người biên soạn thấy thêm Biên soạn (công việc, xuất, bản sửa đổi); chủ
gia phả và quản trị thấy thêm Quản trị. Trên máy tính bảng và điện thoại đây
là lối vào duy nhất tới mọi trang, nên nhóm Danh mục đứng trước nhóm tài
khoản. Thông báo chưa đọc hiện thành huy hiệu trên chính biểu tượng tài khoản.
*/

import {LitElement, html, css} from 'lit'
import {
  mdiAccountCircle,
  mdiAccountCog,
  mdiBellOutline,
  mdiBookmarkOutline,
  mdiHistory,
  mdiFormatListChecks,
  mdiDownload,
  mdiSourceCommit,
  mdiWrench,
  mdiAccountMultiple,
  mdiInformationOutline,
  mdiLogout,
  mdiClose,
} from '@mdi/js'
import {sharedStyles} from '../SharedStyles.js'
import {GrampsjsAppStateMixin} from '../mixins/GrampsjsAppStateMixin.js'
import {handleSearchLink} from '../pageSearch.js'
import {
  mainLinks,
  researchLinks,
  aboutLinks,
  isCurrentLink,
} from '../siteNav.js'
import './GrampsjsIcon.js'

// Vai trò của Gramps Web gọi theo lối của một gia phả dòng họ.
const ROLE_LABELS = {
  5: 'Quản trị hệ thống',
  4: 'Chủ gia phả',
  3: 'Người biên soạn',
  2: 'Người đóng góp',
  1: 'Thành viên',
  0: 'Khách xem',
}

class GrampsjsSettingsMenu extends GrampsjsAppStateMixin(LitElement) {
  static get properties() {
    return {
      open: {state: true},
      unreadCount: {state: true},
      _user: {state: true},
    }
  }

  static styles = [
    sharedStyles,
    css`
      :host {
        display: block;
      }
      .trigger {
        position: relative;
        display: inline-block;
      }
      #button_settings {
        display: grid;
        place-items: center;
        width: 48px;
        height: 48px;
        padding: 0;
        border: 0;
        border-radius: 50%;
        background: transparent;
        color: currentColor;
        cursor: pointer;
      }
      #button_settings:hover,
      #button_settings[aria-expanded='true'] {
        background: color-mix(in srgb, currentColor 12%, transparent);
      }
      #button_settings:focus-visible {
        outline: 2px solid #e2c891;
        outline-offset: -2px;
      }
      .badge {
        position: absolute;
        top: 6px;
        right: 4px;
        min-width: 16px;
        height: 16px;
        padding: 0 4px;
        box-sizing: border-box;
        border-radius: 8px;
        background: var(--md-sys-color-error);
        color: var(--md-sys-color-on-error);
        font: 600 10px/16px var(--grampsjs-body-font-family);
        text-align: center;
        pointer-events: none;
      }
      #account {
        position: fixed;
        inset: auto 16px auto auto;
        top: var(--account-top, 64px);
        width: min(660px, calc(100vw - 32px));
        max-height: calc(100dvh - var(--account-top, 64px) - 16px);
        box-sizing: border-box;
        margin: 0;
        padding: 0;
        overflow-y: auto;
        overscroll-behavior: contain;
        border: 1px solid var(--heritage-rule);
        border-top: 3px solid var(--heritage-gold);
        border-radius: 0 0 4px 4px;
        background-color: var(--md-sys-color-surface);
        background-image: var(--heritage-panel-background);
        color: var(--heritage-ink);
        box-shadow: 0 12px 36px #1d140e40;
      }
      /* Đầu bảng dính khi cuộn để nút đóng luôn với tới trên điện thoại. */
      .identity {
        position: sticky;
        top: 0;
        z-index: 1;
        display: flex;
        align-items: center;
        gap: 14px;
        padding: 14px 8px 12px 20px;
        background: var(--md-sys-color-surface);
        border-bottom: 1px solid var(--heritage-rule);
      }
      .avatar {
        flex: 0 0 44px;
        width: 44px;
        height: 44px;
        display: grid;
        place-items: center;
        border-radius: 50%;
        background: color-mix(
          in srgb,
          var(--heritage-gold) 28%,
          var(--md-sys-color-surface)
        );
        color: var(--md-sys-color-primary);
        font: 600 19px/1 var(--grampsjs-heading-font-family);
      }
      .who {
        flex: 1;
        min-width: 0;
      }
      .who strong {
        display: block;
        font: 600 16px/1.4 var(--grampsjs-heading-font-family);
        overflow-wrap: anywhere;
      }
      .who span {
        display: block;
        margin-top: 2px;
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
        cursor: pointer;
      }
      .close:hover {
        color: var(--md-sys-color-primary);
        background: color-mix(in srgb, var(--heritage-gold) 16%, transparent);
      }
      /* Máy tính: Danh mục bên trái, tài khoản bên phải, kẻ dọc ở giữa. */
      .columns {
        display: grid;
        grid-template-columns: 1.55fr 1fr;
      }
      .me {
        border-left: 1px solid var(--heritage-rule);
      }
      section {
        padding: 10px 8px 8px;
        border-bottom: 1px solid var(--heritage-rule);
      }
      section:last-child {
        border-bottom: 0;
      }
      h3 {
        margin: 0 0 4px 12px;
        font: 500 11px/1.6 var(--grampsjs-body-font-family);
        letter-spacing: 0.16em;
        text-transform: uppercase;
        color: var(--md-sys-color-primary);
      }
      .links {
        display: flex;
        flex-direction: column;
      }
      .lookup .links {
        display: grid;
        grid-template-columns: 1fr 1fr;
        column-gap: 4px;
      }
      .item {
        display: flex;
        align-items: center;
        gap: 12px;
        width: 100%;
        min-height: 44px;
        padding: 4px 12px;
        box-sizing: border-box;
        border: 0;
        border-radius: var(--grampsjs-frame-radius);
        background: transparent;
        color: var(--heritage-ink);
        font: 400 14px/1.4 var(--grampsjs-body-font-family);
        text-align: left;
        text-decoration: none;
        cursor: pointer;
      }
      .item grampsjs-icon {
        flex: 0 0 auto;
        color: var(--md-sys-color-primary);
        --grampsjs-icon-tile: color-mix(
          in srgb,
          var(--heritage-gold) 22%,
          var(--md-sys-color-surface-container)
        );
      }
      .item:hover,
      .item[aria-current='page'] {
        color: var(--md-sys-color-primary);
        background: color-mix(in srgb, var(--heritage-gold) 16%, transparent);
      }
      .item:hover grampsjs-icon,
      .item[aria-current='page'] grampsjs-icon {
        color: var(--md-sys-color-primary);
      }
      .item[aria-current='page'] {
        font-weight: 600;
        box-shadow: inset 3px 0 var(--heritage-gold);
      }
      .count {
        margin-left: auto;
        min-width: 20px;
        padding: 0 6px;
        box-sizing: border-box;
        border-radius: 10px;
        background: var(--md-sys-color-error);
        color: var(--md-sys-color-on-error);
        font: 600 11px/20px var(--grampsjs-body-font-family);
        text-align: center;
      }
      .item.logout,
      .item.logout grampsjs-icon {
        color: var(--grampsjs-logout-font-color);
      }
      .item.logout:hover {
        background: color-mix(
          in srgb,
          var(--grampsjs-logout-font-color) 10%,
          transparent
        );
      }
      @media (max-width: 760px) {
        /* Chỉ đổi lề trái/phải; không dùng inset để không đặt lại top. Một
           cột, mọi nhóm xếp hai cột mục cho bảng ngắn lại. */
        #account {
          left: 8px;
          right: 8px;
          width: auto;
        }
        .identity {
          padding-left: 16px;
        }
        .columns {
          grid-template-columns: 1fr;
        }
        .me {
          border-left: 0;
          border-top: 1px solid var(--heritage-rule);
        }
        .links {
          display: grid;
          grid-template-columns: 1fr 1fr;
          column-gap: 4px;
        }
        .item {
          gap: 10px;
          padding-inline: 8px;
        }
      }
      @media (max-width: 359px) {
        .links,
        .lookup .links {
          grid-template-columns: 1fr;
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
    this._user = null
    this._userRequested = false
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
    const fixedBar = header?.shadowRoot
      ?.querySelector('mwc-top-app-bar')
      ?.shadowRoot?.querySelector('header')
    const top = Math.max(0, (fixedBar || header).getBoundingClientRect().bottom)
    this.style.setProperty(
      '--account-top',
      `${Math.min(top, window.innerHeight - 160)}px`
    )
  }

  _close() {
    const panel = this.renderRoot.querySelector('#account')
    if (panel?.matches(':popover-open')) panel.hidePopover()
  }

  // Tên và vai trò chỉ tải khi bảng mở lần đầu, không tải sẵn lúc khởi động.
  async _loadUser() {
    if (this._userRequested || !this.appState.apiGet) return
    this._userRequested = true
    const data = await this.appState.apiGet('/api/users/-/')
    if ('data' in data) {
      this._user = data.data
    } else {
      this._userRequested = false
    }
  }

  _handleToggle(event) {
    this.open = event.newState === 'open'
    if (this.open) this._loadUser()
  }

  _link(link) {
    const {href, label, icon, badge} = link
    return html`<a
      class="item"
      href=${href}
      aria-current=${isCurrentLink(this.appState.path, link) ? 'page' : 'false'}
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
    >
      <grampsjs-icon
        path=${icon}
        color="currentColor"
        width="30"
        height="30"
        ornament
      ></grampsjs-icon>
      <span>${label}</span>
      ${badge && this.unreadCount > 0
        ? html`<span
            class="count"
            aria-label=${`${this.unreadCount} thông báo chưa đọc`}
            >${this.unreadCount}</span
          >`
        : ''}
    </a>`
  }

  _section(title, items, cls = '') {
    if (!items.length) return ''
    return html`<section class=${cls}>
      <h3>${title}</h3>
      <div class="links">${items.map(item => this._link(item))}</div>
    </section>`
  }

  _initial() {
    const name = this._user?.full_name || this._user?.name || ''
    const last = name.trim().split(/\s+/).pop() || ''
    return last ? last[0].toLocaleUpperCase('vi-VN') : ''
  }

  render() {
    const perms = this.appState.permissions ?? {}
    const account = [
      {
        href: '/settings/user',
        label: this._('User settings'),
        icon: mdiAccountCog,
      },
      {
        href: '/notifications',
        label: this._('Notifications'),
        icon: mdiBellOutline,
        badge: true,
      },
      {
        href: '/bookmarks',
        label: this._('_Bookmarks'),
        icon: mdiBookmarkOutline,
      },
      {href: '/recent', label: 'Mục vừa xem', icon: mdiHistory},
    ]
    const editing = perms.canEdit
      ? [
          {href: '/tasks', label: this._('Tasks'), icon: mdiFormatListChecks},
          {href: '/export', label: this._('Export'), icon: mdiDownload},
          ...(perms.canViewPrivate
            ? [
                {
                  href: '/revisions',
                  label: this._('Revisions'),
                  icon: mdiSourceCommit,
                },
              ]
            : []),
        ]
      : []
    const admin = perms.canManageUsers
      ? [
          {
            href: '/settings/administration',
            label: this._('Administration'),
            icon: mdiWrench,
          },
          {
            href: '/settings/users',
            label: this._('Manage users'),
            icon: mdiAccountMultiple,
          },
          {
            href: '/settings/info',
            label: this._('System Information'),
            icon: mdiInformationOutline,
          },
        ]
      : []
    const name = this._user?.full_name || this._user?.name || ''
    const role = ROLE_LABELS[this._user?.role] || ''
    return html`
      <div class="trigger">
        <button
          id="button_settings"
          popovertarget="account"
          aria-label="Danh mục và tài khoản"
          aria-expanded=${this.open ? 'true' : 'false'}
          aria-controls="account"
          @click=${this._positionPanel}
        >
          <grampsjs-icon
            path=${mdiAccountCircle}
            color="currentColor"
          ></grampsjs-icon>
        </button>
        ${this.unreadCount > 0
          ? html`<span class="badge" aria-hidden="true"
              >${this.unreadCount}</span
            >`
          : ''}
      </div>
      <div id="account" popover="auto" @toggle=${this._handleToggle}>
        <div class="identity">
          <span class="avatar" aria-hidden="true">
            ${this._initial() ||
            html`<grampsjs-icon
              path=${mdiAccountCircle}
              color="currentColor"
              width="28"
              height="28"
            ></grampsjs-icon>`}
          </span>
          <div class="who">
            <strong>${name || this._('Account')}</strong>
            <span>${role || (this._user ? '' : 'Đang tải…')}</span>
          </div>
          <button
            class="close"
            popovertarget="account"
            popovertargetaction="hide"
            aria-label="Đóng"
          >
            <grampsjs-icon
              path=${mdiClose}
              color="currentColor"
            ></grampsjs-icon>
          </button>
        </div>
        <div class="columns">
          <nav class="catalog" aria-label="Danh mục gia phả">
            ${this._section('Tra cứu', mainLinks(this), 'lookup')}
            ${this._section('Tư liệu & nghiên cứu', researchLinks(this))}
            ${this._section('Về dòng họ', aboutLinks())}
          </nav>
          <div class="me">
            ${this._section(this._('Account'), account)}
            ${this._section('Biên soạn', editing)}
            ${this._section('Quản trị', admin)}
            <section>
              <button
                class="item logout"
                type="button"
                @click=${() => this.appState.signout()}
              >
                <grampsjs-icon
                  path=${mdiLogout}
                  color="currentColor"
                  width="30"
                  height="30"
                  ornament
                ></grampsjs-icon>
                <span>${this._('Log out')}</span>
              </button>
            </section>
          </div>
        </div>
      </div>
    `
  }
}

window.customElements.define('grampsjs-settings-menu', GrampsjsSettingsMenu)
