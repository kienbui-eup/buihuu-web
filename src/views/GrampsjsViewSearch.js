import {html, css} from 'lit'
import {live} from 'lit/directives/live.js'
import {
  mdiMagnify,
  mdiClose,
  mdiChevronDown,
  mdiChevronRight,
  mdiChevronLeft,
} from '@mdi/js'
import {GrampsjsView} from './GrampsjsView.js'
import {
  objectTypeToEndpoint,
  objectIconPath,
  objectDescription,
  objectDetail,
  fireEvent,
} from '../util.js'
import {getCourtesyName, getLineage, getLifeSpan} from '../charts/util.js'
import {searchPlaces, placeAddress} from '../placeSearch.js'
import {renderIcon} from '../objectRender.js'
import '../components/GrampsjsIcon.js'
import '../components/GrampsjsPillToggle.js'

const objectTypes = [
  'person',
  'family',
  'event',
  'place',
  'source',
  'citation',
  'repository',
  'note',
  'media',
]
const pageSize = 20
const BASE_DIR = ''

export class GrampsjsViewSearch extends GrampsjsView {
  static get styles() {
    return [
      super.styles,
      css`
        .search-page {
          max-width: 880px;
          margin: 0 auto;
        }
        label {
          display: block;
          font-weight: 500;
          margin-bottom: 10px;
        }
        .search-box {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 5px;
          border: 1px solid var(--md-sys-color-outline);
          border-radius: 2px;
          background: var(--md-sys-color-surface);
        }
        .search-box:focus-within {
          border-color: var(--md-sys-color-primary);
          outline: 2px solid var(--md-sys-color-primary);
          outline-offset: -2px;
        }
        .search-box > grampsjs-icon {
          margin-inline: 8px;
        }
        input {
          width: 100%;
          min-width: 0;
          flex: 1;
          height: 44px;
          padding: 0 4px;
          border: 0;
          outline: none;
          background: transparent;
          color: var(--md-sys-color-on-surface);
          font: inherit;
          font-size: 16px;
        }
        input::placeholder {
          color: var(--md-sys-color-on-surface-variant);
        }
        input::-webkit-search-cancel-button {
          display: none;
        }
        button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          min-height: 44px;
          padding: 8px 14px;
          border: 1px solid var(--md-sys-color-outline-variant);
          border-radius: 2px;
          background: transparent;
          color: var(--md-sys-color-primary);
          font: inherit;
          font-size: 14px;
          cursor: pointer;
        }
        button:hover {
          background: var(--md-sys-color-surface-container);
        }
        button:focus-visible,
        summary:focus-visible,
        a:focus-visible {
          outline: 2px solid var(--md-sys-color-primary);
          outline-offset: 2px;
        }
        button:disabled {
          opacity: 0.45;
          cursor: default;
        }
        .search-submit {
          background: var(--md-sys-color-primary);
          color: var(--md-sys-color-on-primary);
          border-color: transparent;
          padding-inline: 20px;
          font-weight: 500;
        }
        .search-submit:hover {
          background: var(--md-sys-color-primary);
          filter: brightness(1.1);
        }
        .clear-search {
          border: 0;
          padding: 0;
          min-width: 44px;
        }
        .clear-search[hidden] {
          display: none;
        }
        .field-hint {
          margin: 10px 0 16px;
          font-size: 13px;
          color: var(--md-sys-color-on-surface-variant);
        }
        details {
          border-top: 1px solid var(--md-sys-color-outline-variant);
        }
        summary {
          display: flex;
          align-items: center;
          gap: 10px;
          min-height: 48px;
          padding-top: 4px;
          list-style: none;
          cursor: pointer;
          font-size: 14px;
        }
        summary::-webkit-details-marker {
          display: none;
        }
        .scope-label {
          flex: 1;
          min-width: 0;
          overflow-wrap: anywhere;
        }
        .scope-action {
          color: var(--md-sys-color-primary);
          font-size: 13px;
        }
        details[open] .scope-chevron {
          transform: rotate(180deg);
        }
        .filters {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          padding-block: 12px 8px;
        }
        .filters button[aria-pressed='true'] {
          background: var(--md-sys-color-primary);
          color: var(--md-sys-color-on-primary);
          border-color: transparent;
        }
        .scope-short {
          display: none;
        }
        .mode-toggle {
          margin-top: 12px;
          --grampsjs-pill-toggle-font-size: 13px;
        }
        .results {
          margin-top: 28px;
          scroll-margin-top: 80px;
          overflow-wrap: anywhere;
        }
        .results-heading {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 4px 16px;
          margin-bottom: 14px;
        }
        h3 {
          font: 600 17px/1.6 var(--grampsjs-body-font-family);
          margin: 0;
        }
        .query-label {
          margin: 2px 0 0;
          overflow-wrap: anywhere;
          font-size: 14px;
          color: var(--md-sys-color-on-surface-variant);
        }
        .result-range {
          font-size: 13px;
          color: var(--md-sys-color-on-surface-variant);
        }
        .result-list {
          list-style: none;
          padding: 6px;
          margin: 0;
        }
        .result-list li + li {
          border-top: 1px solid var(--md-sys-color-outline-variant);
        }
        .result-link {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 18px 16px;
          text-decoration: none;
          color: var(--md-sys-color-on-surface);
        }
        .result-link:hover {
          background: var(--md-sys-color-surface-container);
        }
        .result-avatar {
          --grampsjs-color-icon: var(--md-sys-color-primary);
          display: grid;
          place-items: center;
          width: 40px;
          height: 40px;
          flex: 0 0 40px;
          background: var(--md-sys-color-surface-container);
          border-radius: 50%;
        }
        .result-copy {
          flex: 1;
          min-width: 0;
          overflow-wrap: anywhere;
        }
        .result-name {
          display: block;
          font-weight: 600;
          line-height: 1.5;
        }
        .result-detail,
        .result-lineage {
          display: block;
          font-size: 14px;
          line-height: 1.65;
          margin-top: 3px;
        }
        .result-lineage {
          color: var(--md-sys-color-primary);
        }
        .result-detail {
          color: var(--md-sys-color-on-surface-variant);
        }
        .result-arrow {
          flex: 0 0 auto;
        }
        .empty-state {
          padding: 22px 0;
          max-width: 520px;
        }
        .empty-state p {
          margin: 8px 0 0;
          color: var(--md-sys-color-on-surface-variant);
          font-size: 15px;
        }
        .empty-state button {
          margin-top: 16px;
        }
        .pagination {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 8px;
          margin-top: 20px;
          font-size: 13px;
        }
        @media (max-width: 768px) {
          :host {
            margin: 20px 16px;
          }
          .search-box > grampsjs-icon {
            display: none;
          }
          .search-submit {
            padding-inline: 14px;
          }
          .quick-scopes {
            display: grid;
            grid-template-columns: 1fr 1.3fr 1fr;
            gap: 6px;
            padding-top: 0;
          }
          .quick-scopes button {
            padding-inline: 6px;
            font-size: 13px;
          }
          .scope-full {
            display: none;
          }
          .scope-short {
            display: inline;
          }
          .result-link {
            gap: 10px;
            padding: 14px 10px;
          }
          .result-arrow {
            display: none;
          }
          .results {
            margin-top: 22px;
          }
        }
      `,
    ]
  }

