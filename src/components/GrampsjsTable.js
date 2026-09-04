import {css, html, LitElement} from 'lit'
import '@material/web/checkbox/checkbox.js'
import '@material/web/iconbutton/icon-button.js'
import '@material/web/icon/icon.js'
import '@material/web/iconbutton/filled-icon-button'
import '@material/web/button/text-button.js'
import '@material/web/menu/menu'
import {mdiSort, mdiSortAscending, mdiSortDescending} from '@mdi/js'
import {classMap} from 'lit/directives/class-map.js'

import './GrampsjsTooltip.js'

import {GrampsjsAppStateMixin} from '../mixins/GrampsjsAppStateMixin.js'
import {sharedStyles} from '../SharedStyles.js'
import {clickKeyHandler, fireEvent} from '../util.js'
import {renderIconSvg} from '../icons.js'

export class GrampsjsTable extends GrampsjsAppStateMixin(LitElement) {
  static get styles() {
    return [
      sharedStyles,
      css`
        :host {
          display: block;
        }

        table {
          border-collapse: collapse;
          font-weight: 400;
        }

        thead {
          display: none;
        }

        /* Bố cục dọc (điện thoại): mỗi dòng là một thẻ, các ô xếp bằng flex
           để tên chiếm trọn hàng đầu, các ô meta nối thành một dòng nhỏ, còn
           lại chia đôi. */
        tbody tr {
          display: flex;
          flex-wrap: wrap;
          align-items: baseline;
          gap: 0.6em 0.75em;
          border-top: 1px solid var(--heritage-rule);
          padding: 10px 0;
        }

        tbody tr:last-child {
          border-bottom: 1px solid var(--heritage-rule);
        }

        tbody td {
          text-align: left;
          display: block;
          flex: 1 1 calc(50% - 0.75em);
          min-width: 0;
          padding: 0 10px;
          border: none;
          position: relative;
          font-size: 16px;
        }

        tbody td::before {
          content: attr(data-label);
          display: block;
          margin-bottom: 5px;
          font-size: 14px;
          color: var(--grampsjs-body-font-color-50);
          font-weight: 400;
        }

        /* Một ô rỗng ở bố cục dọc vẫn chiếm nguyên một khối chỉ để in cái nhãn
           của chính nó — với dữ liệu phả hệ, nơi phần lớn người đời trước không
           có ngày sinh hay ngày mất, đó là phần lớn màn hình. Bỏ hẳn ô đó đi. */
        tbody td.is-empty {
          display: none;
        }

        /* Tên là thứ người ta quét mắt tìm, nên cho nó nguyên một dòng và bỏ
           nhãn "Họ và tên" — dòng đầu của mỗi khối thì không cần chú thích. */
        tbody td[data-key='name'] {
          flex: 1 0 100%;
          font-size: 17px;
          font-weight: 500;
        }

        tbody td[data-key='name']::before {
          display: none;
        }

        /* Cột đánh dấu meta (đời, ngành chi, giỗ) nối thành một dòng nhỏ ngay
           dưới tên: "Đời 13 · Ngành 3 - Chi 2 · Giỗ 12/8 ÂL", không tách mỗi
           thứ thành một khối riêng. Dấu chấm giữa đặt vào nhãn của ô đứng sau
           một ô meta có dữ liệu; ô rỗng đã ẩn nên không tính. */
        table:not(.wide) tbody td.meta {
          flex: 0 0 auto;
          max-width: 100%;
          margin-top: -0.55em;
          font-size: 15px;
          color: var(--grampsjs-body-font-color-70);
        }

        table:not(.wide) tbody td.meta + td.meta {
          margin-left: -0.45em;
        }

        table:not(.wide) tbody td.meta::before {
          display: inline;
          margin: 0 0.15em 0 0;
          font-size: 15px;
        }

        table:not(.wide) tbody td.meta .cell-content {
          display: inline;
        }

        table:not(.wide)
          tbody
          td.meta:not(.is-empty)
          ~ td.meta:not(.is-empty)::before {
          content: '· ' attr(data-label);
        }

        table.linked tbody tr:hover {
          cursor: pointer;
        }

        table.linked tbody tr:not(.selected):hover {
          background-color: color-mix(
            in srgb,
            var(--heritage-gold) 14%,
            var(--grampsjs-frame-paper)
          );
        }

        table:not(.wide) {
          width: 100%;
        }

        /* Điện thoại: mỗi dòng là một thẻ giấy, cùng khung với các khối khác. */
        table:not(.wide) tbody tr {
          position: relative;
          margin-bottom: 12px;
          padding: 16px 12px;
          border: 1px solid var(--heritage-rule);
          border-left: 3px solid
            color-mix(in srgb, var(--heritage-gold) 72%, var(--heritage-rule));
          border-radius: var(--grampsjs-frame-radius);
          background-color: var(--grampsjs-frame-paper);
          background-image: var(--heritage-panel-background);
          box-shadow: var(--heritage-panel-shadow),
            inset 0 0 0 3px
              color-mix(in srgb, var(--heritage-gold) 4%, transparent);
        }

        table.linked tbody tr:focus-visible,
        table.linked tbody tr:hover,
        table:not(.wide) tbody tr.selected {
          outline: 2px solid var(--md-sys-color-primary);
          outline-offset: -2px;
        }

        /* Danh bạ (trang Người trong họ): mỗi người một dòng mảnh, tên rồi
           đến đời, ngành chi, giỗ nối tiếp trên cùng dòng và chỉ xuống dòng
           khi không đủ chỗ; trên màn hình rộng chia thành nhiều cột như trang
           danh bạ thay cho bảng bốn cột thưa. */
        .table-container.roster {
          padding: 6px 16px 8px;
          border: 1px solid var(--heritage-rule);
          border-radius: var(--grampsjs-frame-radius);
          background-color: var(--grampsjs-frame-paper);
          background-image: var(--heritage-panel-background);
          box-shadow: var(--heritage-panel-shadow),
            inset 0 3px var(--heritage-gold);
        }

        table.roster tbody {
          display: block;
          columns: 360px;
          column-gap: 36px;
        }

        table.roster tbody tr {
          break-inside: avoid;
          margin: 0;
          padding: 9px 6px;
          gap: 1px 10px;
          border: 0;
          border-top: 1px solid var(--heritage-rule);
          border-radius: 0;
          background: none;
          box-shadow: none;
        }

        table.roster tbody tr:first-child {
          border-top: 0;
        }

        table.roster tbody tr:last-child {
          border-bottom: 0;
        }

        table.roster tbody td {
          padding: 0;
        }

        table.roster tbody td[data-key='name'] {
          flex: 0 1 auto;
          font-size: 16px;
          font-weight: 600;
        }

        table.roster tbody td.meta,
        table.roster tbody td.meta::before {
          margin-top: 0;
          font-size: 14px;
        }

        table.roster.linked tbody tr:hover {
          outline: 0;
          border-radius: 3px;
        }

        table.roster tbody tr.selected {
          outline-offset: -1px;
        }

        /* Wide table */

        table.wide thead {
          display: table-header-group;
        }

        /* Máy tính: cả bảng nằm trong một khung giấy, đầu cột viết như nhãn mục. */
        .table-container.wide {
          border: 1px solid var(--heritage-rule);
          border-radius: var(--grampsjs-frame-radius);
          background-color: var(--grampsjs-frame-paper);
          background-image: var(--heritage-panel-background);
          box-shadow: var(--heritage-panel-shadow),
            inset 0 3px var(--heritage-gold);
          overflow-x: auto;
        }

        table.wide {
          background: transparent;
        }

        table.wide thead th {
          text-align: left;
          padding: 16px 20px;
          font: 500 11px/1.6 var(--grampsjs-body-font-family);
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--md-sys-color-primary);
          background: color-mix(
            in srgb,
            var(--heritage-gold) 8%,
            var(--grampsjs-frame-paper)
          );
          vertical-align: middle;
          white-space: nowrap;
        }

        table.wide tbody tr {
          display: table-row;
          gap: 0;
          padding: 0;
        }

        table.wide tbody tr:last-child {
          border-bottom: 0;
        }

        table.wide thead tr {
          border-bottom: 1px solid var(--heritage-rule);
        }

        table.wide tbody td {
          display: table-cell;
          padding: 14px 20px;
          border: none;
          font-size: 15px;
        }

        tbody td > .cell-content {
          display: -webkit-box;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 3;
          overflow: hidden;
        }

        table.wide tbody td > .cell-content {
          -webkit-line-clamp: 1;
        }

        table.wide tbody td::before {
          content: none;
        }

        th {
          --md-icon-button-icon-size: 18px;
          --md-icon-button-container-height: 20px;
          --md-icon-button-container-width: 20px;
        }

        th md-icon-button {
          margin-left: 0.5em;
          vertical-align: middle;
        }

        .mobile-sort {
          position: relative;
          display: flex;
          justify-content: flex-end;
          margin-top: 5px;
          margin-bottom: 8px;
        }

        .mobile-sort md-text-button {
          --md-text-button-label-text-size: 14px;
          --md-text-button-label-text-color: var(--grampsjs-body-font-color-70);
          --md-text-button-icon-size: 20px;
        }

        .mobile-sort md-menu {
          --md-menu-item-one-line-container-height: 48px;
          --md-menu-item-selected-container-color: var(
            --md-sys-color-secondary-container
          );
        }

        /* Narrow (card) mode: pull checkbox out of grid flow, pin to left */
        table:not(.wide) tbody tr:has(td.col-select) {
          position: relative;
          padding-left: 48px;
        }

        table:not(.wide) tbody td.col-select {
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0;
        }

        tbody td.col-select::before {
          content: none;
        }

        /* Wide (table) mode */
        table.wide th.col-select {
          width: 48px;
          padding: 0 4px;
          vertical-align: middle;
          text-align: center;
        }

        table.wide td.col-select {
          width: 48px;
          padding: 4px;
          vertical-align: middle;
          text-align: center;
        }

        .narrow-select-all {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 4px 4px 4px 8px;
          font-size: 14px;
          color: var(--grampsjs-body-font-color-70);
        }

        .narrow-select-all + table {
          margin-top: 12px;
        }

        tbody tr.selected {
          background-color: var(
            --md-sys-color-secondary-container,
            var(--grampsjs-color-shade-240)
          );
        }

        .col-select md-checkbox,
        .narrow-select-all md-checkbox {
          --md-checkbox-outline-color: var(--grampsjs-body-font-color-30);
          --md-checkbox-hover-outline-color: var(--grampsjs-body-font-color-50);
        }
      `,
    ]
  }

