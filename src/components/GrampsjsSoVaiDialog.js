import {LitElement, css, html, nothing} from 'lit'
import '@material/web/dialog/dialog.js'
import '@material/web/button/text-button.js'
import '@material/web/button/outlined-button.js'

import {GrampsjsAppStateMixin} from '../mixins/GrampsjsAppStateMixin.js'
import {
  getAttributeValue,
  personDisplayName,
  personProfileDisplayName,
} from '../util.js'
import {ATTR_GENERATION, READING_GUIDE_PATH} from '../branding.js'
import {parseDoi, vaiVe} from '../xungHo.js'
import './GrampsjsObjectPickerDialog.js'

/*
So vai hai người bất kỳ trong họ: chọn hai người, cho biết người này gọi người
kia là gì, cách nhau mấy đời. Dùng khi câu hỏi không phải "tôi với người này"
mà "cụ A với cụ B" (xem thêm khối "Xưng hô trong họ" trên hồ sơ, so với chính
mình). Vai tính theo đời, cùng logic ở xungHo.js.
*/

const summarize = object => ({
  grampsId: object.gramps_id,
  name: personProfileDisplayName(object.profile) || personDisplayName(object),
  doi: parseDoi(getAttributeValue(object, ATTR_GENERATION)),
  gender: object.gender,
})

export class GrampsjsSoVaiDialog extends GrampsjsAppStateMixin(LitElement) {
  static get properties() {
    return {
      _a: {state: true},
      _b: {state: true},
      _slot: {state: true},
    }
  }

  static get styles() {
    return css`
      md-dialog {
        max-width: min(520px, 95vw);
      }
      .pick {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        padding: 10px 0;
        border-bottom: 1px solid var(--md-sys-color-outline-variant);
      }
      .pick .who {
        font-size: 13px;
        color: var(--md-sys-color-on-surface-variant);
      }
      .pick .name {
        font-weight: 600;
        color: var(--md-sys-color-on-surface);
      }
      .result {
        margin-top: 14px;
        font: 400 15px/1.6 var(--grampsjs-body-font-family, sans-serif);
        color: var(--md-sys-color-on-surface);
      }
      .call {
        color: var(--md-sys-color-primary);
        font-weight: 600;
      }
      .note {
        margin-top: 8px;
        font-size: 13px;
        line-height: 1.6;
        color: var(--md-sys-color-on-surface-variant);
      }
      .note a {
        color: var(--md-sys-color-primary);
      }
    `
  }

  constructor() {
    super()
    this._a = null
    this._b = null
    this._slot = null
  }

  open() {
    this.renderRoot.querySelector('#so-vai-dialog')?.show()
  }

  // Chỉ mở một hộp một lúc: đóng hộp so vai rồi mở ô chọn người (ô chọn là hộp
  // riêng, không lồng trong hộp so vai, vì hai md-dialog lồng nhau chồng lớp
  // không ổn định). Chọn xong mở lại hộp so vai với lựa chọn mới.
  _pick(slot) {
    this._slot = slot
    this.renderRoot.querySelector('#so-vai-dialog')?.close()
    this.renderRoot.querySelector('grampsjs-object-picker-dialog')?.open('')
  }

  _onPick(event) {
    const object = event.detail?.object
    if (object && this._slot) {
      const person = summarize(object)
      if (this._slot === 'a') this._a = person
      else this._b = person
    }
    this._slot = null
    this.open()
  }

  _renderRow(slot, label) {
    const person = slot === 'a' ? this._a : this._b
    return html`<div class="pick">
      <span>
        <span class="who">${label}: </span>
        ${person
          ? html`<span class="name">${person.name}</span>${person.doi != null
                ? html` <span class="who">· Đời ${person.doi}</span>`
                : nothing}`
          : html`<span class="who">chưa chọn</span>`}
      </span>
      <md-text-button @click=${() => this._pick(slot)}>
        ${person ? 'Đổi' : 'Chọn'}
      </md-text-button>
    </div>`
  }

  _renderResult() {
    if (!this._a || !this._b) {
      return html`<p class="note">Chọn cả hai người để so vai.</p>`
    }
    const a = this._a
    const b = this._b
    const rel = vaiVe({
      doiSelf: a.doi,
      doiOther: b.doi,
      genderSelf: a.gender,
      genderOther: b.gender,
      sameHandle: a.grampsId === b.grampsId,
    })
    if (rel.kind === 'self') {
      return html`<p class="result">${a.name} và ${b.name} là một người.</p>`
    }
    if (rel.kind === 'unknown') {
      const who = a.doi == null ? a.name : b.name
      return html`<p class="result">
        Chưa tính được vai vì phả chưa chép đời cho ${who}.
      </p>`
    }
    if (rel.direction === 'same') {
      return html`<p class="result">
          ${a.name} và ${b.name} ngang vai — hàng
          <span class="call">anh, chị hoặc em</span> trong họ.
        </p>
        ${this._renderNote(rel)}`
    }
    const bac = rel.direction === 'up' ? 'trên' : 'dưới'
    return html`<p class="result">
        ${b.name} thuộc bậc ${bac} ${a.name} ${rel.level} đời. ${a.name} gọi
        ${b.name} là <span class="call">${rel.youCall}</span>; ${b.name} gọi
        ${a.name} là <span class="call">${rel.theyCall}</span>.
      </p>
      ${this._renderNote(rel)}`
  }

  // eslint-disable-next-line class-methods-use-this
  _renderNote(rel) {
    const uncertain = rel.uncertain
      ? rel.direction === 'same'
        ? 'Phả chưa chép thứ tự sinh nên chưa phân được anh với em; chỉ tính vai theo đời. '
        : 'Phả chưa chép thứ tự sinh nên chưa phân được bác với chú; chỉ tính vai theo đời. '
      : ''
    return html`<p class="note">
      ${uncertain}Vai tính theo đời trong họ, không kể tuổi.
      <a href="${READING_GUIDE_PATH}">Cách đọc gia phả</a>
    </p>`
  }

  render() {
    return html`<md-dialog id="so-vai-dialog">
        <div slot="headline">So vai hai người</div>
        <div slot="content">
          ${this._renderRow('a', 'Người thứ nhất')}
          ${this._renderRow('b', 'Người thứ hai')} ${this._renderResult()}
        </div>
        <div slot="actions">
          <md-text-button
            @click=${() =>
              this.renderRoot.querySelector('#so-vai-dialog')?.close()}
            >Đóng</md-text-button
          >
        </div>
      </md-dialog>
      <grampsjs-object-picker-dialog
        objectType="person"
        nameSearch
        .appState=${this.appState}
        @select-object:selected=${this._onPick}
      ></grampsjs-object-picker-dialog>`
  }
}

window.customElements.define('grampsjs-so-vai-dialog', GrampsjsSoVaiDialog)