  static get properties() {
    return {
      semantic: {type: Boolean},
      dbInfo: {type: Object},
      _data: {state: true},
      _totalCount: {state: true},
      _page: {state: true},
      _pages: {state: true},
      _objectTypes: {state: true},
      _query: {state: true},
      _submittedQuery: {state: true},
      _tags: {state: true},
    }
  }

  constructor() {
    super()
    this.semantic = false
    this.dbInfo = {}
    this._data = []
    this._totalCount = -1
    this._page = 1
    this._pages = 0
    this._objectTypes = {person: true}
    this._query = ''
    this._submittedQuery = ''
    this._tags = []
    this._searchRequest = 0
  }

  renderContent() {
    const onlyPeople = this._onlyPeople()
    const onlyPlaces = this._onlyPlaces()
    return html`
      <div class="search-page">
        <header class="page-heading">
          <p class="section-label">Tra cứu gia phả</p>
          <h2>${this._('Search')}</h2>
          <p class="lead">
            Tìm người thân và những thông tin đã ghi trong gia phả.
          </p>
        </header>
        <section class="search-panel" aria-label="Tìm trong gia phả">
          <form role="search" @submit="${this._handleSubmit}">
            <label for="search-field"
              >${onlyPeople
                ? 'Họ tên hoặc tên tự'
                : onlyPlaces
                ? 'Tên địa danh hoặc địa chỉ'
                : 'Thông tin cần tìm'}</label
            >
            <div class="search-box">
              <grampsjs-icon
                path="${mdiMagnify}"
                color="currentColor"
              ></grampsjs-icon>
              <input
                id="search-field"
                type="search"
                enterkeyhint="search"
                autocomplete="off"
                aria-describedby="search-hint"
                placeholder="${onlyPeople
                  ? 'Nhập tên cần tìm…'
                  : 'Nhập từ khóa…'}"
                .value="${live(this._query)}"
                @input="${this._handleInput}"
                @keydown="${this._handleSearchKey}"
              />
              <button
                class="clear-search"
                type="button"
                aria-label="Xóa từ khóa"
                ?hidden="${!this._query}"
                @click="${this._clearAndFocus}"
              >
                <grampsjs-icon
                  path="${mdiClose}"
                  color="currentColor"
                  width="20"
                  height="20"
                ></grampsjs-icon>
              </button>
              <button class="search-submit" type="submit">Tìm</button>
            </div>
            <p class="field-hint" id="search-hint">
              ${onlyPeople
                ? 'Có thể nhập một phần tên, không cần nhớ đầy đủ họ tên.'
                : onlyPlaces
                ? 'Tìm theo tên, tên cũ hoặc địa chỉ thôn, xã, huyện, tỉnh đã ghi trong gia phả. Có thể nhập không dấu.'
                : 'Tìm theo tên hoặc nội dung đã ghi của loại dữ liệu được chọn.'}
            </p>
          </form>
          ${this._renderQuickScopes()} ${this.renderFilters()}
          ${this._semanticEnabled() ? this._renderModeToggle() : ''}
        </section>
        <section
          class="results"
          aria-label="Kết quả tìm kiếm"
          aria-busy="${this.loading}"
        >
          <div role="status" aria-live="polite" aria-atomic="true">
            ${this._renderStatus()}
          </div>
          ${!this.loading && !this.error && this._data.length
            ? html`<ul class="result-list heritage-frame">
                ${this._data.map(obj => this._renderResult(obj))}
              </ul>`
            : ''}
          ${!this.loading && !this.error && this._pages > 1
            ? html`<nav class="pagination" aria-label="Trang kết quả">
                <button
                  type="button"
                  aria-label="Trang trước"
                  ?disabled="${this._page <= 1}"
                  @click="${() => this._changePage(this._page - 1)}"
                >
                  <grampsjs-icon
                    path="${mdiChevronLeft}"
                    color="currentColor"
                    width="18"
                    height="18"
                  ></grampsjs-icon
                  >Trước
                </button>
                <span>Trang ${this._page} / ${this._pages}</span>
                <button
                  type="button"
                  aria-label="Trang sau"
                  ?disabled="${this._page >= this._pages}"
                  @click="${() => this._changePage(this._page + 1)}"
                >
                  Sau<grampsjs-icon
                    path="${mdiChevronRight}"
                    color="currentColor"
                    width="18"
                    height="18"
                  ></grampsjs-icon>
                </button>
              </nav>`
            : ''}
        </section>
      </div>
    `
  }

