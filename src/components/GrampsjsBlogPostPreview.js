import {html, css, LitElement} from 'lit'
import {sharedStyles} from '../SharedStyles.js'
import '@material/mwc-button'

import './GrampsjsImg.js'
import './GrampsjsGallery.js'
import './GrampsjsNoteContent.js'
import './GrampsjsTimedelta.js'
import {GrampsjsAppStateMixin} from '../mixins/GrampsjsAppStateMixin.js'

// Các dòng siêu dữ liệu ở đầu bài nghiên cứu và dòng tiêu đề của Lời tựa:
// không phải nội dung, không đưa vào đoạn trích.
const SKIP_PARAGRAPH = [
  /^Chuyên mục:/i,
  /^Bản nghiên cứu mở/i,
  /^Cập nhật nội dung/i,
  /^Mục lục chuyên mục/i,
  /^Hiệu chỉnh nội dung/i,
  /^PHẢ HỆ HỌ BÙI HỮU/i,
]

const SENTENCE_ENDS = ['. ', '… ', '! ', '? ']

export function getBlogPreviewText(text, limit = 250) {
  const paragraphs = (text || '')
    .split(/\n\s*\n/)
    .map(paragraph => paragraph.replace(/\s+/g, ' ').trim())
    .filter(Boolean)
    .filter(paragraph => !SKIP_PARAGRAPH.some(re => re.test(paragraph)))
  if (paragraphs.length === 0) return ''
  // Đoạn ngắn thường là đề mục hay dòng địa danh; ưu tiên đoạn văn thật sự.
  const opening = paragraphs.find(paragraph => paragraph.length >= 100)
  const body = opening || paragraphs[0]
  if (body.length <= limit) return body
  const head = body.slice(0, limit + 1)
  const boundary = Math.max(
    ...SENTENCE_ENDS.map(mark => head.lastIndexOf(mark))
  )
  if (boundary >= limit / 3) return body.slice(0, boundary + 1)
  return `${body.slice(0, limit).replace(/\s+\S*$/, '')}…`
}

export class GrampsjsBlogPostPreview extends GrampsjsAppStateMixin(LitElement) {
  static get styles() {
    return [
      sharedStyles,
      css`
        h3 {
          font-family: var(--grampsjs-heading-font-family);
          font-size: 20px;
          margin-bottom: 20px;
          font-weight: 500;
          margin-top: 0;
          line-height: 1.3em;
          min-height: 2.6em;
          color: var(--heritage-ink);
        }

        #image {
          width: 170px;
          flex-shrink: 0;
          text-align: right;
        }

        #note {
          flex-grow: 1;
          font-size: 16px;
          font-weight: 400;
          color: var(--md-sys-color-on-surface-variant);
          line-height: 1.6em;
        }

        #date {
          color: var(--md-sys-color-on-surface-variant);
          font-size: 13px;
          letter-spacing: 0.02em;
          margin: 1.6em 0 0;
          font-weight: 400;
        }

        .clear {
          clear: both;
        }

        #content {
          display: flex;
        }

        @media (max-width: 500px) {
          #image {
            display: none;
          }
        }
      `,
    ]
  }

  static get properties() {
    return {
      data: {type: Object},
    }
  }

  constructor() {
    super()
    this.data = {}
  }

  render() {
    if (Object.keys(this.data).length === 0) {
      return html``
    }
    return html`
      <div class="blog-preview">
        <h3>${this.data.title}</h3>
        <div id="content">
          <div id="note">${this.getPreviewText()}</div>
          ${this.data?.media_list?.length ? this._renderImage() : ''}
        </div>
        <div class="clear"></div>
        <div id="date">
          ${this.appState.i18n.lang
            ? html`<grampsjs-timedelta
                timestamp="${this.data.change}"
                locale="${this.appState.i18n.lang}"
              ></grampsjs-timedelta>`
            : ''}
        </div>
      </div>
    `
  }

  getPreviewText() {
    return getBlogPreviewText(this.data?.extended?.notes?.[0]?.text?.string)
  }

  _renderImage() {
    const ref = this.data.media_list[0]
    const obj = this.data.extended.media[0]
    return html`
      <div id="image">
        <grampsjs-img
          handle="${obj.handle}"
          size="200"
          displayHeight="150"
          square
          .rect="${ref.rect || []}"
          mime="${obj.mime}"
          checksum="${obj.checksum}"
        ></grampsjs-img>
      </div>
    `
  }
}

window.customElements.define(
  'grampsjs-blog-post-preview',
  GrampsjsBlogPostPreview
)
