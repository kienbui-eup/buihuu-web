import {LitElement, html, css} from 'lit'
import {classMap} from 'lit/directives/class-map.js'
import '@material/web/iconbutton/icon-button.js'
import '@material/web/menu/menu.js'
import '@material/web/menu/menu-item.js'
import {mdiFamilyTree} from '@mdi/js'

import {GrampsjsAppStateMixin} from '../mixins/GrampsjsAppStateMixin.js'
import {loadTreePeople} from '../charts/treeData.js'
import {getBranch, formatBranch, getGeneration} from '../charts/util.js'
import {fireEvent} from '../util.js'
import './GrampsjsIcon.js'

/*
Bộ chọn nhánh gọn trong cột công cụ bên phải: một nút biểu tượng mở menu gồm
"Nhánh chính" (mặc định), từng ngành chi và "Toàn gia phả". Con cháu vẫn chọn
đúng "chi nhà mình" nhưng vùng vẽ không còn bị một dãy nút ngang che khuất;
hậu duệ của một người bất kỳ vẫn mở từ nút trên thẻ.

Người đầu chi tính từ dữ liệu phả đồ đã tải (loadTreePeople, chung bộ đệm với
biểu đồ nên không tốn thêm lượt gọi): người mang thẻ chi mà cha mẹ không mang
thẻ đó. Nếu còn nhiều người (vợ người đầu chi cũng mang thẻ) thì ưu tiên nam,
rồi đời nhỏ nhất, rồi mã Gramps nhỏ nhất (mã đánh theo thứ tự sổ họ).
*/

const GENDER_MALE = 1

function compareRoots(a, b) {
  return (
    a.branch.branch - b.branch.branch ||
    (a.branch.sub ?? 0) - (b.branch.sub ?? 0)
  )
}

function compareCandidates(a, b) {
  const male =
    (a.gender === GENDER_MALE ? 0 : 1) - (b.gender === GENDER_MALE ? 0 : 1)
  if (male) return male
  const generation =
    (Number(getGeneration(a)) || 99) - (Number(getGeneration(b)) || 99)
  if (generation) return generation
  return String(a.gramps_id).localeCompare(String(b.gramps_id), 'vi', {
    numeric: true,
  })
}

export function branchRoots(people) {
  const groups = new Map()
  people.forEach(person => {
    const branch = getBranch(person.extended?.tags)
    if (!branch) return
    const key = `${branch.branch}.${branch.sub ?? 0}`
    if (!groups.has(key)) groups.set(key, {branch, members: []})
    groups.get(key).members.push(person)
  })
  const roots = []
  groups.forEach(({branch, members}) => {
    const handles = new Set(members.map(member => member.handle))
    const candidates = members.filter(member => {
      const family = member.extended?.primary_parent_family
      return !(
        handles.has(family?.father_handle) || handles.has(family?.mother_handle)
      )
    })
    const pool = (candidates.length ? candidates : members).sort(
      compareCandidates
    )
    roots.push({
      branch,
      label: formatBranch(branch),
      grampsId: pool[0].gramps_id,
      count: members.length,
    })
  })
  return roots.sort(compareRoots)
}

class GrampsjsTreeBranchBar extends GrampsjsAppStateMixin(LitElement) {
  static get properties() {
    return {
      view: {type: String},
      grampsId: {type: String},
      homePerson: {type: String},
      _roots: {state: true},
    }
  }