  _renderStatus() {
    if (this.loading) return html`<p>Đang tìm “${this._submittedQuery}”…</p>`
    if (this.error)
      return html`<div class="empty-state">
        <h3>Chưa tải được kết quả</h3>
        <p>Kiểm tra kết nối rồi thử tìm lại.</p>
        <button
          type="button"
          @click="${() =>
            this._executeSearch(this._page, this._submittedQuery)}"
        >
          Thử lại
        </button>
      </div>`
    if (this._totalCount < 0)
      return html`<div class="empty-state">
        <h3>
          ${this._onlyPeople()
            ? 'Bạn muốn tìm ai trong gia phả?'
            : 'Bạn muốn tìm thông tin gì?'}
        </h3>
        <p>
          ${this._onlyPeople()
            ? 'Nhập tên ở ô phía trên. Đời, ngành chi và ngày giỗ sẽ giúp bạn nhận ra đúng người khi có nhiều người trùng tên.'
            : 'Chọn phạm vi và nhập từ khóa ở ô phía trên để bắt đầu.'}
        </p>
      </div>`
    if (this._totalCount === 0)
      return html`<div class="empty-state">
        <h3>Chưa tìm thấy kết quả</h3>
        <p class="query-label">Với từ khóa “${this._submittedQuery}”.</p>
        <p>
          Thử bớt từ trong tên hoặc kiểm tra lại cách viết. Bạn cũng có thể đổi
          phạm vi tìm kiếm phía trên.
        </p>
        <button type="button" @click="${this._focus}">Sửa từ khóa</button>
      </div>`
    return html`<div class="results-heading">
      <div>
        <h3>
          ${this._totalCount}
          ${this._onlyPeople() ? 'người được tìm thấy' : 'kết quả'}
        </h3>
        <p class="query-label">Với từ khóa “${this._submittedQuery}”</p>
      </div>
      ${this._pages > 1
        ? html`<span class="result-range"
            >${(this._page - 1) * pageSize + 1}–${Math.min(
              this._page * pageSize,
              this._totalCount
            )}
            / ${this._totalCount}</span
          >`
        : ''}
    </div>`
  }

