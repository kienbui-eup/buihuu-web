import {css, html} from 'lit'
import {mdiArchive, mdiBookOpenPageVariant, mdiMagnify} from '@mdi/js'
import {GrampsjsConnectedComponent} from './GrampsjsConnectedComponent.js'
import {heritageFrameStyles} from '../HeritageStyles.js'
import {fireEvent} from '../util.js'
import './GrampsjsIcon.js'

const INDEX_TAG = 'Mục lục nghiên cứu'
const ORIGINAL_TEXTS = 'Văn bản gốc'
const LEADING_GROUPS = [INDEX_TAG, ORIGINAL_TEXTS]
const DESCRIPTIONS = {
  [INDEX_TAG]: 'Lối vào toàn bộ kho sử và các hướng tra cứu chính.',
  [ORIGINAL_TEXTS]:
    'Văn bản do dòng họ lưu truyền, giữ riêng để tiện đối chiếu.',
  'Gia phả và thế thứ':
    'Các đời, ngành chi, hôn nhân, ngày giỗ và phần mộ trong gia phả.',
  'Quê hương và di tích':
    'Chỉ Bồ, nhà thờ tổ, di tích và những thay đổi địa danh.',
  'Nhân vật và nguồn công khai':
    'Nhân vật trong họ qua báo chí, lưu trữ và tư liệu công khai.',
  'Tư liệu và tra cứu': 'Cách tìm, đọc và kiểm tra chéo các nguồn sử liệu.',
  'Hiệu đính và bổ sung':
    'Những điểm còn thiếu, còn khác nhau và cách con cháu góp tư liệu.',
}

export const searchableBlogText = text =>
  (text || '')
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/đ/gi, 'd')
    .toLowerCase()

const tagNames = post => (post.extended?.tags || []).map(tag => tag.name)

export const getBlogCategories = post => {
  const named = tagNames(post)
    .filter(name => name.startsWith('Chuyên mục:'))
    .map(name => name.slice('Chuyên mục:'.length).trim())
    .filter(Boolean)
  if (named.length) return named
  return [tagNames(post).includes(INDEX_TAG) ? INDEX_TAG : ORIGINAL_TEXTS]
}

const groupRank = name => {
  const rank = LEADING_GROUPS.indexOf(name)
  return rank < 0 ? LEADING_GROUPS.length : rank
}

export const compareBlogCategories = (a, b) =>
  groupRank(a) - groupRank(b) || a.localeCompare(b, 'vi')

export const filterBlogPosts = (posts, query = '', category = '') => {
  const needle = searchableBlogText(query.trim())
  return posts
    .filter(
      post =>
        (!category || getBlogCategories(post).includes(category)) &&
        searchableBlogText(post.title).includes(needle)
    )
    .sort(
      (a, b) =>
        compareBlogCategories(
          getBlogCategories(a)[0],
          getBlogCategories(b)[0]
        ) || (a.title || '').localeCompare(b.title || '', 'vi')
    )
}

const groupPosts = posts => {
  const groups = new Map()
  for (const post of posts) {
    const category = getBlogCategories(post)[0]
    if (!groups.has(category)) groups.set(category, [])
    groups.get(category).push(post)
  }
  return [...groups.entries()]
}

export class GrampsjsBlogArchive extends GrampsjsConnectedComponent {
  static get properties() {
    return {_query: {state: true}, _category: {state: true}}
  }

