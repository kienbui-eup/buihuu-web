import {html, css} from 'lit'
import {mdiFamilyTree, mdiAccountGroup, mdiCandle, mdiMagnify} from '@mdi/js'
import {fireEvent} from '../util.js'
import {heritageFrameStyles} from '../HeritageStyles.js'
import '../components/GrampsjsHomePreface.js'
import '../components/GrampsjsTempleHero.js'
import '../components/GrampsjsIcon.js'

import '@material/web/button/text-button'
import '@material/web/button/outlined-button'

import {GrampsjsView} from './GrampsjsView.js'
import './GrampsjsViewRecentlyChanged.js'
import './GrampsjsViewRecentBlogPosts.js'
import './GrampsjsViewAnniversaries.js'
import './GrampsjsViewDeathAnniversaries.js'
import '../components/GrampsjsHomePerson.js'
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
          max-width: none;
          margin: -4px 0 0;
        }
        .dashboard-content {
          padding: 0 var(--heritage-gutter) 40px;
        }
        .opening-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.65fr) minmax(240px, 0.85fr);
          gap: 32px;
          margin: 40px 0 48px;
          align-items: start;
        }
        #loi-tua {
          scroll-margin-top: 88px;
        }
        .family-ledger {
          border-top: 3px solid var(--heritage-gold);
          padding: 30px;
          background: color-mix(
            in srgb,
            var(--heritage-gold) 9%,
            var(--md-sys-color-surface)
          );
        }
        .family-ledger h2 {
          font-size: 26px;
          margin: 0 0 14px;
          color: var(--heritage-ink);
        }
        .family-ledger > p:not(.section-label) {
          font-size: 14px;
          line-height: 1.85;
          color: var(--md-sys-color-on-surface-variant);
        }
        .family-ledger dl {
          margin: 24px 0;
        }
        .family-ledger dl > div {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          gap: 16px;
          border-top: 1px solid var(--heritage-rule);
          padding: 14px 0;
        }
        .family-ledger dt {
          font-size: 13px;
          color: var(--md-sys-color-on-surface-variant);
        }
        .family-ledger dd {
          font: 500 28px/1.3 var(--grampsjs-heading-font-family);
          padding: 0;
          color: var(--heritage-ink);
        }
        .family-ledger a {
          display: inline-flex;
          min-height: 44px;
          align-items: center;
          font-size: 14px;
          text-decoration: underline;
          text-underline-offset: 5px;
        }
        .section-heading {
          border-top: 1px solid var(--heritage-rule);
          padding-top: 28px;
          margin: 0 0 24px;
        }
        .section-heading h2 {
          font-size: 30px;
          margin: 0;
          color: var(--heritage-ink);
        }
        .dashboard-actions {
          display: flex;
          align-items: center;
          gap: 16px;
          margin: 0;
          padding: 24px 0;
          border-bottom: 1px solid var(--heritage-rule);
          container: home-actions / inline-size;
        }
        .search {
          display: flex;
          flex: 1 1 360px;
          min-width: 0;
          gap: 12px;
          align-items: center;
          padding: 6px 6px 6px 18px;
          margin: 0;
          border: 1px solid var(--md-sys-color-outline);
          border-radius: 4px;
          background: var(--md-sys-color-surface);
        }
        .search:focus-within {
          border-color: var(--md-sys-color-primary);
          outline: 2px solid var(--md-sys-color-primary);
          outline-offset: -2px;
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
          text-overflow: ellipsis;
        }
        .search > grampsjs-icon,
        .quick-link > grampsjs-icon {
          flex-shrink: 0;
        }
        .search input::placeholder {
          color: var(--md-sys-color-on-surface-variant);
        }
        .search button {
          display: grid;
          place-items: center;
          flex-shrink: 0;
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
        .submit-icon {
          display: none;
        }
        .search button:focus-visible,
        .quick-link:focus-visible {
          outline: 2px solid var(--md-sys-color-primary);
          outline-offset: 3px;
        }
        .quick-links {
          display: grid;
          flex: 1.4 1 600px;
          min-width: 0;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 0;
          border-top: 0;
          border-bottom: 0;
          margin: 0;
        }
        .quick-link,
        .quick-link:link,
        .quick-link:visited {
          display: flex;
          align-items: center;
          min-width: 0;
          gap: 10px;
          padding: 10px 12px;
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
          font: 600 16px/1.6 var(--grampsjs-heading-font-family);
          white-space: nowrap;
        }
        .quick-link small {
          display: block;
          font-size: 12px;
          margin-top: 2px;
          color: var(--md-sys-color-on-surface-variant);
        }
        .quick-link small {
          white-space: nowrap;
        }
        @container home-actions (max-width: 880px) {
          .search {
            flex: 1;
            gap: 4px;
            padding: 4px;
          }
          .search > grampsjs-icon,
          .submit-label,
          .quick-link-label {
            display: none;
          }
          .search input {
            padding: 0 6px;
          }
          .search button {
            width: 44px;
            padding: 0;
          }
          .submit-icon {
            display: block;
          }
          .quick-links {
            flex: 0 0 auto;
            gap: 4px;
            border: 0;
          }
          .quick-link {
            box-sizing: border-box;
            justify-content: center;
            width: 44px;
            height: 54px;
            padding: 0;
            border: 1px solid var(--md-sys-color-outline-variant);
            border-radius: 3px;
          }
          .quick-link:last-child {
            border-right: 1px solid var(--md-sys-color-outline-variant);
          }
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
        .buttons {
          display: flex;
          gap: 1em;
          margin-top: 1em;
          flex-wrap: wrap;
        }

        .home-page-image-only {
          display: flex;
          justify-content: center;
          margin-top: 1em;
          margin-bottom: 1.5em;
        }

        @media screen and (max-width: 768px) {
          .dashboard-actions {
            margin: 0;
            gap: 8px;
            padding-block: 18px;
          }
          .opening-grid {
            grid-template-columns: minmax(0, 1fr);
            gap: 24px;
            margin: 24px 0 32px;
          }
          .dashboard-grid {
            grid-template-columns: minmax(0, 1fr);
            gap: 0;
          }
          .panel {
            padding: 22px 18px;
          }
        }
      `,
    ]
  }

  _renderHomePageImage() {
    const imageHandle =
      this.appState.treeConfig?.[TREE_CONFIG_HOME_PAGE_IMAGE] ?? ''

    if (!imageHandle) return html``

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
    return html`<a
      class="quick-link"
      href="${href}"
      aria-label="${title}"
      title="${title}"
    >
      <grampsjs-icon
        path="${icon}"
        color="var(--md-sys-color-primary)"
      ></grampsjs-icon>
      <span class="quick-link-label"
        ><strong>${title}</strong><small>${description}</small></span
      >
    </a>`
  }

  renderContent() {
    const hasPeople = Boolean(this.appState.dbInfo?.object_counts?.people)
    const {canEdit} = this.appState.permissions
    return html`
      <grampsjs-temple-hero
        @preface:open=${() =>
          this.renderRoot
            .querySelector('#loi-tua')
            ?.scrollIntoView({behavior: 'smooth', block: 'start'})}
      ></grampsjs-temple-hero>
      <div class="dashboard-content">
        <div class="dashboard-actions">
          <form class="search" role="search" @submit="${this._searchPeople}">
            <grampsjs-icon
              path="${mdiMagnify}"
              color="var(--md-sys-color-primary)"
            ></grampsjs-icon>
            <input
              id="home-search"
              type="search"
              aria-label="Tìm người trong họ"
              placeholder="Tìm người…"
              enterkeyhint="search"
              required
            />
            <button type="submit" aria-label="Tìm người trong họ" title="Tìm">
              <span class="submit-label">Tìm</span>
              <grampsjs-icon
                class="submit-icon"
                path="${mdiMagnify}"
                color="currentColor"
              ></grampsjs-icon>
            </button>
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
        </div>
        <div class="opening-grid">
          <grampsjs-home-preface
            id="loi-tua"
            .appState=${this.appState}
            .noteHandle=${this.appState.treeConfig?.[
              TREE_CONFIG_HOME_PAGE_NOTE
            ] ?? ''}
          ></grampsjs-home-preface>
          <aside class="family-ledger" aria-label="Khái quát gia phả">
            <p class="section-label">Từng người, từng nếp nhà</p>
            <h2>Gia phả hôm nay</h2>
            <p>
              Những trang phả nối các thế hệ với nhau, để mỗi người tìm thấy vị
              trí của mình trong dòng họ.
            </p>
            <dl>
              ${[
                ['people', 'Người trong gia phả'],
                ['families', 'Gia đình'],
                ['places', 'Địa danh'],
              ].map(
                ([key, label]) =>
                  html`<div>
                    <dt>${label}</dt>
                    <dd>
                      ${this.appState.dbInfo?.object_counts?.[
                        key
                      ]?.toLocaleString('vi-VN') ?? '—'}
                    </dd>
                  </div>`
              )}
            </dl>
            <a href="/blog"
              >Tìm hiểu chuyện dòng họ
              <span aria-hidden="true">&nbsp;→</span></a
            >
          </aside>
        </div>
        <div class="section-heading">
          <p class="section-label">Gìn giữ & tiếp nối</p>
          <h2>Những trang ký ức dòng họ</h2>
        </div>
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
      </div>
    `
  }
}

window.customElements.define('grampsjs-view-dashboard', GrampsjsViewDashboard)
