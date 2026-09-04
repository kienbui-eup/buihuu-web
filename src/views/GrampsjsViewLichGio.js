/*
Trang Lịch giỗ: toàn bộ ngày giỗ trong họ, tra theo tháng âm lịch như lật một
cuốn lịch treo tường, kèm nút tải về lịch điện thoại.

Bố cục: một hàng tab "Sắp tới · Giêng … Chạp · Cả năm" ghim dưới thanh ứng
dụng; mỗi tháng là một bảng gom theo ngày, người giỗ cùng ngày chung một ô ngày
(ngày âm to, thứ và ngày dương nhỏ bên dưới). Cách này thay cho danh sách 344
dòng nối nhau dài hơn bốn mươi nghìn điểm ảnh trên điện thoại.

Mọi mục đều được vẽ sẵn và chỉ ẩn bằng thuộc tính hidden, nên in trang là in cả
năm dù đang mở tab nào. Dữ liệu tải khi trang được mở lần đầu, không tải sẵn lúc
khởi động. Khối "Ngày giỗ sắp tới" trên trang chủ dùng cùng nguồn nhưng chỉ đưa
vài người gần nhất.
*/

import {html, css, nothing} from 'lit'
import {heritageFrameStyles} from '../HeritageStyles.js'
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
import {formatBranch, getBranch} from '../charts/util.js'
import {canChiYear} from '../lunar.js'
import {
  collectAnniversaries,
  buildMonthSections,
  groupByDay,
  upcomingEntries,
  matchesQuery,
  lunarToday,
  lunarMonthName,
  lunarMonthSpan,
  formatSolarShort,
  formatSolarSpan,
  WEEKDAY_LONG,
  buildGioIcs,
} from '../gioCalendar.js'

const UPCOMING_DAYS = 30
const TAB_UPCOMING = 'sap-toi'
const TAB_ALL = 'ca-nam'
const TAB_MONTH = month => `thang-${month}`
const TAB_RE = /^#?(sap-toi|ca-nam|thang-(?:[1-9]|1[0-2]))$/

