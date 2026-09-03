import {LitElement, html, css} from 'lit'
import {sharedStyles} from '../SharedStyles.js'
import {GrampsjsAppStateMixin} from '../mixins/GrampsjsAppStateMixin.js'

export class GrampsjsObjectToc extends GrampsjsAppStateMixin(LitElement) {
  static get styles() {
    return [
      sharedStyles,
      css`
        :host {
          display: block;
        }

        /* Cột mục lục bên phải hồ sơ: cùng khung giấy và nhãn mục với các khối
           khác; trong hộp thoại (không có tiêu đề) thì không đóng khung. */
        .toc-frame {
          padding: 16px 8px 8px;
        }

        md-list.toc-list {
          background: transparent;
          --md-list-item-label-text-weight: 400;
          --md-list-item-label-text-size: 14px;
          --md-list-item-label-text-color: var(--md-sys-color-on-surface);
          --md-list-item-hover-state-layer-color: var(--heritage-gold);
          --md-list-item-top-space: 0px;
          --md-list-item-bottom-space: 0px;
          --md-list-item-one-line-container-height: 40px;
        }

        md-list-item.active {
          --md-list-item-label-text-weight: 600;
          --md-list-item-label-text-color: var(--md-sys-color-primary);
          box-shadow: inset 3px 0 var(--heritage-gold);
        }

        h3 {
          margin: 0 16px 6px;
          font: 500 11px/1.6 var(--grampsjs-body-font-family);
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: var(--md-sys-color-primary);
        }
      `,
    ]
  }

  static get properties() {
    return {
      tabs: {type: Object},
      activeSection: {type: String},
      heading: {type: Boolean},
    }
  }

  constructor() {
    super()
    this.tabs = {}
    this.activeSection = ''
    this.heading = false
  }

  render() {
    const tabKeys = Object.keys(this.tabs)
    if (tabKeys.length <= 1) {
      return html`` // Don't show TOC if there's only one section
    }

    return html`
      <nav
        class="${this.heading ? 'toc-frame heritage-frame' : ''}"
        aria-label="${this._('Table Of Contents')}"
      >
        ${this.heading ? html`<h3>${this._('Table Of Contents')}</h3>` : ''}
        <md-list class="toc-list">
          ${tabKeys.map(
            key => html`
              <md-list-item
                type="button"
                id="toc-item-${key}"
                class="${key === this.activeSection ? 'active' : ''}"
                @click="${e => this._handleItemClick(e, key)}"
              >
                ${this._(this.tabs[key].title)}
              </md-list-item>
            `
          )}
        </md-list>
      </nav>
    `
  }

  setActiveSection(sectionKey) {
    this.activeSection = sectionKey
  }

  _handleItemClick(e, sectionKey) {
    e.preventDefault()
    e.stopPropagation()

    this.activeSection = sectionKey

    this.dispatchEvent(
      new CustomEvent('toc-item-click', {
        detail: {
          sectionKey,
        },
        bubbles: true,
        composed: true,
      })
    )
  }
}

customElements.define('grampsjs-object-toc', GrampsjsObjectToc)