  static get styles() {
    return [
      heritageFrameStyles,
      css`
        :host {
          display: block;
          color: var(--heritage-ink, var(--md-sys-color-on-surface));
        }
        .archive {
          max-width: 76rem;
          margin: 0 auto;
        }
        .archive-hero {
          position: relative;
          overflow: hidden;
          padding: clamp(28px, 5vw, 64px);
          color: var(--md-sys-color-on-primary);
          background: linear-gradient(90deg, #0002 1px, transparent 1px) 0 0 /
              42px 42px,
            linear-gradient(#0002 1px, transparent 1px) 0 0 / 42px 42px,
            var(--md-sys-color-primary);
        }
        .archive-hero::after {
          content: 'BÙI HỮU';
          position: absolute;
          right: clamp(18px, 5vw, 64px);
          bottom: -0.2em;
          color: #fff1;
          font: 700 clamp(64px, 11vw, 150px) / 1
            var(--grampsjs-heading-font-family);
          letter-spacing: 0.04em;
          white-space: nowrap;
          pointer-events: none;
        }
        .eyebrow {
          margin: 0 0 12px;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.18em;
          text-transform: uppercase;
        }
        h1 {
          position: relative;
          z-index: 1;
          margin: 0;
          font: 600 clamp(38px, 6vw, 72px) / 1.05
            var(--grampsjs-heading-font-family);
        }
        .intro {
          position: relative;
          z-index: 1;
          max-width: 48rem;
          margin: 20px 0 0;
          font-size: clamp(16px, 2vw, 20px);
          line-height: 1.65;
        }
        .archive-stats {
          position: relative;
          z-index: 1;
          display: flex;
          margin-top: clamp(28px, 5vw, 48px);
          border-top: 1px solid #fff5;
        }
        .stat {
          min-width: 130px;
          padding: 16px 28px 0 0;
        }
        .stat + .stat {
          padding-left: 28px;
          border-left: 1px solid #fff5;
        }
        .stat strong {
          display: block;
          font: 600 28px/1 var(--grampsjs-heading-font-family);
        }
        .stat span {
          display: block;
          margin-top: 6px;
          font-size: 13px;
        }
        .catalog-tools {
          margin: -1px clamp(16px, 4vw, 48px) 0;
          padding: 22px clamp(16px, 3vw, 32px);
          background: var(--md-sys-color-surface);
          border: 1px solid var(--md-sys-color-outline-variant);
          box-shadow: 0 12px 30px #38251b10;
        }
        .search-box {
          display: grid;
          grid-template-columns: auto minmax(0, 1fr);
          align-items: center;
          gap: 10px;
          max-width: 46rem;
          margin: auto;
          border-bottom: 2px solid var(--md-sys-color-primary);
        }
        .search-box grampsjs-icon {
          color: var(--md-sys-color-primary);
        }
        input {
          width: 100%;
          min-height: 48px;
          box-sizing: border-box;
          padding: 8px 0;
          border: 0;
          outline: 0;
          background: transparent;
          color: inherit;
          font: 500 17px/1.4 var(--grampsjs-body-font-family);
        }
        .category-tabs {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 18px;
          padding-bottom: 2px;
          overflow-x: auto;
          scrollbar-width: thin;
        }
        .category-tabs button {
          display: inline-flex;
          gap: 4px;
          align-items: center;
        }
        button {
          min-height: 42px;
          padding: 8px 14px;
          color: var(--md-sys-color-on-surface-variant);
          background: transparent;
          border: 1px solid var(--md-sys-color-outline-variant);
          border-radius: 2px;
          font: 500 14px/1.3 var(--grampsjs-body-font-family);
          cursor: pointer;
          white-space: nowrap;
        }
        button[aria-pressed='true'] {
          color: var(--md-sys-color-on-primary);
          background: var(--md-sys-color-primary);
          border-color: var(--md-sys-color-primary);
        }
        button[aria-pressed='true'] .number {
          color: inherit;
        }
        :is(input, button, a):focus-visible {
          outline: 2px solid var(--md-sys-color-primary);
          outline-offset: 3px;
        }
        .catalog-body {
          display: grid;
          grid-template-columns: minmax(13rem, 17rem) minmax(0, 1fr);
          gap: clamp(28px, 4vw, 56px);
          padding: clamp(42px, 6vw, 72px) clamp(8px, 2vw, 24px);
        }
        .shelf-index {
          align-self: start;
          position: sticky;
          top: 80px;
          padding: 20px;
          border-top: 3px solid var(--md-sys-color-primary);
          border-bottom: 1px solid var(--md-sys-color-outline-variant);
        }
        .shelf-index h2,
        .records-heading h2 {
          margin: 0;
          font-family: var(--grampsjs-heading-font-family);
          font-weight: 600;
        }
        .shelf-index h2 {
          font-size: 23px;
        }
        .shelf-index ul {
          margin: 16px 0 0;
          padding: 0;
          list-style: none;
        }
        .shelf-index li + li {
          border-top: 1px solid var(--md-sys-color-outline-variant);
        }
        .shelf-index button {
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 12px;
          align-items: center;
          width: 100%;
          min-height: 48px;
          padding-inline: 0;
          text-align: left;
          border: 0;
          white-space: normal;
        }
        .shelf-index button[aria-pressed='true'] {
          color: var(--md-sys-color-primary);
          background: transparent;
          font-weight: 700;
        }
        .number {
          font-variant-numeric: tabular-nums;
          color: var(--md-sys-color-on-surface-variant);
        }
        .result-count {
          margin: 0 0 28px;
          color: var(--md-sys-color-on-surface-variant);
          font-size: 14px;
        }
        .collection + .collection {
          margin-top: 56px;
        }
        .records-heading {
          display: grid;
          grid-template-columns: auto 1fr auto;
          gap: 12px;
          align-items: center;
          margin-bottom: 18px;
        }
        .records-heading grampsjs-icon {
          color: var(--md-sys-color-primary);
        }
        .records-heading h2 {
          font-size: clamp(24px, 3vw, 34px);
        }
        .records-heading .number {
          min-width: 38px;
          padding: 7px 8px;
          color: var(--md-sys-color-primary);
          border: 1px solid var(--md-sys-color-outline-variant);
          text-align: center;
          font-weight: 600;
        }
        .collection-description {
          max-width: 50rem;
          margin: -4px 0 20px 38px;
          color: var(--md-sys-color-on-surface-variant);
          line-height: 1.6;
        }
        .record-list {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 12px;
          margin: 0;
          padding: 0;
          list-style: none;
        }
        .record a {
          display: grid;
          grid-template-columns: auto minmax(0, 1fr);
          gap: 13px;
          min-height: 100%;
          box-sizing: border-box;
          padding: 18px;
          color: inherit;
          background: var(--md-sys-color-surface);
          border: 1px solid var(--md-sys-color-outline-variant);
          border-left: 3px solid var(--md-sys-color-primary);
          text-decoration: none;
          transition: background 140ms, transform 140ms;
        }
        .record a:hover {
          background: var(--md-sys-color-surface-container-low);
          transform: translateY(-2px);
        }
        .record-code {
          color: var(--md-sys-color-primary);
          font: 600 11px/1.4 var(--grampsjs-body-font-family);
          letter-spacing: 0.06em;
        }
        .record-title {
          display: block;
          font: 600 18px/1.35 var(--grampsjs-heading-font-family);
        }
        .record-meta {
          display: block;
          margin-top: 10px;
          color: var(--md-sys-color-on-surface-variant);
          font-size: 13px;
          line-height: 1.4;
        }
        .empty,
        .status {
          padding: 32px;
          text-align: center;
          border: 1px solid var(--md-sys-color-outline-variant);
          color: var(--md-sys-color-on-surface-variant);
        }
        .empty button,
        .status button {
          display: block;
          margin: 16px auto 0;
        }
        @media (max-width: 800px) {
          .catalog-tools {
            margin-inline: 12px;
          }
          .catalog-body {
            display: block;
            padding-inline: 4px;
          }
          .category-tabs {
            flex-wrap: nowrap;
          }
          .shelf-index {
            position: static;
            margin-bottom: 36px;
          }
          .shelf-index ul {
            display: flex;
            gap: 8px;
            overflow-x: auto;
          }
          .shelf-index li + li {
            border: 0;
          }
          .shelf-index button {
            display: block;
            width: auto;
            min-width: max-content;
            padding: 8px 12px;
            border: 1px solid var(--md-sys-color-outline-variant);
          }
          .shelf-index .number {
            margin-left: 6px;
          }
        }
        @media (max-width: 560px) {
          .archive-hero {
            padding: 28px 20px 34px;
          }
          .archive-hero::after,
          .stat:last-child {
            display: none;
          }
          .archive-stats {
            display: grid;
            grid-template-columns: 1fr 1fr;
          }
          .stat {
            min-width: 0;
            padding-right: 14px;
          }
          .stat + .stat {
            padding-left: 14px;
          }
          .catalog-tools {
            padding: 16px;
          }
          .record-list {
            grid-template-columns: 1fr;
          }
          .collection + .collection {
            margin-top: 44px;
          }
          .collection-description {
            margin-left: 0;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .record a {
            transition: none;
          }
        }
      `,
    ]
  }

