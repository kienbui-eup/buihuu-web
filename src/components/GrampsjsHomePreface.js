import {css, html, nothing} from 'lit'
import {mdiClose} from '@mdi/js'
import {GrampsjsConnectedComponent} from './GrampsjsConnectedComponent.js'
import {fireEvent} from '../util.js'
import {PLACE_SHORT} from '../branding.js'
import './GrampsjsHeritageMark.js'
import './GrampsjsConnectedNote.js'
import './GrampsjsIcon.js'

// Lời tựa gia phả: nguồn S0001 mang thẻ Blog, toàn văn nằm trong ghi chú đầu.
// Phần tử này tải ghi chú, đưa trích đoạn mở đầu cho khối giới thiệu trang chủ
// (sự kiện preface:loaded) và giữ hộp thoại toàn văn trình bày như một tờ sớ:
// giấy dó ngả vàng, khung son kép, hai trục cuốn trên dưới, ấn son đóng cạnh
// chữ ký. Mở bằng open(), đóng bằng nút, phím Escape hay bấm ra nền.
const EXCERPT_LIMIT = 260
const SENTENCE_ENDS = ['. ', '… ', '! ', '? ']
const PREFACE_PATH = 'blog/S0001'

/**
 * Trích đoạn mở đầu của lời tựa: bỏ các dòng tiêu đề, địa danh ngắn, lấy đoạn
 * văn đầu tiên và cắt ở ranh giới câu cuối cùng trước giới hạn, không cắt giữa câu.
 */
export function prefaceExcerpt(text, limit = EXCERPT_LIMIT) {
  const paragraphs = (text || '')
    .split(/\n\s*\n/)
    .map(paragraph => paragraph.replace(/\s+/g, ' ').trim())
    .filter(Boolean)
  const opening = paragraphs.find(paragraph => paragraph.length > 160)
  const body = opening || paragraphs.join(' ')
  if (body.length <= limit) return body
  const head = body.slice(0, limit + 1)
  const boundary = Math.max(
    ...SENTENCE_ENDS.map(mark => head.lastIndexOf(mark))
  )
  if (boundary >= limit / 3) return body.slice(0, boundary + 1).trim()
  return `${body.slice(0, limit).replace(/\s+\S*$/, '')}…`
}

export class GrampsjsHomePreface extends GrampsjsConnectedComponent {
  static get properties() {
    return {
      noteHandle: {type: String},
      // Toàn văn chỉ nạp khi hộp thoại được mở lần đầu, rồi giữ lại.
      _mounted: {state: true},
    }
  }

  constructor() {
    super()
    this.noteHandle = ''
    this._mounted = false
    this.renderOnError = true
    this._handleClose = this._handleClose.bind(this)
    this._handleBackdropClick = this._handleBackdropClick.bind(this)
  }

  firstUpdated() {
    super.firstUpdated()
    // Bấm ra nền mờ để đóng: đích sự kiện là chính <dialog>, gắn ngoài template
    // vì bàn phím đã có Escape của hộp thoại lo, không cần thêm phím ở đây.
    this.renderRoot
      .querySelector('dialog')
      ?.addEventListener('click', this._handleBackdropClick)
  }