export class GrampsjsViewLichGio extends GrampsjsView {
  static get styles() {
    return [
      super.styles,
      heritageFrameStyles,
      css`
        :host {
          display: block;
        }

        .page-heading {
          margin-bottom: 16px;
        }

        /* Ô lọc và nút tải lịch trên một hàng; ô nhập cùng kiểu với ô tìm
           người ở trang chủ. Trên điện thoại nút xuống hàng riêng. */
        .toolbar {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 8px 16px;
          margin: 0 0 8px;
        }

        .toolbar md-filled-tonal-button {
          flex-shrink: 0;
        }

        .toolbar .short {
          display: none;
        }

        /* Điện thoại: nhãn nút rút gọn để nút đứng cùng hàng với ô lọc. */
        @media (max-width: 599px) {
          .toolbar {
            gap: 8px;
          }

          /* Chọn qua .toolbar để thắng quy tắc .search khai báo phía dưới. */
          .toolbar .search {
            flex: 1 1 180px;
            max-width: none;
          }

          .toolbar .long {
            display: none;
          }

          .toolbar .short {
            display: inline;
          }
        }

        .search {
          display: flex;
          flex: 1 1 240px;
          /* min-width 0 để ô co được dưới bề rộng mặc định của input, nhờ đó
             đứng chung hàng với nút tải lịch trên điện thoại. */
          min-width: 0;
          max-width: 420px;
          align-items: center;
          gap: 10px;
          padding: 0 10px 0 14px;
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
          flex: 1 1 0;
          width: 100%;
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

        .summary,
        .today {
          font-size: 13px;
          line-height: 1.5;
          color: var(--md-sys-color-on-surface-variant);
        }

        .today {
          margin: 0 0 4px;
        }

        .today b {
          font-weight: 600;
          color: var(--md-sys-color-on-surface);
        }

        /* Hàng tab ghim dưới thanh ứng dụng. Chip co giãn để trên điện thoại
           mười bốn ô xếp thành hai hàng, không có ô nào khuất ngoài mép. */
        .tabs {
          position: sticky;
          top: var(--workspace-header-height, 64px);
          z-index: 2;
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          padding: 8px 0 10px;
          margin: 0 0 6px;
          background: var(--md-sys-color-background, #f4f2ed);
        }

        .tabs button {
          flex: 1 0 auto;
          min-width: 44px;
          min-height: 36px;
          padding: 0 10px;
          border: 1px solid var(--heritage-rule);
          border-radius: var(--grampsjs-frame-radius);
          background: var(--grampsjs-frame-paper, var(--md-sys-color-surface));
          color: var(--md-sys-color-on-surface);
          font: 500 14px/1 var(--grampsjs-body-font-family);
          cursor: pointer;
          white-space: nowrap;
        }

        .tabs button.wide {
          flex-grow: 0;
          padding: 0 14px;
        }

        .tabs button:hover,
        .tabs button:focus-visible {
          border-color: var(--heritage-gold);
          color: var(--md-sys-color-primary);
        }

        .tabs button:focus-visible {
          outline: 2px solid var(--md-sys-color-primary);
          outline-offset: 1px;
        }

        .tabs button[aria-selected='true'] {
          border-color: var(--heritage-gold);
          background: var(--md-sys-color-secondary-container);
          color: var(--md-sys-color-on-secondary-container);
        }

        /* Chấm nhỏ đánh dấu tháng âm đang đứng. */
        .tabs button.now::after {
          content: '';
          display: inline-block;
          width: 5px;
          height: 5px;
          margin-left: 5px;
          border-radius: 50%;
          background: var(--md-sys-color-primary);
          vertical-align: 2px;
        }

        /* Dưới 840 px: lưới bảy cột, hai hàng. "Sắp tới" và "Cả năm" đứng đầu
           mỗi hàng, sáu tháng nối theo sau như hai nửa của một tờ lịch, nên
           không ô nào khuất ngoài mép mà hàng tab vẫn gọn. */
        @media (max-width: 839px) {
          .tabs {
            display: grid;
            grid-template-columns: auto repeat(6, minmax(0, 1fr));
            gap: 4px;
          }

          .tabs button {
            min-width: 0;
            padding: 0 2px;
            font-size: 13px;
          }

          .tabs button.wide {
            padding: 0 8px;
          }

          .tabs button.wide:last-child {
            grid-row: 2;
            grid-column: 1;
          }
        }

        @media (max-width: 359px) {
          .tabs button {
            font-size: 12px;
            letter-spacing: -0.01em;
          }
        }

        .sections {
          display: flex;
          flex-direction: column;
        }

        .month {
          margin: 0 0 22px;
        }

        .month[hidden] {
          display: none;
        }

        .month h3 {
          display: flex;
          flex-wrap: wrap;
          align-items: baseline;
          gap: 2px 10px;
          margin: 8px 0 8px;
          font-size: 19px;
          font-weight: 600;
        }

        .month h3 .sub {
          font: 400 13px/1.5 var(--grampsjs-body-font-family);
          color: var(--md-sys-color-on-surface-variant);
        }

        .days {
          overflow: hidden;
        }

        .caption {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          padding: 5px 12px 5px 0;
          border-bottom: 1px solid var(--heritage-rule);
          background: color-mix(
            in srgb,
            var(--heritage-gold) 9%,
            var(--grampsjs-frame-paper)
          );
          font-size: 11px;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: var(--md-sys-color-on-surface-variant);
        }

        .caption span:first-child {
          flex: 0 0 72px;
          text-align: center;
        }

        /* Một ngày giỗ: ô ngày bên trái, những người giỗ ngày đó bên phải. */
        .day {
          display: grid;
          grid-template-columns: 72px minmax(0, 1fr);
          border-bottom: 1px solid var(--md-sys-color-outline-variant);
          break-inside: avoid;
        }

        .day:last-child {
          border-bottom: 0;
        }

        .when {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 8px 4px;
          border-right: 1px solid var(--md-sys-color-outline-variant);
          text-align: center;
          color: var(--md-sys-color-primary);
        }

        .when strong {
          font: 500 22px/1.15 var(--grampsjs-heading-font-family);
          white-space: nowrap;
        }

        .when small {
          font: 400 11.5px/1.4 var(--grampsjs-body-font-family);
          color: var(--md-sys-color-on-surface-variant);
          white-space: nowrap;
        }

        .when .due {
          margin-top: 2px;
          font-size: 11px;
          font-weight: 600;
          color: var(--md-sys-color-primary);
        }

        .day.soon .when {
          background: color-mix(in srgb, var(--heritage-gold) 16%, transparent);
        }

        .day.today .when {
          background: var(--md-sys-color-primary);
          color: var(--md-sys-color-on-primary);
        }

        .day.today .when small,
        .day.today .when .due {
          color: inherit;
        }

        .row {
          display: grid;
          grid-template-columns: minmax(0, 1fr);
          gap: 0 12px;
          padding: 7px 12px;
          border-bottom: 1px solid
            color-mix(
              in srgb,
              var(--md-sys-color-outline-variant) 55%,
              transparent
            );
          color: var(--md-sys-color-on-surface);
          text-decoration: none;
        }

        .row:last-child {
          border-bottom: 0;
        }

        .row:hover,
        .row:focus-visible {
          background: var(--md-sys-color-surface-container);
          color: var(--md-sys-color-primary);
          text-decoration: none;
        }

        .row .name {
          font-size: 15px;
          font-weight: 600;
          line-height: 1.35;
          overflow-wrap: anywhere;
        }

        .row .meta {
          display: block;
          font-size: 12.5px;
          line-height: 1.5;
          color: var(--md-sys-color-on-surface-variant);
        }

        .row .meta .gen + .branch::before {
          content: ' · ';
        }

        /* Trong tháng đang đứng: vạch ngăn giữa giỗ còn lại năm nay và giỗ đã
           qua, lần tới rơi vào năm âm sau. */
        .year-break {
          padding: 5px 12px;
          border-bottom: 1px solid var(--heritage-rule);
          background: color-mix(
            in srgb,
            var(--heritage-gold) 9%,
            var(--grampsjs-frame-paper)
          );
          font-size: 12.5px;
          color: var(--md-sys-color-on-surface-variant);
        }

        .empty {
          padding: 14px 12px;
          font-size: 14px;
          color: var(--md-sys-color-on-surface-variant);
        }

        @media (max-width: 599px) {
          .tabs {
            top: var(--workspace-header-height, 56px);
          }
        }

        /* Máy tính bảng trở lên: đời và ngành chi thành cột riêng để dò theo
           hàng dọc được. */
        @media (min-width: 840px) {
          .day {
            grid-template-columns: 84px minmax(0, 1fr);
          }

          .caption span:first-child {
            flex-basis: 84px;
          }

          .row {
            grid-template-columns: minmax(0, 1fr) 64px 150px;
            align-items: baseline;
            padding: 6px 16px;
          }

          .row .meta {
            display: contents;
          }

          .row .meta .gen,
          .row .meta .branch {
            font-size: 13px;
            color: var(--md-sys-color-on-surface-variant);
            white-space: nowrap;
          }

          .row .meta .gen + .branch::before {
            content: none;
          }

          .row:hover .meta .gen,
          .row:hover .meta .branch {
            color: inherit;
          }
        }

        /* Màn hình rộng: bảng của một tháng chia hai cột, mỗi ngày trọn trong
           một cột. */
        @media (min-width: 1200px) {
          .days.split {
            column-count: 2;
            column-gap: 0;
            column-rule: 1px solid var(--heritage-rule);
          }

          .days.split .caption {
            column-span: all;
          }

          .days.split .day {
            border-bottom: 1px solid var(--md-sys-color-outline-variant);
          }
        }

        @media print {
          .toolbar,
          .tabs,
          .today,
          md-filled-tonal-button {
            display: none;
          }

          .month[hidden] {
            display: block;
          }

          .month.upcoming {
            display: none;
          }

          .heritage-frame {
            box-shadow: none;
          }
        }
      `,
    ]
  }

