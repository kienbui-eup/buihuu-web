/*
Quan hệ giữa người đang xem và người gốc của cây.

Gramps không có bộ tính quan hệ tiếng Việt: /api/relations trả "eighth great
grandson" dù đã gửi locale=vi, con cháu trong họ không đọc được. Khi người gốc
là thuỷ tổ (mặc định của bản này) thì câu trả lời đã nằm sẵn trong thuộc tính
Đời: đời thứ n tức là cách thuỷ tổ n-1 đời, nên viết thẳng câu tiếng Việt và
không gọi máy chủ. Khi người dùng tự đặt người gốc khác thì vẫn hỏi máy chủ,
nhưng chuỗi không có chữ tiếng Việt thì ẩn đi thay vì in tiếng Anh.

`label` là nhãn của dòng ("Quan hệ với thủy tổ"); có nhãn thì thành phần tự
dựng cặp <dt>/<dd> và chỉ dựng khi có nội dung, để không còn nhãn đứng trơ
trên một ô trống.
*/

import {html} from 'lit'
import {GrampsjsConnectedComponent} from './GrampsjsConnectedComponent.js'
import {DEFAULT_HOME_PERSON, DEFAULT_LANGUAGE} from '../branding.js'

// Chữ cái có dấu của tiếng Việt (Latin-1 bổ sung, Latin mở rộng A và
// Latin mở rộng bổ sung), đủ để nhận ra một câu quan hệ đã được dịch.
const VIETNAMESE_LETTERS = /[À-ɏẠ-ỹ]/u

export class GrampsjsPersonRelationship extends GrampsjsConnectedComponent {
  static get properties() {
    return {
      person1: {type: String},
      person2: {type: String},
      homeGrampsId: {type: String},
      generation: {type: String},
      label: {type: String},
    }
  }

  constructor() {
    super()
    this.person1 = ''
    this.person2 = ''
    this.homeGrampsId = ''
    this.generation = ''
    this.label = ''
  }

  get _homeIsFounder() {
    return this.homeGrampsId === DEFAULT_HOME_PERSON
  }

  getUrl() {
    if (!this.person1 || !this.person2 || this._homeIsFounder) {
      return ''
    }
    return `/api/relations/${this.person1}/${this.person2}?depth=20&locale=${
      this.appState.i18n.lang || DEFAULT_LANGUAGE
    }`
  }

  render() {
    if (this._homeIsFounder) {
      return this._wrap(this._founderRelation())
    }
    if (this.error && !this.renderOnError) {
      return ''
    }
    if (this.loading) {
      return this._wrap(this.renderLoading())
    }
    return this._wrap(this.renderContent())
  }

  _wrap(content) {
    if (!this.label) {
      return content
    }
    if (!content) {
      return ''
    }
    return html`<dl>
      <dt>${this.label}</dt>
      <dd>${content}</dd>
    </dl>`
  }

  _founderRelation() {
    if (this.person1 === this.person2) {
      return ''
    }
    const n = parseInt(this.generation, 10)
    if (!Number.isFinite(n) || n <= 1) {
      return ''
    }
    return `Hậu duệ đời thứ ${n} của thủy tổ (cách ${n - 1} đời)`
  }

  // eslint-disable-next-line class-methods-use-this
  renderLoading() {
    return html`<span class="skeleton" style="width:7em;">&nbsp;</span>`
  }

  renderContent() {
    const relation = this._data?.data?.relationship_string
    if (this.person1 === this.person2) {
      return html`${this._('self')}`
    }
    if (relation === undefined) {
      return ''
    }
    if (relation === '') {
      return html`${this._('Not Related')}`
    }
    if (!VIETNAMESE_LETTERS.test(relation)) {
      return ''
    }
    return html`${relation}`
  }
}

window.customElements.define(
  'grampsjs-person-relationship',
  GrampsjsPersonRelationship
)
