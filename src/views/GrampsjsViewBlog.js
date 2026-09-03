import {css, html} from 'lit'
import {mdiPlus} from '@mdi/js'

import '@material/web/fab/fab.js'
import {GrampsjsView} from './GrampsjsView.js'
import '../components/GrampsjsBlogPostPreview.js'
import '../components/GrampsjsBlogLayout.js'
import '../components/GrampsjsIcon.js'

import {GrampsjsStaleDataMixin} from '../mixins/GrampsjsStaleDataMixin.js'

import {fireEvent, clickKeyHandler} from '../util.js'

// Hai bài luôn ghim đầu trang: danh sách xếp theo ngày đưa lên nên Lời tựa
// (mốc cũ nhất) và Mục lục nghiên cứu sẽ trôi xuống các trang sau.
const PINNED_POSTS = [
  {id: 'S0001', label: 'Lời tựa gia phả'},
  {id: 'SBHNC00', label: 'Mục lục nghiên cứu'},
]

export class GrampsjsViewBlog extends GrampsjsStaleDataMixin(GrampsjsView) {
  static get styles() {
    return [
      super.styles,
      css`
        :host {
          margin: 24px;
        }

        h2 {
          margin-left: 0;
        }

        .muted {
          opacity: 0.4;
        }

        .pinned {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 0 10px;
          margin: -8px 0 12px;
          font-size: 15px;
        }

        .pinned a {
          display: inline-flex;
          align-items: center;
          min-height: 44px;
          color: var(--md-sys-color-primary);
          text-decoration: underline;
          text-underline-offset: 3px;
        }

        .pinned a:focus-visible {
          outline: 2px solid var(--md-sys-color-primary);
          outline-offset: 2px;
        }

        #posts {
          display: grid;
          gap: 1em;
          grid-template-columns: repeat(
            auto-fill,
            minmax(min(320px, 100%), 1fr)
          );
        }

        .post {
          padding: 20px;
          cursor: pointer;
          outline: 2px solid var(--grampsjs-body-font-color-0);
          transition: outline-color 0.3s ease-in;
        }

        .post:focus,
        .post:focus-within {
          outline: 2px solid var(--grampsjs-body-font-color-10);
          border-radius: var(--grampsjs-frame-radius);
        }

        md-fab {
          position: fixed;
          bottom: 32px;
          right: 32px;
        }

        grampsjs-blog-layout[wide] ~ md-fab {
          right: calc(clamp(17rem, 22vw, 21rem) + 48px);
        }

        @media (max-width: 991px) {
          md-fab {
            bottom: calc(80px + env(safe-area-inset-bottom, 0px));
            right: 16px;
          }
        }
        @media (max-width: 768px) {
          :host {
            margin: 20px 16px;
          }
        }
      `,
    ]
  }

  static get properties() {
    return {
      _dataSources: {type: Array},
      _dataNotes: {type: Array},
      _totalCount: {type: Number},
      _page: {type: Number},
      _pages: {type: Number},
    }
  }

  constructor() {
    super()
    this._dataSources = []
    this._dataNotes = []
    this._page = 1
    this._pageSize = 6
    this._firstLoaded = false
    this._totalCount = -1
    this._pages = -1
  }

  renderContent() {
    return html`
      <grampsjs-blog-layout .appState=${this.appState} .active=${this.active}>
        ${this.renderPosts()}
        ${this._totalCount > 0 ? this.renderPagination() : ''}
      </grampsjs-blog-layout>
      ${this.appState.permissions.canAdd ? this.renderFab() : ''}
    `
  }

  renderFab() {
    return html`
      <md-fab
        variant="secondary"
        aria-label="Thêm bài viết"
        @click=${this._handleClickAdd}
      >
        <grampsjs-icon
          slot="icon"
          .path="${mdiPlus}"
          color="var(--mdc-theme-on-secondary)"
        ></grampsjs-icon>
      </md-fab>
    `
  }

  _handleClickAdd() {
    fireEvent(this, 'nav', {path: 'new_blog_post'})
  }

  _renderHeading() {
    return html`<header class="page-heading">
      <p class="section-label">Chuyện dòng họ</p>
      <h2>${this._('Blog')}</h2>
    </header>`
  }

  renderPosts() {
    if (this._firstLoaded && this._dataSources.length === 0) {
      return html`
        ${this._renderHeading()}
        <p class="muted">
          ${this._("To start using the blog, add a source with tag 'Blog'.")}
        </p>
      `
    }
    if (this.loading) {
      return html``
    }
    return html`
      ${this._renderHeading()} ${this.renderPinned()}
      <div id="posts">
        ${this._dataSources.map(
          (source, i) => this.renderPost(source, this._dataNotes[i]),
          this
        )}
      </div>
    `
  }

  renderPinned() {
    return html`
      <nav class="pinned" aria-label="Bài ghim đầu trang">
        ${PINNED_POSTS.map(
          (post, i) => html`
            ${i > 0 ? html`<span aria-hidden="true">·</span>` : ''}
            <a
              href="/blog/${post.id}"
              @click="${event => this._handlePinnedClick(event, post.id)}"
              >${post.label}</a
            >
          `
        )}
      </nav>
    `
  }

  _handlePinnedClick(event, grampsId) {
    if (
      event.button ||
      event.ctrlKey ||
      event.metaKey ||
      event.shiftKey ||
      event.altKey
    )
      return
    event.preventDefault()
    this._handlePreviewClick(grampsId)
  }

  renderPagination() {
    return html`
      <grampsjs-pagination
        page="${this._page}"
        pages="${this._pages}"
        @page:changed="${this._handlePageChanged}"
        .appState="${this.appState}"
      ></grampsjs-pagination>
    `
  }

  _handlePageChanged(event) {
    this._page = event.detail.page
    this._fetchData()
  }

  // eslint-disable-next-line no-dupe-class-members
  renderPost(source) {
    return html`
      <div
        class="post heritage-frame"
        tabindex="0"
        @click="${() => this._handlePreviewClick(source.gramps_id)}"
        @keydown="${clickKeyHandler}"
      >
        <div>
          <grampsjs-blog-post-preview
            .data="${source}"
            .appState="${this.appState}"
          ></grampsjs-blog-post-preview>
        </div>
      </div>
    `
  }

  firstUpdated() {
    this._fetchData()
  }

  _handlePreviewClick(grampsId) {
    fireEvent(this, 'nav', {path: `blog/${grampsId}`})
  }

  handleUpdateStaleData() {
    this._fetchData()
  }

  async _fetchData() {
    this.loading = true
    const rules = {
      rules: [
        {
          name: 'HasTag',
          values: ['Blog'],
        },
      ],
    }
    const uri = `/api/sources/?rules=${encodeURIComponent(
      JSON.stringify(rules)
    )}&page=${this._page}&pagesize=${this._pageSize}&sort=-change&locale=${
      this.appState.i18n.lang || 'en'
    }&profile=all&extend=all`
    await this.appState.apiGet(uri).then(data => {
      if ('data' in data) {
        this.error = false
        this._dataSources = data.data
        this._totalCount = data.total_count
        this._pages = Math.ceil(this._totalCount / this._pageSize)
      } else if ('error' in data) {
        this.error = true
        this._errorMessage = data.error
      }
    })
    this.loading = false
    this._firstLoaded = true
  }
}

window.customElements.define('grampsjs-view-blog', GrampsjsViewBlog)
