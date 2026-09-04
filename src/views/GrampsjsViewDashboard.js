import {html, css} from 'lit'
import {getAttributeValue, personProfileDisplayName} from '../util.js'
import {heritageFrameStyles} from '../HeritageStyles.js'
import '../components/GrampsjsHomePreface.js'
import '../components/GrampsjsTempleHero.js'
import '../components/GrampsjsIcon.js'

import '@material/web/button/text-button'
import '@material/web/button/outlined-button'

import {GrampsjsView} from './GrampsjsView.js'
import './GrampsjsViewRecentlyChanged.js'
import './GrampsjsViewRecentBlogPosts.js'
import './GrampsjsViewDeathAnniversaries.js'
import '../components/GrampsjsImg.js'
import {
  TREE_CONFIG_HOME_PAGE_NOTE,
  TREE_CONFIG_HOME_PAGE_IMAGE,
} from '../api.js'
import {
  GENERATIONS,
  BRANCHES_LABEL,
  DEFAULT_HOME_PERSON,
  ATTR_GENERATION,
} from '../branding.js'
import {
  ARTICLE_GIOI_THIEU,
  ARTICLE_HUONG_DAN,
  ARTICLE_GOP_Y,
} from '../components/GrampsjsSiteFooter.js'

// Bài "Cách đọc gia phả": giải thích đời, ngành chi, dòng trưởng, các thẻ.
const ARTICLE_CACH_DOC = '/blog/SBHNC15'

export class GrampsjsViewDashboard extends GrampsjsView {
  static get properties() {
    return {
      dbInfo: {type: Object},
      homePersonDetails: {type: Object},
      homePersonGrampsId: {type: String},
      // Trích đoạn lời tựa do grampsjs-home-preface tải, đưa lên phần giới thiệu.
      _prefaceExcerpt: {state: true},
    }
  }

