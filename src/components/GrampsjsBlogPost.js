import {html, css, LitElement} from 'lit'
import {sharedStyles} from '../SharedStyles.js'
import '@material/mwc-button'

import './GrampsjsImg.js'
import './GrampsjsGallery.js'
import './GrampsjsNoteContent.js'
import './GrampsjsTimedelta.js'
import './GrampsjsArticleContents.js'
import {getArticleSections} from '../articleContents.js'
import {GrampsjsAppStateMixin} from '../mixins/GrampsjsAppStateMixin.js'

export class GrampsjsBlogPost extends GrampsjsAppStateMixin(LitElement) {
  static get styles() {
    return [
      sharedStyles,
      css`
        h2 {
          color: var(--grampsjs-note-color);
          font-weight: 530;
          font-size: clamp(28px, 4vw, 44px);
          padding-bottom: 0.75em;
          margin-bottom: 0.5em;
          padding-top: 0;
          text-align: center;
          border-bottom: 2px solid var(--grampsjs-note-color);
        }

        h3.author {
          font-family: var(--grampsjs-body-font-family);
          font-weight: 300;
          font-size: 16px;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          margin-bottom: 28px;
          text-align: center;
        }

        #img-container grampsjs-img {
          display: flex;
          justify-content: center;
        }

        #image {
          margin-top: 2em;
          margin-bottom: 3em;
        }

        #note {
          margin: 0 0 3em;
        }

        #note-wrapper {
          margin: 0 auto;
          max-width: 40em;
        }

        grampsjs-note-content {
          --grampsjs-note-line-height: 1.7em;
          --grampsjs-note-font-size: 18px;
          --grampsjs-note-font-family: var(--grampsjs-body-font-family);
        }

        #btn-details {
          margin-top: 2em;
        }

        @media (min-width: 768px) {
          h2 {
            font-size: 44px;
            padding-bottom: 0.3em;
          }

          grampsjs-note-content {
            --grampsjs-note-font-size: 19px;
          }
        }
      `,
    ]
  }

  static get properties() {
    return {
      source: {type: Object},
      note: {type: Object},
      _sections: {state: true},
    }
  }

  constructor() {
    super()
    this.source = {}
    this.note = {}
    this._sections = []
  }

  render() {
    if (Object.keys(this.source).length === 0) {
      return html``
    }
    return html`
      <div class="blog-preview">
        <h2>${this.source.title}</h2>
        <h3 class="author">
          ${this.source.author} ~
          ${this.appState.i18n.lang
            ? html`<grampsjs-timedelta
                timestamp="${this.source.change}"
                locale="${this.appState.i18n.lang}"
              ></grampsjs-timedelta>`
            : ''}
        </h3>
        ${this.source?.media_list?.length
          ? html`<div id="image">${this._renderImage()}</div>`
          : ''}
        <div id="note">
          <div id="note-wrapper">
            <grampsjs-article-contents
              .sections=${this._sections}
              .articleId=${this.source.gramps_id}
              @article-section:select=${this._scrollToSection}
            ></grampsjs-article-contents>
            <grampsjs-note-content
              grampsId="${this.note?.gramps_id || ''}"
              content="${this.note?.formatted?.html ||
              this.note?.text?.string ||
              'Error loading note'}"
            >
            </grampsjs-note-content>

            ${this.source?.media_list?.length > 1
              ? html`
                  <grampsjs-gallery
                    .appState="${this.appState}"
                    .media=${this.source?.extended?.media}
                    .mediaRef=${this.source?.media_list}
                  ></grampsjs-gallery>
                `
              : ''}

            <mwc-button
              id="btn-details"
              @click="${() => this._clickDetails(this.source.gramps_id)}"
              >${this._('Details')}</mwc-button
            >
          </div>
        </div>
      </div>
    `
  }

  async updated(changed) {
    if (!changed.has('note') && !changed.has('source')) return
    this._sections = []
    const note = this.note
    const content = this.shadowRoot.querySelector('grampsjs-note-content')
    if (!content) return
    // NoteContent có một lượt cập nhật tiếp theo khi đổi bố cục cột.
    while (!(await content.updateComplete)) {
      if (!this.isConnected || this.note !== note) return
    }
    if (!this.isConnected || this.note !== note) return
    this._sections = getArticleSections(
      content.shadowRoot.querySelector('#note-content')
    )
  }

  _scrollToSection(event) {
    const content = this.shadowRoot.querySelector('grampsjs-note-content')
    // NoteContent có thể dựng lại các đoạn khi đổi thuộc tính bố cục.
    // Tìm đích trong DOM hiện hành, không cuộn tới phần tử cũ đã bị thay.
    const sections = getArticleSections(
      content?.shadowRoot.querySelector('#note-content')
    )
    const {key, label, offset} = event.detail
    const section = sections[key]
    if (!section || section.label !== label) return
    const target = section.element
    target.style.scrollMarginTop = `${offset}px`
    target.tabIndex = -1
    target.focus({preventScroll: true})
    target.scrollIntoView({
      block: 'start',
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
        ? 'instant'
        : 'smooth',
    })
  }

  _clickDetails(grampsId) {
    this.dispatchEvent(
      new CustomEvent('nav', {
        bubbles: true,
        composed: true,
        detail: {path: `source/${grampsId}`},
      })
    )
  }

  _renderImage() {
    const ref = this.source.media_list[0]
    const obj = this.source.extended.media[0]
    return html`
      <div id="img-container">
        <grampsjs-img
          handle="${obj.handle}"
          size="1000"
          .rect="${ref.rect || []}"
          mime="${obj.mime}"
          checksum="${obj.checksum}"
        ></grampsjs-img>
      </div>
    `
  }
}

window.customElements.define('grampsjs-blog-post', GrampsjsBlogPost)