  constructor() {
    super()
    this._query = ''
    this._category = ''
  }

  firstUpdated() {}

  getUrl() {
    if (!this.active || !this.appState.apiGet) return ''
    const rules = {rules: [{name: 'HasTag', values: ['Blog']}]}
    return `/api/sources/?rules=${encodeURIComponent(
      JSON.stringify(rules)
    )}&sort=gramps_id&extend=tag_list&keys=gramps_id,title,author,pubinfo,change,extended&locale=${
      this.appState.i18n?.lang || 'vi'
    }`
  }

  render() {
    const posts = this._data.data || []
    const names = [...new Set(posts.flatMap(getBlogCategories))].sort(
      compareBlogCategories
    )
    const matches = filterBlogPosts(posts, this._query, this._category)
    const counts = Object.fromEntries(
      names.map(name => [
        name,
        posts.filter(post => getBlogCategories(post).includes(name)).length,
      ])
    )
    return html`<main class="archive">
      <header class="archive-hero">
        <p class="eyebrow">Dòng họ Bùi Hữu · Chỉ Bồ</p>
        <h1>Kho sử dòng họ</h1>
        <p class="intro">
          Nơi lưu giữ lời tựa gia phả, chuyện các cụ, quê hương và những tư liệu
          đang được con cháu cùng nhau kiểm chứng, bổ sung.
        </p>
        <div class="archive-stats" aria-label="Thống kê kho sử">
          <div class="stat">
            <strong>${posts.length || '—'}</strong><span>hồ sơ bài viết</span>
          </div>
          <div class="stat">
            <strong>${names.length || '—'}</strong><span>ngăn tư liệu</span>
          </div>
          <div class="stat">
            <strong>17</strong><span>đời trong gia phả</span>
          </div>
        </div>
      </header>
      <section class="catalog-tools" aria-label="Tra cứu kho sử">
        <label class="search-box"
          ><grampsjs-icon .path=${mdiMagnify}></grampsjs-icon>
          <input
            type="search"
            aria-label="Tìm trong kho sử"
            placeholder="Tìm tên người, địa danh hoặc tên bài viết…"
            .value=${this._query}
            @input=${event => {
              this._query = event.target.value
            }}
        /></label>
        <div class="category-tabs" aria-label="Lọc theo ngăn tư liệu">
          ${this._renderFilter('Tất cả tư liệu', '', posts.length)}
          ${names.map(name => this._renderFilter(name, name, counts[name]))}
        </div>
      </section>
      ${this.loading
        ? html`<p class="status" role="status">Đang mở kho sử…</p>`
        : this.error
        ? html`<div class="status" role="status">
            Chưa mở được kho sử.<button @click=${() => this._updateData()}>
              Thử lại
            </button>
          </div>`
        : html`<div class="catalog-body" id="archive-results">
            <nav
              class="shelf-index heritage-frame"
              aria-label="Các ngăn tư liệu"
            >
              <h2>Các ngăn tư liệu</h2>
              <ul>
                <li>
                  ${this._renderFilter('Toàn bộ kho sử', '', posts.length)}
                </li>
                ${names.map(
                  name =>
                    html`<li>
                      ${this._renderFilter(name, name, counts[name])}
                    </li>`
                )}
              </ul>
            </nav>
            <div class="records">
              <p class="result-count" role="status">
                Tìm thấy ${matches.length} hồ sơ trong ${posts.length} bài viết
              </p>
              ${matches.length
                ? groupPosts(matches).map(([name, group]) =>
                    this._renderCollection(name, group)
                  )
                : html`<div class="empty">
                    Không tìm thấy bài phù hợp.<button
                      @click=${() => {
                        this._query = ''
                        this._category = ''
                      }}
                    >
                      Xem toàn bộ kho sử
                    </button>
                  </div>`}
            </div>
          </div>`}
    </main>`
  }

