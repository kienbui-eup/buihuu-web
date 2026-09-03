/*
The dropdown menu for adding objects in the top app bar
*/

import {html, css, LitElement} from 'lit'
import {sharedStyles} from '../SharedStyles.js'
import {GrampsjsAppStateMixin} from '../mixins/GrampsjsAppStateMixin.js'
import {fireEvent, objectTypeToEndpoint} from '../util.js'

// Các trang người trong họ mở thường xuyên: nạp sẵn.
import '../views/GrampsjsViewPeople.js'
import '../views/GrampsjsViewFamilies.js'
import '../views/GrampsjsViewPlaces.js'
import '../views/GrampsjsViewEvents.js'
import '../views/GrampsjsViewSources.js'
import '../views/GrampsjsViewCitations.js'
import '../views/GrampsjsViewRepositories.js'
import '../views/GrampsjsViewNotes.js'
import '../views/GrampsjsViewPerson.js'
import '../views/GrampsjsViewFamily.js'
import '../views/GrampsjsViewPlace.js'
import '../views/GrampsjsViewEvent.js'
import '../views/GrampsjsViewSource.js'
import '../views/GrampsjsViewBlog.js'
import '../views/GrampsjsViewBlogPost.js'
import '../views/GrampsjsViewLichGio.js'
import '../views/GrampsjsViewCitation.js'
import '../views/GrampsjsViewDashboard.js'
import '../views/GrampsjsViewRepository.js'
import '../views/GrampsjsViewNote.js'
import '../views/GrampsjsViewMedia.js'
import '../views/GrampsjsViewSearch.js'
import '../views/GrampsjsViewSettingsUser.js'
import '../views/GrampsjsViewRecent.js'
import '../views/GrampsjsViewBookmarks.js'
import '../views/GrampsjsViewMap.js'
import '../views/GrampsjsViewTree.js'

/*
Các trang còn lại nạp động khi lần đầu được mở.

Bản gốc import tĩnh 55 view, nên gói khởi động mang cả trò chuyện AI, ADN, báo
cáo, xuất dữ liệu, lịch sử sửa đổi (jsondiffpatch) và mọi form thêm mới, dù con
cháu mở điện thoại ra chỉ để tra một cái tên. Phần tử của các trang này vẫn nằm
sẵn trong template bên dưới; trình duyệt giữ chúng ở dạng chưa định nghĩa và tự
nâng cấp khi module được nạp, Lit giữ lại các thuộc tính đã gán trước đó.
*/
const LAZY_VIEWS = {
  chat: () => import('../views/GrampsjsViewChat.js'),
  export: () => import('../views/GrampsjsViewExport.js'),
  reports: () => import('../views/GrampsjsViewReports.js'),
  report: () => import('../views/GrampsjsViewReport.js'),
  revisions: () => import('../views/GrampsjsViewRevisions.js'),
  revision: () => import('../views/GrampsjsViewRevision.js'),
  'dna-matches': () => import('../views/GrampsjsViewDnaMatches.js'),
  'dna-chromosome': () => import('../views/GrampsjsViewDnaMatches.js'),
  ydna: () => import('../views/GrampsjsViewYDna.js'),
  notifications: () => import('../views/GrampsjsViewNotificationLog.js'),
  tasks: () => import('../views/GrampsjsViewTasks.js'),
  task: () => import('../views/GrampsjsViewTask.js'),
  timeline: () => import('../views/GrampsjsViewTimeline.js'),
  help: () => import('../views/GrampsjsViewHelp.js'),
  medialist: () => import('../views/GrampsjsViewMediaObjects.js'),
  settings: () =>
    Promise.all([
      import('../views/GrampsjsViewSysinfo.js'),
      import('../views/GrampsjsViewAdminSettings.js'),
      import('../views/GrampsjsViewUserManagement.js'),
    ]),
  new_person: () => import('../views/GrampsjsViewNewPerson.js'),
  new_family: () => import('../views/GrampsjsViewNewFamily.js'),
  new_event: () => import('../views/GrampsjsViewNewEvent.js'),
  new_place: () => import('../views/GrampsjsViewNewPlace.js'),
  new_source: () => import('../views/GrampsjsViewNewSource.js'),
  new_citation: () => import('../views/GrampsjsViewNewCitation.js'),
  new_repository: () => import('../views/GrampsjsViewNewRepository.js'),
  new_note: () => import('../views/GrampsjsViewNewNote.js'),
  new_media: () => import('../views/GrampsjsViewNewMedia.js'),
  new_task: () => import('../views/GrampsjsViewNewTask.js'),
  new_blog_post: () => import('../views/GrampsjsViewNewBlogPost.js'),
}

