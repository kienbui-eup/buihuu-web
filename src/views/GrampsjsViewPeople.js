/*
People list view
*/

import {html} from 'lit'
import {GrampsjsViewObjectsBase} from './GrampsjsViewObjectsBase.js'
import {
  prettyTimeDiffTimestamp,
  personFilter,
  filterCounts,
  personProfileDisplayName,
  getAttributeValue,
} from '../util.js'
import {ATTR_GENERATION, ATTR_DEATH_ANNIVERSARY} from '../branding.js'
import '../components/GrampsjsFilterYears.js'
import '../components/GrampsjsFilterProperties.js'
import '../components/GrampsjsFilterTags.js'
import '../components/GrampsjsFilterPrivate.js'

// Nhãn ngành chi nhập từ nguồn có dạng "Ngành 2 - Chi 1", "Ngành 1"; các nhãn
// khác (Đời, Dòng trưởng, Cần soát lại) không phải ngành chi.
const BRANCH_TAG = /^(ngành|chi)\b/iu

function _ageAtDeath(birthDate, deathDate) {
  if (!birthDate || !deathDate) return null
  const by = String(birthDate).match(/\b(\d{4})\b/)
  const dy = String(deathDate).match(/\b(\d{4})\b/)
  if (!by || !dy) return null
  const age = parseInt(dy[1], 10) - parseInt(by[1], 10)
  return age >= 0 ? age : null
}

export class GrampsjsViewPeople extends GrampsjsViewObjectsBase {
  constructor() {
    super()
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
  }

  get _supportsMerge() {
    return true
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
