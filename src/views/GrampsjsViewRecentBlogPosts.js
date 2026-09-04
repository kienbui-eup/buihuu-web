import {html, css} from 'lit'

import {GrampsjsConnectedComponent} from '../components/GrampsjsConnectedComponent.js'
import '../components/GrampsjsSearchResultList.js'
import {fireEvent} from '../util.js'

const FEATURED_POSTS = [
  {
    id: 'SBHNC22',
    title: 'Bài phát biểu ngày khánh thành nhà thờ họ Bùi Hữu',
    description: 'Lịch sử dòng họ và quá trình trùng tu nhà thờ tổ năm 2026',
  },
  {
    id: 'SBHNC23',
    title: 'Văn khấn giỗ tổ năm Bính Ngọ',
    description: 'Văn khấn ngày 24 tháng Giêng, tức 12/03/2026',
  },
]

export class GrampsjsViewRecentBlogPosts extends GrampsjsConnectedComponent {
  static get styles() {
    return [
      super.styles,
      css`
        .change {
          font-size: 0.8em;
          color: var(--grampsjs-body-font-color-50);
          margin-top: 0.3em;
        }

        h3 {
          margin: 0 0 12px;
          font-size: 24px;
        }
        h4 {
          margin: 18px 0 6px;
          color: var(--heritage-ink);
          font: 600 15px/1.5 var(--grampsjs-heading-font-family);
        }
        ul {
          list-style: none;
          margin: 0;
          padding: 0;
        }
        li {
          border-top: 1px solid var(--heritage-rule);
          padding: 10px 0;
        }
        li:first-child {
          border-top: 0;
        }
        a.post {
          display: block;
          min-height: 44px;
          font: 600 16px/1.5 var(--grampsjs-heading-font-family);
          color: var(--md-sys-color-primary);
          text-decoration: none;
        }
        a.post:hover {
          text-decoration: underline;
          text-underline-offset: 4px;
        }
        a.post small {
          display: block;
          font: 400 13px/1.6 var(--grampsjs-body-font-family);
          color: var(--md-sys-color-on-surface-variant);
        }
        p.more {
          margin: 12px 0 0;
          font-size: 0.95em;
        }
      `,
    ]
  }

  renderContent() {
    const featuredIds = new Set(FEATURED_POSTS.map(post => post.id))
    const recentPost = this._data?.data?.find(
      post => !featuredIds.has(post.gramps_id)
    )

    return html`
      <h3>Tư liệu năm Bính Ngọ</h3>
      <ul>
        ${FEATURED_POSTS.map(
          post => html`<li>
            <a class="post" href="/blog/${post.id}"
              >${post.title}<small>${post.description}</small></a
            >
          </li>`
        )}
      </ul>
      ${recentPost
        ? html`<h4>Mới cập nhật</h4>
            <grampsjs-search-result-list
              large
              selectable
              @search-result:clicked="${this._handleClick}"
              .data="${[{object: recentPost, object_type: 'source'}]}"
              .appState="${this.appState}"
              date
              noSep
            >
            </grampsjs-search-result-list>`
        : ''}
      <p class="more"><a href="/blog">Mở kho sử</a></p>
    `
  }

  renderLoading() {
    return html`
      <h3>Tư liệu năm Bính Ngọ</h3>
      <ul>
        ${FEATURED_POSTS.map(
          post => html`<li>
            <a class="post" href="/blog/${post.id}"
              >${post.title}<small>${post.description}</small></a
            >
          </li>`
        )}
      </ul>
      <p class="more"><a href="/blog">Mở kho sử</a></p>
    `
  }

  _handleClick(event) {
    const grampsId = event?.detail?.object?.gramps_id
    if (grampsId) {
      fireEvent(this, 'nav', {path: `blog/${grampsId}`})
    }
  }

  getUrl() {
    const rules = {
      rules: [
        {
          name: 'HasTag',
          values: ['Blog'],
        },
      ],
    }
    return `/api/sources/?rules=${encodeURIComponent(
      JSON.stringify(rules)
    )}&pagesize=3&sort=-change&locale=${
      this.appState.i18n.lang || 'en'
    }&profile=all&extend=all`
  }
}

window.customElements.define(
  'grampsjs-view-recent-blog-posts',
  GrampsjsViewRecentBlogPosts
)