  static get properties() {
    return {
      _people: {type: Array},
      _loaded: {type: Boolean},
      _fetching: {type: Boolean},
      _search: {state: true},
      _tab: {state: true},
    }
  }

  constructor() {
    super()
    this._people = []
    this._loaded = false
    this._fetching = false
    this._search = ''
    this._tab = TAB_UPCOMING
    this._entries = []
  }

  connectedCallback() {
    super.connectedCallback()
    const match = window.location.hash.match(TAB_RE)
    if (match) this._tab = match[1]
  }

  openSearch() {
    const field = this.renderRoot.querySelector('#anniversary-search')
    field?.scrollIntoView({block: 'center'})
    field?.focus({preventScroll: true})
  }

  willUpdate(changed) {
    super.willUpdate(changed)
    if (changed.has('_people')) {
      this._entries = collectAnniversaries(this._people)
    }
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
    const today = new Date()
    const searching = this._search.trim() !== ''
    const entries = searching
      ? this._entries.filter(entry => matchesQuery(entry, this._search))
      : this._entries
    const sections = buildMonthSections(entries, today)
    const lunar = lunarToday(today)
    const upcoming = upcomingEntries(entries, UPCOMING_DAYS)
    return html`
      <header class="page-heading">
        <p class="section-label">Tưởng niệm</p>
        <h2>${this._('Death anniversary calendar')}</h2>
        <p class="lead">
          Giỗ cả họ theo tháng âm lịch, kèm thứ và ngày dương của lần giỗ sắp
          tới. <a href="${GIO_GUIDE_PATH}">Cách đọc và cách bổ sung</a>
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
            placeholder="Tìm tên hoặc ngày"
            title="Gõ tên, hoặc ngày âm như 24/7, hoặc chỉ ngày như 24"
            autocomplete="off"
            .value=${this._search}
            @input=${event => {
              this._search = event.target.value
            }}
          />
        </label>
        <md-filled-tonal-button
          @click="${this._download}"
          ?disabled="${this._entries.length === 0}"
        >
          <span class="long">${this._('Download calendar (.ics)')}</span>
          <span class="short" aria-hidden="true">Tải lịch</span>
          <grampsjs-icon
            slot="icon"
            path="${mdiCalendarExport}"
            color="currentColor"
          ></grampsjs-icon>
        </md-filled-tonal-button>
      </div>
      <p class="today">
        Hôm nay
        <b
          >${WEEKDAY_LONG[today.getDay()]}
          ${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear()}</b
        >, tức ${lunar.day} tháng ${lunarMonthName(lunar.month)} năm
        ${canChiYear(lunar.year)} âm lịch.
        <span class="summary" aria-live="polite"
          >${this.loading
            ? this._('Loading items...')
            : this._countLabel(entries.length, searching)}</span
        >
      </p>
      ${searching ? nothing : this._renderTabs(sections)}
      <div class="sections">
        ${searching ? nothing : this._renderUpcoming(upcoming, lunar, today)}
        ${sections.map(section => this._renderMonth(section, lunar, searching))}
        ${searching && entries.length === 0 && !this.loading
          ? html`<p class="empty">
              Không có ngày giỗ nào khớp "${this._search.trim()}".
            </p>`
          : nothing}
      </div>
    `
  }

