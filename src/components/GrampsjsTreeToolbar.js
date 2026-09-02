import {LitElement, html, css} from 'lit'
import '@material/web/iconbutton/icon-button.js'
import '@material/web/menu/menu.js'
import '@material/web/menu/menu-item.js'
import {
  mdiHomeAccount,
  mdiArrowLeft,
  mdiAccountDetails,
  mdiCog,
  mdiFitToScreenOutline,
  mdiCollapseAllOutline,
  mdiCrosshairsGps,
  mdiDotsVertical,
} from '@mdi/js'
import './GrampsjsIcon.js'
import {TREE_VIEWS, TREE_VIEW_LABELS} from '../treeDefaults.js'
import {appBarIconButtonStyles} from '../SharedStyles.js'

class GrampsjsTreeToolbar extends LitElement {
  static properties = {state: {attribute: false}}

  static styles = [
    appBarIconButtonStyles,
    css`
      :host {
        display: block;
        min-width: 0;
      }
      .tools {
        display: flex;
        align-items: center;
        position: relative;
        gap: 2px;
      }
      select {
        flex: 1;
        min-width: 0;
        max-width: 260px;
        height: 44px;
        font: inherit;
        font-size: 13px;
        padding: 6px 8px;
        border: 1px solid currentColor;
        border-radius: 4px;
        color: var(--grampsjs-top-app-bar-font-color);
        background: transparent;
      }
      option {
        color: var(--md-sys-color-on-surface);
        background: var(--md-sys-color-surface);
      }
      select:focus-visible {
        outline: 2px solid currentColor;
        outline-offset: 2px;
      }
      md-icon-button {
        width: 44px;
        height: 44px;
        flex: 0 0 44px;
      }
      .secondary {
        display: contents;
      }
      #btn-more {
        display: none;
      }
      md-menu {
        min-width: 240px;
        max-width: calc(100vw - 16px);
        color: var(--md-sys-color-on-surface);
      }
      .summary {
        padding: 8px 16px;
        font-size: 12px;
        line-height: 1.5;
        max-width: 260px;
        white-space: normal;
      }
      @media (max-width: 991px) {
        select {
          max-width: none;
        }
        .secondary {
          display: none;
        }
        #btn-more {
          display: inline-flex;
        }
      }
    `,
  ]

  constructor() {
    super()
    this.state = {}
  }

  _act(action, value) {
    this.state.onAction?.(action, value)
  }

  _button(id, label, icon, action, disabled = false) {
    return html`<md-icon-button
      id=${id}
      title=${label}
      aria-label=${label}
      ?disabled=${disabled}
      @click=${() => this._act(action)}
      ><grampsjs-icon path=${icon} color="currentColor"></grampsjs-icon
    ></md-icon-button>`
  }

  render() {
    const state = this.state
    const extra = [
      [
        'button-home',
        'Về người gốc',
        mdiHomeAccount,
        'home',
        state.disableHome,
      ],
      ['btn-back', 'Người trước đó', mdiArrowLeft, 'back', state.disableBack],
      ['btn-person', 'Mở hồ sơ', mdiAccountDetails, 'person'],
      state.view === 'main'
        ? [
            'btn-collapse',
            'Thu gọn nhánh chính',
            mdiCollapseAllOutline,
            'collapse',
          ]
        : ['btn-focus', 'Người đang xem', mdiCrosshairsGps, 'focus'],
    ]
    return html`<div class="tools" role="group" aria-label="Công cụ gia phả">
      <select
        id="tree-view"
        aria-label="Hiển thị gia phả"
        title=${`${TREE_VIEW_LABELS[state.view] || ''} · ${
          state.summary || ''
        }`}
        .value=${state.view || 'main'}
        @change=${e => this._act('view', e.target.value)}
      >
        ${TREE_VIEWS.map(
          view =>
            html`<option value=${view} ?selected=${view === state.view}>
              ${view === 'main' ? 'Nhánh chính' : TREE_VIEW_LABELS[view]}
            </option>`
        )}
      </select>
      ${this._button(
        'btn-overview',
        'Vừa khung',
        mdiFitToScreenOutline,
        'overview'
      )}
      ${this._button('btn-controls', 'Tùy chọn gia phả', mdiCog, 'preferences')}
      <div class="secondary">${extra.map(args => this._button(...args))}</div>
      <md-icon-button
        id="btn-more"
        aria-label="Thao tác khác với cây"
        aria-haspopup="menu"
        @click=${() => this.renderRoot.querySelector('md-menu').show()}
        ><grampsjs-icon
          path=${mdiDotsVertical}
          color="currentColor"
        ></grampsjs-icon
      ></md-icon-button>
      <md-menu
        anchor="btn-more"
        anchor-corner="end-end"
        menu-corner="start-end"
      >
        ${extra.map(
          ([, label, icon, action, disabled]) =>
            html`<md-menu-item
              ?disabled=${disabled}
              @click=${() => this._act(action)}
              ><grampsjs-icon slot="start" path=${icon}></grampsjs-icon>
              <div slot="headline">${label}</div></md-menu-item
            >`
        )}
        <div class="summary">${state.summary}</div>
      </md-menu>
    </div>`
  }
}

window.customElements.define('grampsjs-tree-toolbar', GrampsjsTreeToolbar)
