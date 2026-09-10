import {html} from 'lit'

import {GrampsjsView} from './GrampsjsView.js'
import '../components/GrampsjsNotFound.js'

/*
Trang hiện khi đường dẫn không khớp mục nào (GrampsjsPages quyết định). Đường
dẫn in lại lấy từ trạng thái ứng dụng, không từ window.location, để lúc chuyển
trang không in nhầm đường dẫn cũ.
*/
export class GrampsjsViewNotFound extends GrampsjsView {
  get _path() {
    const {page, pageId, pageId2} = this.appState?.path ?? {}
    return `/${[page, pageId, pageId2].filter(Boolean).join('/')}`
  }

  renderContent() {
    return html`<grampsjs-not-found
      .appState=${this.appState}
      heading="Không có trang này"
      detail="Trang phả hệ không có mục nào ở địa chỉ này. Có thể liên kết đã cũ, hoặc gõ nhầm một chữ."
      path="${this._path}"
    ></grampsjs-not-found>`
  }
}

window.customElements.define('grampsjs-view-not-found', GrampsjsViewNotFound)
