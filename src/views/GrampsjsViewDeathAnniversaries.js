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
import {anniversaryStyles} from '../AnniversaryStyles.js'
import '@material/web/list/list'
import '@material/web/list/list-item'

import {GrampsjsConnectedComponent} from '../components/GrampsjsConnectedComponent.js'
import {ATTR_DEATH_ANNIVERSARY} from '../branding.js'
import {collectAnniversaries} from '../gioCalendar.js'

const MAX_SHOWN = 5

export class GrampsjsViewDeathAnniversaries extends GrampsjsConnectedComponent {
  static get styles() {
    return [
      super.styles,
      css`
        h3 {
          margin: 0 0 12px;
          font-size: 24px;
        }

        p.more {
          margin-top: 0.6em;
          font-size: 0.95em;
        }
      `,
      anniversaryStyles,
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
      <p class="calendar-note">
        Kính nhớ tiền nhân · Ô ngày ghi theo dương lịch
      </p>
      ${upcoming.length === 0
        ? html`<p>${this._('No upcoming death anniversaries.')}</p>`
        : html`
            <div>${upcoming.map(entry => this._renderEntry(entry))}</div>
            <p class="more">
              <a href="/lich-gio" class="link"
                >${this._('See the whole year')}</a
              >
            </p>
          `}`
  }

  _upcoming() {
    return collectAnniversaries(this._data?.data ?? []).slice(0, MAX_SHOWN)
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
