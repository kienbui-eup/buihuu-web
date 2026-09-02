import {LitElement, html, css} from 'lit'

// Dấu chữ thuần Việt, dựng tại chỗ, không tải hình hay phông từ dịch vụ khác.
class GrampsjsHeritageMark extends LitElement {
  static styles = css`
    :host {
      display: inline-block;
      color: var(--md-sys-color-primary);
    }
    span {
      display: grid;
      place-content: center;
      width: 58px;
      height: 64px;
      box-sizing: border-box;
      border: 3px double currentColor;
      border-radius: 1px;
      font: 600 17px/1.4 'Noto Serif', 'Times New Roman', serif;
      letter-spacing: 0.04em;
      text-align: center;
    }
  `

  render() {
    return html`<span aria-hidden="true">BÙI<br />HỮU</span>`
  }
}

window.customElements.define('grampsjs-heritage-mark', GrampsjsHeritageMark)
