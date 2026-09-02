import {html, css} from 'lit'
import {
  mdiFamilyTree,
  mdiAccountGroup,
  mdiCandle,
  mdiArrowRight,
  mdiMagnify,
} from '@mdi/js'
import {fireEvent} from '../util.js'
import {heritageFrameStyles} from '../HeritageStyles.js'
import '../components/GrampsjsHeritageMark.js'
import '../components/GrampsjsIcon.js'

import '@material/web/button/text-button'
import '@material/web/button/outlined-button'

import {GrampsjsView} from './GrampsjsView.js'
import './GrampsjsViewRecentlyChanged.js'
import './GrampsjsViewRecentBlogPosts.js'
import './GrampsjsViewAnniversaries.js'
import './GrampsjsViewDeathAnniversaries.js'
import '../components/GrampsjsHomePerson.js'
import '../components/GrampsjsConnectedNote.js'
import '../components/GrampsjsImg.js'
import {
  TREE_CONFIG_HOME_PAGE_NOTE,
  TREE_CONFIG_HOME_PAGE_IMAGE,
} from '../api.js'

export class GrampsjsViewDashboard extends GrampsjsView {
  static get properties() {
    return {
      dbInfo: {type: Object},
      homePersonDetails: {type: Object},
      homePersonGrampsId: {type: String},
    }
  }

  constructor() {
    super()
    this.dbInfo = {}
    this.homePersonDetails = {}
    this.homePersonGrampsId = ''
  }

  static get styles() {
    return [
      super.styles,
      heritageFrameStyles,
      css`
        :host {
          max-width: 1200px;
        }
        .welcome {
          position: relative;
          border-bottom: 1px solid var(--md-sys-color-outline-variant);
          padding: 24px 0 32px;
          display: grid;
          grid-template-columns: minmax(0, 1fr) auto;
          gap: 24px;
          align-items: center;
        }
        .eyebrow {
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: var(--md-sys-color-primary);
          margin: 0 0 8px;
        }
        h1 {
          margin: 0;
          font-size: clamp(40px, 5vw, 64px);
          line-height: 1.2;
          color: var(--md-sys-color-primary);
        }
        .origin {
          font-size: 14px;
          color: var(--md-sys-color-on-surface-variant);
          margin: 12px 0 0;
        }
        .motto {
          margin: 12px 0 0;
          font: 400 16px/1.7 var(--grampsjs-body-font-family);
          color: var(--md-sys-color-on-surface-variant);
        }
        .search {
          display: flex;
          gap: 12px;
          align-items: center;
          max-width: 650px;
          padding: 6px 6px 6px 18px;
          margin: 24px 0;
          border: 1px solid var(--md-sys-color-outline);
          border-radius: 3px;
          background: var(--md-sys-color-surface);
        }
        .search:focus-within {
          outline: 2px solid var(--md-sys-color-primary);
          outline-offset: 2px;
        }
        .search input {
          flex: 1;
          min-width: 0;
          border: 0;
          background: transparent;
          color: var(--md-sys-color-on-surface);
          font: inherit;
          font-size: 16px;
          outline: none;
        }
        .search input::placeholder {
          color: var(--md-sys-color-on-surface-variant);
        }
        .search button {
          min-height: 44px;
          padding: 0 20px;
          background: var(--md-sys-color-primary);
          color: var(--md-sys-color-on-primary);
          border: 0;
          border-radius: 2px;
          font: inherit;
          font-size: 14px;
          cursor: pointer;
        }
        .quick-links {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 0;
          border-top: 1px solid var(--md-sys-color-outline-variant);
          border-bottom: 1px solid var(--md-sys-color-outline-variant);
          margin-bottom: 28px;
        }
        .quick-link {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 20px 16px;
          color: var(--md-sys-color-on-surface);
          background: transparent;
          border-right: 1px solid var(--md-sys-color-outline-variant);
          text-decoration: none;
        }
        .quick-link:hover {
          background: var(--md-sys-color-surface-container);
        }
        .quick-link:last-child {
          border-right: 0;
        }
        .quick-link strong {
          display: block;
          font: 600 18px/1.6 var(--grampsjs-heading-font-family);
        }
        .quick-link small {
          display: block;
          font-size: 12px;
          margin-top: 2px;
          color: var(--md-sys-color-on-surface-variant);
        }
        .quick-link .arrow {
          margin-left: auto;
        }
        .dashboard-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr);
          gap: 24px;
          align-items: start;
        }
        .panel {
          min-width: 0;
          padding: 28px;
          margin-bottom: 20px;
        }
        .panel > h3 {
          margin: 0 0 12px;
        }
        .editor-tools {
          border-top: 1px solid var(--md-sys-color-outline-variant);
          margin-top: 24px;
          padding-top: 12px;
        }
        summary {
          cursor: pointer;
          min-height: 44px;
          align-content: center;
          color: var(--md-sys-color-on-surface-variant);
          font-size: 14px;
        }
        .colophon {
          margin: 28px 0 8px;
          padding-top: 20px;
          border-top: 1px solid var(--md-sys-color-outline-variant);
          font-size: 13px;
          color: var(--md-sys-color-on-surface-variant);
        }

        .buttons {
          display: flex;
          gap: 1em;
          margin-top: 1em;
          flex-wrap: wrap;
        }

        .home-page-block {
          width: 100%;
          margin-top: 2em;
          margin-bottom: 1em;
          overflow: hidden;
          clear: both;
        }

        .home-page-block:not(.home-page-block-combined) {
          padding-left: 1em;
          box-sizing: border-box;
        }

        .home-page-block-combined {
          display: flex;
          gap: 3em;
          align-items: center;
        }

        .home-page-block-combined .home-page-image {
          flex: 0 0 auto;
          margin-top: 1em;
        }

        .home-page-block-combined .home-page-note {
          flex: 1;
          min-width: 0;
        }

        .home-page-image-only {
          display: flex;
          justify-content: center;
          margin-top: 1em;
          margin-bottom: 1.5em;
        }

        @media screen and (max-width: 768px) {
          .welcome {
            display: block;
            padding: 8px 0 20px;
            gap: 12px;
          }
          .welcome grampsjs-heritage-mark {
            position: absolute;
            top: 10px;
            right: 0;
          }
          .welcome h1,
          .eyebrow {
            padding-right: 72px;
          }
          .origin {
            line-height: 1.7;
          }
          .motto {
            font-size: 14px;
          }
          .search {
            margin: 20px 0;
            gap: 8px;
            padding-left: 12px;
          }
          .search button {
            padding: 0 14px;
          }
          .quick-links {
            gap: 0;
            margin-bottom: 20px;
          }
          .quick-link {
            flex-direction: column;
            text-align: center;
            gap: 8px;
            padding: 14px 4px;
          }
          .quick-link strong {
            font: 500 13px/1.6 var(--grampsjs-body-font-family);
          }
          .quick-link small,
          .quick-link .arrow {
            display: none;
          }
          .dashboard-grid {
            grid-template-columns: minmax(0, 1fr);
            gap: 0;
          }
          .panel {
            padding: 22px 18px;
          }

          .home-page-block-combined {
            flex-direction: column;
          }

          .home-page-block-combined .home-page-image {
            flex: unset;
            width: 100%;
          }
        }
      `,
    ]
  }