const loadedViews = new Set()

function ensureView(page) {
  const loader = LAZY_VIEWS[page]
  if (!loader || loadedViews.has(page)) return
  loadedViews.add(page)
  loader().catch(error => {
    loadedViews.delete(page)
    // eslint-disable-next-line no-console
    console.error(`Không nạp được trang ${page}`, error)
  })
}

class GrampsjsPages extends GrampsjsAppStateMixin(LitElement) {
  static get styles() {
    return [
      sharedStyles,
      css`
        .page {
          display: none;
        }

        .page[active] {
          display: block;
        }
      `,
    ]
  }

  static get properties() {
    return {
      settings: {type: Object},
      homePersonDetails: {type: Object},
      dbInfo: {type: Object},
    }
  }

  constructor() {
    super()
    this.settings = {}
    this.homePersonDetails = {}
    this.dbInfo = {}
    this._boundPageSearch = event => this._handlePageSearch(event)
  }

  willUpdate(changed) {
    super.willUpdate(changed)
    ensureView(this.appState?.path?.page)
  }

  connectedCallback() {
    super.connectedCallback()
    window.addEventListener('page:search', this._boundPageSearch)
  }

  disconnectedCallback() {
    super.disconnectedCallback()
    window.removeEventListener('page:search', this._boundPageSearch)
  }

  _handlePageSearch(event) {
    const view = this.renderRoot.querySelector('.page[active]')
    if (!view) return
    event.preventDefault()
    if (typeof view.openSearch === 'function') {
      view.openSearch()
      return
    }
    const page = this.appState.path.page
    const type = Object.keys(objectTypeToEndpoint).find(
      key =>
        key === page ||
        objectTypeToEndpoint[key] === page ||
        (key === 'media' && page === 'medialist')
    )
    const search = this.renderRoot.querySelector('grampsjs-view-search')
    search.setSearchScope(type)
    fireEvent(this, 'nav', {path: 'search'})
  }

