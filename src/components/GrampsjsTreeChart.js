import {html, css} from 'lit'
import {zoomTransform} from 'd3-zoom'

import '@material/mwc-menu'
import '@material/mwc-list/mwc-list-item'

import {TreeChart} from '../charts/TreeChart.js'
import {GrampsjsChartBase} from './GrampsjsChartBase.js'
import {
  getDescendantTree,
  getPersonByGrampsId,
  getTree,
  getImageUrl,
  rescaleViewBox,
} from '../charts/util.js'
import {fireEvent, clickKeyHandler} from '../util.js'

export class GrampsjsTreeChart extends GrampsjsChartBase {
  static get styles() {
    return [
      super.styles,
      css`
        svg a {
          text-decoration: none !important;
        }

        .tree-root .person-card {
          fill: color-mix(
            in srgb,
            var(--md-sys-color-primary) 6%,
            var(--md-sys-color-surface)
          );
          stroke: var(--md-sys-color-primary);
          stroke-width: 2px;
          vector-effect: non-scaling-stroke;
        }

        mwc-menu {
          --mdc-typography-subtitle1-font-size: 13px;
          --mdc-menu-item-height: 36px;
        }
      `,
    ]
  }

  static get properties() {
    return {
      grampsId: {type: String},
      nAnc: {type: Number},
      nDesc: {type: Number},
      ancestors: {type: Boolean},
      descendants: {type: Boolean},
      gapX: {type: Number},
      nameDisplayFormat: {type: String},
      canEdit: {type: Boolean},
    }
  }

  constructor() {
    super()
    this.grampsId = ''
    this.nAnc = 5
    this.nDesc = 5
    this.gapX = 24
    this._savedZoom = null
    this._savedViewBox = null
    this._focusPending = false
    this._focused = false
  }

  render() {
    return html`
      <div
        @pedigree:show-children="${this._handleShowChildren}"
        style="position:relative;"
      >
        <div id="container">${this.renderChart()}</div>
        ${this.renderChildrenMenu()}
      </div>
    `
  }

  willUpdate(changed) {
    if (changed.has('grampsId') && changed.get('grampsId')) {
      this._focusPending = true
    }
    // A different person needs a fresh viewport. Preserve both parts of the
    // viewport on other updates: a zoom transform alone uses the wrong origin.
    const svg = this.renderRoot
      ?.getElementById('container')
      ?.querySelector('svg')
    this._savedZoom = !this._focusPending && svg ? zoomTransform(svg) : null
    this._savedViewBox = !this._focusPending
      ? svg?.getAttribute('viewBox')
      : null
    if (
      this._savedViewBox &&
      (changed.has('containerWidth') || changed.has('containerHeight'))
    ) {
      // Xoay điện thoại hay mở menu bên: giữ tâm và tỷ lệ, đổi khung theo
      // kích cỡ mới thay vì để SVG co giãn theo khung cũ.
      this._savedViewBox = rescaleViewBox(
        this._savedViewBox,
        changed.get('containerWidth') ?? this.containerWidth,
        changed.get('containerHeight') ?? this.containerHeight,
        this.containerWidth,
        this.containerHeight
      )
    }
  }

  updated() {
    this._updateMenuAnchor()
    this._fitChartToViewport()
  }

  focusPerson() {
    this._focusPending = true
    this.requestUpdate()
  }

  // Đo phần đã vẽ để căn khung. Điện thoại giữ cỡ chữ đọc được và neo vào
  // người gốc; các nhánh rộng có thể xem bằng cách vuốt hoặc thu/phóng.
  // Khi người xem đã kéo cây hay tìm một người, giữ nguyên khung nhìn đó.
  _fitChartToViewport() {
    const zoomed =
      this._savedZoom &&
      (this._savedZoom.k !== 1 ||
        this._savedZoom.x !== 0 ||
        this._savedZoom.y !== 0)
    const svg = this.renderRoot
      ?.getElementById('container')
      ?.querySelector('svg')
    const content = svg?.querySelector('#chart-content')
    if (!content) {
      return
    }
    const width = this.containerWidth
    const height = this.containerHeight
    if (width <= 0 || height <= 0) {
      return
    }
    if (this._focusPending) {
      const card =
        svg.querySelector('.tree-selected .person-card') ||
        svg.querySelector('.tree-root .person-card')
      const matrix = svg.getScreenCTM()
      if (!card || !matrix) {
        return
      }
      const box = card.getBoundingClientRect()
      const center = svg.createSVGPoint()
      center.x = box.x + box.width / 2
      center.y = box.y + box.height / 2
      const point = center.matrixTransform(matrix.inverse())
      // One SVG unit per screen pixel keeps the selected person's name legible,
      // including when the full tree spans many generations.
      svg.setAttribute(
        'viewBox',
        `${point.x - width / 2} ${point.y - height / 2} ${width} ${height}`
      )
      this._focusPending = false
      this._focused = true
      return
    }
    if (zoomed || (this._focused && this._savedViewBox)) {
      return
    }
    let box
    try {
      box = content.getBBox()
    } catch (error) {
      return
    }
    if (!box?.width || !box?.height || !width || !height) {
      return
    }
    const margin = 24
    const fit = Math.min(
      1,
      width / (box.width + 2 * margin),
      height / (box.height + 2 * margin)
    )
    // Không thu nhỏ quá mức đọc được: 85% trên điện thoại, 70% trên máy tính.
    // Cây 17 đời ép vừa khung 900 px thì ô người cao 20 px, chữ 5 px, nhìn ra
    // hình dáng cây nhưng không đọc được tên ai. Nút Vừa khung vẫn còn đó cho
    // ai muốn xem toàn cảnh.
    const minScale = width <= 600 ? 0.85 : 0.7
    if (fit < minScale) {
      const viewWidth = width / minScale
      const viewHeight = height / minScale
      const rootMargin = 60 / minScale
      let y = -viewHeight / 2
      if (!this.ancestors) {
        y = -rootMargin
      } else if (!this.descendants) {
        y = rootMargin - viewHeight
      }
      svg.setAttribute(
        'viewBox',
        `${-viewWidth / 2} ${y} ${viewWidth} ${viewHeight}`
      )
      return
    }
    const viewWidth = width / fit
    const viewHeight = height / fit
    const x = box.x + box.width / 2 - viewWidth / 2
    const y =
      this.descendants && !this.ancestors
        ? box.y - margin / fit
        : box.y + box.height / 2 - viewHeight / 2
    svg.setAttribute('viewBox', `${x} ${y} ${viewWidth} ${viewHeight}`)
  }

