import {LitElement, css, html, nothing} from 'lit'
import {mdiClose, mdiOpenInNew} from '@mdi/js'

import '@material/web/iconbutton/icon-button.js'
import {GrampsjsAppStateMixin} from '../mixins/GrampsjsAppStateMixin.js'
import {fireEvent} from '../util.js'
import {heritageFrameStyles} from '../HeritageStyles.js'
import './GrampsjsIcon.js'
import './GrampsjsPersonPreview.js'
import './GrampsjsFamily.js'
import './GrampsjsPlace.js'
import './GrampsjsEvent.js'
import './GrampsjsSource.js'
import './GrampsjsCitation.js'
import './GrampsjsRepository.js'
import './GrampsjsNote.js'
import './GrampsjsMediaObject.js'

const SHOW_DELAY = 200
const HIDE_DELAY = 250
const CACHE_MAX_SIZE = 50
const POPUP_MARGIN = 8

const NOTE_LINK_FORMAT = encodeURIComponent(
  JSON.stringify({link_format: '/{obj_class}/{gramps_id}'})
)

const URLS = {
  person: (id, lang) =>
    `/api/people/?gramps_id=${encodeURIComponent(
      id
    )}&locale=${lang}&profile=families&keys=handle,gramps_id,primary_name,alternate_names,attribute_list,profile&precision=1`,
  family: (id, lang) =>
    `/api/families/?gramps_id=${id}&locale=${lang}&profile=all&backlinks=true&extend=all&precision=1`,
  place: (id, lang) =>
    `/api/places/?gramps_id=${id}&backlinks=true&extend=all&locale=${lang}&precision=1&profile=all`,
  event: (id, lang) =>
    `/api/events/?gramps_id=${id}&locale=${lang}&profile=all&backlinks=true&extend=all`,
  source: (id, lang) =>
    `/api/sources/?gramps_id=${id}&locale=${lang}&profile=all&backlinks=true&extend=all`,
  citation: (id, lang) =>
    `/api/citations/?gramps_id=${id}&locale=${lang}&profile=all&backlinks=true&extend=all`,
  repository: (id, lang) =>
    `/api/repositories/?gramps_id=${id}&locale=${lang}&profile=all&backlinks=true&extend=all`,
  note: (id, lang) =>
    `/api/notes/?gramps_id=${id}&locale=${lang}&profile=all&backlinks=true&extend=all&formats=html&format_options=${NOTE_LINK_FORMAT}`,
  media: (id, lang) =>
    `/api/media/?gramps_id=${id}&locale=${lang}&backlinks=true&extend=all&profile=all`,
}

export class GrampsjsObjectPreview extends GrampsjsAppStateMixin(LitElement) {
  static get styles() {
    return [
      heritageFrameStyles,
      css`
        :host {
          display: block;
          position: fixed;
          z-index: 9999;
          top: 0;
          left: 0;
        }

        #popup {
          position: fixed;
          display: flex;
          flex-direction: column;
          width: 480px;
          max-width: calc(100vw - 16px);
          max-height: min(520px, calc(100dvh - 16px));
          background: var(--grampsjs-frame-paper);
          color: var(--md-sys-color-on-surface);
          border: 1px solid transparent;
          border-radius: var(--grampsjs-frame-radius);
          padding: 6px;
          box-shadow: 0 8px 24px var(--grampsjs-body-font-color-10),
            0 2px 8px var(--grampsjs-body-font-color-10);
          box-sizing: border-box;
          visibility: hidden;
          opacity: 0;
          transition: opacity 0.15s ease, visibility 0.15s ease;
          pointer-events: none;
          overflow: hidden;
        }

        #popup.person {
          width: 320px;
          max-height: min(420px, calc(100dvh - 16px));
        }

        #popup.visible {
          visibility: visible;
          opacity: 1;
          pointer-events: auto;
        }

        header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 4px 8px 0 16px;
          flex-shrink: 0;
          font: 500 11px/1.4 var(--grampsjs-body-font-family, sans-serif);
          color: var(--md-sys-color-primary);
          letter-spacing: 0.04em;
        }

        #close-btn {
          width: 32px;
          height: 32px;
          --md-icon-button-icon-size: 18px;
        }

        #open-btn {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-shrink: 0;
          min-height: 44px;
          padding: 8px 16px;
          border: 0;
          border-top: 1px solid var(--md-sys-color-outline-variant);
          background: transparent;
          color: var(--md-sys-color-primary);
          font: 500 13px/1.5 var(--grampsjs-body-font-family, sans-serif);
          cursor: pointer;
          text-align: left;
        }

        #open-btn:hover {
          background: var(--md-sys-color-surface-container-high);
        }

        #open-btn:focus-visible {
          outline: 2px solid var(--md-sys-color-primary);
          outline-offset: -3px;
        }

        #content {
          min-height: 0;
          overflow-y: auto;
          overscroll-behavior: contain;
          padding: 0 16px 14px;
          box-sizing: border-box;
        }

        .status {
          margin: 8px 0;
          font: 400 13px/1.5 var(--grampsjs-body-font-family, sans-serif);
        }
      `,
    ]
  }

