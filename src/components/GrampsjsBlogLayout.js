import {css, html} from 'lit'
import {ifDefined} from 'lit/directives/if-defined.js'
import {mdiChevronDown, mdiBookOpenPageVariant} from '@mdi/js'
import {GrampsjsConnectedComponent} from './GrampsjsConnectedComponent.js'
import {heritageFrameStyles} from '../HeritageStyles.js'
import {fireEvent} from '../util.js'
import './GrampsjsIcon.js'

const searchable = text =>
  text.normalize('NFD').replace(/\p{M}/gu, '').replace(/đ/gi, 'd').toLowerCase()

const categories = post =>
  (post.extended?.tags || [])
    .map(tag => tag.name)
    .filter(name => name.startsWith('Chuyên mục:'))
    .map(name => name.slice('Chuyên mục:'.length).trim())
    .filter(Boolean)

export class GrampsjsBlogLayout extends GrampsjsConnectedComponent {
  static get properties() {
    return {
      currentId: {type: String},
      wide: {type: Boolean, reflect: true},
      _query: {state: true},
      _category: {state: true},
    }
  }

  static get styles() {
    return [
      heritageFrameStyles,
      css`
        :host {
          display: block;
          min-width: 0;
        }
        .layout {
          max-width: 74rem;
          margin-inline: auto;
        }
        .content {
          min-width: 0;
        }
        aside {
          margin-bottom: 24px;
          color: var(--md-sys-color-on-surface);
          font: 400 15px/1.5 var(--grampsjs-body-font-family);
        }
        details {
          padding: 6px;
        }
        summary {
          display: flex;
          gap: 10px;
          align-items: center;
          min-height: 48px;
          padding: 2px 12px;
          cursor: pointer;
          list-style: none;
          color: var(--md-sys-color-primary);
          font-weight: 600;
        }
        summary::-webkit-details-marker {
          display: none;
        }
        .title {
          flex: 1;
        }
        .chevron {
          transition: transform 150ms;
        }
        details[open] .chevron {
          transform: rotate(180deg);
        }
        .filters {
          padding: 8px 12px 12px;
        }
        label {
          display: block;
          margin-bottom: 4px;
          font-size: 13px;
        }
        input,
        select {
          box-sizing: border-box;
          width: 100%;
          min-height: 44px;
          border: 1px solid var(--md-sys-color-outline-variant);
          border-radius: 2px;
          padding: 8px;
          font: inherit;
          background: var(--md-sys-color-surface);
          color: inherit;
        }
        input {
          margin-bottom: 10px;
        }
        .count,
        .status {
          margin: 0;
          padding: 0 12px 10px;
          font-size: 13px;
        }
        nav {
          max-height: min(46dvh, 420px);
          overflow-y: auto;
          overscroll-behavior: contain;
          scrollbar-width: thin;
          border-top: 1px solid var(--md-sys-color-outline-variant);
        }
        ul {
          list-style: none;
          margin: 0;
          padding: 6px;
        }
        li + li {
          border-top: 1px solid var(--md-sys-color-outline-variant);
        }
        a {
          display: block;
          padding: 12px 10px;
          min-height: 44px;
          box-sizing: border-box;
          color: inherit;
          text-decoration: none;
          overflow-wrap: anywhere;
        }
        a:hover {
          background: var(--md-sys-color-surface-container);
        }
        a[aria-current='page'] {
          background: var(--md-sys-color-secondary-container);
          color: var(--md-sys-color-on-secondary-container);
          box-shadow: inset 3px 0 var(--md-sys-color-primary);
        }
        .category,
        .current {
          display: block;
          font-size: 12px;
          margin-top: 4px;
        }
        .current {
          font-weight: 600;
        }
        button {
          padding: 10px 12px;
          min-height: 44px;
          font: inherit;
          color: var(--md-sys-color-primary);
          background: transparent;
          border: 0;
          cursor: pointer;
        }
        :is(summary, input, select, a, button):focus-visible {
          outline: 2px solid var(--md-sys-color-primary);
          outline-offset: -2px;
        }
        :host([wide]) .layout {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 19rem;
          gap: 28px;
          align-items: start;
        }
        :host([wide]) aside {
          grid-column: 2;
          grid-row: 1;
          position: sticky;
          top: 80px;
          margin: 0;
        }
        :host([wide]) .content {
          grid-column: 1;
          grid-row: 1;
        }
        :host([wide]) details[open] {
          display: flex;
          flex-direction: column;
          max-height: calc(100dvh - 112px);
        }
        :host([wide]) nav {
          min-height: 0;
          max-height: calc(100dvh - 390px);
        }
        @media (prefers-reduced-motion: reduce) {
          .chevron {
            transition: none;
          }
        }
        @media print {
          aside {
            display: none;
          }
          :host([wide]) .layout {
            display: block;
          }
        }
      `,
    ]
  }

  constructor() {
    super()
    this.currentId = ''
    this.wide = false
    this._query = ''
    this._category = ''
  }

  connectedCallback() {
    super.connectedCallback()
    this._resizeObserver = new ResizeObserver(([entry]) => {
      this.wide = entry.contentRect.width >= 880
    })
    this._resizeObserver.observe(this)
  }