  renderChart() {
    if (this.data.length === 0 || !this.grampsId) {
      return ''
    }
    const {handle} = getPersonByGrampsId(this.data, this.grampsId)
    if (!handle) {
      return ''
    }
    const dataDescendants = this.descendants
      ? getDescendantTree(this.data, handle, this.nDesc)
      : false
    const dataAncestors = this.ancestors
      ? getTree(this.data, handle, this.nAnc, false)
      : false
    let childrenTriangle = false
    if (this.descendants && this.ancestors) {
      childrenTriangle = false
    } else if (this.descendants) {
      childrenTriangle = this._hasParents()
    } else {
      childrenTriangle = this._hasChildren()
    }
    return html`
      ${TreeChart(dataDescendants, dataAncestors, {
        nAnc: this.nAnc,
        nDesc: this.nDesc,
        childrenTriangle,
        getImageUrl: d => getImageUrl(d?.data?.person || {}, 100),
        gapX: this.gapX,
        bboxWidth: this.containerWidth,
        bboxHeight: this.containerHeight,
        nameDisplayFormat: this.nameDisplayFormat,
        canEdit: this.canEdit,
        initialZoom: this._savedZoom,
        initialViewBox: this._savedViewBox,
      })}
    `
  }

  _hasChildren() {
    const {handle} = getPersonByGrampsId(this.data, this.grampsId)
    const data = getDescendantTree(this.data, handle, 2)
    if (data.children && data.children.length) {
      return true
    }
    return false
  }

  _hasParents() {
    const {handle} = getPersonByGrampsId(this.data, this.grampsId)
    const data = getTree(this.data, handle, 2, false)
    if (data.children && data.children.length) {
      return true
    }
    return false
  }

  renderChildrenMenu() {
    const {handle} = getPersonByGrampsId(this.data, this.grampsId)
    const data = this.descendants
      ? getTree(this.data, handle, 2, false)
      : getDescendantTree(this.data, handle, 2)
    const {children} = data
    if (!children || !children.length) {
      return ''
    }
    return html`
      <mwc-menu fixed corner="BOTTOM_LEFT" menuCorner="START">
        ${children.map(
          child =>
            html`
              <mwc-list-item
                @click=${() => this._handleChild(child.person.gramps_id)}
                @keydown=${clickKeyHandler}
                >${child.name_given || html`&hellip;`}</mwc-list-item
              >
            `
        )}
      </mwc-menu>
    `
  }

  _handleChild(grampsId) {
    fireEvent(this, 'pedigree:person-selected', {grampsId})
    this._closeMenu()
  }

  _handleShowChildren() {
    const triangle = this.renderRoot.querySelector('#triangle-children')
    if (triangle !== null) {
      this._openMenu()
    }
  }

  _openMenu() {
    const menu = this.renderRoot.querySelector('mwc-menu')
    if (menu !== null) {
      menu.open = true
    }
  }

  _closeMenu() {
    const menu = this.renderRoot.querySelector('mwc-menu')
    if (menu !== null) {
      menu.open = false
    }
  }

  _updateMenuAnchor() {
    const menu = this.renderRoot.querySelector('mwc-menu')
    const triangle = this.renderRoot.querySelector('#triangle-children')
    if (menu !== null && triangle !== null) {
      menu.anchor = triangle
    }
  }
}

window.customElements.define('grampsjs-tree-chart', GrampsjsTreeChart)
