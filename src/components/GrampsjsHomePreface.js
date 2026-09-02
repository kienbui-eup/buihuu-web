import {css, html} from 'lit'
import {GrampsjsConnectedComponent} from './GrampsjsConnectedComponent.js'
import './GrampsjsHeritageMark.js'
import './GrampsjsConnectedNote.js'

export class GrampsjsHomePreface extends GrampsjsConnectedComponent {
  static get properties() {
    return {
      noteHandle: {type: String},
      _expanded: {state: true},
    }
  }

  constructor() {
    super()
    this.noteHandle = ''
    this._expanded = false
    this.renderOnError = true
  }

  static get styles() {
    return [
      super.styles,
      css`
        :host {
          display: block;
          min-width: 0;
          --preface-serif: 'EB Garamond x', 'Noto Serif', serif;
          --preface-ink: var(--md-sys-color-on-surface);
          --preface-rule: color-mix(
            in srgb,
            var(--md-sys-color-primary) 45%,
            var(--md-sys-color-surface)
          );
        }
        .manuscript-page {
          position: relative;
          padding: 34px clamp(24px, 5vw, 72px) 24px;
          border: 1px solid var(--preface-rule);
          color: var(--preface-ink);
          background: radial-gradient(
              ellipse at top,
              transparent 35%,
              color-mix(in srgb, var(--md-sys-color-primary) 5%, transparent)
            ),
            var(--md-sys-color-surface);
        }
        header {
          text-align: center;
        }
        .title-line {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 16px;
        }
        .eyebrow {
          margin: 0 0 6px;
          font: 400 16px/1.6 var(--preface-serif);
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--md-sys-color-primary);
        }
        h1 {
          margin: 0;
          font: 700 clamp(54px, 6vw, 76px) / 1.4 'Charm', var(--preface-serif);
          color: var(--md-sys-color-primary);
        }
        grampsjs-heritage-mark {
          transform: rotate(-4deg) scale(0.8);
          flex: 0 0 58px;
        }
        .ornament {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          margin: 14px auto 24px;
          color: var(--preface-rule);
        }
        .ornament::before,
        .ornament::after {
          content: '';
          width: 64px;
          border-top: 1px solid currentColor;
        }
        .ornament span {
          width: 6px;
          height: 6px;
          border: 1px solid currentColor;
          transform: rotate(45deg);
        }
        .excerpt,
        .message {
          max-width: 38rem;
          margin: 0 auto 12px;
          font: 400 23px/1.7 var(--preface-serif);
          overflow-wrap: anywhere;
        }
        .excerpt {
          text-align: justify;
        }
        .excerpt::first-letter {
          float: left;
          margin: 7px 8px 0 0;
          font: 400 3.1em/0.85 var(--preface-serif);
          color: var(--md-sys-color-primary);
        }
        .message {
          color: var(--md-sys-color-on-surface-variant);
          text-align: center;
        }
        .reading-action {
          text-align: center;
        }
        button {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          min-height: 44px;
          margin-top: 4px;
          padding: 4px 12px;
          border: 0;
          background: transparent;
          color: var(--md-sys-color-primary);
          font: italic 400 20px/1.5 var(--preface-serif);
          text-align: left;
          text-decoration: underline;
          text-underline-offset: 4px;
          cursor: pointer;
        }
        button::after {
          content: '';
          width: 6px;
          height: 6px;
          border-right: 1px solid currentColor;
          border-bottom: 1px solid currentColor;
          transform: translateY(-2px) rotate(45deg);
        }
        button[aria-expanded='true']::after {
          transform: translateY(2px) rotate(225deg);
        }
        button:focus-visible {
          outline: 2px solid var(--md-sys-color-primary);
          outline-offset: 4px;
        }
        #preface-content {
          max-width: 38rem;
          margin-inline: auto;
          overflow-wrap: anywhere;
          --grampsjs-note-font-family: var(--preface-serif);
          --grampsjs-note-font-size: 23px;
          --grampsjs-note-line-height: 1.75em;
          --grampsjs-note-color: var(--preface-ink);
        }
        @media (max-width: 768px) {
          .manuscript-page {
            padding: 24px 22px 16px;
          }
          .eyebrow {
            font-size: 13px;
            letter-spacing: 0.14em;
          }
          .title-line {
            gap: 4px;
          }
          .ornament {
            margin: 12px auto 22px;
          }
          .excerpt,
          .message {
            font-size: 21px;
            line-height: 1.65;
            text-align: left;
          }
          #preface-content {
            --grampsjs-note-font-size: 21px;
          }
        }
        @media print {
          .reading-action {
            display: none;
          }
          .manuscript-page {
            background: none;
          }
        }
      `,
    ]
  }

