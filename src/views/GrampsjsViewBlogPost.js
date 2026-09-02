import {css, html} from 'lit'

import {GrampsjsView} from './GrampsjsView.js'
import {GrampsjsStaleDataMixin} from '../mixins/GrampsjsStaleDataMixin.js'
import '../components/GrampsjsBlogPost.js'
import '../components/GrampsjsBlogLayout.js'
import '../components/GrampsjsArticleContents.js'

const BASE_DIR = ''

export class GrampsjsViewBlogPost extends GrampsjsStaleDataMixin(GrampsjsView) {
  static get styles() {
    return [
      super.styles,
      css`
        :host {
          margin: 24px;
        }
        @media (max-width: 768px) {
          :host {
            margin: 20px 16px;
          }
        }
        .muted {
          opacity: 0.4;
        }
      `,
    ]
  }

  static get properties() {
    return {
      grampsId: {type: String},
      _dataSources: {type: Array},
      _dataNotes: {type: Array},
      _sections: {state: true},
    }
  }

  constructor() {
    super()
    this.grampsId = ''
    this._dataSources = []
    this._dataNotes = []
    this._firstLoaded = false
    this._fetchRequest = 0
    this._sections = []
  }

  renderContent() {
    return html`
      <grampsjs-blog-layout
        .appState=${this.appState}
        .active=${this.active}
        .currentId=${this.grampsId}
      >
        ${this._sections.length
          ? html`<grampsjs-article-contents
              slot="contents"
              .sections=${this._sections}
              .articleId=${this.grampsId}
              @article-section:select=${this._selectSection}
            ></grampsjs-article-contents>`
          : ''}
        ${this.renderPosts()}
      </grampsjs-blog-layout>
    `
  }

  renderPosts() {
    if (this._firstLoaded && this._dataSources.length === 0) {
      return html`
        <h2>${this._('Blog')}</h2>
        <p class="muted">
          ${this._("To start using the blog, add a source with tag 'Blog'.")}
        </p>
      `
    }
    if (this.loading) {
      return html``
    }
    return html`
      ${this._dataSources.map(
        (source, i) => this.renderPost(source, this._dataNotes[i]),
        this
      )}
    `
  }

  // eslint-disable-next-line no-dupe-class-members
  renderPost(source, note) {
    return html`
      <grampsjs-blog-post
        .externalContents=${true}
        @article-sections:changed=${this._handleSectionsChanged}
        .source="${source}"
        .note="${note}"
        .appState="${this.appState}"
      ></grampsjs-blog-post>
    `
  }

  firstUpdated() {
    this._fetchData()
  }

  _handleSectionsChanged(event) {
    if (event.detail.articleId === this.grampsId) {
      this._sections = event.detail.sections
    }
  }

  _selectSection(event) {
    this.shadowRoot.querySelector('grampsjs-blog-post')?._scrollToSection(event)
  }

  handleUpdateStaleData() {
    this._fetchData()
  }

  _getNotesUrl() {
    const grampsId = this._dataSources[0]?.extended?.notes?.[0]?.gramps_id
    if (!grampsId) {
      return ''
    }
    const options = {
      link_format: `${BASE_DIR}/{obj_class}/{gramps_id}`,
    }
    return `/api/notes/?locale=${
      this.appState.i18n.lang || 'en'
    }&profile=all&extend=all&formats=html&gramps_id=${grampsId}&format_options=${encodeURIComponent(
      JSON.stringify(options)
    )}`
  }

  update(changed) {
    super.update(changed)
    if (this.active && changed.has('grampsId')) {
      this._fetchData()
    }
    if (
      changed.has('active') &&
      this.active &&
      !this.loading &&
      this.grampsId !== this._dataSources[0]?.gramps_id
    ) {
      this._fetchData()
    }
  }

  async _fetchData() {
    const request = ++this._fetchRequest
    this.loading = true
    this._sections = []
    this._dataNotes = []
    const uri = `/api/sources/?gramps_id=${this.grampsId}&locale=${
      this.appState.i18n.lang || 'en'
    }&profile=all&backlinks=true&extend=all`
    await this.appState.apiGet(uri).then(data => {
      if (request !== this._fetchRequest) return
      if ('data' in data) {
        this.error = false
        this._dataSources = data.data
      } else if ('error' in data) {
        this._dataSources = []
        this.error = true
        this._errorMessage = data.error
      }
    })
    if (request !== this._fetchRequest) return
    const uriNotes = this._getNotesUrl()
    if (uriNotes) {
      await this.appState.apiGet(uriNotes).then(data => {
        if (request !== this._fetchRequest) return
        if ('data' in data) {
          this.error = false
          this._dataNotes = data.data
        } else if ('error' in data) {
          this.error = true
          this._errorMessage = data.error
        }
      })
    }
    if (request !== this._fetchRequest) return
    this.loading = false
    this._firstLoaded = true
  }
}

window.customElements.define('grampsjs-view-blog-post', GrampsjsViewBlogPost)
