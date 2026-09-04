import {html, css} from 'lit'
import {zoomTransform} from 'd3-zoom'

import '@material/mwc-menu'
import '@material/mwc-list/mwc-list-item'

import {TreeChart} from '../charts/TreeChart.js'
import {GrampsjsChartBase} from './GrampsjsChartBase.js'
import {
  chartTopInset,
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

        /* Nút "Xem hậu duệ" ở góc trên phải thẻ người có con cháu. */
        svg .card-action-bg {
          fill: color-mix(
            in srgb,
            var(--heritage-gold) 8%,
            var(--md-sys-color-surface)
          );
          stroke: var(--heritage-gold);
          stroke-width: 1.5px;
          vector-effect: non-scaling-stroke;
          filter: drop-shadow(0 1px 2px var(--grampsjs-body-font-color-30));
          transition: fill 140ms;
        }

        svg .card-action-icon {
          fill: var(--md-sys-color-primary);
        }

        svg .card-action:hover .card-action-bg {
          fill: color-mix(
            in srgb,
            var(--heritage-gold) 30%,
            var(--md-sys-color-surface)
          );
        }

        svg .person-card {
          stroke: var(--heritage-rule);
          stroke-width: 1.25px;
          vector-effect: non-scaling-stroke;
          filter: drop-shadow(0 2px 2px var(--grampsjs-body-font-color-20));
          transition: fill 140ms, stroke 140ms, filter 140ms;
        }

        svg .tree-link {
          stroke: color-mix(
            in srgb,
            var(--heritage-gold) 58%,
            var(--heritage-wood)
          );
          stroke-opacity: 0.72;
        }

        svg .person-living .person-card {
          fill: transparent;
          stroke: transparent;
          filter: none;
        }

        svg .person-deceased {
          --person-card-text: #fff8e9;
          --person-card-muted-text: #e2cda7;
        }

        svg .person-deceased .person-card {
          fill: color-mix(in srgb, var(--heritage-wood) 88%, #6d2d22);
          stroke: var(--heritage-gold);
          stroke-width: 1.5px;
          filter: drop-shadow(0 4px 5px var(--grampsjs-body-font-color-30));
        }

        svg a:hover .person-card,
        svg a:focus-visible .person-card {
          stroke: var(--md-sys-color-primary);
          filter: drop-shadow(0 4px 5px var(--grampsjs-body-font-color-30));
        }

        svg a.person-living:hover .person-card,
        svg a.person-living:focus-visible .person-card {
          fill: transparent;
          stroke: transparent;
          filter: none;
        }

        svg a.person-living:hover .nameplate-body,
        svg a.person-living:focus-visible .nameplate-body {
          fill: color-mix(
            in srgb,
            var(--heritage-gold) 20%,
            var(--md-sys-color-surface)
          );
          stroke: var(--md-sys-color-primary);
        }

        svg a.person-deceased:hover .person-card,
        svg a.person-deceased:focus-visible .person-card {
          fill: color-mix(in srgb, var(--heritage-wood) 76%, #8a4833);
        }

        svg .tree-link,
        svg .memorial-inset,
        svg .memorial-base,
        svg .memorial-crest,
        svg .nameplate-body,
        svg .living-avatar-halo,
        svg .living-avatar-icon,
        svg .memorial-portrait * {
          vector-effect: non-scaling-stroke;
        }

        svg .nameplate-body {
          fill: color-mix(
            in srgb,
            var(--heritage-gold) 13%,
            var(--md-sys-color-surface)
          );
          stroke: color-mix(
            in srgb,
            var(--heritage-gold) 58%,
            var(--heritage-rule)
          );
          stroke-width: 1px;
          filter: drop-shadow(0 2px 3px var(--grampsjs-body-font-color-15));
          transition: fill 140ms, stroke 140ms;
        }

        svg .living-avatar-halo {
          fill: color-mix(
            in srgb,
            var(--heritage-gold) 26%,
            var(--md-sys-color-surface)
          );
          stroke: var(--heritage-gold);
          stroke-width: 1.25px;
          filter: drop-shadow(0 2px 3px var(--grampsjs-body-font-color-15));
        }

        svg .living-avatar-icon {
          fill: var(--heritage-ink);
          opacity: 0.78;
        }

        svg .living-avatar-photo {
          stroke: color-mix(
            in srgb,
            var(--md-sys-color-surface) 88%,
            var(--heritage-gold)
          );
          stroke-width: 2px;
          vector-effect: non-scaling-stroke;
          filter: drop-shadow(0 2px 3px var(--grampsjs-body-font-color-15));
        }

        svg .memorial-inset {
          fill: none;
          stroke: color-mix(in srgb, var(--heritage-gold) 72%, transparent);
          stroke-width: 1px;
        }

        svg .memorial-base {
          fill: none;
          stroke: var(--heritage-gold);
          stroke-width: 1.5px;
        }

        svg .memorial-crest {
          fill: none;
          stroke: color-mix(in srgb, var(--heritage-gold) 76%, transparent);
          stroke-width: 1px;
          stroke-linecap: round;
          stroke-linejoin: round;
        }

        svg .memorial-portrait-bg {
          fill: color-mix(
            in srgb,
            var(--heritage-gold) 16%,
            var(--heritage-wood)
          );
          stroke: var(--heritage-gold);
          stroke-width: 1.25px;
        }

        svg .memorial-portrait-icon {
          fill: #f1dfbd;
          opacity: 0.96;
        }

        .tree-root .person-card {
          stroke: var(--heritage-gold);
          stroke-width: 2.5px;
          vector-effect: non-scaling-stroke;
          filter: drop-shadow(0 4px 6px var(--grampsjs-body-font-color-30));
        }

        .tree-root.person-living .person-card {
          stroke: transparent;
          filter: none;
        }

        .tree-root.person-living .nameplate-body {
          stroke: var(--heritage-gold);
          stroke-width: 2px;
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
      // Chừa thêm chỗ cho ô chọn phạm vi nổi ở góc trên trái trên điện thoại.
      const rootMargin = (60 + chartTopInset(width)) / minScale
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