  constructor() {
    super()
    this.dbInfo = {}
    this.homePersonDetails = {}
    this.homePersonGrampsId = ''
    this._prefaceExcerpt = ''
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
        /* Số liệu bản phả là dải thống kê cuối trang chủ, ngay trên footer. */
        .opening-grid {
          margin: 40px 0 0;
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
          max-width: 42em;
          font-size: 14px;
          line-height: 1.85;
          color: var(--md-sys-color-on-surface-variant);
        }
        /* Bốn số liệu xếp thành một hàng trên màn hình rộng, hai cột trên
           điện thoại; mỗi ô có đường kẻ trên như dòng sổ. Kiểu chung của trang
           cho "dl div" trôi trái (float) nên phải tắt để lưới hoạt động. */
        .family-ledger dl {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
          gap: 0 32px;
          margin: 22px 0 8px;
        }
        .family-ledger dl > div {
          float: none;
          margin-right: 0;
          border-top: 1px solid var(--heritage-rule);
          padding: 14px 0;
        }
        .family-ledger .ledger-links {
          clear: both;
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
        .family-ledger .ledger-links {
          display: flex;
          flex-wrap: wrap;
          gap: 4px 18px;
          margin: 0;
        }
        .family-ledger a {
          display: inline-flex;
          min-height: 44px;
          align-items: center;
          font-size: 14px;
          text-decoration: underline;
          text-underline-offset: 5px;
        }
        .family-ledger dd.text {
          font-size: 20px;
        }
        .family-ledger dd small {
          display: block;
          font: 400 12px/1.5 var(--grampsjs-body-font-family);
          color: var(--md-sys-color-on-surface-variant);
        }
        .starter h3 {
          margin: 0 0 8px;
          font-size: 24px;
        }
        .starter ul {
          list-style: none;
          margin: 0;
          padding: 0;
        }
        .starter li {
          border-top: 1px solid var(--heritage-rule);
          padding: 10px 0;
        }
        .starter li:first-child {
          border-top: 0;
        }
        .starter a {
          display: block;
          min-height: 44px;
          font: 600 16px/1.5 var(--grampsjs-heading-font-family);
          text-decoration: none;
          color: var(--md-sys-color-primary);
        }
        .starter small {
          display: block;
          font-size: 13px;
          line-height: 1.6;
          color: var(--md-sys-color-on-surface-variant);
        }
        .section-heading {
          border-top: 0;
          padding-top: 36px;
          margin: 0 0 24px;
        }
        .section-heading h2 {
          font-size: 30px;
          margin: 0;
          color: var(--heritage-ink);
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
          .opening-grid {
            margin: 28px 0 0;
          }
          .family-ledger {
            padding: 22px 18px;
          }
          .family-ledger dl {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 0 20px;
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

  // Người gốc đưa lên hero: mặc định là thủy tổ (DEFAULT_HOME_PERSON), ai đặt
  // người gốc riêng thì hiện người đó. Chưa tải xong hồ sơ thì hero chưa hiện.
  _founder() {
    const details = this.homePersonDetails
    if (!this.homePersonGrampsId || !details?.gramps_id) return null
    return {
      label:
        this.homePersonGrampsId === DEFAULT_HOME_PERSON
          ? 'Thủy tổ'
          : this._('Home Person'),
      name: personProfileDisplayName(details.profile),
      generation: getAttributeValue(details, ATTR_GENERATION),
      href: `/person/${details.gramps_id}`,
    }
  }

  renderContent() {
    const hasPeople = Boolean(this.appState.dbInfo?.object_counts?.people)
    const {canEdit} = this.appState.permissions
    return html`
      <grampsjs-temple-hero
        .people=${this.appState.dbInfo?.object_counts?.people ?? 0}
        .founder=${this._founder()}
        .prefaceExcerpt=${this._prefaceExcerpt}
        @preface:open=${() => {
          // Toàn văn lời tựa mở thành hộp thoại kiểu tờ sớ, không rời trang chủ.
          this.renderRoot.querySelector('#loi-tua')?.open()
        }}
      ></grampsjs-temple-hero>
      <grampsjs-home-preface
        id="loi-tua"
        .appState=${this.appState}
        .noteHandle=${this.appState.treeConfig?.[TREE_CONFIG_HOME_PAGE_NOTE] ??
        ''}
        @preface:loaded=${event => {
          this._prefaceExcerpt = event.detail?.excerpt ?? ''
        }}
      ></grampsjs-home-preface>
      <div class="dashboard-content">
        <div class="section-heading">
          <p class="section-label">Hôm nay trong họ</p>
          <h2>Giỗ sắp tới, thủy tổ và bài viết mới</h2>
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
                    <p class="section-label">Lịch giỗ</p>
                    <grampsjs-view-death-anniversaries
                      id="death-anniversaries"
                      .appState="${this.appState}"
                    >
                    </grampsjs-view-death-anniversaries>
                  </div>
                `
              : ''}
            <div class="panel starter heritage-frame">
              <p class="section-label">Mới vào trang</p>
              <h3>Đọc trước khi tra cứu</h3>
              <ul>
                <li>
                  <a href="${ARTICLE_GIOI_THIEU}"
                    >Giới thiệu dòng họ
                    <small
                      >Thủy tổ, các đời đầu, ba ngành năm chi và nhà thờ tổ ở
                      Chỉ Bồ</small
                    ></a
                  >
                </li>
                <li>
                  <a href="${ARTICLE_CACH_DOC}"
                    >Cách đọc gia phả
                    <small
                      >Đời tính từ ai, ngành chi là gì, dòng trưởng, tên tự, các
                      thẻ "Chỉ có tên", "Cần soát lại"</small
                    ></a
                  >
                </li>
                <li>
                  <a href="${ARTICLE_HUONG_DAN}"
                    >Hướng dẫn tra cứu trên điện thoại
                    <small
                      >Tìm người, đọc cây, xem giỗ, tải lịch giỗ về máy, mã dòng
                      họ</small
                    ></a
                  >
                </li>
                <li>
                  <a href="${ARTICLE_GOP_Y}"
                    >Góp ý và sửa sai
                    <small
                      >Thấy sai tên, đời, ngày giỗ hay thiếu người thì báo thế
                      nào</small
                    ></a
                  >
                </li>
              </ul>
            </div>
          </div>
          <div>
            ${this._renderHomePageImage()}
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
                <grampsjs-view-recently-changed
                  id="recently-changed"
                  .appState="${this.appState}"
                >
                </grampsjs-view-recently-changed>
              </details>
            `
          : ''}
        <div class="opening-grid">
          <aside class="family-ledger" aria-label="Số liệu bản phả">
            <p class="section-label">Bản số hóa</p>
            <h2>Số liệu bản phả</h2>
            <p>
              Tính trên phần gia phả đã nhập từ các sổ chi, chưa phải điều tra
              dân số hay xác nhận huyết thống.
            </p>
            <dl>
              <div>
                <dt>Đời</dt>
                <dd>${GENERATIONS}</dd>
              </div>
              <div>
                <dt>Ngành, chi</dt>
                <dd class="text">${BRANCHES_LABEL}</dd>
              </div>
              <div>
                <dt>Người ghi trong phả</dt>
                <dd>
                  ${this.appState.dbInfo?.object_counts?.people?.toLocaleString(
                    'vi-VN'
                  ) ?? '—'}
                  <small>nhiều người mới có tên, chưa có dòng riêng</small>
                </dd>
              </div>
              <div>
                <dt>Cặp vợ chồng</dt>
                <dd>
                  ${this.appState.dbInfo?.object_counts?.families?.toLocaleString(
                    'vi-VN'
                  ) ?? '—'}
                </dd>
              </div>
            </dl>
            <p class="ledger-links">
              <a href="${ARTICLE_GIOI_THIEU}"
                >Giới thiệu dòng họ <span aria-hidden="true">&nbsp;→</span></a
              ><a href="${ARTICLE_CACH_DOC}"
                >Cách đọc gia phả <span aria-hidden="true">&nbsp;→</span></a
              >
            </p>
          </aside>
        </div>
      </div>
    `
  }
}

window.customElements.define('grampsjs-view-dashboard', GrampsjsViewDashboard)
