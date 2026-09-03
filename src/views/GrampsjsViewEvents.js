/*
Events list view
*/

import {html} from 'lit'
import '../components/GrampsjsFilterText.js'
import '../components/GrampsjsFilterType.js'
import '../components/GrampsjsFilterYears.js'
import '../components/GrampsjsFilterTags.js'
import '../components/GrampsjsFilterPrivate.js'
import {GrampsjsViewObjectsBase} from './GrampsjsViewObjectsBase.js'
import {localizeServerTerm} from '../glossary.js'
import {
  prettyTimeDiffTimestamp,
  filterCounts,
  personTitleFromProfile,
  familyTitleFromProfile,
} from '../util.js'

const PRIMARY_ROLES_EN = new Set(['Primary', 'Family'])
const PRIMARY_ROLES_VI = new Set(['Chủ yếu', 'Chính', 'Gia đình'])

export class GrampsjsViewEvents extends GrampsjsViewObjectsBase {
  constructor() {
    super()
    // Mã Gramps và mốc sửa là dữ liệu của người biên tập; trên điện thoại mỗi
    // cột là một khối chiếm chỗ, nên tắt sẵn và để bật lại ở nút cài đặt cột.
    this._columns = [
      {
        name: 'Gramps ID',
        key: 'grampsId',
        sortKey: 'gramps_id',
        defaultVisible: false,
      },
      // Đổi "Chết" thành "Mất" lúc vẽ, không phải lúc nhận dữ liệu: danh sách
      // có thể về trước bản dịch máy chủ, khi đó bảng thuật ngữ còn trống.
      {
        name: 'Event Type',
        key: 'type',
        sortKey: 'type',
        format: localizeServerTerm,
      },
      {name: 'Date', key: 'date', sortKey: 'date'},
      {name: 'Place', key: 'place', sortKey: 'place'},
      {name: 'Participants', key: 'participants'},
      {name: 'Description', key: 'description', defaultVisible: false},
      {
        name: 'Last changed',
        key: 'change',
        sortKey: 'change',
        defaultVisible: false,
      },
    ]
    this._objectsName = 'events'
  }

  get _supportsMerge() {
    return true
  }

  get _fetchUrl() {
    return `/api/events/?locale=${
      this.appState.i18n.lang || 'en'
    }&profile=participants&keys=gramps_id,profile,description,change,handle`
  }

  // eslint-disable-next-line class-methods-use-this
  _getItemPath(item) {
    return `event/${item.grampsId}`
  }

  // eslint-disable-next-line class-methods-use-this
  _getAddPath() {
    return 'new_event'
  }

  renderFilters() {
    return html`
      <grampsjs-filter-years
        .appState="${this.appState}"
        dateIndex="1"
        numArgs="4"
        label="${this._('Event Year')}"
        rule="HasData"
      ></grampsjs-filter-years>

      <grampsjs-filter-type
        .appState="${this.appState}"
        label="${this._('Event Type')}"
        typeName="event_types"
      ></grampsjs-filter-type>

      <grampsjs-filter-text
        .appState="${this.appState}"
        label="Description"
        rule="HasData"
        .valueIndex=${3}
        .numArgs=${4}
      ></grampsjs-filter-text>

      <grampsjs-filter-text
        .appState="${this.appState}"
        label="Place"
        rule="HasData"
        .valueIndex=${2}
        .numArgs=${4}
      ></grampsjs-filter-text>

      <grampsjs-filter-properties
        hasCount
        .appState="${this.appState}"
        .props="${filterCounts.events}"
        label="${this._('Associations')}"
      ></grampsjs-filter-properties>

      <grampsjs-filter-tags .appState="${this.appState}"></grampsjs-filter-tags>

      <grampsjs-filter-private
        .appState="${this.appState}"
        rule="EventPrivate"
      ></grampsjs-filter-private>
    `
  }

  _formatRow(row) {
    // Vai trò về từ máy chủ đã dịch ("Chủ yếu"). So với cả ba dạng có thể gặp
    // (khoá gốc, bản dịch máy chủ, chữ của nhà) vì dòng có thể được dựng trước
    // khi bản dịch tải xong; không thì cột người tham gia trống với tiếng Việt.
    const isPrimary = role =>
      PRIMARY_ROLES_EN.has(role) ||
      PRIMARY_ROLES_VI.has(role) ||
      [this._('Primary'), this._('Family')].includes(localizeServerTerm(role))
    const people = (row?.profile?.participants?.people || [])
      .filter(p => isPrimary(p.role))
      .map(p => personTitleFromProfile(p.person))
    const families = (row?.profile?.participants?.families || [])
      .filter(f => isPrimary(f.role))
      .map(f => familyTitleFromProfile(f.family))
    return {
      grampsId: row.gramps_id,
      type: row?.profile?.type,
      date: row?.profile?.date,
      place: row?.profile?.place_name || row?.profile?.place,
      participants: [...people, ...families].join(', '),
      description: row?.description,
      change: prettyTimeDiffTimestamp(row.change, this.appState.i18n.lang),
    }
  }
}

window.customElements.define('grampsjs-view-events', GrampsjsViewEvents)
