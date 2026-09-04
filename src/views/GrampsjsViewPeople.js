/*
People list view
*/

import {html, css} from 'lit'
import {mdiMagnify, mdiClose} from '@mdi/js'
import '@material/web/iconbutton/icon-button.js'
import {GrampsjsViewObjectsBase} from './GrampsjsViewObjectsBase.js'
import {
  prettyTimeDiffTimestamp,
  personFilter,
  filterCounts,
  personProfileDisplayName,
  getAttributeValue,
  debounce,
} from '../util.js'
import {ATTR_GENERATION, ATTR_DEATH_ANNIVERSARY} from '../branding.js'
import {nameSearchRules, NAME_SEARCH_SLOT} from '../nameSearch.js'
import {takePendingPeopleSearch} from '../pageSearch.js'
import '../components/GrampsjsIcon.js'
import '../components/GrampsjsFilterTagMenu.js'
import '../components/GrampsjsFilterYears.js'
import '../components/GrampsjsFilterProperties.js'
import '../components/GrampsjsFilterTags.js'
import '../components/GrampsjsFilterPrivate.js'

// Nhãn ngành chi nhập từ nguồn có dạng "Ngành 2 - Chi 1", "Ngành 1"; các nhãn
// khác (Đời, Dòng trưởng, Cần soát lại) không phải ngành chi.
const BRANCH_TAG = /^(ngành|chi)\b/iu
// Thẻ đời do pipeline gắn: "Đời 1" … "Đời 17".
const GENERATION_TAG = /^Đời\s+(\d+)$/u
// Khoá của hai ô lọc nhanh, để chip lọc không lặp lại và nút xoá gom được.
const GENERATION_SLOT = 'quick:doi'
const BRANCH_SLOT = 'quick:nganh'

function _ageAtDeath(birthDate, deathDate) {
  if (!birthDate || !deathDate) return null
  const by = String(birthDate).match(/\b(\d{4})\b/)
  const dy = String(deathDate).match(/\b(\d{4})\b/)
  if (!by || !dy) return null
  const age = parseInt(dy[1], 10) - parseInt(by[1], 10)
  return age >= 0 ? age : null
}

export class GrampsjsViewPeople extends GrampsjsViewObjectsBase {
  static get styles() {
    return [
      super.styles,
      css`
        /* Ô tìm tên: cùng kiểu với ô tìm trên trang chủ, chữ 16px để iOS
           không tự phóng to khi chạm vào. */
        .name-search {
          display: flex;
          align-items: center;
          flex: 1 1 auto;
          gap: 8px;
          box-sizing: border-box;
          /* Không có min-width: 0 thì ở khổ 320px ô lấy bề rộng mặc định của
             input và tràn đè lên nút bánh răng bên cạnh. */
          min-width: 0;
          max-width: 560px;
          min-height: 48px;
          padding: 0 4px 0 14px;
          border: 1px solid var(--md-sys-color-outline);
          border-radius: var(--grampsjs-frame-radius);
          background: var(--grampsjs-frame-paper);
        }

        .name-search:focus-within {
          border-color: var(--md-sys-color-primary);
          outline: 2px solid var(--md-sys-color-primary);
          outline-offset: -2px;
        }

        .name-search > grampsjs-icon {
          flex-shrink: 0;
        }

        .name-search input {
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

        .name-search input::placeholder {
          color: var(--md-sys-color-on-surface-variant);
        }

        .name-search input::-webkit-search-cancel-button {
          -webkit-appearance: none;
          appearance: none;
        }

        .name-search md-icon-button {
          --md-icon-button-icon-size: 20px;
          flex-shrink: 0;
        }
      `,
    ]
  }

  static get properties() {
    return {
      _searchText: {type: String},
      _tagNames: {type: Object},
    }
  }