  _renderHomePageBlock() {
    const noteHandle =
      this.appState.treeConfig?.[TREE_CONFIG_HOME_PAGE_NOTE] ?? ''
    const imageHandle =
      this.appState.treeConfig?.[TREE_CONFIG_HOME_PAGE_IMAGE] ?? ''

    if (!noteHandle) return html``

    if (imageHandle) {
      return html`
        <div class="home-page-block home-page-block-combined">
          <div class="home-page-image">
            <grampsjs-img
              handle="${imageHandle}"
              size="300"
              displayHeight="180"
            ></grampsjs-img>
          </div>
          <div class="home-page-note">
            <grampsjs-connected-note
              handle="${noteHandle}"
              .framed="${false}"
              .appState="${this.appState}"
            ></grampsjs-connected-note>
          </div>
        </div>
      `
    }

    return html`
      <div class="home-page-block">
        <grampsjs-connected-note
          handle="${noteHandle}"
          .framed="${false}"
          .appState="${this.appState}"
        ></grampsjs-connected-note>
      </div>
    `
  }

  _renderHomePageImage() {
    const noteHandle =
      this.appState.treeConfig?.[TREE_CONFIG_HOME_PAGE_NOTE] ?? ''
    const imageHandle =
      this.appState.treeConfig?.[TREE_CONFIG_HOME_PAGE_IMAGE] ?? ''

    if (!imageHandle || noteHandle) return html``

    return html`
      <div class="home-page-image-only">
        <grampsjs-img
          handle="${imageHandle}"
          size="300"
          displayHeight="200"
        ></grampsjs-img>
      </div>
    `
  }

  _searchPeople(event) {
    event.preventDefault()
    const query = this.renderRoot.querySelector('#home-search').value.trim()
    if (query)
      fireEvent(this, 'nav', {path: `search/${encodeURIComponent(query)}`})
  }