  static get properties() {
    return {
      columns: {type: Array},
      data: {type: Array},
      narrow: {type: Boolean},
      // Kiểu danh bạ: không bao giờ chuyển sang bảng rộng, dòng mảnh, nhiều
      // cột trên màn hình rộng (xem CSS .roster).
      roster: {type: Boolean},
      naturalWidth: {type: Boolean},
      breakPoint: {type: Number},
      loading: {type: Boolean},
      linked: {type: Boolean},
      sortable: {type: Boolean},
      sort: {type: Number},
      descending: {type: Boolean},
      serverSort: {type: Boolean},
      sortDescriptor: {type: String},
      selectable: {type: Boolean},
      selectionKey: {type: Number},
      _containerWidth: {type: Number},
      _selectedIndices: {type: Object},
    }
  }

  constructor() {
    super()
    this.columns = []
    this.data = []
    this.loading = false
    this.narrow = false
    this.roster = false
    this.naturalWidth = false
    this.breakPoint = 600
    this.linked = false
    this.sortable = false
    this.sort = -1
    this.descending = false
    this.serverSort = false
    this.sortDescriptor = ''
    this.selectable = false
    this.selectionKey = 0
    this._containerWidth = -1
    this._selectedIndices = new Set()
  }

  updated(changed) {
    if (changed.has('selectionKey')) {
      this._selectedIndices = new Set()
    }
  }

