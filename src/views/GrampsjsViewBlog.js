import {css, html} from 'lit'
import {mdiPlus} from '@mdi/js'
import '@material/web/fab/fab.js'
import {GrampsjsView} from './GrampsjsView.js'
import '../components/GrampsjsBlogArchive.js'
import '../components/GrampsjsIcon.js'
import {fireEvent} from '../util.js'

export class GrampsjsViewBlog extends GrampsjsView {
  static get styles() {
    return [
      super.styles,
      css`
        :host {
          margin: 24px;
        }
        md-fab {
          position: fixed;
          right: 32px;
          bottom: 32px;
        }
        @media (max-width: 768px) {
          :host {
            margin: 16px;
          }
          md-fab {
            right: 16px;
            bottom: calc(80px + env(safe-area-inset-bottom, 0px));
          }
        }
      `,
    ]
  }

  renderContent() {
    return html`
      <grampsjs-blog-archive
        .appState=${this.appState}
        .active=${this.active}
      ></grampsjs-blog-archive>
      ${this.appState.permissions.canAdd
        ? html`<md-fab
            variant="secondary"
            aria-label="Thêm bài viết"
            @click=${() => fireEvent(this, 'nav', {path: 'new_blog_post'})}
          >
            <grampsjs-icon
              slot="icon"
              .path=${mdiPlus}
              color="var(--mdc-theme-on-secondary)"
            ></grampsjs-icon>
          </md-fab>`
        : ''}
    `
  }
}

window.customElements.define('grampsjs-view-blog', GrampsjsViewBlog)