  _renderFilter(label, value, count) {
    return html`<button
      aria-pressed=${this._category === value}
      @click=${() => {
        this._category = value
      }}
    >
      <span>${label}</span><span class="number">(${count})</span>
    </button>`
  }

  _renderCollection(name, posts) {
    const id = `collection-${searchableBlogText(name).replace(/\s+/g, '-')}`
    return html`<section class="collection" aria-labelledby=${id}>
      <header class="records-heading">
        <grampsjs-icon
          .path=${name === INDEX_TAG ? mdiBookOpenPageVariant : mdiArchive}
        ></grampsjs-icon>
        <h2 id=${id}>${name}</h2>
        <span class="number">${posts.length}</span>
      </header>
      <p class="collection-description">
        ${DESCRIPTIONS[name] ||
        'Các bài viết và tư liệu đã được sắp theo nội dung để tiện tra cứu.'}
      </p>
      <ol class="record-list">
        ${posts.map(
          post => html`<li class="record">
            <a
              href=${`/blog/${encodeURIComponent(post.gramps_id)}`}
              @click=${event => this._openPost(event, post.gramps_id)}
              ><span class="record-code">${post.gramps_id}</span>
              <span
                ><span class="record-title"
                  >${post.title || 'Bài viết chưa có tiêu đề'}</span
                >
                <span class="record-meta"
                  >${post.pubinfo || 'Tư liệu đang được bổ sung'}</span
                ></span
              ></a
            >
          </li>`
        )}
      </ol>
    </section>`
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
    fireEvent(this, 'nav', {path: `blog/${encodeURIComponent(id)}`})
  }
}

window.customElements.define('grampsjs-blog-archive', GrampsjsBlogArchive)
