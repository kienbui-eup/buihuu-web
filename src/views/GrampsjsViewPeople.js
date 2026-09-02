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
    this._columns = [
      {name: 'Full name', key: 'name', sortKey: 'surname'},
      {name: 'Generation', key: 'generation'},
      {name: 'Death anniversary', key: 'memorial'},
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
  }

  get _supportsMerge() {
    return true
  }

  get _fetchUrl() {
    // attribute_list mang "Đời" và "Ngày giỗ" — không có trong profile rút gọn.
    return `/api/people/?locale=${
      this.appState.i18n.lang || 'en'
    }&profile=self&keys=gramps_id,profile,change,handle,attribute_list`
  }

  // eslint-disable-next-line class-methods-use-this
  _getItemPath(item) {
    return `person/${item.grampsId}`
  }

  // eslint-disable-next-line class-methods-use-this
  _getAddPath() {
    return 'new_person'
  }

  // eslint-disable-next-line class-methods-use-this
  _formatRow(row) {
    const birthDate = row?.profile?.birth?.date
    const deathDate = row?.profile?.death?.date
    return {
      grampsId: row.gramps_id,
      name: personProfileDisplayName(row?.profile),
      generation: getAttributeValue(row, ATTR_GENERATION),
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
