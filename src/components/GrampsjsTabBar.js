import {html, css, LitElement} from 'lit'

import '@material/web/tabs/tabs'
import '@material/web/tabs/primary-tab'

import {fireEvent} from '../util.js'
import {sharedStyles} from '../SharedStyles.js'
import {GrampsjsAppStateMixin} from '../mixins/GrampsjsAppStateMixin.js'

const tabs = {
  people: 'People',
  families: 'Families',
  events: 'Events',
  places: 'Places',
  sources: 'Sources',
  citations: 'Citations',
  repositories: 'Repositories',
  notes: 'Notes',
  settings: {
    user: 'User settings',
    administration: 'Administration',
    users: 'Manage users',
    info: 'System Information',
  },
}

/*
Thanh tab của các trang danh sách và cài đặt. Kéo dài hết chiều ngang, gạch
chân vàng dưới mục đang chọn, cùng ngữ pháp với điều hướng chính trên header.
*/
class GrampsjsTabBar extends GrampsjsAppStateMixin(LitElement) {
  static get styles() {
    return [
      sharedStyles,
      css`
        :host {
          display: block;
        }

        .tabs-shell {
          padding: 0 var(--heritage-gutter);
          border-bottom: 1px solid var(--heritage-rule);
          background: color-mix(
            in srgb,
            var(--md-sys-color-surface) 55%,
            transparent
          );
        }

        md-tabs {
          width: max-content;
          max-width: 100%;
          --md-primary-tab-container-color: transparent;
          --md-primary-tab-container-height: 52px;
          --md-primary-tab-label-text-font: var(--grampsjs-body-font-family);
          --md-primary-tab-label-text-size: 15px;
          --md-primary-tab-label-text-weight: 500;
          --md-primary-tab-label-text-color: var(
            --md-sys-color-on-surface-variant
          );
          --md-primary-tab-hover-label-text-color: var(--md-sys-color-primary);
          --md-primary-tab-focus-label-text-color: var(--md-sys-color-primary);
          --md-primary-tab-pressed-label-text-color: var(
            --md-sys-color-primary
          );
          --md-primary-tab-active-label-text-color: var(--md-sys-color-primary);
          --md-primary-tab-active-hover-label-text-color: var(
            --md-sys-color-primary
          );
          --md-primary-tab-active-focus-label-text-color: var(
            --md-sys-color-primary
          );
          --md-primary-tab-active-pressed-label-text-color: var(
            --md-sys-color-primary
          );
          --md-primary-tab-active-indicator-color: var(--heritage-gold);
          --md-primary-tab-active-indicator-height: 3px;
          --md-primary-tab-hover-state-layer-color: var(--heritage-gold);
          --md-primary-tab-pressed-state-layer-color: var(--heritage-gold);
          --md-divider-thickness: 0px;
        }

        md-primary-tab {
          flex: 0 0 auto;
          width: auto;
        }

        @media (max-width: 768px) {
          .tabs-shell {
            padding: 0 8px;
          }
          md-tabs {
            --md-primary-tab-container-height: 48px;
            --md-primary-tab-label-text-size: 14px;
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
    const currentKey = this.appState.path.pageId || this.appState.path.page
    if (!(this.appState.path.page in tabs)) {
      return ''
    }
    if (
      this.appState.path.pageId &&
      this.appState.path.page in tabs &&
      !(this.appState.path.pageId in tabs[this.appState.path.page])
    ) {
      return ''
    }
    let currentTabs
    if (!this.appState.path.pageId) {
      currentTabs = Object.fromEntries(
        Object.entries(tabs).filter(([, value]) => typeof value === 'string')
      )
    } else {
      currentTabs = tabs[this.appState.path.page]
    }
    const filteredTabKeys = Object.keys(currentTabs).filter(
      key =>
        this._permissionToSeeTab(this.appState.path.page, key) &&
        this._hasContent(this.appState.path.page, key, currentKey)
    )
    return html`
      <div class="tabs-shell">
        <md-tabs .activeTabIndex=${filteredTabKeys.indexOf(currentKey)}>
          ${filteredTabKeys.map(
            key =>
              html`
                <md-primary-tab @click="${() => this._goTo(key)}"
                  >${this._(currentTabs[key])}</md-primary-tab
                >
              `
          )}
        </md-tabs>
      </div>
    `
  }

  // Con cháu tra cứu không cần thấy những loại dữ liệu cây này chưa có (trích
  // dẫn, kho tư liệu, hình ảnh). Người có quyền thêm vẫn thấy đủ để nhập; tab
  // đang mở luôn giữ lại để không mất chỗ đứng.
  _hasContent(page, key, currentKey) {
    if (page === 'settings' || this.appState.permissions?.canAdd) {
      return true
    }
    const counts = this.appState.dbInfo?.object_counts
    if (!counts || !(key in counts)) {
      return true
    }
    return counts[key] > 0 || key === currentKey
  }

  _permissionToSeeTab(page, key) {
    if (page !== 'settings') {
      return true
    }
    switch (key) {
      case 'administration':
        return this.appState.permissions.canManageUsers
      case 'users':
        return this.appState.permissions.canManageUsers
      case 'user':
        return true
      case 'info':
        return true
      default:
        return false
    }
  }

  _goTo(key) {
    if (this.appState.path.pageId) {
      fireEvent(this, 'nav', {path: `${this.appState.path.page}/${key}`})
    } else {
      fireEvent(this, 'nav', {path: key})
    }
  }
}

window.customElements.define('grampsjs-tab-bar', GrampsjsTabBar)