  static get properties() {
    return {
      _visible: {type: Boolean},
      _objectType: {type: String},
      _grampsId: {type: String},
      _data: {type: Object},
      _loading: {type: Boolean},
      _x: {type: Number},
      _y: {type: Number},
    }
  }

  constructor() {
    super()
    this._visible = false
    this._objectType = ''
    this._grampsId = ''
    this._data = null
    this._loading = false
    this._x = 0
    this._y = 0
    this._cache = new Map()
    this._showTimer = null
    this._hideTimer = null
    this._mouseInPopup = false
    this._requestId = 0
    this._cacheGeneration = 0
    this._anchorRect = null
    this._anchorElement = null
    this._pendingAnchor = null
    this._pointer = null
    this._boundPointerMove = event => {
      this._pointer = {x: event.clientX, y: event.clientY}
      this._checkPointer()
    }
    this._boundPointerOut = event => {
      if (!event.relatedTarget) this._dismiss()
    }
    this._boundVisibility = () => {
      if (document.hidden) this._dismiss()
    }
    this._boundShow = this._handleShow.bind(this)
    this._boundHide = this._handleHide.bind(this)
    this._boundNav = this._dismiss.bind(this)
    this._boundKey = event => {
      if (event.key === 'Escape') this._dismiss()
    }
    this._boundOutside = event => {
      if (!event.composedPath().includes(this)) {
        this._dismiss()
      }
    }
    this._boundDbChanged = () => {
      this._cache.clear()
      this._cacheGeneration += 1
      this._requestId += 1
      this._dismiss()
    }
  }

  connectedCallback() {
    super.connectedCallback()
    window.addEventListener('object:preview-show', this._boundShow)
    window.addEventListener('object:preview-hide', this._boundHide)
    window.addEventListener('nav', this._boundNav)
    window.addEventListener('db:changed', this._boundDbChanged)
    window.addEventListener('keydown', this._boundKey)
    window.addEventListener('resize', this._boundNav)
    window.addEventListener('blur', this._boundNav)
    window.addEventListener('pointermove', this._boundPointerMove, true)
    window.addEventListener('pointerout', this._boundPointerOut, true)
    document.addEventListener('visibilitychange', this._boundVisibility)
    window.addEventListener('scroll', this._boundOutside, true)
    window.addEventListener('pointerdown', this._boundOutside, true)
    window.addEventListener('wheel', this._boundOutside, {
      passive: true,
      capture: true,
    })
    this.updateComplete.then(() => {
      if (!this.isConnected) return
      this._resizeObserver = new ResizeObserver(() => this._position())
      this._resizeObserver.observe(this.renderRoot.querySelector('#popup'))
    })
  }