  /*
  "344 người có ngày giỗ" một mình khiến người tra không biết hơn nghìn người
  còn lại là trang lỗi hay phả không có. Nói rõ phần còn lại phả chưa chép,
  tổng số người lấy từ dbInfo để không phải tải cả cây.
  */
  _countLabel(shown, searching) {
    const total = this._entries.length
    const withMemorial = `${total} ${this._('people with a death anniversary')}`
    if (searching) {
      return `${shown} kết quả trong ${withMemorial}`
    }
    const people = this.appState.dbInfo?.object_counts?.people
    if (!people || people <= total) {
      return withMemorial
    }
    return `${withMemorial} · ${(people - total).toLocaleString(
      'vi-VN'
    )} người phả chưa chép giỗ`
  }

  _renderTabs(sections) {
    const tabs = [
      {id: TAB_UPCOMING, label: 'Sắp tới', wide: true, title: '30 ngày tới'},
      ...sections.map(section => ({
        id: TAB_MONTH(section.month),
        label: section.name,
        now: section.current,
        title: `Tháng ${section.name} âm lịch, ${section.entries.length} giỗ`,
      })),
      {
        id: TAB_ALL,
        label: 'Cả năm',
        wide: true,
        title: 'Mười hai tháng nối nhau',
      },
    ]
    return html`
      <div
        class="tabs"
        role="tablist"
        aria-label="Chọn tháng âm lịch"
        @keydown=${this._onTabKeydown}
      >
        ${tabs.map(
          tab =>
            html`<button
              type="button"
              role="tab"
              id="tab-${tab.id}"
              class="${tab.wide ? 'wide' : ''} ${tab.now ? 'now' : ''}"
              aria-selected="${this._tab === tab.id ? 'true' : 'false'}"
              aria-controls="${tab.id}"
              tabindex="${this._tab === tab.id ? '0' : '-1'}"
              title="${tab.title}"
              data-tab="${tab.id}"
              @click=${() => this._selectTab(tab.id)}
            >
              ${tab.label}
            </button>`
        )}
      </div>
    `
  }

