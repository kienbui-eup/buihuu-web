import {LitElement, html, css} from 'lit'
import '@material/web/iconbutton/icon-button.js'
import {
  mdiHomeAccount,
  mdiArrowLeft,
  mdiAccountDetails,
  mdiCog,
  mdiFitToScreenOutline,
  mdiCollapseAllOutline,
  mdiCrosshairsGps,
} from '@mdi/js'
import './GrampsjsIcon.js'
import {iconButtonColorStyles} from '../SharedStyles.js'

/*
Công cụ của trang Cây nổi ngay trên vùng vẽ, không chiếm một hàng riêng dưới
thanh đầu trang. Các nút xếp thành một cột bên phải, chia hai nhóm: xem (vừa
khung, tuỳ chọn) và đi lại (về người gốc, người trước, hồ sơ, thu gọn hay tìm
người đang xem). Chọn phạm vi (nhánh chính, ngành chi, toàn gia phả) nằm ở dải
nút góc trên trái do GrampsjsTreeBranchBar đảm nhiệm. Lớp phủ này không nhận
sự kiện chuột, chỉ cột nút nhận, nên kéo hay chụm cây vẫn bình thường.
*/
class GrampsjsChartToolbar extends LitElement {
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
        right: 14px;
        top: 50%;
        translate: 0 -50%;
        display: flex;
        flex-direction: column;
        gap: 6px;
        pointer-events: auto;
      }
      .gap {
        height: 8px;
      }
      md-icon-button {
        width: 44px;
        height: 44px;
        color: var(--md-sys-color-primary);
        --grampsjs-icon-button-color: currentColor;
        --md-icon-button-state-layer-width: 44px;
        --md-icon-button-state-layer-height: 44px;
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
        border-radius: 6px;
        box-shadow: 0 2px 10px var(--grampsjs-body-font-color-10);
      }
      md-icon-button[disabled] {
        opacity: 0.4;
      }
      @media (max-width: 991px) {
        .stack {
          right: 8px;
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
    const navigation = [
      [
        'button-home',
        'Về nhánh chính từ thủy tổ',
        mdiHomeAccount,
        'home',
        state.disableHome,
      ],
      [
        'btn-back',
        'Quay lại lần xem trước',
        mdiArrowLeft,
        'back',
        state.disableBack,
      ],
      ['btn-person', 'Mở hồ sơ', mdiAccountDetails, 'person'],
      state.view === 'main'
        ? [
            'btn-collapse',
            'Thu gọn nhánh chính',
            mdiCollapseAllOutline,
            'collapse',
          ]
        : [
            'btn-focus',
            'Đưa người đang xem vào giữa',
            mdiCrosshairsGps,
            'focus',
          ],
    ]
    return html`<div
      class="stack"
      role="group"
      aria-label="Công cụ cho phạm vi đang xem"
    >
      ${this._button(
        'btn-overview',
        'Vừa khung',
        mdiFitToScreenOutline,
        'overview'
      )}
      ${this._button('btn-controls', 'Tùy chọn gia phả', mdiCog, 'preferences')}
      <span class="gap" aria-hidden="true"></span>
      ${navigation.map(args => this._button(...args))}
    </div>`
  }
}

window.customElements.define('grampsjs-chart-toolbar', GrampsjsChartToolbar)