  static get styles() {
    return [
      css`
        :host {
          position: relative;
          display: block;
        }
        md-icon-button {
          width: 42px;
          height: 42px;
          color: var(--md-sys-color-primary);
          --grampsjs-icon-button-color: currentColor;
          --md-icon-button-state-layer-width: 42px;
          --md-icon-button-state-layer-height: 42px;
          --md-icon-button-hover-state-layer-color: var(--heritage-gold);
          --md-icon-button-pressed-state-layer-color: var(--heritage-gold);
          --md-icon-button-hover-state-layer-opacity: 0.18;
          --md-icon-button-pressed-state-layer-opacity: 0.28;
          background: color-mix(
            in srgb,
            var(--heritage-gold) 8%,
            var(--md-sys-color-surface)
          );
          border: 1px solid var(--heritage-rule);
          border-radius: 11px;
          box-shadow: 0 2px 8px var(--grampsjs-body-font-color-10);
        }
        md-icon-button.active {
          color: var(--md-sys-color-on-primary);
          --grampsjs-icon-button-color: currentColor;
          background: var(--md-sys-color-primary);
          border-color: var(--md-sys-color-primary);
        }
        md-menu {
          z-index: 8;
          min-width: 260px;
          max-width: min(340px, calc(100vw - 76px));
          max-height: min(68vh, 480px);
          color: var(--md-sys-color-on-surface);
          --md-menu-container-color: var(--md-sys-color-surface-container);
          --md-menu-item-one-line-container-height: 46px;
          --md-menu-item-selected-container-color: var(
            --md-sys-color-secondary-container
          );
        }
        md-menu-item {
          --md-menu-item-label-text-size: 14px;
          --md-menu-item-hover-state-layer-color: var(--heritage-gold);
        }
        .item-line {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          gap: 18px;
          width: 100%;
        }
        .item-line small {
          flex: 0 0 auto;
          color: var(--md-sys-color-on-surface-variant);
          font-size: 11px;
        }
      `,
    ]
  }

  constructor() {
    super()
    this.view = 'main'
    this.grampsId = ''
    this.homePerson = ''
    this._roots = []
    this._loadedKey = ''
  }

  updated(changed) {
    super.updated(changed)
    if (changed.has('appState')) this._load()
  }

  async _load() {
    const api = this.appState?.apiGet
    if (!api) return
    const key = `${this.appState.dbInfo?.tree?.id || ''}:${
      this.appState.i18n?.lang || 'en'
    }`
    if (key === this._loadedKey) return
    this._loadedKey = key
    const result = await loadTreePeople(this.appState).catch(() => null)
    if (this._loadedKey !== key) return
    if (result?.data) {
      this._roots = branchRoots(result.data)
    } else {
      this._loadedKey = ''
    }
  }

  _pick(view, grampsId = '') {
    fireEvent(this, 'tree:scope', {view, grampsId})
  }

  _toggleMenu() {
    const menu = this.renderRoot.querySelector('#branch-menu')
    if (menu) menu.open = !menu.open
  }

  get _activeLabel() {
    if (this.view === 'main') return 'Nhánh chính'
    if (this.view === 'all') return 'Toàn gia phả'
    return (
      this._roots.find(root => this.grampsId === root.grampsId)?.label ??
      'Nhánh đang xem'
    )
  }

  render() {
    const isBranch = root =>
      this.view === 'descendants' && this.grampsId === root.grampsId
    const label = `Chọn nhánh gia phả · Đang xem ${this._activeLabel}`
    return html`<md-icon-button
        id="branch-button"
        class=${classMap({active: this.view !== 'main'})}
        title=${label}
        aria-label=${label}
        aria-haspopup="menu"
        @click=${this._toggleMenu}
      >
        <grampsjs-icon
          path=${mdiFamilyTree}
          color="currentColor"
        ></grampsjs-icon>
      </md-icon-button>
      <md-menu
        id="branch-menu"
        anchor="branch-button"
        positioning="popover"
        anchor-corner="start-start"
        menu-corner="start-end"
        aria-label="Xem nhanh theo nhánh"
      >
        <md-menu-item
          ?selected=${this.view === 'main'}
          @click=${() => this._pick('main', this.homePerson)}
        >
          <div slot="headline" class="item-line">
            <span>Nhánh chính</span><small>Mặc định</small>
          </div>
        </md-menu-item>
        ${this._roots.map(
          root => html`<md-menu-item
            ?selected=${isBranch(root)}
            @click=${() => this._pick('descendants', root.grampsId)}
          >
            <div slot="headline" class="item-line">
              <span>${root.label}</span
              ><small>${root.count.toLocaleString('vi-VN')} người</small>
            </div>
          </md-menu-item>`
        )}
        <md-menu-item
          ?selected=${this.view === 'all'}
          @click=${() => this._pick('all')}
        >
          <div slot="headline" class="item-line">
            <span>Toàn gia phả</span><small>Tất cả các nhánh</small>
          </div>
        </md-menu-item>
      </md-menu>`
  }
}

window.customElements.define('grampsjs-tree-branch-bar', GrampsjsTreeBranchBar)
