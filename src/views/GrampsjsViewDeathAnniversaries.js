/*
Ngày giỗ sắp tới.

Khác với "Ngày kỷ niệm" của bản gốc — thứ đọc ngày dương trong các sự kiện —
màn hình này đọc thuộc tính "Ngày giỗ" mà bộ dữ liệu phả hệ ghi theo âm lịch,
rồi quy sang dương lịch để biết năm nay giỗ rơi vào ngày nào. Đó là câu hỏi
người trong họ mở trang lên để hỏi.

Lọc ngay ở máy chủ bằng luật HasAttribute nên chỉ tải về những người thực sự có
ngày giỗ, không phải cả nghìn người trong cây.
*/

import {html, css} from 'lit'
import '@material/web/list/list'
import '@material/web/list/list-item'

import {GrampsjsConnectedComponent} from '../components/GrampsjsConnectedComponent.js'
import {fireEvent} from '../util.js'
import {ATTR_DEATH_ANNIVERSARY} from '../branding.js'
import {collectAnniversaries} from '../gioCalendar.js'

const MAX_SHOWN = 8

export class GrampsjsViewDeathAnniversaries extends GrampsjsConnectedComponent {
  static get styles() {
    return [
      super.styles,
      css`
        h3 {
          margin-bottom: 15px;
        }

        .date {
          height: 38px;
          width: 38px;
          border-radius: 19px;
          background-color: var(--mdc-theme-primary);
          opacity: 0.6;
          color: var(--mdc-theme-on-primary);
          font-size: 13px;
          line-height: 38px;
          display: inline-block;
          text-align: center;
          font-family: var(--grampsjs-heading-font-family);
          font-weight: 300;
          margin-right: 10px;
          white-space: nowrap;
        }

        .soon {
          opacity: 1;
        }

        p.more {
          margin-top: 0.6em;
          font-size: 0.95em;
        }
      `,
    ]
  }

  renderLoading() {
    return html`<h3>${this._('Upcoming death anniversaries')}</h3>
      <md-list>
        ${Array(2).fill(
          html`
            <md-list-item type="button" noninteractive>
              <span slot="headline" class="skeleton" style="width:15em;"
                >&nbsp;</span
              >
              <span slot="supporting-text" class="skeleton" style="width:10em;"
                >&nbsp;</span
              >
              <span slot="start" class="skeleton avatar">&nbsp;</span>
            </md-list-item>
          `
        )}
      </md-list>`
  }

  renderContent() {
    const upcoming = this._upcoming()
    return html`<h3>${this._('Upcoming death anniversaries')}</h3>
      ${upcoming.length === 0
        ? html`<p>${this._('No upcoming death anniversaries.')}</p>`
        : html`
            <md-list class="large">
              ${upcoming.map(entry => this._renderEntry(entry))}
            </md-list>
            <p class="more">
              <a href="/lich-gio" class="link"
                >${this._('See the whole year')}</a
              >
            </p>
          `}`
  }

  _openCalendar() {
    fireEvent(this, 'nav', {path: 'lich-gio'})
  }

  _upcoming() {
    return collectAnniversaries(this._data?.data ?? []).slice(0, MAX_SHOWN)
  }

  _renderEntry({person, lunar, next, name, generation}) {
    const [day, month] = next.solar
    return html`
      <md-list-item
        type="button"
        @click="${() => this._handleClick(person)}"
        @keydown="${this._handleKeyDown}"
      >
        <span slot="headline">${name}</span>
        <span slot="start" class="date ${next.daysAway <= 7 ? 'soon' : ''}"
          >${day}/${month}</span
        >
        <span slot="supporting-text">
          ${this._('Death anniversary')} ${lunar.day}/${lunar.month}
          ${this._('lunar')} ·
          ${this._daysAwayLabel(next.daysAway)}${generation
            ? html` · ${this._('Generation')} ${generation}`
            : ''}
        </span>
      </md-list-item>
    `
  }

  _daysAwayLabel(days) {
    if (days === 0) return this._('Today')
    if (days === 1) return this._('Tomorrow')
    return this._('in %s days', days)
  }

  _handleClick(person) {
    fireEvent(this, 'nav', {path: `person/${person.gramps_id}`})
  }

  // eslint-disable-next-line class-methods-use-this
  _handleKeyDown(event) {
    if (event.code === 'Enter') {
      event.target.click()
      event.preventDefault()
      event.stopPropagation()
    }
  }

  getUrl() {
    // Lọc ở máy chủ: chỉ những người có thuộc tính ngày giỗ. Giá trị rỗng trong
    // luật nghĩa là "có thuộc tính này, giá trị bất kỳ".
    const rules = encodeURIComponent(
      JSON.stringify({
        rules: [{name: 'HasAttribute', values: [ATTR_DEATH_ANNIVERSARY, '']}],
      })
    )
    return (
      `/api/people/?rules=${rules}` +
      `&keys=gramps_id,attribute_list,profile&profile=self` +
      `&locale=${this.appState.i18n.lang || 'en'}&pagesize=1000&page=1`
    )
  }
}

window.customElements.define(
  'grampsjs-view-death-anniversaries',
  GrampsjsViewDeathAnniversaries
)