  disconnectedCallback() {
    super.disconnectedCallback()
    window.removeEventListener('object:preview-show', this._boundShow)
    window.removeEventListener('object:preview-hide', this._boundHide)
    window.removeEventListener('nav', this._boundNav)
    window.removeEventListener('db:changed', this._boundDbChanged)
    window.removeEventListener('keydown', this._boundKey)
    window.removeEventListener('resize', this._boundNav)
    window.removeEventListener('blur', this._boundNav)
    window.removeEventListener('pointermove', this._boundPointerMove, true)
    window.removeEventListener('pointerout', this._boundPointerOut, true)
    document.removeEventListener('visibilitychange', this._boundVisibility)
    window.removeEventListener('scroll', this._boundOutside, true)
    window.removeEventListener('pointerdown', this._boundOutside, true)
    window.removeEventListener('wheel', this._boundOutside, true)
    this._resizeObserver?.disconnect()
    this._dismiss()
  }

  updated(changed) {
    if (
      changed.has('_visible') ||
      changed.has('_data') ||
      changed.has('_objectType') ||
      changed.has('_loading')
    ) {
      this._position()
    }
    this._checkPointer()
  }

  _dismiss() {
    clearTimeout(this._showTimer)
    clearTimeout(this._hideTimer)
    this._showTimer = null
    this._hideTimer = null
    this._pendingAnchor = null
    this._anchorElement = null
    this._anchorObserver?.disconnect()
    this._mouseInPopup = false
    this._visible = false
  }

  _cacheKey(objectType, grampsId) {
    const lang = this.appState?.i18n?.lang || 'en'
    return `${
      this.appState?.dbInfo?.tree?.id || ''
    }:${objectType}:${grampsId}:${lang}`
  }

  // Debounced: a burst of `object:preview-show` events (e.g. sweeping the
  // cursor across many chart nodes in quick succession) resolves to a
  // single preview once the cursor settles on one target for SHOW_DELAY ms.
  _handleShow(e) {
    const detail = e.detail
    if (window.matchMedia('(hover: none)').matches || !detail?.anchorRect)
      return
    clearTimeout(this._hideTimer)
    this._hideTimer = null
    clearTimeout(this._showTimer)
    this._pendingAnchor = detail
    this._showTimer = setTimeout(() => {
      this._showTimer = null
      this._pendingAnchor = null
      if (detail.anchorElement && !detail.anchorElement.isConnected) return
      this._showPreview(detail)
    }, SHOW_DELAY)
  }

  _showPreview({objectType, grampsId, anchorRect, anchorElement}) {
    this._requestId += 1
    this._objectType = objectType
    this._grampsId = grampsId
    this._anchorRect = anchorRect
    this._anchorElement = anchorElement || null
    this._anchorObserver?.disconnect()
    if (anchorElement) {
      this._anchorObserver = new MutationObserver(() => {
        if (!anchorElement.isConnected) this._dismiss()
      })
      // Removing a hovered SVG node does not reliably fire mouseleave.
      this._anchorObserver.observe(anchorElement.getRootNode(), {
        childList: true,
        subtree: true,
      })
    }
    this._mouseInPopup = false
    this._visible = true
    this.updateComplete.then(() => {
      const content = this.renderRoot.querySelector('#content')
      if (content) content.scrollTop = 0
      this._position()
    })

    const cacheKey = this._cacheKey(objectType, grampsId)
    if (this._cache.has(cacheKey)) {
      this._data = this._cache.get(cacheKey)
      this._loading = false
    } else {
      this._data = null
      this._loading = true
      this._fetchData(objectType, grampsId, this._requestId)
    }
  }

  _handleHide() {
    clearTimeout(this._showTimer)
    this._showTimer = null
    this._pendingAnchor = null
    if (this._pointer) {
      this._mouseInPopup = this._containsPointer(
        this.renderRoot.querySelector('#popup')?.getBoundingClientRect()
      )
    }
    if (this._mouseInPopup) return
    this._scheduleHide()
  }

