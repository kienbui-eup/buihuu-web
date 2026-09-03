import {html, css} from 'lit'
import {classMap} from 'lit/directives/class-map.js'
import {mdiInformation} from '@mdi/js'

import {GrampsjsEditableList} from './GrampsjsEditableList.js'
import './GrampsjsFormEditAttribute.js'
import './GrampsjsIcon.js'

import {fireEvent, linkUrls} from '../util.js'
import {
  ATTR_CONFIDENCE,
  ATTR_SENIOR_LINE,
  PERSON_HEADING_ATTRIBUTES,
} from '../branding.js'

/*
Giá trị "Độ tin cậy" của pipeline là mã ba mức; người trong họ cần biết mã ấy
nói gì về việc nối người này với cha.
*/
const CONFIDENCE_VALUES = {
  gốc: 'thủy tổ, không có đời trước',
  cao: 'phả ghi rõ cha',
  vừa: 'cha suy từ vị trí trong sổ',
}

const CONFIDENCE_LABEL = 'Căn cứ nối cha'

// Mã dòng trưởng "N2C1" của bảng hệ thống → "Ngành 2 - Chi 1", cùng chữ với thẻ.
const SENIOR_LINE_CODE = /^N(\d+)C(\d+)$/i

export class GrampsjsAttributes extends GrampsjsEditableList {
  static get styles() {
    return [
      super.styles,
      css`
        md-list-item {
          cursor: default;
        }

        md-list.activatable md-list-item {
          cursor: pointer;
        }
      `,
    ]
  }

  static get properties() {
    return {
      attributeCategory: {type: String},
    }
  }

  constructor() {
    super()
    this.attributeCategory = ''
  }

  get _isPerson() {
    return this.attributeCategory === 'people'
  }

  /*
  Khi chỉ xem hồ sơ người, bỏ hai thuộc tính đã in ở đầu trang (Đời, Ngày
  giỗ). Lúc sửa thì hiện đủ, vì nút sửa/xoá đi theo chỉ số trong data.
  */
  sortData(dataCopy) {
    if (this.edit || !this._isPerson) {
      return dataCopy
    }
    return dataCopy.filter(
      attr => !PERSON_HEADING_ATTRIBUTES.includes((attr.type || '').trim())
    )
  }

  /*
  Nhãn và giá trị để in. Trên hồ sơ người, mã của pipeline được viết lại thành
  chữ ("cao" → "phả ghi rõ cha", "N2C1" → "Ngành 2 - Chi 1"); lúc sửa thì giữ
  nguyên giá trị thật để người sửa thấy đúng thứ đang lưu.
  */
  _describe(obj) {
    const type = (obj.type || '').trim()
    const raw = obj.value ?? ''
    if (this.edit || !this._isPerson) {
      return {label: this._(type), value: raw}
    }
    if (type === ATTR_CONFIDENCE) {
      return {
        label: CONFIDENCE_LABEL,
        value: CONFIDENCE_VALUES[raw.trim().toLowerCase()] || raw,
      }
    }
    if (type === ATTR_SENIOR_LINE) {
      return {
        label: this._(type),
        value: raw.trim().replace(SENIOR_LINE_CODE, 'Ngành $1 - Chi $2'),
      }
    }
    return {label: this._(type), value: raw}
  }

  row(obj, i) {
    const {label, value} = this._describe(obj)
    const shown = value.length > 200 ? `${value.slice(0, 200)}…` : value
    // Tên thuộc tính trước, giá trị sau ("Căn cứ nối cha: phả ghi rõ cha"),
    // vì "cao / Độ tin cậy" đọc ngược không ra câu.
    return html`
      <md-list-item
        type="${this.edit ? 'button' : 'text'}"
        class="${classMap({selected: i === this._selectedIndex})}"
        @click="${() => {
          if (this.edit) {
            this._handleSelected(i)
          }
        }}"
      >
        ${label}: ${this.edit ? shown : linkUrls(shown, false)}
        <grampsjs-icon
          slot="start"
          path="${mdiInformation}"
          color="var(--grampsjs-color-icon)"
        ></grampsjs-icon>
      </md-list-item>
    `
  }

  _handleAdd() {
    this.dialogContent = html`
      <grampsjs-form-edit-attribute
        new
        attributeCategory="${this.attributeCategory}"
        @object:save="${this._handleAttrSave}"
        @object:cancel="${this._handleAttrCancel}"
        .appState="${this.appState}"
      >
      </grampsjs-form-edit-attribute>
    `
  }

  _handleEdit() {
    const attr = this.data[this._selectedIndex]
    const data = {
      type: attr.type || '',
      value: attr.value || '',
    }
    this.dialogContent = html`
      <grampsjs-form-edit-attribute
        attributeCategory="${this.attributeCategory}"
        @object:save="${this._handleAttrSaveEdit}"
        @object:cancel="${this._handleAttrCancel}"
        .appState="${this.appState}"
        .data="${data}"
      >
      </grampsjs-form-edit-attribute>
    `
  }

  _handleDelete() {
    fireEvent(this, 'edit:action', {
      action: 'delAttr',
      index: this._selectedIndex,
    })
  }

  _handleAttrSave(e) {
    fireEvent(this, 'edit:action', {
      action: 'addAttribute',
      data: e.detail.data,
    })
    e.preventDefault()
    e.stopPropagation()
    this.dialogContent = ''
  }

  _handleAttrSaveEdit(e) {
    fireEvent(this, 'edit:action', {
      action: 'updateAttribute',
      data: e.detail.data,
      index: this._selectedIndex,
    })
    e.preventDefault()
    e.stopPropagation()
    this.dialogContent = ''
  }

  _handleAttrCancel() {
    this.dialogContent = ''
  }
}

window.customElements.define('grampsjs-attributes', GrampsjsAttributes)
