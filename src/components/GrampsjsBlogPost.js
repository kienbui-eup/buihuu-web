import {html, css, LitElement} from 'lit'
import {sharedStyles} from '../SharedStyles.js'
import '@material/web/button/text-button.js'

import './GrampsjsImg.js'
import './GrampsjsGallery.js'
import './GrampsjsNoteContent.js'
import './GrampsjsArticleContents.js'
import {getArticleSections} from '../articleContents.js'
import {fireEvent} from '../util.js'
import {GrampsjsAppStateMixin} from '../mixins/GrampsjsAppStateMixin.js'

// Lời tựa gia phả: nguồn duy nhất hiển thị theo lối bản thảo và có lời người
// biên tập kèm theo.
const PREFACE_ID = 'S0001'

export function formatPostedDate(timestamp) {
  if (!timestamp) return ''
  return new Date(timestamp * 1000).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export class GrampsjsBlogPost extends GrampsjsAppStateMixin(LitElement) {
  static get styles() {
    return [
      sharedStyles,
      css`
        :host {
          display: block;
          min-width: 0;
        }

        .reading-layout {
          width: 100%;
        }

        .reading-layout.with-sidebar {
          display: grid;
          grid-template-columns: minmax(0, 1fr) clamp(17rem, 22%, 21rem);
          column-gap: clamp(20px, 2vw, 32px);
          align-items: start;
        }

        .article-header,
        #note {
          min-width: 0;
          grid-column: 1;
        }

        .with-sidebar grampsjs-article-contents {
          grid-column: 2;
          grid-row: 1 / span 2;
          align-self: start;
        }

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

        .byline {
          margin: 0 0 6px;
          text-align: center;
          font-family: var(--grampsjs-body-font-family);
          font-size: 17px;
          font-style: italic;
          font-weight: 400;
          color: var(--grampsjs-body-font-color-75);
        }

        .posted {
          margin: 0 0 28px;
          text-align: center;
          font-family: var(--grampsjs-body-font-family);
          font-size: 13px;
          letter-spacing: 0.02em;
          color: var(--grampsjs-body-font-color-60);
        }

        .editor-note {
          max-width: 44rem;
          margin: 2.5em auto 0;
          padding: 14px 20px;
          border-left: 3px solid var(--md-sys-color-outline-variant);
          font-family: var(--grampsjs-body-font-family);
          font-size: 16px;
          line-height: 1.6;
          color: var(--grampsjs-body-font-color-75);
        }

        .editor-note h3 {
          margin: 0 0 8px;
          font-family: var(--grampsjs-body-font-family);
          font-size: 14px;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--md-sys-color-primary);
        }

        .editor-note p {
          margin: 0 0 0.75em;
        }

        .editor-note p:last-child {
          margin-bottom: 0;
        }

        .editor-note a {
          color: var(--md-sys-color-primary);
          text-underline-offset: 3px;
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
          min-width: 0;
        }

        grampsjs-note-content {
          --grampsjs-note-line-height: 1.7em;
          --grampsjs-note-font-size: 18px;
          --grampsjs-note-font-family: var(--grampsjs-body-font-family);
          --grampsjs-note-column-width: auto;
        }

        .actions {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
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

        @media print {
          .reading-layout.with-sidebar {
            display: block;
            max-width: 44rem;
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
      _wideContents: {state: true},
      externalContents: {type: Boolean},
    }
  }

  constructor() {
    super()
    this.source = {}
    this.note = {}
    this._sections = []
    this._wideContents = false
    this.externalContents = false
  }

  connectedCallback() {
    super.connectedCallback()
    this._layoutObserver = new ResizeObserver(([entry]) => {
      this._wideContents = entry.contentRect.width >= 880
    })
    this._layoutObserver.observe(this)
  }

  disconnectedCallback() {
    this._layoutObserver?.disconnect()
    super.disconnectedCallback()
  }

  render() {
    if (Object.keys(this.source).length === 0) {
      return html``
    }
    return html`
      <div
        class="reading-layout ${!this.externalContents &&
        this._wideContents &&
        this._sections.length
          ? 'with-sidebar'
          : ''}"
      >
        <header class="article-header">
          <h2>${this.source.title}</h2>
          ${this._renderByline()}
          ${this.source?.media_list?.length
            ? html`<div id="image">${this._renderImage()}</div>`
            : ''}
        </header>
        ${!this.externalContents && this._sections.length
          ? html`<grampsjs-article-contents
              .sections=${this._sections}
              .articleId=${this.source.gramps_id}
              .sidebar=${this._wideContents}
              @article-section:select=${this._scrollToSection}
            ></grampsjs-article-contents>`
          : ''}
        <div id="note">
          <div id="note-wrapper">
            <grampsjs-note-content
              grampsId="${this.note?.gramps_id || ''}"
              ?manuscript="${this._isPreface}"
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
            ${this._isPreface ? this._renderEditorNote() : ''}
            ${this.appState.permissions?.canEdit ? this._renderActions() : ''}
          </div>
        </div>
      </div>
    `
  }

  get _isPreface() {
    return this.source?.gramps_id === PREFACE_ID
  }

  _renderByline() {
    // pubinfo giữ mốc thật của văn bản ("lập tháng Giêng năm Canh Tý (2020)");
    // ngày đưa lên trang chỉ là mốc kỹ thuật nên để chữ nhỏ.
    const byline = this.source.pubinfo || this.source.author || ''
    const posted = formatPostedDate(this.source.change)
    return html`
      ${byline ? html`<p class="byline">${byline}</p>` : ''}
      ${posted ? html`<p class="posted">Đưa lên trang: ${posted}</p>` : ''}
    `
  }

  _renderEditorNote() {
    return html`
      <aside class="editor-note" aria-label="Lời người biên tập">
        <h3>Lời người biên tập</h3>
        <p>
          Bản chép của cụ Bùi Hữu Đặng, tháng Giêng năm Canh Tý (2020), chép lại
          lời tựa viết năm Duy Tân thứ tư (1910) của bản phả biên soạn năm 1893.
          Địa danh ghi theo thời điểm chép; từ 01/07/2025 xã Thụy Trường thuộc
          xã Đông Thụy Anh, tỉnh Hưng Yên.
        </p>
        <p>
          Đoạn kể về cụ Bùi Thứ và ba người con là truyền thuyết về gốc gác
          trước khi về Chỉ Bồ, chưa nối được với cây; cây trên trang bắt đầu từ
          thủy tổ Bùi Huyền Nhân (đời 1).
        </p>
        <p>
          Xem bài
          «${this._renderLink(
            'blog/SBHNC03',
            'Lời tựa, niên đại và những cách ghi tên'
          )}»
          và
          «${this._renderLink(
            'blog/SBHNC21',
            'Các cụ tổ theo Lời tựa gia phả'
          )}».
        </p>
      </aside>
    `
  }

  _renderLink(path, label) {
    return html`<a
      href="/${path}"
      @click="${event => this._navigate(event, path)}"
      >${label}</a
    >`
  }

  _renderActions() {
    const noteId = this.note?.gramps_id
    return html`
      <div class="actions">
        ${noteId
          ? html`<md-text-button
              @click="${event => this._navigate(event, `note/${noteId}`)}"
              >Sửa bài</md-text-button
            >`
          : ''}
        <md-text-button
          @click="${() => this._clickDetails(this.source.gramps_id)}"
          >${this._('Details')}</md-text-button
        >
      </div>
    `
  }

  _navigate(event, path) {
    if (
      event?.button ||
      event?.ctrlKey ||
      event?.metaKey ||
      event?.shiftKey ||
      event?.altKey
    )
      return
    event?.preventDefault()
    fireEvent(this, 'nav', {path})
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
    if (this.externalContents) {
      this.dispatchEvent(
        new CustomEvent('article-sections:changed', {
          bubbles: true,
          composed: true,
          detail: {
            articleId: this.source.gramps_id,
            sections: this._sections.map(({key, label}) => ({key, label})),
          },
        })
      )
    }
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