  _scheduleHide() {
    // Do not restart the delay on every pointer movement outside the popup.
    if (this._hideTimer === null) {
      this._hideTimer = setTimeout(() => this._dismiss(), HIDE_DELAY)
    }
  }

  _containsPointer(rect) {
    const p = this._pointer
    return !!(
      p &&
      rect &&
      p.x >= rect.left &&
      p.x <= rect.right &&
      p.y >= rect.top &&
      p.y <= rect.bottom
    )
  }

  _checkPointer() {
    if (!this._pointer || (!this._visible && !this._pendingAnchor)) return
    const anchorElement =
      this._pendingAnchor?.anchorElement || this._anchorElement
    const rect = anchorElement?.isConnected
      ? anchorElement.getBoundingClientRect()
      : this._pendingAnchor?.anchorRect || this._anchorRect
    const inAnchor =
      (!anchorElement || anchorElement.isConnected) &&
      this._containsPointer(rect)
    this._mouseInPopup =
      this._visible &&
      this._containsPointer(
        this.renderRoot.querySelector('#popup')?.getBoundingClientRect()
      )
    if (inAnchor || this._mouseInPopup) {
      clearTimeout(this._hideTimer)
      this._hideTimer = null
    } else {
      clearTimeout(this._showTimer)
      this._showTimer = null
      this._pendingAnchor = null
      this._scheduleHide()
    }
  }

  _position() {
    const anchorRect = this._anchorRect
    const popup = this.renderRoot.querySelector('#popup')
    if (!this._visible || !anchorRect || !popup) return
    const viewportW = window.innerWidth
    const viewportH = window.innerHeight
    const {width, height} = popup.getBoundingClientRect()
    const clamp = (value, limit) =>
      Math.max(POPUP_MARGIN, Math.min(value, limit - POPUP_MARGIN))
    // On a vertical tree, leave the ancestors and children above/below visible.
    const candidates = [
      {
        x: anchorRect.right + POPUP_MARGIN,
        y: clamp(anchorRect.top, viewportH - height),
      },
      {
        x: anchorRect.left - width - POPUP_MARGIN,
        y: clamp(anchorRect.top, viewportH - height),
      },
      {
        x: clamp(anchorRect.left, viewportW - width),
        y: anchorRect.bottom + POPUP_MARGIN,
      },
      {
        x: clamp(anchorRect.left, viewportW - width),
        y: anchorRect.top - height - POPUP_MARGIN,
      },
    ]
    const fits = ({x, y}) =>
      x >= POPUP_MARGIN &&
      y >= POPUP_MARGIN &&
      x + width <= viewportW - POPUP_MARGIN &&
      y + height <= viewportH - POPUP_MARGIN
    // A narrow viewport may have no free side: keep the entire card on screen.
    const position =
      candidates.find(fits) ||
      candidates
        .map(({x, y}) => ({
          x: clamp(x, viewportW - width),
          y: clamp(y, viewportH - height),
        }))
        .sort((a, b) => {
          const overlap = ({x, y}) =>
            Math.max(
              0,
              Math.min(x + width, anchorRect.right) -
                Math.max(x, anchorRect.left)
            ) *
            Math.max(
              0,
              Math.min(y + height, anchorRect.bottom) -
                Math.max(y, anchorRect.top)
            )
          return overlap(a) - overlap(b)
        })[0]
    this._x = position.x
    this._y = position.y
  }

  async _fetchData(objectType, grampsId, requestId) {
    const lang = this.appState?.i18n?.lang || 'en'
    const urlFn = URLS[objectType]
    const cacheKey = this._cacheKey(objectType, grampsId)
    const generation = this._cacheGeneration
    try {
      const result = urlFn
        ? await this.appState.apiGet(urlFn(grampsId, lang))
        : null
      const data = result?.data?.[0]
      if (generation !== this._cacheGeneration) return
      if (data) {
        if (this._cache.size >= CACHE_MAX_SIZE) {
          this._cache.delete(this._cache.keys().next().value)
        }
        this._cache.set(cacheKey, data)
      }
      if (requestId === this._requestId) this._data = data || null
    } catch {
      if (requestId === this._requestId) this._data = null
    } finally {
      if (requestId === this._requestId) this._loading = false
    }
  }