  _renderResult(obj) {
    const person = obj.object_type === 'person'
    const address = obj.object_type === 'place' ? placeAddress(obj.object) : ''
    const aliases =
      obj.object_type === 'place'
        ? (obj.object.profile?.alternate_names || []).filter(Boolean)
        : []
    const detail = person
      ? getLifeSpan(obj.object, obj.object.profile)
      : obj.object_type === 'place'
      ? ''
      : objectDetail(
          obj.object_type,
          obj.object,
          this.appState.i18n.strings
        ).trim()
    const courtesy = person ? getCourtesyName(obj.object) : ''
    const lineage = person ? this._personLineage(obj.object) : ''
    const path = `${obj.object_type}/${obj.object.gramps_id}`
    return html`<li>
      <a
        class="result-link"
        href="${BASE_DIR}/${path}"
        @click="${event => this._handleResultClick(event, path)}"
      >
        <span class="result-avatar" aria-hidden="true">${renderIcon(obj)}</span>
        <span class="result-copy">
          <span class="result-name"
            >${objectDescription(
              obj.object_type,
              obj.object,
              this.appState.i18n.strings
            )}</span
          >
          ${courtesy
            ? html`<span class="result-detail">${courtesy}</span>`
            : ''}
          ${lineage ? html`<span class="result-lineage">${lineage}</span>` : ''}
          ${detail ? html`<span class="result-detail">${detail}</span>` : ''}
          ${address ? html`<span class="result-detail">${address}</span>` : ''}
          ${aliases.length
            ? html`<span class="result-detail"
                >Tên khác: ${aliases.join('; ')}</span
              >`
            : ''}
          ${!person
            ? html`<span class="result-detail"
                >${this._typeLabel(obj.object_type)} ·
                ${obj.object.gramps_id}</span
              >`
            : ''}
          ${person && !lineage && !detail
            ? html`<span class="result-detail"
                >Mã gia phả: ${obj.object.gramps_id}</span
              >`
            : ''}
        </span>
        <grampsjs-icon
          class="result-arrow"
          path="${mdiChevronRight}"
          color="currentColor"
          width="20"
          height="20"
        ></grampsjs-icon>
      </a>
    </li>`
  }

  _personLineage(person) {
    const lineage = getLineage(person)
    const tags =
      person.extended?.tags ||
      this._tags.filter(tag => person.tag_list?.includes(tag.handle))
    const branches = [
      ...new Set(
        tags
          .map(tag => tag.name?.normalize('NFC').trim())
          .filter(name => /^(ngành|chi)\b/iu.test(name || ''))
      ),
    ]
    return [lineage, ...branches.filter(name => !lineage.includes(name))]
      .filter(Boolean)
      .join(' · ')
  }

  _handleResultClick(event, path) {
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return
    event.preventDefault()
    fireEvent(this, 'nav', {path})
  }

  _typeLabel(type) {
    if (type === 'place') return 'Địa danh, địa chỉ'
    const endpoint = objectTypeToEndpoint[type] || type
    return this._(`${endpoint.charAt(0).toUpperCase()}${endpoint.slice(1)}`)
  }