  _quickLink(href, icon, title, description) {
    return html`<a class="quick-link" href="${href}">
      <grampsjs-icon
        path="${icon}"
        color="var(--md-sys-color-primary)"
      ></grampsjs-icon>
      <span><strong>${title}</strong><small>${description}</small></span>
      <grampsjs-icon
        class="arrow"
        path="${mdiArrowRight}"
        color="var(--md-sys-color-primary)"
      ></grampsjs-icon>
    </a>`
  }

  renderContent() {
    const hasPeople = Boolean(this.appState.dbInfo?.object_counts?.people)
    const {canEdit} = this.appState.permissions
    return html`
      <header class="welcome">
        <div>
          <p class="eyebrow">Gia phả dòng họ</p>
          <h1>Bùi Hữu</h1>
          <p class="motto">Gìn giữ cội nguồn · Kết nối cháu con</p>
          <p class="origin">Chỉ Bồ · Thụy Trường · Thái Thụy · Thái Bình</p>
        </div>
        <grampsjs-heritage-mark></grampsjs-heritage-mark>
      </header>
      <form class="search" role="search" @submit="${this._searchPeople}">
        <grampsjs-icon
          path="${mdiMagnify}"
          color="var(--md-sys-color-primary)"
        ></grampsjs-icon>
        <input
          id="home-search"
          type="search"
          aria-label="Tìm người trong họ"
          placeholder="Tìm người trong họ…"
          required
        />
        <button type="submit">Tìm</button>
      </form>
      <nav class="quick-links" aria-label="Tra cứu gia phả">
        ${this._quickLink(
          '/tree',
          mdiFamilyTree,
          'Cây gia phả',
          'Lần theo từng thế hệ'
        )}
        ${this._quickLink(
          '/people',
          mdiAccountGroup,
          'Người trong họ',
          'Tra cứu tên và đời'
        )}
        ${this._quickLink(
          '/lich-gio',
          mdiCandle,
          'Lịch giỗ',
          'Tưởng nhớ tổ tiên'
        )}
      </nav>
      ${this._renderHomePageBlock()}
      <div class="dashboard-grid">
        <div>
          ${!hasPeople && canEdit
            ? html`
                <div>
                  <h3>Bắt đầu ghi chép gia phả</h3>
                  <p>
                    ${this._(
                      'To start building your family tree, add yourself as a person or import a family tree file.'
                    )}
                  </p>
                  <div class="buttons">
                    <md-outlined-button href="/new_person"
                      >${this._('New Person')}</md-outlined-button
                    ><md-outlined-button href="/settings/administration"
                      >${this._('Import Family Tree')}</md-outlined-button
                    >
                  </div>
                </div>
              `
            : ''}
          ${hasPeople
            ? html`
                <div class="panel memorial heritage-frame">
                  <p class="section-label">Tưởng niệm</p>
                  <grampsjs-view-death-anniversaries
                    id="death-anniversaries"
                    .appState="${this.appState}"
                  >
                  </grampsjs-view-death-anniversaries>
                </div>
              `
            : ''}
        </div>
        <div>
          ${this._renderHomePageImage()}
          ${hasPeople || this.homePersonGrampsId
            ? html`
                <div class="panel heritage-frame">
                  <p class="section-label">Cội nguồn</p>
                  <grampsjs-home-person
                    id="homeperson"
                    .appState="${this.appState}"
                    .homePersonDetails=${this.homePersonDetails}
                    .homePersonGrampsId=${this.homePersonGrampsId}
                  >
                  </grampsjs-home-person>
                </div>
              `
            : ''}
          <div class="panel heritage-frame">
            <p class="section-label">Chuyện dòng họ</p>
            <grampsjs-view-recent-blog-posts
              id="recent-blog"
              .appState="${this.appState}"
            ></grampsjs-view-recent-blog-posts>
          </div>
        </div>
      </div>
      ${canEdit
        ? html`
            <details class="editor-tools">
              <summary>Công cụ biên soạn gia phả</summary>
              ${this.appState.dbInfo?.object_counts?.events
                ? html`<grampsjs-view-anniversaries
                    .appState="${this.appState}"
                  ></grampsjs-view-anniversaries>`
                : ''}
              <grampsjs-view-recently-changed
                id="recently-changed"
                .appState="${this.appState}"
              >
              </grampsjs-view-recently-changed>
            </details>
          `
        : ''}
      <footer class="colophon">
        Phả hệ Bùi Hữu · Cùng gìn giữ và tiếp nối
      </footer>
    `
  }
}

window.customElements.define('grampsjs-view-dashboard', GrampsjsViewDashboard)
