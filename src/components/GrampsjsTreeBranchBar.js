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
Bộ chọn nhánh nằm trong cột công cụ nhanh bên phải. Một nút biểu tượng mở menu
gồm nhánh chính, từng ngành chi và toàn gia phả, để vùng vẽ không bị một dãy nút
ngang che khuất nhưng người xem vẫn chọn được đúng chi nhà mình.
*/

const GENDER_MALE = 1

const branchKey = branch => `${branch.branch}.${branch.sub ?? 0}`

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
    const key = branchKey(branch)
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

// Một số đời chưa gắn thẻ ngành/chi. Đi ngược cha mẹ để vẫn xác định đúng chi
// đang xem, cùng quy tắc với bộ lọc của biểu đồ quan hệ.
export function branchForPerson(people, grampsId) {
  const byHandle = new Map(people.map(person => [person.handle, person]))
  const selected = people.find(person => person.gramps_id === grampsId)
  const queue = selected ? [selected.handle] : []
  const visited = new Set()
  for (let index = 0; index < queue.length; index += 1) {
    const handle = queue[index]
    if (visited.has(handle)) continue
    visited.add(handle)
    const person = byHandle.get(handle)
    const branch = getBranch(person?.extended?.tags)
    if (branch) return branch
    const family = person?.extended?.primary_parent_family
    if (family?.father_handle) queue.push(family.father_handle)
    if (family?.mother_handle) queue.push(family.mother_handle)
  }
  return null
}

export class GrampsjsTreeBranchBar extends GrampsjsAppStateMixin(LitElement) {
  static get properties() {
    return {
      view: {type: String},
      grampsId: {type: String},
      homePerson: {type: String},
      _roots: {state: true},
      _people: {state: true},
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
          width: 44px;
          height: 44px;
          color: var(--md-sys-color-primary);
          --grampsjs-icon-button-color: currentColor;
          --md-icon-button-state-layer-width: 44px;
          --md-icon-button-state-layer-height: 44px;
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
          border-radius: 6px;
          box-shadow: 0 2px 10px var(--grampsjs-body-font-color-10);
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
    this._people = []
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
      this._people = result.data
      this._roots = branchRoots(result.data)
    } else {
      this._loadedKey = ''
    }
  }

  _currentRoot() {
    const current = branchForPerson(this._people, this.grampsId)
    if (!current) return null
    return this._roots.find(
      root => branchKey(root.branch) === branchKey(current)
    )
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
    return this._currentRoot()?.label ?? 'Nhánh đang xem'
  }

  render() {
    const currentRoot = this._currentRoot()
    const isCurrentBranch = root =>
      this.view === 'branch' && currentRoot === root
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
            ?selected=${isCurrentBranch(root)}
            @click=${() => this._pick('branch', root.grampsId)}
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
