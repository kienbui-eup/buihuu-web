import {css, html} from 'lit'
import {
  mdiArchive,
  mdiBookOpenPageVariant,
  mdiChevronRight,
  mdiMagnify,
} from '@mdi/js'
import {GrampsjsConnectedComponent} from './GrampsjsConnectedComponent.js'
import {heritageFrameStyles} from '../HeritageStyles.js'
import {fireEvent} from '../util.js'
import {PLACE_SHORT} from '../branding.js'
import {
  SHELF_DESCRIPTIONS as DESCRIPTIONS,
  compareBlogCategories,
  filterBlogPosts,
  getBlogCategories,
  isIndexPost,
  latestBlogUpdate,
  searchableBlogText,
} from '../blogShelves.js'
import './GrampsjsIcon.js'

// Trang Kho sử: một biển đầu trang ngắn, ô tìm, một dãy ngăn duy nhất (cột trái
// giữ vị trí khi cuộn trên màn rộng, dải dính dưới thanh đầu trang trên điện
// thoại) và các hồ sơ bài viết nhóm theo ngăn. Bài mục lục không nằm trong ngăn
// nào mà là lối vào đặt trên cùng.

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
          padding: clamp(24px, 4vw, 52px) clamp(20px, 5vw, 64px);
          color: var(--heritage-ink);
          background: transparent;
          border-top: 2px solid var(--heritage-gold);
          border-bottom: 1px solid var(--heritage-rule);
        }
        .archive-hero::after {
          content: none;
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
          margin: 0 0 10px;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.18em;
          text-transform: uppercase;
        }
        h1 {
          position: relative;
          z-index: 1;
          margin: 0;
          font: 500 clamp(30px, 4vw, 48px) / 1.1
            var(--grampsjs-heading-font-family);
        }
        .intro {
          position: relative;
          z-index: 1;
          max-width: 46rem;
          margin: 14px 0 0;
          font-size: clamp(15px, 1.6vw, 19px);
          line-height: 1.6;
        }
        .archive-facts {
          position: relative;
          z-index: 1;
          display: flex;
          flex-wrap: wrap;
          gap: 4px 0;
          margin: clamp(18px, 3vw, 30px) 0 0;
          padding-top: 14px;
          border-top: 1px solid var(--heritage-rule);
          font-size: 14px;
        }
        .archive-facts span + span::before {
          content: '·';
          margin: 0 10px;
          opacity: 0.7;
        }
        .archive-facts strong {
          font-weight: 700;
        }
        .catalog-tools {
          margin: -1px clamp(16px, 4vw, 48px) 0;
          padding: 16px clamp(16px, 3vw, 32px);
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
        :is(input, button, a):focus-visible {
          outline: 2px solid var(--md-sys-color-primary);
          outline-offset: 3px;
        }
        .catalog-body {
          display: grid;
          grid-template-columns: minmax(13rem, 17rem) minmax(0, 1fr);
          gap: clamp(28px, 4vw, 56px);
          padding: clamp(36px, 5vw, 60px) clamp(8px, 2vw, 24px) 24px;
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
        .records {
          scroll-margin-top: 96px;
        }
        .guide {
          display: grid;
          grid-template-columns: auto minmax(0, 1fr) auto;
          gap: 14px;
          align-items: center;
          margin: 0 0 28px;
          padding: 14px 16px;
          color: inherit;
          background: var(--md-sys-color-secondary-container);
          border: 1px solid var(--md-sys-color-outline-variant);
          border-left: 3px solid var(--md-sys-color-primary);
          text-decoration: none;
        }
        .guide grampsjs-icon {
          color: var(--md-sys-color-primary);
        }
        .guide-label {
          display: block;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--md-sys-color-primary);
        }
        .guide-title {
          display: block;
          margin-top: 2px;
          font: 600 17px/1.35 var(--grampsjs-heading-font-family);
        }
        .result-count {
          margin: 0 0 24px;
          color: var(--md-sys-color-on-surface-variant);
          font-size: 14px;
        }
        .collection + .collection {
          margin-top: 48px;
        }
        .records-heading {
          display: grid;
          grid-template-columns: auto 1fr auto;
          gap: 12px;
          align-items: center;
          margin-bottom: 14px;
        }
        .records-heading grampsjs-icon {
          color: var(--md-sys-color-primary);
        }
        .records-heading h2 {
          font-size: clamp(23px, 3vw, 32px);
          line-height: 1.2;
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
          margin: -2px 0 18px 38px;
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
          margin-top: 8px;
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
        @media (max-width: 768px) {
          .catalog-tools {
            margin-inline: 12px;
          }
          .catalog-body {
            display: block;
            padding: 16px 0 8px;
          }
          .records {
            scroll-margin-top: 132px;
          }
          /* Dải ngăn dính dưới thanh đầu trang, tràn hai mép để thành một
             thanh liền; bỏ khung giấy của .heritage-frame. */
          .shelf-index.heritage-frame {
            position: sticky;
            top: 64px;
            z-index: 2;
            margin: 0 -16px 20px;
            padding: 8px 16px 10px;
            border: 0;
            border-bottom: 1px solid var(--md-sys-color-outline-variant);
            border-radius: 0;
            background: var(--md-sys-color-surface);
            box-shadow: 0 6px 14px -10px #38251b40;
          }
          .shelf-index h2 {
            position: absolute;
            width: 1px;
            height: 1px;
            overflow: hidden;
            clip-path: inset(50%);
          }
          .shelf-index ul {
            display: flex;
            gap: 8px;
            margin: 0;
            overflow-x: auto;
            scrollbar-width: none;
          }
          .shelf-index ul::-webkit-scrollbar {
            display: none;
          }
          .shelf-index li + li {
            border: 0;
          }
          .shelf-index button {
            display: inline-flex;
            gap: 6px;
            width: auto;
            min-width: max-content;
            min-height: 40px;
            padding: 6px 12px;
            border: 1px solid var(--md-sys-color-outline-variant);
            white-space: nowrap;
          }
          .shelf-index button[aria-pressed='true'] {
            color: var(--md-sys-color-on-primary);
            background: var(--md-sys-color-primary);
            border-color: var(--md-sys-color-primary);
          }
          .shelf-index button[aria-pressed='true'] .number {
            color: inherit;
          }
          .guide {
            margin-bottom: 24px;
            padding: 12px 14px;
          }
          .guide-title {
            font-size: 16px;
          }
          .record-list {
            grid-template-columns: 1fr;
            gap: 10px;
          }
          .record a {
            grid-template-columns: minmax(0, 1fr);
            gap: 0;
            padding: 14px 16px;
          }
          .record-code {
            display: none;
          }
          .record-title {
            font-size: 17px;
          }
          .collection + .collection {
            margin-top: 40px;
          }
          .collection-description {
            margin-left: 0;
            font-size: 15px;
          }
        }
        @media (max-width: 560px) {
          .archive-hero {
            padding: 22px 20px 24px;
          }
          .archive-hero::after,
          .eyebrow-province {
            display: none;
          }
          .archive-facts {
            margin-top: 16px;
            padding-top: 12px;
            font-size: 13px;
          }
          .catalog-tools {
            padding: 12px 16px;
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
    const all = this._data.data || []
    const guide = all.find(isIndexPost)
    const posts = all.filter(post => !isIndexPost(post))
    const names = [...new Set(posts.flatMap(getBlogCategories))].sort(
      compareBlogCategories
    )
    const counts = Object.fromEntries(
      names.map(name => [
        name,
        posts.filter(post => getBlogCategories(post).includes(name)).length,
      ])
    )
    const matches = filterBlogPosts(posts, this._query, this._category)
    const updated = latestBlogUpdate(all)
    return html`<main class="archive">
      <header class="archive-hero">
        <p class="eyebrow">
          ${PLACE_SHORT}<span class="eyebrow-province"> · Thái Bình</span>
        </p>
        <h1>Kho sử tộc Bùi Hữu</h1>
        <p class="intro">
          Văn bản gốc của dòng họ, nguồn gốc và thế thứ, nhân vật, quê hương và
          nhà thờ tổ; con cháu cùng đọc, kiểm chứng và bổ sung.
        </p>
        ${posts.length
          ? html`<p class="archive-facts">
              <span><strong>${posts.length}</strong> bài</span>
              <span><strong>${names.length}</strong> ngăn tư liệu</span>
              ${updated ? html`<span>Cập nhật ${updated}</span>` : ''}
            </p>`
          : ''}
      </header>
      <section class="catalog-tools" aria-label="Tìm trong kho sử">
        <label class="search-box"
          ><grampsjs-icon .path=${mdiMagnify}></grampsjs-icon>
          <input
            type="search"
            aria-label="Tìm theo tên bài, người soạn, nơi hoặc năm"
            placeholder="Tìm bài trong kho sử…"
            .value=${this._query}
            @input=${event => {
              this._query = event.target.value
            }}
        /></label>
      </section>
      ${this.loading
        ? html`<p class="status" role="status">Đang mở kho sử…</p>`
        : this.error
        ? html`<div class="status" role="status">
            Chưa mở được kho sử.<button @click=${() => this._updateData()}>
              Thử lại
            </button>
          </div>`
        : html`<div class="catalog-body">
            <nav
              class="shelf-index heritage-frame"
              aria-label="Các ngăn tư liệu"
            >
              <h2>Các ngăn tư liệu</h2>
              <ul>
                <li>${this._renderFilter('Toàn bộ', '', posts.length)}</li>
                ${names.map(
                  name =>
                    html`<li>
                      ${this._renderFilter(name, name, counts[name])}
                    </li>`
                )}
              </ul>
            </nav>
            <div class="records">
              ${guide ? this._renderGuide(guide) : ''}
              ${this._query.trim()
                ? html`<p class="result-count" role="status">
                    ${this._describeMatches(matches.length)}
                  </p>`
                : ''}
              ${matches.length
                ? groupPosts(matches).map(([name, group]) =>
                    this._renderCollection(name, group)
                  )
                : html`<div class="empty">
                    ${posts.length
                      ? 'Không tìm thấy bài phù hợp.'
                      : 'Kho sử chưa có bài viết.'}
                    ${posts.length
                      ? html`<button
                          @click=${() => {
                            this._query = ''
                            this._selectCategory('')
                          }}
                        >
                          Xem toàn bộ kho sử
                        </button>`
                      : ''}
                  </div>`}
            </div>
          </div>`}
    </main>`
  }

  _describeMatches(count) {
    const query = this._query.trim()
    const shelf = this._category ? ` trong ngăn ${this._category}` : ''
    return `${count} bài có "${query}"${shelf}`
  }

  _renderFilter(label, value, count) {
    return html`<button
      aria-pressed=${this._category === value}
      @click=${() => this._selectCategory(value)}
    >
      <span>${label}</span><span class="number">(${count})</span>
    </button>`
  }

  // Chọn ngăn khi đã cuộn sâu thì đưa đầu danh sách lên ngay dưới dải ngăn,
  // để người dùng không rơi vào khoảng trống của danh sách vừa ngắn lại; trên
  // điện thoại kéo thêm dải ngăn cho nút vừa chọn lộ ra.
  _selectCategory(value) {
    this._category = value
    this.updateComplete.then(() => {
      const records = this.renderRoot.querySelector('.records')
      if (records && records.getBoundingClientRect().top < 0) {
        records.scrollIntoView({block: 'start'})
      }
      this.renderRoot
        .querySelector('.shelf-index button[aria-pressed="true"]')
        ?.scrollIntoView({inline: 'nearest', block: 'nearest'})
    })
  }

  _renderGuide(post) {
    return html`<a
      class="guide"
      href=${`/blog/${encodeURIComponent(post.gramps_id)}`}
      @click=${event => this._openPost(event, post.gramps_id)}
    >
      <grampsjs-icon .path=${mdiBookOpenPageVariant}></grampsjs-icon>
      <span>
        <span class="guide-label">Bắt đầu từ đây</span>
        <span class="guide-title">${post.title || 'Mục lục kho sử'}</span>
      </span>
      <grampsjs-icon .path=${mdiChevronRight}></grampsjs-icon>
    </a>`
  }

  _renderCollection(name, posts) {
    const id = `collection-${searchableBlogText(name).replace(/\s+/g, '-')}`
    return html`<section class="collection" aria-labelledby=${id}>
      <header class="records-heading">
        <grampsjs-icon .path=${mdiArchive}></grampsjs-icon>
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