  constructor() {
    super()
    this._searchText = ''
    this._appliedSearch = ''
    this._tagNames = null
    // Chờ người gõ ngừng tay rồi mới hỏi máy chủ; Enter thì hỏi ngay.
    this._applySearchDebounced = debounce(() => this._applySearch(), 350)
    // 40 người một trang: mỗi thẻ trên điện thoại chỉ hai dòng, cuộn một
    // trang nhanh hơn bấm sang trang.
    this._pageSize = 40
    // Họ và tên đi chung một cột: tiếng Việt đọc liền "Bùi Đức Anh", và trên
    // điện thoại mỗi cột tách ra là thêm một khối chiếm chỗ. Đời đứng ngay sau
    // tên vì đó là thứ người trong họ tra trước tiên. Gramps ID và mốc thay đổi
    // là dữ liệu của người biên tập, nên tắt sẵn — vẫn bật lại được ở nút cài
    // đặt cột.
    //
    // Ba cột đánh dấu `meta` nối thành một dòng nhỏ dưới tên trên điện thoại:
    // "Đời 13 · Ngành 3 - Chi 2 · Giỗ 12/8 ÂL", đúng thứ tự người trong họ hỏi.
    this._columns = [
      {name: 'Full name', key: 'name', sortKey: 'surname'},
      {name: 'Generation', key: 'generation', meta: true},
      {name: 'Lineage branch', key: 'branch', meta: true, noLabel: true},
      {name: 'Death anniversary', key: 'memorial', meta: true},
      {
        name: 'Birth Date',
        key: 'birth',
        sortKey: 'birth',
        defaultVisible: false,
      },
      {
        name: 'Death Date',
        key: 'death',
        sortKey: 'death',
        defaultVisible: false,
      },
      {name: 'Birth Place', key: 'birthPlace', defaultVisible: false},
      {name: 'Death Place', key: 'deathPlace', defaultVisible: false},
      {name: 'Age at death', key: 'age', defaultVisible: false},
      {
        name: 'Gramps ID',
        key: 'grampsId',
        sortKey: 'gramps_id',
        defaultVisible: false,
      },
      {
        name: 'Last changed',
        key: 'change',
        sortKey: 'change',
        defaultVisible: false,
      },
    ]
    this._objectsName = 'people'
    // Mặc định của bản gốc là "mới sửa nhất", vô nghĩa với cây vừa nhập một lượt:
    // trang đầu toàn người không tên ở đời 15. Mã Gramps được pipeline đánh theo
    // thứ tự sổ họ, nên xếp theo đó là thuỷ tổ đứng đầu rồi lần xuống các đời.
    // Không viết "+gramps_id": dấu + ghép thẳng vào URL bị máy chủ đọc thành
    // khoảng trắng (mã hoá %2B thì trả 422); không dấu là tăng dần.
    this._sort = 'gramps_id'
    this._boundPeopleSearch = () => this.requestUpdate()
  }

  get _supportsMerge() {
    return true
  }

  // Danh sách người vẽ kiểu danh bạ: một dòng mỗi người, nhiều cột trên màn
  // hình rộng, thay cho bảng bốn cột thưa.
  // eslint-disable-next-line class-methods-use-this
  get _tableRoster() {
    return true
  }

  connectedCallback() {
    super.connectedCallback()
    // Nút kính lúp ở header, thanh dưới, phím tắt hay ô tìm trên trang chủ
    // đều dẫn về ô tìm tên ở đây (xem pageSearch.js).
    window.addEventListener('people:search', this._boundPeopleSearch)
  }

  disconnectedCallback() {
    super.disconnectedCallback()
    window.removeEventListener('people:search', this._boundPeopleSearch)
  }

  updated(changed) {
    super.updated(changed)
    if (!this.active) return
    const pending = takePendingPeopleSearch()
    if (pending) this.openSearch(pending.query)
  }

  // GrampsjsPages gọi khi đang ở trang này mà người dùng bấm tìm kiếm; các
  // trang khác gửi yêu cầu qua pageSearch.js rồi updated() nhận ở trên.
  openSearch(query = '') {
    if (query) {
      this._searchText = query
      this._applySearch()
    }
    this._focusSearch()
  }

  async _focusSearch() {
    await this.updateComplete
    const input = this.renderRoot.querySelector('#people-search')
    if (!input) return
    input.focus()
    input.select()
  }

  get _fetchUrl() {
    // attribute_list mang "Đời" và "Ngày giỗ", tag_list mang ngành chi — không
    // có trong profile rút gọn.
    return `/api/people/?locale=${
      this.appState.i18n.lang || 'en'
    }&profile=self&keys=gramps_id,profile,change,handle,attribute_list,tag_list`
  }

  _fetchData() {
    this._ensureTagNames()
    super._fetchData()
  }

  // Danh sách người chỉ có handle của thẻ; tên thẻ tải một lần rồi dùng lại.
  // Dữ liệu người có thể về trước thẻ, nên khi thẻ về thì dựng lại các dòng.
  _ensureTagNames() {
    if (this._tagNamesPromise) {
      return this._tagNamesPromise
    }
    this._tagNamesPromise = this.appState.apiGet('/api/tags/').then(result => {
      if (!('data' in result)) {
        this._tagNamesPromise = null
        return
      }
      this._tagNames = new Map(result.data.map(tag => [tag.handle, tag.name]))
      this._data = this._rawData.map(row => this._formatRow(row, this))
    })
    return this._tagNamesPromise
  }

  _branchOf(row) {
    const names = (row?.tag_list || [])
      .map(handle => this._tagNames?.get(handle) || '')
      .map(name => name.normalize('NFC').trim())
      .filter(name => BRANCH_TAG.test(name))
    return [...new Set(names)].join(', ')
  }

  get _allTagNames() {
    return [...(this._tagNames?.values() ?? [])].map(name =>
      name.normalize('NFC').trim()
    )
  }

  // "Đời 1" … "Đời 17" theo số, không theo chữ (kẻo Đời 10 đứng sau Đời 1).
  get _generationTags() {
    return this._allTagNames
      .filter(name => GENERATION_TAG.test(name))
      .sort(
        (a, b) =>
          Number(a.match(GENERATION_TAG)[1]) -
          Number(b.match(GENERATION_TAG)[1])
      )
  }

