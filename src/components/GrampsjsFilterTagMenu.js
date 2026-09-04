/*
Nút thả xuống lọc nhanh theo một nhóm thẻ, ví dụ "Đời" (Đời 1 … Đời 17) hay
"Ngành chi" (Ngành 2 - Chi 1 …). Chọn một thẻ là thêm quy tắc HasTag mang
khoá `slotKey`, chọn "Tất cả" là bỏ. Trạng thái đang chọn đọc từ `filters`
do grampsjs-filters phát xuống, nên nút "Xóa tất cả bộ lọc" cũng đưa nút về
mặc định mà không cần nói riêng với nó.
*/

import {css, html, LitElement} from 'lit'
import '@material/web/button/outlined-button.js'
import '@material/web/button/filled-tonal-button.js'
import '@material/web/menu/menu.js'
import '@material/web/menu/menu-item.js'
import {mdiMenuDown} from '@mdi/js'

import './GrampsjsIcon.js'
import {sharedStyles} from '../SharedStyles.js'
import {GrampsjsAppStateMixin} from '../mixins/GrampsjsAppStateMixin.js'
import {fireEvent} from '../util.js'

export class GrampsjsFilterTagMenu extends GrampsjsAppStateMixin(LitElement) {
  static get styles() {
    return [
      sharedStyles,
      css`
        :host {
          display: inline-block;
          position: relative;
        }

        md-outlined-button,
        md-filled-tonal-button {
          --md-outlined-button-container-shape: var(--grampsjs-frame-radius);
          --md-filled-tonal-button-container-shape: var(
            --grampsjs-frame-radius
          );
          --md-outlined-button-trailing-space: 10px;
          --md-filled-tonal-button-trailing-space: 10px;
          --md-outlined-button-with-trailing-icon-trailing-space: 10px;
          --md-filled-tonal-button-with-trailing-icon-trailing-space: 10px;
          max-width: 100%;
        }

        md-menu {
          --md-menu-item-one-line-container-height: 44px;
          --md-menu-item-selected-container-color: var(
            --md-sys-color-secondary-container
          );
          min-width: 180px;
          /* Menu 18 dòng mở từ giữa màn hình điện thoại: giới hạn cao để phần
             cuối không chui xuống dưới thanh điều hướng, còn lại cuộn trong menu. */
          max-height: min(46vh, 400px);
        }
      `,
    ]
  }

  static get properties() {
    return {
      label: {type: String},
      options: {type: Array},
      slotKey: {type: String},
      filters: {type: Array},
    }
  }

  constructor() {
    super()
    this.label = ''
    this.options = []
    this.slotKey = 'quick:tag'
    this.filters = []
  }

  get _selected() {
    return (
      this.filters?.find(rule => rule._slot === this.slotKey)?.values?.[0] ?? ''
    )
  }

  get _buttonId() {
    return `btn-${this.slotKey.replace(/[^a-z0-9]/giu, '-')}`
  }

  render() {
    if (this.options.length === 0) {
      return ''
    }
    const selected = this._selected
    return html`
      ${selected
        ? html`<md-filled-tonal-button
            id="${this._buttonId}"
            trailing-icon
            aria-haspopup="menu"
            @click="${this._toggleMenu}"
          >
            ${selected}
            <grampsjs-icon
              slot="icon"
              .path="${mdiMenuDown}"
              height="20"
              color="var(--md-sys-color-on-secondary-container)"
            ></grampsjs-icon>
          </md-filled-tonal-button>`
        : html`<md-outlined-button
            id="${this._buttonId}"
            trailing-icon
            aria-haspopup="menu"
            @click="${this._toggleMenu}"
          >
            ${this.label}
            <grampsjs-icon
              slot="icon"
              .path="${mdiMenuDown}"
              height="20"
              color="var(--mdc-theme-primary)"
            ></grampsjs-icon>
          </md-outlined-button>`}
      <md-menu id="menu" anchor="${this._buttonId}">
        <md-menu-item
          ?selected="${!selected}"
          @click="${() => this._choose('')}"
        >
          <div slot="headline">${this._('All')}</div>
        </md-menu-item>
        ${this.options.map(
          name => html`
            <md-menu-item
              ?selected="${name === selected}"
              @click="${() => this._choose(name)}"
            >
              <div slot="headline">${name}</div>
            </md-menu-item>
          `
        )}
      </md-menu>
    `
  }

  _toggleMenu() {
    const menu = this.renderRoot.querySelector('#menu')
    if (menu) {
      menu.open = !menu.open
    }
  }

  _choose(name) {
    if (name === this._selected) {
      return
    }
    const rules = name
      ? [{name: 'HasTag', values: [name], _slot: this.slotKey}]
      : []
    fireEvent(this, 'filter:changed', {
      filters: {rules},
      replace: this.slotKey,
    })
  }
}

window.customElements.define('grampsjs-filter-tag-menu', GrampsjsFilterTagMenu)
