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
  mdiMagnify,
  mdiDotsHorizontal,
} from '@mdi/js'
import './GrampsjsIcon.js'
import './GrampsjsTreeBranchBar.js'
import {iconButtonColorStyles} from '../SharedStyles.js'

/*
Công cụ của trang Cây nổi ngay trên vùng vẽ, không chiếm một hàng riêng dưới
thanh đầu trang. Các nút xếp thành một cột bên phải, chia hai nhóm: xem (vừa
khung, tuỳ chọn) và đi lại (về người gốc, người trước, hồ sơ, thu gọn hay tìm
người đang xem). Chọn phạm vi (nhánh chính, ngành chi, toàn gia phả) là nút đầu
cột do GrampsjsTreeBranchBar đảm nhiệm. Lớp phủ này không nhận sự kiện chuột,
chỉ cột nút nhận, nên kéo hay chụm cây vẫn bình thường.
*/
class GrampsjsTreeToolbar extends LitElement {
  static properties = {state: {attribute: false}}

  static styles = [
    iconButtonColorStyles,
    css`
      :host {
        position: absolute;
        inset: 0;
        z-index: 3;
        pointer-events: none;
      }
      .stack {
        position: absolute;
        right: 12px;
        top: 50%;
        translate: 0 -50%;
        display: flex;
        flex-direction: column;
        gap: 5px;
        pointer-events: auto;
      }
      .gap {
        height: 8px;
      }
      .desktop-navigation {
        display: flex;
        flex-direction: column;
        gap: 5px;
      }
      .mobile-navigation {
        position: relative;
        display: none;
      }
      md-menu {
        z-index: 8;
        min-width: 210px;
        color: var(--md-sys-color-on-surface);
        --md-menu-container-color: var(--md-sys-color-surface-container);
        --md-menu-item-one-line-container-height: 46px;
      }
      md-menu-item {
        --md-menu-item-label-text-size: 14px;
        --md-menu-item-hover-state-layer-color: var(--heritage-gold);
      }
      md-icon-button {
        width: 42px;
        height: 42px;
        color: var(--md-sys-color-primary);
        --grampsjs-icon-button-color: currentColor;
        --md-icon-button-state-layer-width: 42px;
        --md-icon-button-state-layer-height: 42px;
        --md-icon-button-hover-state-layer-color: var(--heritage-gold);
        --md-icon-button-pressed-state-layer-color: var(--heritage-gold);
        --md-icon-button-hover-state-layer-opacity: 0.18;
        --md-icon-button-pressed-state-layer-opacity: 0.28;
        background: color-mix(
          in srgb,
          var(--heritage-gold) 8%,
          var(--md-sys-color-surface)
        );
        border: 1px solid var(--heritage-rule);
        border-radius: 11px;
        box-shadow: 0 2px 8px var(--grampsjs-body-font-color-10);
      }
      md-icon-button[disabled] {
        opacity: 0.4;
      }
      @media (max-width: 991px) {
        .stack {
          right: 8px;
          top: 12px;
          translate: none;
        }
        .desktop-navigation {
          display: none;
        }
        .mobile-navigation {
          display: block;
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

  _toggleNavigationMenu() {
    const menu = this.renderRoot.querySelector('#navigation-menu')
    if (menu) menu.open = !menu.open
  }

  render() {
    const state = this.state
    const navigation = [
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
    return html`<div class="stack" role="group" aria-label="Công cụ gia phả">
      <grampsjs-tree-branch-bar
        .appState=${state.appState}
        view=${state.view ?? 'main'}
        grampsId=${state.grampsId ?? ''}
        homePerson=${state.homePerson ?? ''}
      ></grampsjs-tree-branch-bar>
      ${this._button('btn-search', 'Tìm theo tên', mdiMagnify, 'search')}
      ${this._button(
        'btn-overview',
        'Vừa khung',
        mdiFitToScreenOutline,
        'overview'
      )}
      ${this._button('btn-controls', 'Tùy chọn gia phả', mdiCog, 'preferences')}
      <span class="desktop-navigation">
        <span class="gap" aria-hidden="true"></span>
        ${navigation.map(args => this._button(...args))}
      </span>
      <span class="mobile-navigation">
        <md-icon-button
          id="btn-more"
          title="Điều hướng gia phả"
          aria-label="Điều hướng gia phả"
          aria-haspopup="menu"
          @click=${this._toggleNavigationMenu}
          ><grampsjs-icon
            path=${mdiDotsHorizontal}
            color="currentColor"
          ></grampsjs-icon>
        </md-icon-button>
        <md-menu
          id="navigation-menu"
          anchor="btn-more"
          positioning="popover"
          anchor-corner="start-start"
          menu-corner="start-end"
          aria-label="Điều hướng gia phả"
        >
          ${navigation.map(
            ([, label, , action, disabled]) => html`<md-menu-item
              ?disabled=${disabled}
              @click=${() => this._act(action)}
            >
              <span slot="headline">${label}</span>
            </md-menu-item>`
          )}
        </md-menu>
      </span>
    </div>`
  }
}

window.customElements.define('grampsjs-tree-toolbar', GrampsjsTreeToolbar)