  get _branchTags() {
    return this._allTagNames
      .filter(name => BRANCH_TAG.test(name))
      .sort((a, b) => a.localeCompare(b, 'vi', {numeric: true}))
  }

  _renderQuickSearch() {
    return html`
      <div class="name-search">
        <grampsjs-icon
          .path="${mdiMagnify}"
          height="22"
          color="var(--md-sys-color-on-surface-variant)"
        ></grampsjs-icon>
        <input
          id="people-search"
          type="search"
          autocomplete="off"
          spellcheck="false"
          enterkeyhint="search"
          aria-label="${this._('Search by name')}"
          placeholder="${this._('Type a name, accents optional')}"
          .value="${this._searchText}"
          @input="${this._handleSearchInput}"
          @keydown="${this._handleSearchKey}"
        />
        ${this._searchText
          ? html`<md-icon-button
              aria-label="${this._('Clear search')}"
              @click="${this._clearSearch}"
            >
              <grampsjs-icon .path="${mdiClose}" height="20"></grampsjs-icon>
            </md-icon-button>`
          : ''}
      </div>
    `
  }

  _handleSearchInput(e) {
    this._searchText = e.target.value
    this._applySearchDebounced()
  }

  _handleSearchKey(e) {
    if (e.key === 'Enter') {
      this._applySearch()
    } else if (e.key === 'Escape') {
      this._clearSearch()
    }
  }

  _clearSearch() {
    this._searchText = ''
    this._applySearch()
    this.renderRoot.querySelector('#people-search')?.focus()
  }

  _applySearch() {
    const text = this._searchText.trim()
    if (text === this._appliedSearch) {
      return
    }
    this._appliedSearch = text
    this._filters?.setRules(nameSearchRules(text), NAME_SEARCH_SLOT)
  }

  // Nút "Xóa tất cả bộ lọc" hay chuyển sang GQL bỏ quy tắc tìm tên mà không
  // qua ô tìm, nên ô phải tự trống theo.
  _handleFiltersChanged(e) {
    const rules = e.detail?.filters ?? []
    if (!rules.some(rule => rule._slot === NAME_SEARCH_SLOT)) {
      this._searchText = ''
      this._appliedSearch = ''
    }
    super._handleFiltersChanged(e)
  }

  // eslint-disable-next-line class-methods-use-this
  _getItemPath(item) {
    return `person/${item.grampsId}`
  }

  // eslint-disable-next-line class-methods-use-this
  _getAddPath() {
    return 'new_person'
  }

  _formatRow(row) {
    const birthDate = row?.profile?.birth?.date
    const deathDate = row?.profile?.death?.date
    return {
      grampsId: row.gramps_id,
      name: personProfileDisplayName(row?.profile),
      generation: getAttributeValue(row, ATTR_GENERATION),
      branch: this._branchOf(row),
      memorial: getAttributeValue(row, ATTR_DEATH_ANNIVERSARY)
        ? `${getAttributeValue(row, ATTR_DEATH_ANNIVERSARY)} ÂL`
        : '',
      birth: birthDate,
      birthPlace: row?.profile?.birth?.place_name,
      death: deathDate,
      deathPlace: row?.profile?.death?.place_name,
      age: _ageAtDeath(birthDate, deathDate),
      change: prettyTimeDiffTimestamp(row.change, this.appState.i18n.lang),
    }
  }

  renderFilters() {
    return html`
      <grampsjs-filter-tag-menu
        slot="leading"
        label="${this._('Generation')}"
        slotKey="${GENERATION_SLOT}"
        .options="${this._generationTags}"
        .appState="${this.appState}"
      ></grampsjs-filter-tag-menu>
      <grampsjs-filter-tag-menu
        slot="leading"
        label="${this._('Lineage branch')}"
        slotKey="${BRANCH_SLOT}"
        .options="${this._branchTags}"
        .appState="${this.appState}"
      ></grampsjs-filter-tag-menu>

      <grampsjs-filter-years
        .appState="${this.appState}"
        label="Birth year"
        rule="HasBirth"
      >
      </grampsjs-filter-years>
      <grampsjs-filter-years
        .appState="${this.appState}"
        label="Death year"
        rule="HasDeath"
      >
      </grampsjs-filter-years>

      <grampsjs-filter-properties
        .appState="${this.appState}"
        .props="${personFilter}"
      ></grampsjs-filter-properties>

      <grampsjs-filter-properties
        hasCount
        .appState="${this.appState}"
        .props="${filterCounts.people}"
        label="${this._('Associations')}"
      ></grampsjs-filter-properties>

      <grampsjs-filter-tags .appState="${this.appState}"></grampsjs-filter-tags>

      <grampsjs-filter-private
        .appState="${this.appState}"
        rule="PeoplePrivate"
        publicRule="PeoplePublic"
      ></grampsjs-filter-private>
    `
  }
}

window.customElements.define('grampsjs-view-people', GrampsjsViewPeople)
