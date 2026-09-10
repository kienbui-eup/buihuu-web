import {LitElement, css, html, nothing} from 'lit'
import '@material/web/button/outlined-button'
import '@material/web/button/text-button'

import {GrampsjsAppStateMixin} from '../mixins/GrampsjsAppStateMixin.js'
import {heritageFrameStyles} from '../HeritageStyles.js'
import {
  getAttributeValue,
  personDisplayName,
  personProfileDisplayName,
} from '../util.js'
import {ATTR_GENERATION, READING_GUIDE_PATH} from '../branding.js'
import {parseDoi, vaiVe} from '../xungHo.js'
import './GrampsjsObjectPickerDialog.js'
import './GrampsjsSoVaiDialog.js'

/*
Khối "Xưng hô trong họ" trên hồ sơ người: bạn chọn một lần "bạn là ai trong
họ" (người mốc), trang nhớ trong trình duyệt, rồi mỗi hồ sơ hiện luôn bạn gọi
người này là gì, người này gọi bạn là gì. Vai tính theo đời (xem xungHo.js).

Người mốc lưu trong localStorage của từng máy, không gửi đi đâu: tài khoản xem
bằng mã dòng họ là chung cả họ, nên không thể lưu theo tài khoản. Đọc/ghi bọc
try/catch vì cửa sổ ẩn danh có thể chặn.
*/

const STORE_KEY = 'buihuu-xung-ho-me'

export class GrampsjsXungHo extends GrampsjsAppStateMixin(LitElement) {
  static get properties() {
    return {
      person: {type: Object},
      _anchor: {state: true},
    }
  }

  static get styles() {
    return [
      heritageFrameStyles,
      css`
        :host {
          display: block;
          margin-top: 16px;
        }
        section {
          padding: 16px 18px;
        }
        .section-label {
          margin: 0 0 6px;
        }
        p {
          margin: 6px 0 0;
          font: 400 15px/1.6 var(--grampsjs-body-font-family, sans-serif);
          color: var(--md-sys-color-on-surface);
        }
        p.prompt {
          color: var(--md-sys-color-on-surface-variant);
        }
        .call {
          color: var(--md-sys-color-primary);
          font-weight: 600;
        }
        .anchor {
          display: flex;
          align-items: baseline;
          flex-wrap: wrap;
          gap: 4px 10px;
          margin: 2px 0 6px;
          font-size: 13px;
          color: var(--md-sys-color-on-surface-variant);
        }
        .anchor strong {
          color: var(--heritage-ink, var(--md-sys-color-on-surface));
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
        .actions {
          margin-top: 10px;
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }
        md-text-button,
        md-outlined-button {
          --md-sys-color-primary: var(--md-sys-color-primary);
        }
      `,
    ]
  }

  constructor() {
    super()
    this.person = null
    this._anchor = this._load()
  }

  // eslint-disable-next-line class-methods-use-this
  _load() {
    try {
      const raw = window.localStorage.getItem(STORE_KEY)
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  }

  _save(anchor) {
    this._anchor = anchor
    try {
      if (anchor) window.localStorage.setItem(STORE_KEY, JSON.stringify(anchor))
      else window.localStorage.removeItem(STORE_KEY)
    } catch {
      // Cửa sổ ẩn danh chặn ghi: vẫn giữ trong bộ nhớ phiên này.
    }
  }

  _openPicker() {
    this.renderRoot.querySelector('grampsjs-object-picker-dialog')?.open('')
  }

  _openSoVai() {
    this.renderRoot.querySelector('grampsjs-so-vai-dialog')?.open()
  }

  _onPick(event) {
    const object = event.detail?.object
    if (!object) return
    this._save({
      grampsId: object.gramps_id,
      name:
        personProfileDisplayName(object.profile) || personDisplayName(object),
      doi: parseDoi(getAttributeValue(object, ATTR_GENERATION)),
      gender: object.gender,
    })
  }

  _clear() {
    this._save(null)
  }

  _renderPicker() {
    return html`<grampsjs-object-picker-dialog
      objectType="person"
      nameSearch
      .appState=${this.appState}
      @select-object:selected=${this._onPick}
    ></grampsjs-object-picker-dialog>`
  }

  _renderRelation() {
    const doiOther = parseDoi(getAttributeValue(this.person, ATTR_GENERATION))
    const rel = vaiVe({
      doiSelf: this._anchor.doi,
      doiOther,
      genderSelf: this._anchor.gender,
      genderOther: this.person.gender,
      sameHandle: this._anchor.grampsId === this.person.gramps_id,
    })
    const name = this._displayName()

    if (rel.kind === 'self') {
      return html`<p>Đây là bạn — người bạn đã chọn làm mốc.</p>`
    }
    if (rel.kind === 'unknown') {
      const who = this._anchor.doi == null ? `bạn (${this._anchor.name})` : name
      return html`<p class="prompt">
        Chưa tính được vai vì phả chưa chép đời cho ${who}.
      </p>`
    }
    if (rel.direction === 'same') {
      return html`<p>
          Ngang vai với bạn — hàng
          <span class="call">anh, chị hoặc em</span> trong họ.
        </p>
        ${this._renderNote(rel)}`
    }
    const bac = rel.direction === 'up' ? 'trên' : 'dưới'
    return html`<p>
        ${name} thuộc bậc ${bac} bạn ${rel.level} đời. Bạn gọi ${name} là
        <span class="call">${rel.youCall}</span>; ${name} gọi bạn là
        <span class="call">${rel.theyCall}</span>.
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

  // Cùng hàng với nút chọn hoặc đổi người mốc, để khối gọn một hàng nút.
  _renderSoVaiButton() {
    return html`<md-text-button @click=${this._openSoVai}
      >So vai hai người khác</md-text-button
    >`
  }

  _displayName() {
    return (
      personProfileDisplayName(this.person?.profile) ||
      personDisplayName(this.person) ||
      'người này'
    )
  }

  render() {
    if (!this.person) return nothing
    return html`<section class="heritage-frame">
      <p class="section-label">Xưng hô trong họ</p>
      ${this._anchor
        ? html`
            <div class="anchor">
              <span
                >Người mốc: <strong>${this._anchor.name}</strong>${this._anchor
                  .doi != null
                  ? html` · Đời ${this._anchor.doi}`
                  : nothing}</span
              >
            </div>
            ${this._renderRelation()}
            <div class="actions">
              <md-text-button @click=${this._openPicker}
                >Đổi người mốc</md-text-button
              >
              <md-text-button @click=${this._clear}>Bỏ</md-text-button>
              ${this._renderSoVaiButton()}
            </div>
          `
        : html`
            <p class="prompt">
              Chọn bạn là ai trong họ, trang sẽ cho biết bạn gọi mỗi người là
              gì. Chỉ lưu trên máy này.
            </p>
            <div class="actions">
              <md-outlined-button @click=${this._openPicker}
                >Chọn người mốc</md-outlined-button
              >
              ${this._renderSoVaiButton()}
            </div>
          `}
      ${this._renderPicker()}
      <grampsjs-so-vai-dialog
        .appState=${this.appState}
      ></grampsjs-so-vai-dialog>
    </section>`
  }
}

window.customElements.define('grampsjs-xung-ho', GrampsjsXungHo)