  _onTabKeydown(event) {
    const keys = ['ArrowLeft', 'ArrowRight', 'Home', 'End']
    if (!keys.includes(event.key)) return
    const buttons = [...event.currentTarget.querySelectorAll('button')]
    const index = buttons.findIndex(button => button.dataset.tab === this._tab)
    let next = index
    if (event.key === 'ArrowLeft')
      next = (index - 1 + buttons.length) % buttons.length
    if (event.key === 'ArrowRight') next = (index + 1) % buttons.length
    if (event.key === 'Home') next = 0
    if (event.key === 'End') next = buttons.length - 1
    event.preventDefault()
    this._selectTab(buttons[next].dataset.tab)
    this.updateComplete.then(() => {
      this.renderRoot.querySelector(`#tab-${this._tab}`)?.focus()
    })
  }

  _selectTab(id) {
    if (id === this._tab) return
    const tabs = this.renderRoot.querySelector('.tabs')
    const stuck =
      tabs && tabs.getBoundingClientRect().top <= this._headerHeight() + 1
    this._tab = id
    window.history.replaceState(window.history.state, '', `#${id}`)
    if (!stuck) return
    // Hàng tab đang ghim, nội dung phía trên đã cuộn khuất: kéo mục vừa chọn
    // lên ngay dưới hàng tab để người dùng không rơi vào giữa bảng.
    this.updateComplete.then(() => {
      const section =
        this.renderRoot.querySelector(`#${id}`) ??
        this.renderRoot.querySelector('.month:not([hidden])')
      if (!section) return
      section.style.scrollMarginTop = `${
        this._headerHeight() + tabs.offsetHeight + 4
      }px`
      section.scrollIntoView({block: 'start'})
    })
  }

  _headerHeight() {
    const value = getComputedStyle(this).getPropertyValue(
      '--workspace-header-height'
    )
    return parseInt(value, 10) || 64
  }