  render() {
    return html`
      <grampsjs-view-dashboard
        class="page"
        ?active=${this.appState.path.page === 'home'}
        .appState="${this.appState}"
        .dbInfo="${this.dbInfo}"
        .homePersonDetails=${this.homePersonDetails}
        .homePersonGrampsId=${this.settings.homePerson ?? ''}
      ></grampsjs-view-dashboard>
      <grampsjs-view-blog
        class="page"
        ?active=${this.appState.path.page === 'blog' &&
        !this.appState.path.pageId}
        .appState="${this.appState}"
      ></grampsjs-view-blog>
      <grampsjs-view-blog-post
        class="page"
        ?active=${this.appState.path.page === 'blog' &&
        this.appState.path.pageId}
        grampsId="${this.appState.path.pageId}"
        .appState="${this.appState}"
      ></grampsjs-view-blog-post>

      <grampsjs-view-lich-gio
        class="page"
        ?active=${this.appState.path.page === 'lich-gio'}
        .appState="${this.appState}"
      ></grampsjs-view-lich-gio>

      <grampsjs-view-people
        class="page"
        ?active=${this.appState.path.page === 'people'}
        .appState="${this.appState}"
      ></grampsjs-view-people>
      <grampsjs-view-families
        class="page"
        ?active=${this.appState.path.page === 'families'}
        .appState="${this.appState}"
      ></grampsjs-view-families>
      <grampsjs-view-events
        class="page"
        ?active=${this.appState.path.page === 'events'}
        .appState="${this.appState}"
      ></grampsjs-view-events>
      <grampsjs-view-places
        class="page"
        ?active=${this.appState.path.page === 'places'}
        .appState="${this.appState}"
      ></grampsjs-view-places>
      <grampsjs-view-sources
        class="page"
        ?active=${this.appState.path.page === 'sources'}
        .appState="${this.appState}"
      ></grampsjs-view-sources>
      <grampsjs-view-citations
        class="page"
        ?active=${this.appState.path.page === 'citations'}
        .appState="${this.appState}"
      ></grampsjs-view-citations>
      <grampsjs-view-repositories
        class="page"
        ?active=${this.appState.path.page === 'repositories'}
        .appState="${this.appState}"
      ></grampsjs-view-repositories>
      <grampsjs-view-notes
        class="page"
        ?active=${this.appState.path.page === 'notes'}
        .appState="${this.appState}"
      ></grampsjs-view-notes>
      <grampsjs-view-media-objects
        class="page"
        ?active=${this.appState.path.page === 'medialist'}
        .appState="${this.appState}"
      ></grampsjs-view-media-objects>

      <grampsjs-view-dna-matches
        class="page"
        ?active=${['dna-matches', 'dna-chromosome'].includes(
          this.appState.path.page
        )}
        .appState="${this.appState}"
        homePersonGrampsId="${this.homePersonDetails?.gramps_id ?? ''}"
        grampsId="${this.appState.path.pageId}"
        grampsIdMatch="${this.appState.path.pageId2}"
        ?matches="${this.appState.path.page === 'dna-matches'}"
        ?chromosome="${this.appState.path.page === 'dna-chromosome'}"
      ></grampsjs-view-dna-matches>

      <grampsjs-view-ydna
        class="page"
        ?active=${this.appState.path.page === 'ydna'}
        .appState="${this.appState}"
        homePersonGrampsId="${this.homePersonDetails?.gramps_id ?? ''}"
        grampsId="${this.appState.path.pageId}"
      ></grampsjs-view-ydna>

      <grampsjs-view-help
        class="page"
        ?active=${this.appState.path.page === 'help'}
        .appState="${this.appState}"
      ></grampsjs-view-help>
      <grampsjs-view-map
        class="page"
        ?active=${this.appState.path.page === 'map'}
        .appState="${this.appState}"
      ></grampsjs-view-map>
      <grampsjs-view-tree
        class="page"
        ?active=${this.appState.path.page === 'tree'}
        grampsId="${this.settings.homePerson}"
        .appState="${this.appState}"
        .settings="${this.settings}"
      ></grampsjs-view-tree>
      <grampsjs-view-person
        class="page"
        ?active=${this.appState.path.page === 'person'}
        grampsId="${this.appState.path.pageId}"
        .appState="${this.appState}"
        .homePersonDetails=${this.homePersonDetails}
      ></grampsjs-view-person>
      <grampsjs-view-family
        class="page"
        ?active=${this.appState.path.page === 'family'}
        grampsId="${this.appState.path.pageId}"
        .appState="${this.appState}"
      ></grampsjs-view-family>
      <grampsjs-view-event
        class="page"
        ?active=${this.appState.path.page === 'event'}
        grampsId="${this.appState.path.pageId}"
        .appState="${this.appState}"
      ></grampsjs-view-event>
      <grampsjs-view-place
        class="page"
        ?active=${this.appState.path.page === 'place'}
        grampsId="${this.appState.path.pageId}"
        .appState="${this.appState}"
      ></grampsjs-view-place>
      <grampsjs-view-source
        class="page"
        ?active=${this.appState.path.page === 'source'}
        grampsId="${this.appState.path.pageId}"
        .appState="${this.appState}"
      ></grampsjs-view-source>
      <grampsjs-view-citation
        class="page"
        ?active=${this.appState.path.page === 'citation'}
        grampsId="${this.appState.path.pageId}"
        .appState="${this.appState}"
      ></grampsjs-view-citation>
      <grampsjs-view-repository
        class="page"
        ?active=${this.appState.path.page === 'repository'}
        grampsId="${this.appState.path.pageId}"
        .appState="${this.appState}"
      ></grampsjs-view-repository>
      <grampsjs-view-note
        class="page"
        ?active=${this.appState.path.page === 'note'}
        grampsId="${this.appState.path.pageId}"
        .appState="${this.appState}"
      ></grampsjs-view-note>
      <grampsjs-view-media
        class="page"
        ?active=${this.appState.path.page === 'media'}
        grampsId="${this.appState.path.pageId}"
        .appState="${this.appState}"
        .dbInfo="${this.dbInfo}"
      ></grampsjs-view-media>
      ${this.canUseChat
        ? html`
            <grampsjs-view-chat
              class="page"
              ?active=${this.appState.path.page === 'chat'}
              .appState="${this.appState}"
            ></grampsjs-view-chat>
          `
        : ''}
      <grampsjs-view-export
        class="page"
        ?active=${this.appState.path.page === 'export'}
        .appState="${this.appState}"
      ></grampsjs-view-export>
      <grampsjs-view-reports
        class="page"
        ?active=${this.appState.path.page === 'reports'}
        .appState="${this.appState}"
      ></grampsjs-view-reports>
      <grampsjs-view-search
        class="page"
        ?active=${this.appState.path.page === 'search'}
        .appState="${this.appState}"
        .dbInfo="${this.dbInfo}"
      ></grampsjs-view-search>
      <grampsjs-view-recent
        class="page"
        ?active=${this.appState.path.page === 'recent'}
        .appState="${this.appState}"
      ></grampsjs-view-recent>
      <grampsjs-view-bookmarks
        class="page"
        ?active=${this.appState.path.page === 'bookmarks'}
        .appState="${this.appState}"
      ></grampsjs-view-bookmarks>
      <grampsjs-view-tasks
        class="page"
        ?active=${this.appState.path.page === 'tasks'}
        .appState="${this.appState}"
      ></grampsjs-view-tasks>
      <grampsjs-view-notification-log
        class="page"
        ?active=${this.appState.path.page === 'notifications'}
        .appState="${this.appState}"
      ></grampsjs-view-notification-log>
      <grampsjs-view-settings-user
        class="page"
        ?active=${this.appState.path.page === 'settings' &&
        (this.appState.path.pageId === 'user' || !this.appState.path.pageId)}
        .appState="${this.appState}"
      ></grampsjs-view-settings-user>
      ${this.appState.permissions.canManageUsers
        ? html`
            <grampsjs-view-admin-settings
              class="page"
              ?active=${this.appState.path.page === 'settings' &&
              this.appState.path.pageId === 'administration'}
              .appState="${this.appState}"
            ></grampsjs-view-admin-settings>
            <grampsjs-view-user-management
              class="page"
              ?active=${this.appState.path.page === 'settings' &&
              this.appState.path.pageId === 'users'}
              .appState="${this.appState}"
              .dbInfo="${this.dbInfo}"
            ></grampsjs-view-user-management>
          `
        : ''}
      <grampsjs-view-sysinfo
        class="page"
        ?active=${this.appState.path.page === 'settings' &&
        this.appState.path.pageId === 'info'}
        .appState="${this.appState}"
      ></grampsjs-view-sysinfo>
      <grampsjs-view-report
        class="page"
        ?active=${this.appState.path.page === 'report'}
        .appState="${this.appState}"
        reportId="${this.appState.path.pageId}"
      ></grampsjs-view-report>
      ${this.appState.permissions.canViewPrivate
        ? html`
            <grampsjs-view-revisions
              class="page"
              ?active=${this.appState.path.page === 'revisions'}
              .appState="${this.appState}"
            ></grampsjs-view-revisions>
          `
        : ''}
      <grampsjs-view-revision
        class="page"
        transactionId="${this.appState.path.pageId}"
        ?active=${this.appState.path.page === 'revision'}
        .appState="${this.appState}"
      ></grampsjs-view-revision>

      <grampsjs-view-new-person
        class="page"
        ?active=${this.appState.path.page === 'new_person'}
        .appState="${this.appState}"
      ></grampsjs-view-new-person>
      <grampsjs-view-new-family
        class="page"
        ?active=${this.appState.path.page === 'new_family'}
        .appState="${this.appState}"
      ></grampsjs-view-new-family>
      <grampsjs-view-new-event
        class="page"
        ?active=${this.appState.path.page === 'new_event'}
        .appState="${this.appState}"
      ></grampsjs-view-new-event>
      <grampsjs-view-new-place
        class="page"
        ?active=${this.appState.path.page === 'new_place'}
        .appState="${this.appState}"
      ></grampsjs-view-new-place>
      <grampsjs-view-new-source
        class="page"
        ?active=${this.appState.path.page === 'new_source'}
        .appState="${this.appState}"
      ></grampsjs-view-new-source>
      <grampsjs-view-new-citation
        class="page"
        ?active=${this.appState.path.page === 'new_citation'}
        .appState="${this.appState}"
      ></grampsjs-view-new-citation>
      <grampsjs-view-new-repository
        class="page"
        ?active=${this.appState.path.page === 'new_repository'}
        .appState="${this.appState}"
      ></grampsjs-view-new-repository>
      <grampsjs-view-new-note
        class="page"
        ?active=${this.appState.path.page === 'new_note'}
        .appState="${this.appState}"
      ></grampsjs-view-new-note>
      <grampsjs-view-new-media
        class="page"
        ?active=${this.appState.path.page === 'new_media'}
        .appState="${this.appState}"
      ></grampsjs-view-new-media>
      <grampsjs-view-new-task
        class="page"
        ?active=${this.appState.path.page === 'new_task'}
        .appState="${this.appState}"
      ></grampsjs-view-new-task>
      <grampsjs-view-new-blog-post
        class="page"
        ?active=${this.appState.path.page === 'new_blog_post'}
        .appState="${this.appState}"
      ></grampsjs-view-new-blog-post>
      <grampsjs-view-task
        class="page"
        ?active=${this.appState.path.page === 'task'}
        grampsId="${this.appState.path.pageId}"
        .appState="${this.appState}"
      ></grampsjs-view-task>
      <grampsjs-view-timeline
        class="page"
        ?active=${this.appState.path.page === 'timeline'}
        .appState="${this.appState}"
      ></grampsjs-view-timeline>
    `
  }
}

window.customElements.define('grampsjs-pages', GrampsjsPages)
