/*
Trang Lịch giỗ: toàn bộ ngày giỗ trong họ, xếp theo tháng âm lịch kể từ hôm
nay, kèm nút tải về lịch điện thoại.

Khối "Ngày giỗ sắp tới" trên trang chủ chỉ đưa vài người gần nhất; trang này là
bản đầy đủ để người lo việc họ nhìn cả năm. Dữ liệu tải khi trang được mở lần
đầu, không tải sẵn lúc khởi động.
*/

import {html, css} from 'lit'
import {anniversaryStyles} from '../AnniversaryStyles.js'
import {heritageFrameStyles} from '../HeritageStyles.js'
import '@material/web/list/list'
import '@material/web/list/list-item'
import '@material/web/button/filled-tonal-button'
import {mdiCalendarExport} from '@mdi/js'

import {GrampsjsView} from './GrampsjsView.js'
import '../components/GrampsjsIcon.js'
import {fireEvent} from '../util.js'
import {ATTR_DEATH_ANNIVERSARY} from '../branding.js'
import {
  collectAnniversaries,
  groupByLunarMonth,
  buildGioIcs,
} from '../gioCalendar.js'

export class GrampsjsViewLichGio extends GrampsjsView {
  static get styles() {
    return [
      super.styles,
      heritageFrameStyles,
      css`
        .month-entries {
          padding: 6px 20px;
        }
        .month-entries .remembrance:last-child {
          border-bottom: 0;
        }
        .intro {
          max-width: 40em;
        }

        .toolbar {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 1em;
          margin: 1em 0 2em;
        }

        .count {
          color: var(--grampsjs-body-font-color-70);
        }

        h3 {
          margin: 1.6em 0 0.4em;
          font-weight: 500;
        }
      `,
      anniversaryStyles,
    ]
  }

  static get properties() {
    return {
      _people: {type: Array},
      _loaded: {type: Boolean},
      _fetching: {type: Boolean},
    }
  }

  constructor() {
    super()
    this._people = []
    this._loaded = false
    this._fetching = false
  }

  updated(changed) {
    super.updated(changed)
    if (this.active && !this._loaded && !this._fetching) {
      this._fetch()
    }
  }

  async _fetch() {
    this._fetching = true
    this.loading = true
    const rules = encodeURIComponent(
      JSON.stringify({
        rules: [{name: 'HasAttribute', values: [ATTR_DEATH_ANNIVERSARY, '']}],
      })
    )
    const url =
      `/api/people/?rules=${rules}` +
      `&keys=gramps_id,attribute_list,profile&profile=self` +
      `&locale=${this.appState.i18n.lang || 'en'}&pagesize=2000&page=1`
    const result = await this.appState.apiGet(url)
    this._fetching = false
    this.loading = false
    if ('data' in result) {
      this._people = result.data
      this._loaded = true
    } else if ('error' in result) {
      fireEvent(this, 'grampsjs:error', {message: result.error})
    }
  }

  renderContent() {
    const entries = collectAnniversaries(this._people)
    const groups = groupByLunarMonth(entries)
    return html`
      <h2>${this._('Death anniversary calendar')}</h2>
      <p class="intro">
        ${this._(
          'Every death anniversary in the clan for the next twelve months, by lunar month. Dates in the circles are the solar dates for this year.'
        )}
      </p>
      <div class="toolbar">
        <md-filled-tonal-button
          @click="${this._download}"
          ?disabled="${entries.length === 0}"
        >
          ${this._('Download calendar (.ics)')}
          <grampsjs-icon
            slot="icon"
            path="${mdiCalendarExport}"
            color="currentColor"
          ></grampsjs-icon>
        </md-filled-tonal-button>
        <span class="count"
          >${this.loading
            ? this._('Loading items...')
            : `${entries.length} ${this._('people with a death anniversary')}`}
        </span>
      </div>
      ${groups.map(group => this._renderGroup(group))}
    `
  }

  _renderGroup(group) {
    return html`
      <h3>${this._('Lunar month %s', group.month)}</h3>
      <div class="month-entries heritage-frame">
        ${group.entries.map(entry => this._renderEntry(entry))}
      </div>
    `
  }

  _renderEntry({person, lunar, next, name, generation}) {
    const [day, month] = next.solar
    return html`
      <a class="remembrance" href="/person/${person.gramps_id}">
        <span
          class="date ${next.daysAway <= 7 ? 'soon' : ''}"
          aria-label="${day}/${month} dương lịch"
        >
          <strong>${day}</strong><small>tháng ${month}</small>
        </span>
        <span class="details">
          <span class="name">${name}</span>
          <span class="meta"
            >${this._('Death anniversary')} ${lunar.day}/${lunar.month}
            ${this._('lunar')}${generation
              ? html` · ${this._('Generation')} ${generation}`
              : ''}</span
          >
          <span class="meta">${this._daysAwayLabel(next.daysAway)}</span>
        </span>
      </a>
    `
  }

  _daysAwayLabel(days) {
    if (days === 0) return this._('Today')
    if (days === 1) return this._('Tomorrow')
    return this._('in %s days', days)
  }

  _download() {
    const entries = collectAnniversaries(this._people)
    const ics = buildGioIcs(entries, {
      baseUrl: window.location.origin,
      domain: window.location.hostname || 'phahe.troly.me',
    })
    const blob = new Blob([ics], {type: 'text/calendar;charset=utf-8'})
    const href = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = href
    link.download = 'lich-gio.ics'
    document.body.appendChild(link)
    link.click()
    link.remove()
    setTimeout(() => URL.revokeObjectURL(href), 10000)
  }
}

window.customElements.define('grampsjs-view-lich-gio', GrampsjsViewLichGio)