  _renderUpcoming(upcoming, lunar, today) {
    const days = groupByDay(upcoming)
    const end = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() + UPCOMING_DAYS
    )
    const span = formatSolarSpan(
      [today.getDate(), today.getMonth() + 1, today.getFullYear()],
      [end.getDate(), end.getMonth() + 1, end.getFullYear()]
    )
    return html`
      <section
        class="month upcoming"
        id="${TAB_UPCOMING}"
        role="tabpanel"
        aria-labelledby="tab-${TAB_UPCOMING}"
        ?hidden=${this._tab !== TAB_UPCOMING}
      >
        <h3>
          Sắp tới
          <span class="sub"
            >${UPCOMING_DAYS} ngày tới · ${span} · ${upcoming.length} giỗ</span
          >
        </h3>
        <div class="days heritage-frame">
          <div class="caption">
            <span>Âm · dương</span><span>Họ tên · đời · ngành, chi</span>
          </div>
          ${days.length
            ? days.map(day => this._renderDay(day, true))
            : html`<p class="empty">
                Trong ${UPCOMING_DAYS} ngày tới phả không chép giỗ nào.
              </p>`}
        </div>
      </section>
    `
  }

  _renderMonth(section, lunar, searching) {
    if (searching && section.entries.length === 0) return nothing
    const visible =
      searching ||
      this._tab === TAB_ALL ||
      this._tab === TAB_MONTH(section.month)
    const nextYear = canChiYear(section.lunarYear + 1)
    const span = lunarMonthSpan(section.month, section.lunarYear)
    return html`
      <section
        class="month"
        id="${TAB_MONTH(section.month)}"
        role="${searching ? nothing : 'tabpanel'}"
        aria-labelledby="${searching
          ? nothing
          : `tab-${TAB_MONTH(section.month)}`}"
        style="order: ${(section.month - lunar.month + 12) % 12}"
        ?hidden=${!visible}
      >
        <h3>
          Tháng ${section.name}
          <span class="sub"
            >âm lịch · năm ${section.yearName} ·
            ${formatSolarSpan(span.first, span.last)} dương lịch ·
            ${section.entries.length}
            giỗ${section.current ? ' · tháng này' : ''}</span
          >
        </h3>
        <div
          class="days heritage-frame ${section.days.length > 6 ? 'split' : ''}"
        >
          <div class="caption">
            <span>Âm · dương</span><span>Họ tên · đời · ngành, chi</span>
          </div>
          ${section.days.length === 0
            ? html`<p class="empty">Phả chưa chép giỗ nào trong tháng này.</p>`
            : section.days.map(
                (day, index) =>
                  html`${index === section.nextYearFrom
                    ? html`<div class="year-break">
                        Đã qua trong năm nay, lần giỗ tới thuộc năm ${nextYear}
                        (${section.lunarYear + 1})
                      </div>`
                    : nothing}${this._renderDay(day, false)}`
              )}
        </div>
      </section>
    `
  }

  _renderDay(day, withMonth) {
    const classes = ['day']
    if (day.daysAway === 0) classes.push('today')
    else if (day.daysAway <= 7) classes.push('soon')
    const [d, m, y] = day.solar
    const label =
      `Ngày ${day.day} tháng ${lunarMonthName(day.month)} âm lịch, ` +
      `${WEEKDAY_LONG[
        new Date(y, m - 1, d).getDay()
      ].toLowerCase()} ${d}/${m}/${y}`
    return html`
      <div class="${classes.join(' ')}">
        <div class="when" aria-label="${label}">
          <strong>${withMonth ? `${day.day}/${day.month}` : day.day}</strong>
          <small>${formatSolarShort(day.solar)}</small>
          ${day.daysAway <= UPCOMING_DAYS
            ? html`<span class="due"
                >${this._daysAwayLabel(day.daysAway)}</span
              >`
            : nothing}
        </div>
        <div class="people">
          ${day.entries.map(entry => this._renderEntry(entry))}
        </div>
      </div>
    `
  }

  _renderEntry({person, name, generation}) {
    const branch = formatBranch(getBranch(person.extended?.tags))
    return html`
      <a class="row" href="/person/${person.gramps_id}">
        <span class="name">${name}</span>
        <span class="meta">
          ${generation
            ? html`<span class="gen"
                >${this._('Generation')} ${generation}</span
              >`
            : nothing}${branch
            ? html`<span class="branch">${branch}</span>`
            : nothing}
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
    const ics = buildGioIcs(this._entries, {
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
