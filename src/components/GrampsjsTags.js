import {LitElement, css, html} from 'lit'

import {colorToCss} from '../color.js'
import {sharedStyles} from '../SharedStyles.js'
import '@material/web/chips/chip-set'
import '@material/web/chips/input-chip'
import '@material/web/chips/assist-chip'
import '@material/web/iconbutton/icon-button.js'
import {mdiTagPlus} from '@mdi/js'

import {fireEvent} from '../util.js'
import './GrampsjsIcon.js'
import './GrampsjsTooltip.js'
import {GrampsjsAppStateMixin} from '../mixins/GrampsjsAppStateMixin.js'

export class GrampsjsTags extends GrampsjsAppStateMixin(LitElement) {
  static get styles() {
    return [
      sharedStyles,
      css`
        h4 {
          font-weight: 400;
          font-size: 14px;
          font-family: var(--grampsjs-heading-font-family);
          color: var(--grampsjs-body-font-color-50);
          margin-top: 15px;
          margin-bottom: 7px;
        }

        .tags {
          clear: left;
          margin-bottom: 15px;
          align-items: center;
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          padding: 5px 0px;
        }

        md-input-chip {
          --md-input-chip-container-color: var(--tag-color-bg);
          --md-input-chip-label-text-color: var(--tag-color);
          --md-input-chip-outline-color: var(--tag-color);
          --md-input-chip-icon-color: var(--tag-color);
          --md-input-chip-trailing-icon-color: var(--tag-color);
          --md-input-chip-hover-label-text-color: var(--tag-color);
          --md-input-chip-hover-trailing-icon-color: var(--tag-color);
          --md-input-chip-hover-icon-color: var(--tag-color);
          --md-input-chip-hover-outline-color: var(--tag-color);
          --md-input-chip-focus-label-text-color: var(--tag-color);
          --md-input-chip-focus-trailing-icon-color: var(--tag-color);
          --md-input-chip-focus-icon-color: var(--tag-color);
          --md-input-chip-focus-outline-color: var(--tag-color);
          --md-input-chip-pressed-label-text-color: var(--tag-color);
          --md-input-chip-pressed-trailing-icon-color: var(--tag-color);
          --md-input-chip-pressed-icon-color: var(--tag-color);
        }

        /* Thẻ chỉ xem đi theo theme của trang, màu riêng của thẻ thu về một
           chấm nhỏ. Màu thẻ trong dữ liệu nhập là xanh dương mặc định, tô cả
           viền và chữ thì chỏi với nền nâu, trông như nút lạ. */
        md-assist-chip {
          --md-assist-chip-container-shape: var(--grampsjs-frame-radius, 4px);
          --md-assist-chip-label-text-color: var(--md-sys-color-on-surface);
          --md-assist-chip-outline-color: var(--md-sys-color-outline-variant);
          --md-assist-chip-hover-label-text-color: var(--md-sys-color-primary);
          --md-assist-chip-hover-outline-color: var(--md-sys-color-primary);
          --md-assist-chip-focus-label-text-color: var(--md-sys-color-primary);
          --md-assist-chip-focus-outline-color: var(--md-sys-color-primary);
          --md-assist-chip-pressed-label-text-color: var(
            --md-sys-color-primary
          );
          --md-assist-chip-icon-size: 12px;
          --md-assist-chip-leading-space: 12px;
        }

        md-assist-chip svg[slot='icon'] {
          width: 12px;
          height: 12px;
        }

        md-icon-button {
          --md-icon-button-icon-size: 20px;
          --md-icon-button-state-layer-height: 32px;
          --md-icon-button-state-layer-width: 32px;
        }
      `,
    ]
  }

  static get properties() {
    return {
      data: {type: Array},
      edit: {type: Boolean},
      hideTags: {type: Array},
      noHeading: {type: Boolean},
    }
  }

  constructor() {
    super()
    this.data = []
    this.edit = false
    this.hideTags = []
    this.noHeading = false
  }

  render() {
    if (Object.keys(this.data).length === 0 && !this.edit) {
      return html``
    }
    return html`
      ${this.noHeading ? '' : html`<h4>${this._('Tags')}</h4>`}
      <div class="tags">
        <md-chip-set>
          ${this.data
            .filter(obj => !this.hideTags.includes(obj.name))
            .map(obj =>
              this.edit
                ? html`<md-input-chip
                    label="${obj.name}"
                    style="--tag-color:${colorToCss(
                      obj.color,
                      0.9
                    )};--tag-color-bg:${colorToCss(obj.color, 0.12)}"
                    @remove=${e => {
                      e.preventDefault()
                      this._handleClear(obj.handle)
                    }}
                  ></md-input-chip>`
                : html`<md-assist-chip label="${obj.name}">
                    <svg slot="icon" viewBox="0 0 12 12" aria-hidden="true">
                      <circle
                        cx="6"
                        cy="6"
                        r="4.5"
                        fill="${colorToCss(obj.color, 0.85)}"
                      />
                    </svg>
                  </md-assist-chip>`
            )}
        </md-chip-set>
        ${this.edit
          ? html`
              <md-icon-button
                id="btn-tag"
                class="edit"
                @click="${this._handleNewTag}"
              >
                <grampsjs-icon
                  path="${mdiTagPlus}"
                  color="var(--mdc-theme-secondary)"
                ></grampsjs-icon>
              </md-icon-button>
              <grampsjs-tooltip for="btn-tag" .appState="${this.appState}"
                >${this._('Add Tag')}</grampsjs-tooltip
              >
            `
          : ''}
      </div>
    `
  }

  _handleNewTag() {
    fireEvent(this, 'tag:new')
  }

  _handleList() {
    return this.data.map(_obj => _obj.handle)
  }

  _handleClear(handle) {
    const handles = this._handleList().filter(h => h !== handle)
    fireEvent(this, 'edit:action', {
      action: 'updateProp',
      data: {tag_list: handles},
    })
  }
}

window.customElements.define('grampsjs-tags', GrampsjsTags)