  _handlePopupMouseEnter() {
    clearTimeout(this._hideTimer)
    this._hideTimer = null
    clearTimeout(this._showTimer)
    this._showTimer = null
    this._pendingAnchor = null
    this._mouseInPopup = true
  }

  _handlePopupMouseLeave() {
    this._mouseInPopup = false
    this._handleHide()
  }

  _handleOpen() {
    this._dismiss()
    fireEvent(this, 'nav', {path: `${this._objectType}/${this._grampsId}`})
  }

  _renderContent() {
    if (!this._data)
      return html`<p class="status" role="status">
        ${this._loading
          ? 'Đang tải thông tin…'
          : 'Chưa tải được thông tin. Mở hồ sơ để xem thêm.'}
      </p>`
    switch (this._objectType) {
      case 'person':
        return html`<grampsjs-person-preview
          .data=${this._data}
        ></grampsjs-person-preview>`
      case 'family':
        return html`<grampsjs-family
          .data=${this._data}
          .appState=${this.appState}
          ?preview=${true}
        ></grampsjs-family>`
      case 'place':
        return html`<grampsjs-place
          .data=${this._data}
          .appState=${this.appState}
          ?preview=${true}
        ></grampsjs-place>`
      case 'event':
        return html`<grampsjs-event
          .data=${this._data}
          .appState=${this.appState}
          ?preview=${true}
        ></grampsjs-event>`
      case 'source':
        return html`<grampsjs-source
          .data=${this._data}
          .appState=${this.appState}
          ?preview=${true}
        ></grampsjs-source>`
      case 'citation':
        return html`<grampsjs-citation
          .data=${this._data}
          .appState=${this.appState}
          ?preview=${true}
        ></grampsjs-citation>`
      case 'repository':
        return html`<grampsjs-repository
          .data=${this._data}
          .appState=${this.appState}
          ?preview=${true}
        ></grampsjs-repository>`
      case 'note':
        return html`<grampsjs-note
          .data=${this._data}
          .appState=${this.appState}
          ?preview=${true}
        ></grampsjs-note>`
      case 'media':
        return html`<grampsjs-media-object
          .data=${this._data}
          .appState=${this.appState}
          ?preview=${true}
        ></grampsjs-media-object>`
      default:
        return nothing
    }
  }

  render() {
    return html`
      <div
        id="popup"
        class="${this._visible ? 'visible' : ''} ${this._objectType === 'person'
          ? 'person'
          : ''}"
        role="dialog"
        aria-label="Xem nhanh"
        style="left:${this._x}px;top:${this._y}px"
        @mouseenter="${this._handlePopupMouseEnter}"
        @mouseleave="${this._handlePopupMouseLeave}"
      >
        <header>
          <span
            >${this._objectType === 'person'
              ? 'Thông tin gia phả'
              : 'Xem nhanh'}</span
          >
          <md-icon-button
            id="close-btn"
            @click=${this._dismiss}
            aria-label="Đóng"
            title="Đóng"
          >
            <grampsjs-icon path=${mdiClose}></grampsjs-icon>
          </md-icon-button>
        </header>
        <div id="content">${this._renderContent()}</div>
        <button id="open-btn" @click=${this._handleOpen}>
          ${this._objectType === 'person' ? 'Xem hồ sơ' : 'Xem chi tiết'}
          <grampsjs-icon path=${mdiOpenInNew}></grampsjs-icon>
        </button>
      </div>
    `
  }
}

window.customElements.define('grampsjs-object-preview', GrampsjsObjectPreview)