  getUrl() {
    const locale = this.appState.i18n?.lang || 'vi'
    if (this.noteHandle) {
      return `/api/notes/${encodeURIComponent(
        this.noteHandle
      )}?locale=${locale}`
    }
    const rules = {rules: [{name: 'HasTag', values: ['Blog']}]}
    return `/api/sources/?rules=${encodeURIComponent(
      JSON.stringify(rules)
    )}&gql=${encodeURIComponent(
      'title = "Lời tựa"'
    )}&pagesize=1&sort=gramps_id&extend=all&locale=${locale}`
  }

  _getNote() {
    return this.noteHandle
      ? this._data.data
      : this._data.data?.[0]?.extended?.notes?.[0]
  }

  _getExcerpt(note) {
    const paragraphs = (note?.text?.string || '')
      .split(/\n\s*\n/)
      .map(paragraph => paragraph.replace(/\s+/g, ' ').trim())
      .filter(Boolean)
    // Bỏ qua các dòng tiêu đề, địa danh ngắn để trích đoạn văn mở đầu.
    const opening = paragraphs.find(paragraph => paragraph.length > 160)
    const text = opening || paragraphs.join(' ')
    if (text.length <= 260) return text
    return `${text.slice(0, 260).replace(/\s+\S*$/, '')}…`
  }

  _renderHeader() {
    return html`<header>
      <p class="eyebrow">Bùi Hữu gia phả</p>
      <div class="title-line">
        <h1>Lời tựa</h1>
        <grampsjs-heritage-mark></grampsjs-heritage-mark>
      </div>
      <div class="ornament" aria-hidden="true"><span></span></div>
    </header>`
  }

  renderLoading() {
    return html`<article class="manuscript-page" aria-label="Lời tựa gia phả">
      ${this._renderHeader()}
      <p class="message" role="status">Đang tải lời tựa…</p>
    </article>`
  }

  renderContent() {
    return html`<article class="manuscript-page" aria-label="Lời tựa gia phả">
      ${this._renderHeader()} ${this._renderBody()}
    </article>`
  }

  _renderBody() {
    if (this.error) {
      return html`<p class="message" role="status">Chưa tải được lời tựa.</p>
        <div class="reading-action">
          <button @click=${() => this._updateData()}>Thử lại</button>
        </div>`
    }
    const note = this._getNote()
    if (!note?.handle) {
      return html`<p class="message">Lời tựa chưa được bổ sung.</p>`
    }
    return html`
      ${this._expanded
        ? ''
        : html`<p class="excerpt">${this._getExcerpt(note)}</p>`}
      <div class="reading-action">
        <button
          aria-expanded=${this._expanded}
          aria-controls="preface-content"
          @click=${() => {
            this._expanded = !this._expanded
          }}
        >
          ${this._expanded ? 'Thu gọn lời tựa' : 'Đọc toàn bộ lời tựa'}
        </button>
      </div>
      <div id="preface-content" ?hidden=${!this._expanded}>
        ${this._expanded
          ? html`<grampsjs-connected-note
              .handle=${note.handle}
              .framed=${false}
              manuscript
              .appState=${this.appState}
            ></grampsjs-connected-note>`
          : ''}
      </div>
    `
  }
}

window.customElements.define('grampsjs-home-preface', GrampsjsHomePreface)
