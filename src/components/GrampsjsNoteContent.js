import {html, css, LitElement} from 'lit'
import {classMap} from 'lit/directives/class-map.js'
import {sharedStyles} from '../SharedStyles.js'
import {linkUrls} from '../util.js'

const NAVIGABLE = new Set([
  'person',
  'family',
  'event',
  'place',
  'source',
  'citation',
  'repository',
  'note',
  'media',
])
const PREVIEWABLE = new Set([
  'person',
  'family',
  'place',
  'event',
  'source',
  'citation',
  'repository',
  'note',
  'media',
])
const NO_HOVER =
  typeof window !== 'undefined' && window.matchMedia?.('(hover: none)').matches

export function _parseGrampsHref(href) {
  // Resolved link from link_format: /person/I0042 or person/I0042
  const m = href.match(/^\/?([a-z]+)\/([^/]+)$/)
  if (m && NAVIGABLE.has(m[1])) return {objectType: m[1], grampsId: m[2]}
  return null
}

export class GrampsjsNoteContent extends LitElement {
  static get styles() {
    return [
      sharedStyles,
      css`
        :host {
          font-family: var(
            --grampsjs-note-font-family,
            var(--grampsjs-body-font-family)
          );
          font-size: var(--grampsjs-note-font-size, 17px);
          line-height: var(--grampsjs-note-line-height, 1.7em);
          color: var(--grampsjs-note-color);
        }

        .note {
          font-weight: 350;
        }

        .note.columns {
          column-width: var(--grampsjs-note-column-width, 30em);
          column-gap: 2em;
          orphans: 2;
          widows: 2;
        }

        .note.manuscript {
          font-weight: 400;
          text-align: justify;
        }

        .manuscript p {
          margin: 0 0 1em;
          text-indent: 1.5em;
          orphans: 3;
          widows: 3;
        }

        .manuscript .manuscript-preamble {
          text-align: center;
          text-indent: 0;
          font-style: italic;
          font-size: 0.95em;
          margin: 0 0 0.65em;
        }

        .manuscript .manuscript-preamble:first-child {
          font-style: normal;
          letter-spacing: 0.06em;
          color: var(--md-sys-color-primary);
        }

        .manuscript .manuscript-opening {
          margin-top: 1.5em;
          text-indent: 0;
        }

        .manuscript .manuscript-opening::first-letter {
          float: left;
          margin: 7px 8px 0 0;
          font-size: 3.1em;
          line-height: 0.85;
          color: var(--md-sys-color-primary);
        }

        .manuscript .manuscript-closing {
          margin-top: 1.5em;
          padding-top: 0.75em;
          border-top: 1px solid var(--md-sys-color-outline-variant);
          text-align: right;
          text-indent: 0;
          font-style: italic;
        }

        @media (max-width: 768px) {
          .note.manuscript {
            text-align: left;
          }
        }

        .note-container.frame {
          border-left: 3px solid var(--md-sys-color-outline-variant);
          padding: 4px 24px;
        }

        .note-container.frame p {
          margin: 2em 0em;
        }

        .note-container.frame p:first-child {
          margin-top: 0;
        }

        .note-container.frame p:last-child {
          margin-bottom: 0;
        }
      `,
    ]
  }

  static get properties() {
    return {
      grampsId: {type: String},
      content: {type: String},
      framed: {type: Boolean},
      columns: {type: Boolean},
      manuscript: {type: Boolean},
    }
  }

  constructor() {
    super()
    this.framed = false
    this.columns = false
    this.manuscript = false
  }

  render() {
    return html`
      <div class="note-container ${this.framed ? 'frame' : ''}">
        <div
          id="note-content"
          class="${classMap({
            note: true,
            columns: this.columns,
            manuscript: this.manuscript,
          })}"
        ></div>
        <slot></slot>
      </div>
    `
  }

  updated() {
    const noteContent = this.shadowRoot.getElementById('note-content')
    noteContent.innerHTML = linkUrls(this.content)
    this.columns = !this.manuscript && noteContent.textContent.length > 1000
    if (this.manuscript) {
      const paragraphs = [...noteContent.querySelectorAll('p')]
      const opening = paragraphs.findIndex(
        paragraph => paragraph.textContent.trim().length > 160
      )
      if (opening >= 0) {
        paragraphs.slice(0, opening).forEach(paragraph => {
          paragraph.classList.add('manuscript-preamble')
        })
        paragraphs[opening].classList.add('manuscript-opening')
        const closing = paragraphs[paragraphs.length - 1]
        if (
          closing !== paragraphs[opening] &&
          closing.textContent.length < 160
        ) {
          closing.classList.add('manuscript-closing')
        }
      }
    }
    this._wireLinks(noteContent)
  }

  _wireLinks(container) {
    for (const a of container.querySelectorAll('a[href]')) {
      const parsed = _parseGrampsHref(a.getAttribute('href'))
      if (!parsed) continue
      a.addEventListener('click', e => {
        if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey)
          return
        e.preventDefault()
        this.dispatchEvent(
          new CustomEvent('nav', {
            bubbles: true,
            composed: true,
            detail: {path: `${parsed.objectType}/${parsed.grampsId}`},
          })
        )
      })
      if (NO_HOVER || !PREVIEWABLE.has(parsed.objectType)) continue
      a.addEventListener('mouseenter', () => {
        window.dispatchEvent(
          new CustomEvent('object:preview-show', {
            detail: {
              objectType: parsed.objectType,
              grampsId: parsed.grampsId,
              anchorRect: a.getBoundingClientRect(),
              anchorElement: a,
            },
          })
        )
      })
      a.addEventListener('mouseleave', () => {
        window.dispatchEvent(new CustomEvent('object:preview-hide'))
      })
    }
  }
}

window.customElements.define('grampsjs-note-content', GrampsjsNoteContent)
