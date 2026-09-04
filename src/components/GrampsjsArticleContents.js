import {css, html, LitElement} from 'lit'
import {mdiChevronDown, mdiFormatListBulleted} from '@mdi/js'
import {heritageFrameStyles} from '../HeritageStyles.js'
import './GrampsjsIcon.js'

export class GrampsjsArticleContents extends LitElement {
  static get properties() {
    return {
      sections: {type: Array},
      articleId: {type: String},
      sidebar: {type: Boolean, reflect: true},
    }
  }

  static get styles() {
    return [
      heritageFrameStyles,
      css`
        :host {
          display: block;
          position: sticky;
          top: 72px;
          z-index: 3;
          margin: 0 0 28px;
          font: 400 15px/1.5 var(--grampsjs-body-font-family);
          color: var(--md-sys-color-on-surface);
        }
        details {
          background: var(--grampsjs-frame-paper);
          border: 1px solid var(--md-sys-color-outline-variant);
          border-radius: var(--grampsjs-frame-radius);
          padding: 5px;
        }
        summary {
          display: flex;
          align-items: center;
          gap: 10px;
          min-height: 52px;
          padding: 4px 14px;
          cursor: pointer;
          list-style: none;
          box-sizing: border-box;
          color: var(--md-sys-color-primary);
          font-weight: 600;
        }
        summary::-webkit-details-marker {
          display: none;
        }
        .title {
          flex: 1;
        }
        .count {
          font-size: 13px;
          font-weight: 400;
          white-space: nowrap;
        }
        .chevron {
          transition: transform 150ms;
        }
        details[open] .chevron {
          transform: rotate(180deg);
        }
        nav {
          border-top: 1px solid var(--md-sys-color-outline-variant);
          max-height: min(
            50dvh,
            400px,
            var(--grampsjs-contents-max-height, 100dvh),
            var(--grampsjs-contents-available-height, 100dvh)
          );
          overflow-y: auto;
          overscroll-behavior: contain;
          padding: 8px;
        }
        ol {
          margin: 0;
          padding: 0;
          list-style: none;
        }
        button,
        a {
          display: block;
          box-sizing: border-box;
          width: 100%;
          padding: 12px;
          min-height: 44px;
          font: inherit;
          text-align: left;
          color: inherit;
          background: transparent;
          border: 0;
          text-decoration: none;
          cursor: pointer;
          overflow-wrap: anywhere;
        }
        button:hover,
        a:hover {
          background: var(--md-sys-color-surface-container);
        }
        summary:focus-visible,
        button:focus-visible,
        a:focus-visible {
          outline: 2px solid var(--md-sys-color-primary);
          outline-offset: -3px;
        }
        .links {
          border-top: 1px solid var(--md-sys-color-outline-variant);
          margin-top: 8px;
          color: var(--md-sys-color-primary);
        }
        :host([sidebar]) {
          margin-bottom: 0;
          top: 80px;
        }
        :host([sidebar]) summary {
          padding-inline: 8px;
          gap: 6px;
        }
        :host([sidebar]) nav {
          max-height: min(
            calc(100dvh - 164px),
            var(--grampsjs-contents-max-height, 100dvh),
            var(--grampsjs-contents-available-height, 100dvh)
          );
          padding: 6px;
          scrollbar-width: thin;
        }
        :host([sidebar]) button,
        :host([sidebar]) a {
          padding: 10px 8px;
        }
        @media (max-width: 767px) {
          :host {
            top: 64px;
            font-size: 14px;
          }
          summary {
            padding: 4px 10px;
            gap: 8px;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .chevron {
            transition: none;
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

  constructor() {
    super()
    this.sections = []
    this.articleId = ''
    this.sidebar = false
  }

  updated(changed) {
    if (changed.has('articleId') || changed.has('sidebar')) {
      const details = this.shadowRoot.querySelector('details')
      if (details) details.open = this.sidebar
    }
  }

  render() {
    if (!this.sections.length) return html``
    return html`
      <details @keydown=${this._handleKeydown} @toggle=${this._fitPanel}>
        <summary>
          <grampsjs-icon .path=${mdiFormatListBulleted}></grampsjs-icon>
          <span class="title"
            >${this.sidebar ? 'Mục lục' : 'Mục lục bài viết'}</span
          >
          <span class="count">${this.sections.length} mục</span>
          <grampsjs-icon
            class="chevron"
            .path=${mdiChevronDown}
          ></grampsjs-icon>
        </summary>
        <nav aria-label="Mục lục bài viết">
          <ol>
            ${this.sections.map(
              section => html`
                <li>
                  <button @click=${() => this._jumpTo(section)}>
                    ${section.label}
                  </button>
                </li>
              `
            )}
          </ol>
          <div class="links">
            ${/^SBHNC\d+$/.test(this.articleId) && this.articleId !== 'SBHNC00'
              ? html`<a href="/blog/SBHNC00">Các chuyên mục nghiên cứu</a>`
              : ''}
            <a href="/blog">Toàn bộ kho sử</a>
          </div>
        </nav>
      </details>
    `
  }

  _handleKeydown(event) {
    if (event.key !== 'Escape') return
    this.shadowRoot.querySelector('details').open = false
    this.shadowRoot.querySelector('summary').focus()
  }

  _jumpTo(section) {
    if (!this.sidebar) this.shadowRoot.querySelector('details').open = false
    // Chừa chỗ cho thanh ứng dụng và mục lục đang ghim, kể cả khi phóng to chữ.
    const top = parseFloat(getComputedStyle(this).top) || 0
    this.dispatchEvent(
      new CustomEvent('article-section:select', {
        bubbles: true,
        composed: true,
        detail: {
          key: section.key,
          label: section.label,
          offset: top + (this.sidebar ? 0 : this.offsetHeight) + 16,
        },
      })
    )
  }

  _fitPanel() {
    if (!this.shadowRoot.querySelector('details').open) return
    const nav = this.shadowRoot.querySelector('nav')
    const bottomSpace = window.matchMedia('(max-width: 991px)').matches
      ? 96
      : 24
    let available =
      window.innerHeight - nav.getBoundingClientRect().top - bottomSpace
    if (available < 160) {
      this.style.scrollMarginTop = getComputedStyle(this).top
      this.scrollIntoView({block: 'start', behavior: 'instant'})
      available =
        window.innerHeight - nav.getBoundingClientRect().top - bottomSpace
    }
    nav.style.setProperty(
      '--grampsjs-contents-available-height',
      `${Math.max(120, this.sidebar ? available : Math.min(400, available))}px`
    )
  }
}

window.customElements.define(
  'grampsjs-article-contents',
  GrampsjsArticleContents
)
