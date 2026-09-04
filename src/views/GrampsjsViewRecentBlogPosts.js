import {html, css} from 'lit'

import {GrampsjsConnectedComponent} from '../components/GrampsjsConnectedComponent.js'
import '../components/GrampsjsSearchResultList.js'

// Hai văn bản của dòng họ được ghim tại mục chính trên trang chủ để con cháu
// có thể mở lại sau khi chúng không còn nằm trong nhóm bài mới nhất.
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

// Ngoài hai văn bản ghim, hiện thêm một bài vừa cập nhật để khối Kho sử vẫn
// phản ánh nội dung mới mà không kéo dài cột bên phải trên trang chủ.
const MAX_RECENT_SHOWN = 1
const MAX_REQUESTED = MAX_RECENT_SHOWN + FEATURED_POSTS.length

export class GrampsjsViewRecentBlogPosts extends GrampsjsConnectedComponent {
  static get styles() {
    return [
      super.styles,
      css`
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
        ul.featured li:first-child {
          border-top: 0;
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
    const recentPosts = (this._data?.data ?? [])
      .filter(post => !featuredIds.has(post.gramps_id))
      .slice(0, MAX_RECENT_SHOWN)

    return html`
      <h3>Tư liệu năm Bính Ngọ</h3>
      <ul class="featured">
        ${FEATURED_POSTS.map(
          post => html`<li>
            <a class="post" href="/blog/${post.id}"
              >${post.title}<small>${post.description}</small></a
            >
          </li>`
        )}
      </ul>
      ${recentPosts.length
        ? html`<h4>Mới cập nhật</h4>
            <ul>
              ${recentPosts.map(
                post => html`<li>
                  <a class="post" href="/blog/${post.gramps_id}"
                    >${post.title}${post.author
                      ? html`<small>${post.author}</small>`
                      : ''}</a
                  >
                </li>`
              )}
            </ul>`
        : ''}
      <p class="more">
        <a href="/blog" class="link">Mở kho sử</a>
      </p>
    `
  }

  renderLoading() {
    return html`
      <h3>Tư liệu năm Bính Ngọ</h3>
      <ul class="featured">
        ${FEATURED_POSTS.map(
          post => html`<li>
            <a class="post" href="/blog/${post.id}"
              >${post.title}<small>${post.description}</small></a
            >
          </li>`
        )}
      </ul>
      <p class="more"><a href="/blog" class="link">Mở kho sử</a></p>
    `
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
    )}&pagesize=${MAX_REQUESTED}&page=1&sort=-change&keys=gramps_id,title,author`
  }
}

window.customElements.define(
  'grampsjs-view-recent-blog-posts',
  GrampsjsViewRecentBlogPosts
)
