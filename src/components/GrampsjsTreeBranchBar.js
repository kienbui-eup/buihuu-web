import {LitElement, html, css} from 'lit'
import {classMap} from 'lit/directives/class-map.js'

import {GrampsjsAppStateMixin} from '../mixins/GrampsjsAppStateMixin.js'
import {loadTreePeople} from '../charts/treeData.js'
import {getBranch, formatBranch, getGeneration} from '../charts/util.js'
import {fireEvent} from '../util.js'

/*
Dải xem nhanh chỉ giữ hai phạm vi cần dùng thường xuyên trên mặt phả đồ:
"Nhánh chính" và chi của người đang xem. Danh sách các chi cùng toàn gia phả
nằm trong bảng chọn mở khi cần, tránh phủ một hàng nút dài lên sơ đồ.
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
          position: absolute;
          top: 14px;
          left: 14px;
          right: 74px;
          z-index: 4;
          pointer-events: none;
        }
        nav {
          display: flex;
          max-width: 100%;
          pointer-events: auto;
        }
        .quick {
          display: flex;
          gap: 5px;
          min-width: 0;
          padding: 3px;
          background: color-mix(
            in srgb,
            var(--md-sys-color-surface) 92%,
            transparent
          );
          border: 1px solid var(--heritage-rule);
          border-radius: 22px;
          box-shadow: 0 3px 14px var(--grampsjs-body-font-color-10);
          backdrop-filter: blur(8px);
        }
        button,
        summary {
          box-sizing: border-box;
          height: 36px;
          font: 500 13px/1.2 var(--grampsjs-body-font-family, inherit);
          color: var(--heritage-ink);
          background: transparent;
          border: 0;
          border-radius: 18px;
          cursor: pointer;
        }
        .scope {
          min-width: 0;
          padding: 0 13px;
          white-space: nowrap;
        }
        .scope.current {
          overflow: hidden;
          text-overflow: ellipsis;
        }
        button:hover,
        summary:hover {
          background: color-mix(in srgb, var(--heritage-gold) 15%, transparent);
        }
        button:focus-visible,
        summary:focus-visible {
          outline: 2px solid var(--heritage-gold);
          outline-offset: 1px;
        }
        button.active {
          color: var(--md-sys-color-on-primary);
          background: var(--md-sys-color-primary);
        }
        button small {
          margin-left: 4px;
          font-size: 11px;
          font-weight: 400;
          opacity: 0.78;
        }
        details {
          position: relative;
          flex: 0 0 auto;
        }
        summary {
          display: grid;
          place-items: center;
          min-width: 36px;
          padding: 0 10px;
          list-style: none;
        }
        summary::-webkit-details-marker {
          display: none;
        }
        summary::after {
          content: '';
          width: 7px;
          height: 7px;
          border-right: 1.5px solid currentColor;
          border-bottom: 1.5px solid currentColor;
          rotate: 45deg;
          translate: 0 -2px;
        }
        details[open] summary {
          color: var(--md-sys-color-primary);
          background: color-mix(in srgb, var(--heritage-gold) 18%, transparent);
        }
        .menu {
          position: absolute;
          top: calc(100% + 9px);
          left: 0;
          width: min(300px, calc(100vw - 24px));
          max-height: min(62vh, 460px);
          overflow-y: auto;
          padding: 8px;
          background: var(--md-sys-color-surface);
          border: 1px solid var(--heritage-rule);
          border-radius: var(--grampsjs-frame-radius, 6px);
          box-shadow: 0 12px 32px var(--grampsjs-body-font-color-20);
        }
        .menu-label {
          margin: 4px 8px 7px;
          color: var(--grampsjs-body-font-color-60);
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }
        .menu button {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          width: 100%;
          height: 42px;
          padding: 0 10px;
          border-radius: 4px;
          text-align: left;
        }
        .menu button span {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .menu button small {
          flex: 0 0 auto;
          margin: 0;
        }
        .menu .all {
          margin-top: 6px;
          border-top: 1px solid var(--heritage-rule);
          border-radius: 0 0 4px 4px;
        }
        @media (max-width: 991px) {
          :host {
            top: 10px;
            left: 10px;
            right: 60px;
          }
          .quick {
            max-width: 100%;
          }
          .scope {
            padding: 0 11px;
          }
          .scope.current {
            flex: 1 1 auto;
            max-width: min(42vw, 168px);
          }
          button small {
            display: none;
          }
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
    this.renderRoot.querySelector('details')?.removeAttribute('open')
    fireEvent(this, 'tree:scope', {view, grampsId})
  }

  _pickCurrentBranch(root) {
    this._pick('branch', this.grampsId || root.grampsId)
  }

  render() {
    const currentRoot = this._currentRoot()
    const isCurrentBranch = root =>
      this.view === 'branch' && currentRoot === root
    return html`<nav aria-label="Xem nhanh phả đồ">
      <div class="quick">
        <button
          type="button"
          class=${classMap({scope: true, active: this.view === 'main'})}
          title="Dòng trưởng từ thủy tổ, cách xem mặc định"
          aria-pressed=${this.view === 'main'}
          @click=${() => this._pick('main', this.homePerson)}
        >
          Nhánh chính<small>mặc định</small>
        </button>
        ${currentRoot
          ? html`<button
              type="button"
              class=${classMap({
                scope: true,
                current: true,
                active: isCurrentBranch(currentRoot),
              })}
              title="Xem trọn ${currentRoot.label}"
              aria-pressed=${isCurrentBranch(currentRoot)}
              @click=${() => this._pickCurrentBranch(currentRoot)}
            >
              ${currentRoot.label}
            </button>`
          : ''}
        <details>
          <summary
            title="Chọn chi hoặc xem toàn gia phả"
            aria-label="Chọn chi"
          ></summary>
          <div class="menu" role="menu">
            <p class="menu-label">Chọn chi để xem</p>
            ${this._roots.map(
              root => html`<button
                type="button"
                role="menuitem"
                class=${classMap({active: isCurrentBranch(root)})}
                title="${root.label}: ${root.count.toLocaleString(
                  'vi-VN'
                )} người đã gắn thẻ"
                @click=${() => this._pick('branch', root.grampsId)}
              >
                <span>${root.label}</span><small>${root.count}</small>
              </button>`
            )}
            <button
              type="button"
              role="menuitem"
              class=${classMap({all: true, active: this.view === 'all'})}
              @click=${() => this._pick('all')}
            >
              <span>Toàn gia phả</span>
            </button>
          </div>
        </details>
      </div>
    </nav>`
  }
}

window.customElements.define('grampsjs-tree-branch-bar', GrampsjsTreeBranchBar)
