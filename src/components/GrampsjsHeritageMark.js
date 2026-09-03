import {LitElement, html, css} from 'lit'

// Ấn son Bùi Hữu dùng tài nguyên nội bộ, có bản 2x cho màn hình điện thoại.
class GrampsjsHeritageMark extends LitElement {
  static styles = css`
    :host {
      display: inline-block;
      line-height: 0;
    }
    img {
      display: block;
      width: var(--grampsjs-mark-size, 64px);
      height: var(--grampsjs-mark-size, 64px);
      object-fit: contain;
    }
  `

  render() {
    return html`<img
      src="images/logo-bui-huu.png"
      width="64"
      height="64"
      alt=""
      aria-hidden="true"
    />`
  }
}

window.customElements.define('grampsjs-heritage-mark', GrampsjsHeritageMark)