  static get styles() {
    return [
      super.styles,
      css`
        :host {
          display: block;
          --so-ink: #3a2716;
          --so-son: #a1301f;
          --so-vang: #b8923f;
          --so-paper: #f2e2bd;
          --so-serif: 'EB Garamond x', 'Noto Serif', serif;
        }
        dialog.so {
          position: fixed;
          inset: 0;
          box-sizing: border-box;
          width: 100vw;
          height: 100vh;
          height: 100dvh;
          max-width: none;
          max-height: none;
          margin: 0;
          padding: 0;
          border: 0;
          background: transparent;
          color: var(--so-ink);
          overflow: hidden;
        }
        dialog.so::backdrop {
          background: rgba(28, 16, 9, 0.8);
          backdrop-filter: blur(4px);
        }
        .scroll {
          display: flex;
          flex-direction: column;
          height: 100%;
          transform-origin: top center;
        }
        dialog[open] .scroll {
          animation: unroll 0.4s ease-out;
        }
        @keyframes unroll {
          from {
            opacity: 0;
            transform: scaleY(0.94);
          }
          to {
            opacity: 1;
            transform: none;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          dialog[open] .scroll {
            animation: none;
          }
        }
        /* Hai trục cuốn: gỗ sẫm, hai đầu bịt đồng. */
        .roller {
          position: relative;
          z-index: 1;
          flex: 0 0 auto;
          height: 22px;
          margin: 0 8px;
          border-radius: 11px;
          background: linear-gradient(
            180deg,
            #7a5230 0%,
            #3b2213 52%,
            #5e3d22 100%
          );
          box-shadow: 0 3px 8px rgba(0, 0, 0, 0.55);
        }
        .roller::before,
        .roller::after {
          content: '';
          position: absolute;
          top: -3px;
          width: 16px;
          height: 28px;
          border-radius: 8px;
          background: linear-gradient(180deg, #e0be74 0%, #8a6a2e 100%);
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.4);
        }
        .roller::before {
          left: -8px;
        }
        .roller::after {
          right: -8px;
        }
        .paper {
          position: relative;
          flex: 1 1 auto;
          min-height: 0;
          overflow-y: auto;
          overscroll-behavior: contain;
          -webkit-overflow-scrolling: touch;
          /* Lề trên đủ cao để nút đóng nằm trên khoảng giấy trống, không chồng
             lên góc khung son. */
          padding: 76px 16px 30px;
          background: radial-gradient(
              ellipse at 18% 8%,
              rgba(255, 250, 235, 0.55),
              transparent 55%
            ),
            radial-gradient(
              ellipse at 85% 92%,
              rgba(122, 82, 34, 0.22),
              transparent 60%
            ),
            radial-gradient(
              ellipse at 60% 45%,
              rgba(150, 110, 60, 0.1),
              transparent 50%
            ),
            linear-gradient(180deg, #f7ebcb 0%, #f0dcb1 55%, #e8d09f 100%);
          box-shadow: inset 0 0 70px rgba(120, 80, 30, 0.22);
        }
        .close {
          position: absolute;
          z-index: 2;
          top: 30px;
          right: 14px;
          display: grid;
          place-items: center;
          width: 44px;
          height: 44px;
          padding: 0;
          border: 1px solid var(--so-son);
          border-radius: 50%;
          background: var(--so-paper);
          color: var(--so-son);
          cursor: pointer;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.25);
        }
        .close:hover {
          background: #fbefd2;
        }
        .close:focus-visible {
          outline: 2px solid var(--so-son);
          outline-offset: 3px;
        }
        /* Chữ dọc hai bên mép giấy, chỉ hiện khi khung rộng. */
        .side {
          display: none;
          position: absolute;
          top: 50%;
          writing-mode: vertical-rl;
          font: 600 12px/1 var(--grampsjs-body-font-family);
          letter-spacing: 0.34em;
          text-transform: uppercase;
          color: var(--so-son);
          opacity: 0.7;
          pointer-events: none;
        }
        .side.left {
          left: 22px;
          transform: translateY(-50%) rotate(180deg);
        }
        .side.right {
          right: 22px;
          transform: translateY(-50%);
        }
        .sheet {
          position: relative;
          box-sizing: border-box;
          max-width: 640px;
          margin: 12px auto 0;
          padding: 36px clamp(20px, 5vw, 56px) 40px;
          border: 2px solid var(--so-son);
          outline: 1px solid var(--so-son);
          outline-offset: 6px;
          /* Cho hộp thoại một màu chủ đạo son và đường kẻ vàng để phần ghi
             chú kiểu bản thảo (chữ hoa đầu, dòng ký tên) hòa vào tờ sớ. */
          --md-sys-color-primary: var(--so-son);
          --md-sys-color-outline-variant: var(--so-vang);
        }
        .sheet::before {
          content: '';
          position: absolute;
          inset: 5px;
          border: 1px solid var(--so-vang);
          pointer-events: none;
        }
        .corner {
          position: absolute;
          width: 12px;
          height: 12px;
          border: 2px solid var(--so-son);
          background: var(--so-paper);
          transform: rotate(45deg);
        }
        .corner.tl {
          top: -8px;
          left: -8px;
        }
        .corner.tr {
          top: -8px;
          right: -8px;
        }
        .corner.bl {
          bottom: -8px;
          left: -8px;
        }
        .corner.br {
          bottom: -8px;
          right: -8px;
        }
        header {
          text-align: center;
        }
        .eyebrow {
          margin: 0 0 6px;
          font: 400 14px/1.6 var(--so-serif);
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: var(--so-son);
        }
        h2 {
          margin: 0;
          font: 700 clamp(46px, 5vw, 62px) / 1.3 'Charm', var(--so-serif);
          color: var(--so-son);
        }
        .ornament {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          margin: 10px auto 26px;
          color: var(--so-vang);
        }
        .ornament::before,
        .ornament::after {
          content: '';
          width: 72px;
          border-top: 1px solid currentColor;
        }
        .ornament span {
          width: 7px;
          height: 7px;
          border: 1px solid currentColor;
          transform: rotate(45deg);
        }
        .text {
          position: relative;
          padding-bottom: 36px;
          overflow-wrap: anywhere;
          --grampsjs-note-font-family: var(--so-serif);
          --grampsjs-note-font-size: 22px;
          --grampsjs-note-line-height: 1.75em;
          --grampsjs-note-color: var(--so-ink);
          /* Khung đã có tiêu đề "Lời tựa", ẩn dòng "PHẢ HỆ HỌ BÙI HỮU" của bản chép. */
          --grampsjs-manuscript-title-display: none;
        }
        .message {
          margin: 0 0 12px;
          font: 400 20px/1.6 var(--so-serif);
          text-align: center;
          color: #6b533a;
        }
        .retry {
          display: block;
          min-height: 44px;
          margin: 0 auto;
          padding: 4px 16px;
          border: 1px solid var(--so-son);
          border-radius: 3px;
          background: transparent;
          color: var(--so-son);
          font: 500 15px/1.4 var(--grampsjs-body-font-family);
          cursor: pointer;
        }
        /* Ấn son đóng lệch cạnh dòng ký tên, hòa vào nền giấy. */
        .seal {
          position: absolute;
          right: 4%;
          bottom: -22px;
          --grampsjs-mark-size: 92px;
          transform: rotate(-9deg);
          mix-blend-mode: multiply;
          opacity: 0.88;
          pointer-events: none;
        }
        .colophon {
          margin: 18px 0 0;
          padding-top: 16px;
          border-top: 1px solid var(--so-vang);
          font: 400 14px/1.65 var(--grampsjs-body-font-family);
          color: #6b533a;
          text-align: center;
          overflow-wrap: anywhere;
        }
        .colophon a {
          color: var(--so-son);
          text-underline-offset: 3px;
          white-space: nowrap;
        }
        @media (min-width: 900px) {
          dialog.so {
            width: min(800px, 92vw);
            height: min(92vh, 1200px);
            height: min(92dvh, 1200px);
            margin: auto;
          }
          .paper {
            padding: 30px 84px 44px;
          }
          .side {
            display: block;
          }
          .close {
            top: 38px;
            right: 22px;
          }
        }
        @media (max-width: 480px) {
          .sheet {
            margin-top: 8px;
            padding: 30px 18px 34px;
          }
          .eyebrow {
            font-size: 12px;
            letter-spacing: 0.16em;
          }
          .ornament::before,
          .ornament::after {
            width: 48px;
          }
          .text {
            --grampsjs-note-font-size: 20px;
            --grampsjs-note-line-height: 1.7em;
          }
          .seal {
            --grampsjs-mark-size: 72px;
            bottom: -16px;
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

  /** Trích đoạn mở đầu, rỗng khi chưa tải hoặc chưa có lời tựa. */
  get excerpt() {
    return prefaceExcerpt(this._getNote()?.text?.string)
  }

  updated(changed) {
    super.updated(changed)
    if (changed.has('_data') && this._getNote()?.handle) {
      fireEvent(this, 'preface:loaded', {excerpt: this.excerpt})
    }
  }

  /** Mở tờ sớ toàn văn; nạp ghi chú ở lần mở đầu. */
  open() {
    this._mounted = true
    this.updateComplete.then(() => {
      const dialog = this.renderRoot.querySelector('dialog')
      if (!dialog || dialog.open) return
      if (typeof dialog.showModal === 'function') dialog.showModal()
      else dialog.setAttribute('open', '')
      // Hộp thoại có vùng cuộn riêng; khóa cuộn của trang phía sau.
      document.documentElement.style.overflow = 'hidden'
      dialog.querySelector('.paper')?.scrollTo?.(0, 0)
    })
  }

  close() {
    const dialog = this.renderRoot.querySelector('dialog')
    if (dialog?.open) dialog.close()
  }

  _handleClose() {
    document.documentElement.style.overflow = ''
  }

  _handleBackdropClick(event) {
    // Bấm vào nền mờ: đích sự kiện là chính hộp thoại, không phải tờ giấy.
    if (event.target === event.currentTarget) this.close()
  }

  _openBlogPost(event) {
    if (
      event.button ||
      event.ctrlKey ||
      event.metaKey ||
      event.shiftKey ||
      event.altKey
    )
      return
    event.preventDefault()
    this.close()
    fireEvent(this, 'nav', {path: PREFACE_PATH})
  }

  renderLoading() {
    return this._renderDialog(
      html`<p class="message" role="status">Đang tải lời tựa…</p>`
    )
  }

  renderContent() {
    return this._renderDialog(this._renderBody())
  }

  _renderDialog(body) {
    return html`<dialog
      class="so"
      aria-labelledby="so-title"
      @close=${this._handleClose}
    >
      <div class="scroll">
        <div class="roller" aria-hidden="true"></div>
        <button
          class="close"
          type="button"
          aria-label="Đóng lời tựa"
          @click=${() => this.close()}
        >
          <grampsjs-icon
            path="${mdiClose}"
            color="currentColor"
            width="22"
            height="22"
          ></grampsjs-icon>
        </button>
        <div class="paper">
          <span class="side left" aria-hidden="true">Phả hệ họ Bùi Hữu</span>
          <span class="side right" aria-hidden="true">${PLACE_SHORT}</span>
          <article class="sheet" aria-label="Lời tựa gia phả">
            <span class="corner tl" aria-hidden="true"></span>
            <span class="corner tr" aria-hidden="true"></span>
            <span class="corner bl" aria-hidden="true"></span>
            <span class="corner br" aria-hidden="true"></span>
            <header>
              <p class="eyebrow">Bản chép năm Canh Tý (2020)</p>
              <h2 id="so-title">Lời tựa</h2>
              <div class="ornament" aria-hidden="true"><span></span></div>
            </header>
            ${body}
          </article>
        </div>
        <div class="roller" aria-hidden="true"></div>
      </div>
    </dialog>`
  }

  _renderBody() {
    if (this.error) {
      return html`<p class="message" role="status">Chưa tải được lời tựa.</p>
        <button class="retry" type="button" @click=${() => this._updateData()}>
          Thử lại
        </button>`
    }
    const note = this._getNote()
    if (!note?.handle) {
      return html`<p class="message">Lời tựa chưa được bổ sung.</p>`
    }
    return html`
      <div class="text">
        ${this._mounted
          ? html`<grampsjs-connected-note
              .handle=${note.handle}
              .framed=${false}
              manuscript
              .appState=${this.appState}
            ></grampsjs-connected-note>`
          : nothing}
        <grampsjs-heritage-mark class="seal"></grampsjs-heritage-mark>
      </div>
      <p class="colophon">
        Bản chép của cụ Bùi Hữu Đặng, tháng Giêng năm Canh Tý (2020). Địa danh
        ghi theo thời điểm chép; từ 7/2025 xã Thụy Trường thuộc xã Đông Thụy
        Anh, tỉnh Hưng Yên.
        <a href="/${PREFACE_PATH}" @click=${this._openBlogPost}
          >Đọc tại trang Bài viết</a
        >
      </p>
    `
  }
}

window.customElements.define('grampsjs-home-preface', GrampsjsHomePreface)