  disconnectedCallback() {
    this._resizeObserver?.disconnect()
    super.disconnectedCallback()
  }

  // The parent view owns visibility; viewport intersection must not pause refreshes.
  firstUpdated() {}

  updated(changed) {
    super.updated(changed)
    if (changed.has('wide')) {
      this.shadowRoot.querySelector('details').open = this.wide
    }
    if (
      changed.has('currentId') ||
      changed.has('_data') ||
      changed.has('loading') ||
      changed.has('wide')
    ) {
      this._revealCurrent()
    }
  }

  _revealCurrent() {
    const nav = this.shadowRoot.querySelector('nav')
    const current = nav?.querySelector('[aria-current="page"]')
    if (!current || !nav.clientHeight) return
    nav.scrollTop +=
      current.getBoundingClientRect().top -
      nav.getBoundingClientRect().top -
      nav.clientHeight / 2 +
      current.offsetHeight / 2
  }

  getUrl() {
    if (!this.active || !this.appState.apiGet) return ''
    const rules = {rules: [{name: 'HasTag', values: ['Blog']}]}
    // Omitting page returns every permitted Blog source, without loading article bodies.
    return `/api/sources/?rules=${encodeURIComponent(
      JSON.stringify(rules)
    )}&sort=gramps_id&extend=tag_list&keys=gramps_id,title,extended&locale=${
      this.appState.i18n?.lang || 'vi'
    }`
  }

  render() {
    const posts = this._data.data || []
    const options = [...new Set(posts.flatMap(categories))].sort((a, b) =>
      a.localeCompare(b, 'vi')
    )
    const query = searchable(this._query.trim())
    const matches = posts.filter(
      post =>
        (!this._category || categories(post).includes(this._category)) &&
        searchable(post.title || '').includes(query)
    )
    return html`
      <div class="layout">
        <aside aria-label="Xem nhanh danh sách bài viết">
          <details
            class="heritage-frame"
            @keydown=${this._handleKeydown}
            @toggle=${this._revealCurrent}
          >
            <summary>
              <grampsjs-icon .path=${mdiBookOpenPageVariant}></grampsjs-icon>
              <span class="title">Danh sách bài viết</span>
              <grampsjs-icon
                class="chevron"
                .path=${mdiChevronDown}
              ></grampsjs-icon>
            </summary>
            <div class="filters">
              <label for="article-search">Tìm bài viết</label>
              <input
                id="article-search"
                type="search"
                placeholder="Tên bài, có hoặc không dấu"
                .value=${this._query}
                @input=${event => {
                  this._query = event.target.value
                }}
              />
              <label for="article-category">Chuyên mục</label>
              <select
                id="article-category"
                .value=${this._category}
                @change=${event => {
                  this._category = event.target.value
                }}
              >
                <option value="">Tất cả chuyên mục</option>
                ${options.map(
                  option => html`<option value=${option}>${option}</option>`
                )}
              </select>
            </div>
            ${this.loading
              ? html`<p class="status" role="status">Đang tải danh sách…</p>`
              : this.error
              ? html`<p class="status" role="status">
                    Chưa tải được danh sách.
                  </p>
                  <button @click=${() => this._updateData()}>Thử lại</button>`
              : html` <p class="count" role="status">
                    ${matches.length} / ${posts.length} bài viết
                  </p>
                  <nav aria-label="Danh sách bài viết">
                    <ul>
                      ${matches.map(
                        post => html` <li>
                          <a
                            href=${`/blog/${encodeURIComponent(
                              post.gramps_id
                            )}`}
                            aria-current=${ifDefined(
                              post.gramps_id === this.currentId
                                ? 'page'
                                : undefined
                            )}
                            @click=${event =>
                              this._openPost(event, post.gramps_id)}
                          >
                            ${post.title || 'Bài viết chưa có tiêu đề'}
                            ${categories(post).length
                              ? html`<span class="category"
                                  >${categories(post).join(' · ')}</span
                                >`
                              : ''}
                            ${post.gramps_id === this.currentId
                              ? html`<span class="current">Đang đọc</span>`
                              : ''}
                          </a>
                        </li>`
                      )}
                    </ul>
                    ${matches.length
                      ? ''
                      : html`<p class="status">
                          ${posts.length
                            ? 'Không có bài phù hợp.'
                            : 'Chưa có bài viết.'}
                        </p>`}
                  </nav>`}
          </details>
        </aside>
        <div class="content"><slot></slot></div>
      </div>
    `
  }

  _openPost(event, id) {
    if (
      event.button !== 0 ||
      event.ctrlKey ||
      event.metaKey ||
      event.shiftKey ||
      event.altKey
    )
      return
    event.preventDefault()
    if (!this.wide) this.shadowRoot.querySelector('details').open = false
    fireEvent(this, 'nav', {path: `blog/${encodeURIComponent(id)}`})
  }

  _handleKeydown(event) {
    if (event.key !== 'Escape') return
    const details = this.shadowRoot.querySelector('details')
    details.open = false
    details.querySelector('summary').focus()
  }
}

window.customElements.define('grampsjs-blog-layout', GrampsjsBlogLayout)
