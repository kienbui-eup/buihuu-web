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
import {mdiCalendarExport, mdiMagnify} from '@mdi/js'

import {GrampsjsView} from './GrampsjsView.js'
import '../components/GrampsjsIcon.js'
import {fireEvent} from '../util.js'
import {
  ATTR_DEATH_ANNIVERSARY,
  DEFAULT_LANGUAGE,
  GIO_GUIDE_PATH,
} from '../branding.js'
import {normalizeSearchText} from '../pageSearch.js'
import {formatBranch, getBranch} from '../charts/util.js'
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
        /* Ô lọc tên, nút tải lịch và số người trên cùng một hàng; ô nhập cùng
           kiểu với ô tìm người ở trang chủ. */
        .toolbar {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 12px 16px;
          margin: 0 0 20px;
        }

        .search {
          display: flex;
          flex: 1 1 260px;
          max-width: 440px;
          align-items: center;
          gap: 10px;
          padding: 0 12px 0 14px;
          border: 1px solid var(--md-sys-color-outline);
          border-radius: var(--grampsjs-frame-radius);
          background: var(--md-sys-color-surface);
        }

        .search:focus-within {
          border-color: var(--md-sys-color-primary);
          outline: 2px solid var(--md-sys-color-primary);
          outline-offset: -2px;
        }

        .search grampsjs-icon {
          flex-shrink: 0;
        }

        #anniversary-search {
          flex: 1;
          min-width: 0;
          min-height: 44px;
          border: 0;
          background: transparent;
          font: inherit;
          font-size: 16px;
          color: var(--md-sys-color-on-surface);
          outline: none;
        }

        #anniversary-search::placeholder {
          color: var(--md-sys-color-on-surface-variant);
        }

        .count {
          font-size: 14px;
          color: var(--md-sys-color-on-surface-variant);
        }

        h3 {
          margin: 28px 0 10px;
          font-size: 20px;
          font-weight: 500;
          /* chừa thanh ứng dụng và hàng tháng ghim phía trên khi nhảy tới */
          scroll-margin-top: 128px;
        }

        /* Hàng tháng âm lịch ghim dưới thanh ứng dụng: 344 ngày giỗ trải trên
           một trang dài, không có hàng này thì muốn xem tháng 11 phải vuốt
           qua hơn ba trăm dòng. */
        .month-nav {
          position: sticky;
          top: 64px;
          z-index: 2;
          display: flex;
          gap: 8px;
          overflow-x: auto;
          padding: 8px 0 10px;
          margin: 0 0 4px;
          background: var(--md-sys-color-background, #f4f2ed);
          scrollbar-width: none;
        }

        .month-nav::-webkit-scrollbar {
          display: none;
        }

        .month-nav a {
          flex: 0 0 auto;
          display: inline-flex;
          align-items: center;
          min-height: 36px;
          padding: 0 14px;
          border: 1px solid var(--heritage-rule);
          border-radius: var(--grampsjs-frame-radius);
          background: var(--grampsjs-frame-paper, var(--md-sys-color-surface));
          color: var(--md-sys-color-on-surface);
          font-size: 14px;
          text-decoration: none;
          white-space: nowrap;
        }

        .month-nav a:hover,
        .month-nav a:focus-visible {
          border-color: var(--heritage-gold);
          background: color-mix(
            in srgb,
            var(--heritage-gold) 16%,
            var(--grampsjs-frame-paper)
          );
          color: var(--md-sys-color-primary);
          text-decoration: none;
        }

        @media (max-width: 599px) {
          .month-nav {
            top: 56px;
          }
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
      _search: {state: true},
    }
  }

  constructor() {
    super()
    this._people = []
    this._loaded = false
    this._fetching = false
    this._search = ''
  }

  openSearch() {
    const field = this.renderRoot.querySelector('#anniversary-search')
    field?.scrollIntoView({block: 'center'})
    field?.focus({preventScroll: true})
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
    // extend=tag_list để có tên thẻ ngành chi trong extended.tags.
    const url =
      `/api/people/?rules=${rules}` +
      `&keys=gramps_id,attribute_list,profile,extended` +
      `&profile=self&extend=tag_list` +
      `&locale=${this.appState.i18n.lang || DEFAULT_LANGUAGE}` +
      `&pagesize=2000&page=1`
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
    const query = normalizeSearchText(this._search)
    const allEntries = collectAnniversaries(this._people)
    const entries = allEntries.filter(entry =>
      normalizeSearchText(entry.name).includes(query)
    )
    const groups = groupByLunarMonth(entries)
    return html`
      <header class="page-heading">
        <p class="section-label">Tưởng niệm</p>
        <h2>${this._('Death anniversary calendar')}</h2>
        <p class="lead">
          ${this._(
            'Every death anniversary in the clan for the next twelve months, by lunar month. Dates in the circles are the solar dates for this year.'
          )}
          <a href="${GIO_GUIDE_PATH}">Cách đọc lịch giỗ và cách bổ sung</a>
        </p>
      </header>
      <div class="toolbar">
        <label class="search">
          <grampsjs-icon
            path="${mdiMagnify}"
            color="var(--md-sys-color-primary)"
          ></grampsjs-icon>
          <input
            id="anniversary-search"
            type="search"
            aria-label="Tìm trong ngày giỗ"
            placeholder="Tìm tên trong ngày giỗ"
            .value=${this._search}
            @input=${event => {
              this._search = event.target.value
            }}
          />
        </label>
        <md-filled-tonal-button
          @click="${this._download}"
          ?disabled="${allEntries.length === 0}"
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
            : this._countLabel(entries.length, allEntries.length, query)}
        </span>
      </div>
      ${groups.length > 1
        ? html`<nav
            class="month-nav"
            aria-label="${this._('Jump to lunar month')}"
          >
            ${groups.map(
              group => html`<a
                href="#thang-${group.month}"
                aria-label="${this._('Lunar month %s', group.month)}"
                @click=${event => this._jumpToMonth(event, group.month)}
                >Tháng ${group.month}</a
              >`
            )}
          </nav>`
        : ''}
      ${groups.map(group => this._renderGroup(group))}
      ${query && !entries.length && !this.loading
        ? html`<p>Không tìm thấy tên phù hợp.</p>`
        : ''}
    `
  }

  /*
  "344 người có ngày giỗ" một mình khiến người tra không biết hơn nghìn người
  còn lại là trang lỗi hay phả không có. Nói rõ phần còn lại phả chưa chép,
  tổng số người lấy từ dbInfo để không phải tải cả cây.
  */
  _countLabel(shown, total, query) {
    const people = this.appState.dbInfo?.object_counts?.people
    const withMemorial = `${total} ${this._('people with a death anniversary')}`
    if (query) {
      return `${shown} trong ${withMemorial}`
    }
    if (!people || people <= total) {
      return withMemorial
    }
    return `${withMemorial} trong ${people.toLocaleString(
      'vi-VN'
    )} người · những người còn lại phả chưa chép giỗ`
  }

  _jumpToMonth(event, month) {
    event.preventDefault()
    this.renderRoot
      .querySelector(`#thang-${month}`)
      ?.scrollIntoView({behavior: 'smooth', block: 'start'})
  }

  _renderGroup(group) {
    return html`
      <h3 id="thang-${group.month}">
        ${this._('Lunar month %s', group.month)}
      </h3>
      <div class="month-entries heritage-frame">
        ${group.entries.map(entry => this._renderEntry(entry))}
      </div>
    `
  }

  _renderEntry({person, lunar, next, name, generation}) {
    const [day, month] = next.solar
    const branch = formatBranch(getBranch(person.extended?.tags))
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
              : ''}${branch ? html` · ${branch}` : ''}</span
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