  get _isWide() {
    return (
      this._containerWidth > this.breakPoint && !this.narrow && !this.roster
    )
  }

  // Dòng có liên kết thì vào được bằng Tab; quy tắc lit-a11y không đọc được
  // biểu thức điều kiện đặt thẳng trong template.
  get _rowTabIndex() {
    return this.linked ? 0 : -1
  }

  render() {
    return html`
      <div
        class="table-container ${classMap({
          wide: this._isWide,
          roster: this.roster,
        })}"
      >
        ${this.data.length > 0 && this.sortable && !this._isWide
          ? this._renderMobileSort()
          : ''}
        ${this.selectable && !this._isWide ? this._renderNarrowSelectAll() : ''}

        <table
          class="${classMap({
            wide: this._isWide,
            linked: this.linked,
            roster: this.roster,
          })}"
          style="${this.naturalWidth && this._isWide
            ? 'width: auto;'
            : 'width: 100%;'}"
        >
          <thead>
            <tr>
              ${this.selectable && this._isWide
                ? html`<th class="col-select">
                    <md-checkbox
                      ?checked="${this._selectedIndices.size ===
                        this.data.length && this.data.length > 0}"
                      ?indeterminate="${this._selectedIndices.size > 0 &&
                      this._selectedIndices.size < this.data.length}"
                      @change="${this._handleSelectAll}"
                      aria-label="${this._('_Select All')}"
                    ></md-checkbox>
                  </th>`
                : ''}
              ${this.columns.map(
                (column, columnIndex) => html`<th>
                  ${this._colLabel(column.name)}
                  ${this.sortable ? this._renderSortBtn(columnIndex) : ''}
                </th>`
              )}
            </tr>
          </thead>
          <tbody>
            ${this._sortedRows().map(
              ({item, index}) => html`
                <tr
                  class="${this._selectedIndices.has(index) ? 'selected' : ''}"
                  @click="${() => this._handleRowClick(index)}"
                  @keydown="${clickKeyHandler}"
                  .tabIndex=${this._rowTabIndex}
                  role="${this.linked ? 'button' : 'row'}"
                >
                  ${this.selectable
                    ? html`<td
                        class="col-select"
                        @click="${e => e.stopPropagation()}"
                      >
                        <md-checkbox
                          ?checked="${this._selectedIndices.has(index)}"
                          @change="${() => this._handleSelectRow(index)}"
                          aria-label="Select row"
                        ></md-checkbox>
                      </td>`
                    : ''}
                  ${item.map(
                    (value, colIndex) => html`
                      <td
                        data-label="${this.columns[colIndex].noLabel
                          ? ''
                          : this._colLabel(this.columns[colIndex].name)}"
                        data-key="${this.columns[colIndex].key ?? ''}"
                        class="${classMap({
                          'is-empty':
                            value === '' ||
                            value === null ||
                            value === undefined,
                          meta: Boolean(this.columns[colIndex].meta),
                        })}"
                      >
                        <div class="cell-content">
                          ${this.loading
                            ? html`<span class="skeleton"
                                ><span style="visibility: hidden;"
                                  >${this._formatValue(
                                    this.columns[colIndex],
                                    value
                                  )}</span
                                ></span
                              >`
                            : this._formatValue(this.columns[colIndex], value)}
                        </div>
                      </td>
                    `
                  )}
                </tr>
              `
            )}
          </tbody>
        </table>
      </div>
    `
  }

  _renderMobileSort() {
    const hasActive = this.serverSort
      ? this._getActiveSortColumn() >= 0
      : this.sort >= 0
    const isAscending = this.serverSort
      ? !this._isSortDescending()
      : !this.descending
    // Nút có chữ, không chỉ một biểu tượng xám lẻ loi ở góc; ghi luôn cột đang
    // xếp nếu cột đó có trong bảng.
    const activeIndex = this.serverSort
      ? this._getActiveSortColumn()
      : this.sort
    const activeLabel =
      hasActive && this.columns[activeIndex]
        ? `: ${this._colLabel(this.columns[activeIndex].name)}`
        : ''
    return html`
      <div class="mobile-sort">
        <md-text-button @click="${this._toggleSortMenu}" id="btn-sort-menu">
          <md-icon slot="icon"
            >${this._renderSortIcon(hasActive, isAscending)}</md-icon
          >
          ${this._('Sort by')}${activeLabel}
        </md-text-button>
        <md-menu id="sort-menu" anchor="btn-sort-menu">
          ${this.columns
            .filter(col => !this.serverSort || col.sortKey)
            .map((column, columnIndex) => {
              const realIndex = this.columns.indexOf(column)
              const isSelected = this.serverSort
                ? this._getActiveSortColumn() === realIndex
                : this.sort === realIndex
              return html`
                <md-menu-item
                  @click="${() => this._toggleSort(realIndex)}"
                  ?selected="${isSelected}"
                >
                  <div slot="headline">${this._colLabel(column.name)}</div>
                </md-menu-item>
              `
            })}
        </md-menu>
      </div>
    `
  }

  _toggleSortMenu() {
    const menu = this.renderRoot.querySelector('#sort-menu')
    menu.open = !menu.open
  }

  _colLabel(name) {
    return this._(name).replace(/:$/, '')
  }

  // eslint-disable-next-line class-methods-use-this
  _formatValue(column, value) {
    let returnValue = value
    if (column.format) {
      returnValue = column.format(value)
    }
    if (column.unit) {
      returnValue = `${returnValue} ${column.unit}`
    }
    return returnValue
  }

  _renderSortBtn(columnIndex) {
    const col = this.columns[columnIndex]
    if (this.serverSort && !col.sortKey) return ''
    const isCurrent = this.serverSort
      ? this._getActiveSortColumn() === columnIndex
      : this.sort === columnIndex
    const isAscending = this.serverSort
      ? isCurrent && !this._isSortDescending()
      : !this.descending
    return html`
      <span>
        <md-icon-button
          @click="${() => this._toggleSort(columnIndex)}"
          id="btn-sort-${columnIndex}"
        >
          <md-icon>${this._renderSortIcon(isCurrent, isAscending)}</md-icon>
        </md-icon-button>
        <grampsjs-tooltip
          for="btn-sort-${columnIndex}"
          .strings="${this.strings}"
          >${this._('Sort')}</grampsjs-tooltip
        >
      </span>
    `
  }

  _toggleSort(columnIndex) {
    if (this.serverSort) {
      const col = this.columns[columnIndex]
      if (!col?.sortKey) return
      const isCurrent = this._getActiveSortColumn() === columnIndex
      const wasDescending = this._isSortDescending()
      const descending = isCurrent ? !wasDescending : false
      fireEvent(this, 'table:sort-changed', {key: col.sortKey, descending})
      return
    }
    if (this.sort === columnIndex) {
      this.descending = !this.descending
    } else {
      this.sort = columnIndex
      this.descending = false
    }
  }

  _getActiveSortColumn() {
    if (!this.sortDescriptor) return -1
    const key = this.sortDescriptor.substring(1)
    return this.columns.findIndex(col => col.sortKey === key)
  }

  _isSortDescending() {
    return this.sortDescriptor?.startsWith('-') ?? false
  }

  // eslint-disable-next-line class-methods-use-this
  _renderSortIcon(isCurrent, isAscending) {
    if (isCurrent) {
      if (isAscending) {
        return renderIconSvg(
          mdiSortAscending,
          'var(--grampsjs-body-font-color-60)'
        )
      }
      return renderIconSvg(
        mdiSortDescending,
        'var(--grampsjs-body-font-color-60)'
      )
    }
    return renderIconSvg(mdiSort, 'var(--grampsjs-body-font-color-20)')
  }

  _renderNarrowSelectAll() {
    return html`
      <div class="narrow-select-all">
        <md-checkbox
          ?checked="${this._selectedIndices.size === this.data.length &&
          this.data.length > 0}"
          ?indeterminate="${this._selectedIndices.size > 0 &&
          this._selectedIndices.size < this.data.length}"
          @change="${this._handleSelectAll}"
          aria-label="${this._('_Select All')}"
        ></md-checkbox>
        <span>${this._('_Select All')}</span>
      </div>
    `
  }

  _handleSelectAll() {
    const willSelectAll = this._selectedIndices.size < this.data.length
    this._selectedIndices = willSelectAll
      ? new Set(this.data.map((_, i) => i))
      : new Set()
    fireEvent(this, 'selection:changed', {indices: [...this._selectedIndices]})
  }

  _handleSelectRow(index) {
    const next = new Set(this._selectedIndices)
    if (next.has(index)) next.delete(index)
    else next.add(index)
    this._selectedIndices = next
    fireEvent(this, 'selection:changed', {indices: [...this._selectedIndices]})
  }

  _sortedRows() {
    const indexed = this.data.map((item, index) => ({item, index}))
    if (!this.serverSort && this.sortable && this.sort >= 0) {
      const col = this.sort
      const dir = this.descending ? -1 : 1
      indexed.sort((a, b) => {
        if (a.item[col] > b.item[col]) return dir
        if (a.item[col] < b.item[col]) return -dir
        return 0
      })
    }
    return indexed
  }

  _handleRowClick(originalIndex) {
    fireEvent(this, 'table:row-click', {rowNumber: originalIndex})
  }

  firstUpdated() {
    const container = this.renderRoot.querySelector('.table-container')
    this._resizeObserver = new ResizeObserver(() => this.handleResize())
    this._resizeObserver.observe(container)
    this.handleResize()
  }

  disconnectedCallback() {
    super.disconnectedCallback()
    this._resizeObserver?.disconnect()
  }

  handleResize() {
    const container = this.renderRoot.querySelector('.table-container')
    if (container) {
      this._containerWidth = container.offsetWidth
    }
  }
}

window.customElements.define('grampsjs-table', GrampsjsTable)