  _renderQuickScopes() {
    const selected = this._getSelectedObjectTypes()
    return html`<div
      class="filters quick-scopes"
      role="group"
      aria-label="Phạm vi tìm nhanh"
    >
      ${[
        {type: 'person', label: 'Người trong họ', short: 'Người'},
        {type: 'place', label: 'Địa danh, địa chỉ', short: 'Địa danh'},
        {type: '', label: 'Tất cả', short: 'Tất cả'},
      ].map(
        ({type, label, short}) => html`<button
          type="button"
          aria-label="${label}"
          aria-pressed="${type
            ? selected.length === 1 && selected[0] === type
            : selected.length === objectTypes.length}"
          @click="${() => this._selectScope(type)}"
        >
          <span class="scope-full">${label}</span>
          <span class="scope-short">${short}</span>
        </button>`
      )}
    </div>`
  }

  _selectScope(type) {
    const query = this._query
    this.setSearchScope(type)
    this._query = query
    if (query.trim()) this._executeSearch()
    this._focus()
  }

  renderFilters() {
    const selected = this._getSelectedObjectTypes()
    return html`<details>
      <summary>
        <span class="scope-label"
          >Đang tìm:
          <strong
            >${selected.length === objectTypes.length
              ? 'Tất cả'
              : selected.map(key => this._typeLabel(key)).join(', ')}</strong
          ></span
        ><span class="scope-action"
          >${this._onlyPeople() ? 'Tìm loại khác' : 'Đổi phạm vi'}</span
        ><grampsjs-icon
          class="scope-chevron"
          path="${mdiChevronDown}"
          color="currentColor"
          width="18"
          height="18"
        ></grampsjs-icon>
      </summary>
      <div class="filters" role="group" aria-label="Loại dữ liệu cần tìm">
        ${objectTypes.map(
          key =>
            html`<button
              type="button"
              id="toggle-${key}"
              aria-pressed="${!!this._objectTypes[key]}"
              @click="${() => this._handleFilterToggle(key)}"
            >
              <grampsjs-icon
                path="${objectIconPath[key]}"
                color="currentColor"
                width="18"
                height="18"
              ></grampsjs-icon
              >${this._typeLabel(key)}
            </button>`
        )}
      </div>
      <p class="field-hint">
        Chọn một hoặc nhiều loại dữ liệu. Luôn giữ ít nhất một loại.
      </p>
    </details>`
  }

  _renderModeToggle() {
    return html`<div class="mode-toggle">
      <grampsjs-pill-toggle
        .options="${[
          {label: this._('full-text'), value: false},
          {label: this._('semantic'), value: true},
        ]}"
        .selected="${this.semantic}"
        .appState="${this.appState}"
        .ariaLabel="${this._('Search mode')}"
        @pill-toggle:change="${this._handleModeClick}"
      ></grampsjs-pill-toggle>
    </div>`
  }

  _semanticEnabled() {
    return (
      !this._onlyPlaces() &&
      !!this.dbInfo?.server?.semantic_search &&
      !!this.dbInfo?.search?.sifts?.count_semantic &&
      this.dbInfo?.search?.sifts?.semantic_index_stale !== true
    )
  }

  _handleModeClick(event) {
    this.semantic = event.detail.value
    this._executeSearch()
  }

  _handleFilterToggle(key) {
    if (this._objectTypes[key] && this._getSelectedObjectTypes().length === 1)
      return
    this._objectTypes = {...this._objectTypes, [key]: !this._objectTypes[key]}
    this._resetResults()
    clearTimeout(this._filterTimer)
    if (this._query.trim())
      this._filterTimer = window.setTimeout(() => this._executeSearch(), 300)
  }

  _getSelectedObjectTypes() {
    return objectTypes.filter(key => this._objectTypes[key])
  }

  _onlyPeople() {
    const selected = this._getSelectedObjectTypes()
    return selected.length === 1 && selected[0] === 'person'
  }

  _onlyPlaces() {
    const selected = this._getSelectedObjectTypes()
    return selected.length === 1 && selected[0] === 'place'
  }

  firstUpdated() {
    super.firstUpdated()
    this._focus()
  }

  openSearch() {
    this._focus()
  }

  setSearchScope(type) {
    this._objectTypes = Object.fromEntries(
      objectTypes.map(key => [key, !type || key === type])
    )
    this._clearAll()
  }

  async _focus() {
    if (!this.active) return
    await this.updateComplete
    if (this.active && this.isConnected)
      this.renderRoot.querySelector('#search-field')?.focus()
  }

  _resetResults() {
    this._searchRequest += 1
    this._data = []
    this._totalCount = -1
    this._page = 1
    this._pages = 0
    this.loading = false
    this.error = false
  }

  _clearAll() {
    clearTimeout(this._filterTimer)
    this._query = ''
    this._submittedQuery = ''
    this._resetResults()
  }

  _clearAndFocus() {
    this._clearAll()
    this._focus()
  }

  updated(changed) {
    super.updated(changed)
    if (!this.active) return
    if (changed.has('active')) this._focus()
    const encodedQuery = this.appState.path?.pageId || ''
    if (encodedQuery === this._routeQuery) return
    this._routeQuery = encodedQuery
    if (!encodedQuery) return
    try {
      this._query = decodeURIComponent(encodedQuery)
    } catch {
      this._query = encodedQuery
    }
    this._objectTypes = {person: true}
    this._executeSearch()
  }

  _handleInput(event) {
    this._query = event.target.value
    if (!this._query.trim()) this._clearAll()
  }

  _handleSearchKey(event) {
    if (event.key !== 'Escape' || event.isComposing) return
    event.preventDefault()
    if (this._query) this._clearAll()
    else this.renderRoot.querySelector('#search-field')?.blur()
  }

  _handleSubmit(event) {
    event.preventDefault()
    this._executeSearch()
    this.renderRoot.querySelector('#search-field')?.blur()
  }

  async _changePage(page) {
    if (page < 1 || page > this._pages || this.loading) return
    await this._executeSearch(page, this._submittedQuery)
    await this.updateComplete
    this.renderRoot.querySelector('.results')?.scrollIntoView({block: 'start'})
  }

  async _executeSearch(page = 1, query = this._query) {
    clearTimeout(this._filterTimer)
    query = query.trim()
    if (!query) {
      this._clearAll()
      return
    }
    this._submittedQuery = query
    this._page = page
    this.loading = true
    this.error = false
    this._data = []
    this._totalCount = -1
    this._pages = 0
    if (window._oldSearchBackend && !this._onlyPlaces())
      query = `${query} (${this._getSelectedObjectTypes()
        .map(key => `type:${key}`)
        .join(' OR ')})`
    await this._fetchData(query, page)
  }

  async _fetchData(query, page) {
    const request = ++this._searchRequest
    if (this._onlyPlaces()) {
      const response = await this.appState.apiGet(
        `/api/places/?profile=all&locale=${this.appState.i18n.lang || 'en'}`
      )
      if (request !== this._searchRequest) return
      this.loading = false
      if ('data' in response) {
        const matches = searchPlaces(response.data, query)
        this.error = false
        this._totalCount = matches.length
        this._pages = Math.ceil(matches.length / pageSize)
        this._data = matches
          .slice((page - 1) * pageSize, page * pageSize)
          .map(object => ({
            object_type: 'place',
            object,
          }))
      } else {
        this.error = true
        this._errorMessage = response.error
        this._errorDetail = response.errorDetail || {}
      }
      return
    }
    let url = `/api/search/?query=${encodeURIComponent(query)}&locale=${
      this.appState.i18n.lang || 'en'
    }&profile=all&page=${page}&pagesize=${pageSize}`
    if (this._semanticEnabled()) url += `&semantic=${this.semantic ? 1 : 0}`
    if (!window._oldSearchBackend)
      url += `&type=${this._getSelectedObjectTypes().join(',')}`
    const data = await this.appState.apiGet(url)
    if (request !== this._searchRequest) return
    if ('data' in data) {
      // Search trả về mã nhãn. Đọc tên ngành chi theo trang, tránh gọi riêng từng người.
      if (
        data.data.some(
          obj => obj.object_type === 'person' && obj.object?.tag_list?.length
        )
      ) {
        const tags = await this.appState.apiGet('/api/tags/')
        if (request !== this._searchRequest) return
        this._tags = tags.data || []
      }
      this._data = data.data
      const total = parseInt(data.total_count, 10)
      this._totalCount = Number.isFinite(total) ? total : data.data.length
      this._pages = Math.ceil(this._totalCount / pageSize)
    } else {
      this.error = true
      this._errorMessage = data.error
      this._errorDetail = data.errorDetail || {}
    }
    this.loading = false
  }

  disconnectedCallback() {
    clearTimeout(this._filterTimer)
    this._searchRequest += 1
    super.disconnectedCallback()
  }
}
window.customElements.define('grampsjs-view-search', GrampsjsViewSearch)
