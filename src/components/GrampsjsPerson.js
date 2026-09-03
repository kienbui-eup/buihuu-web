import {html, css} from 'lit'
import '@material/web/button/outlined-button'
import '@material/web/chips/chip-set'
import '@material/web/chips/filter-chip'
import '@material/web/dialog/dialog'
import '@material/web/button/text-button'
import {
  mdiFamilyTree,
  mdiDna,
  mdiSearchWeb,
  mdiTimelineOutline,
  mdiMap,
  mdiQrcode,
} from '@mdi/js'
import {generate} from 'lean-qr'
import {toSvgDataURL} from 'lean-qr/extras/svg'
import {GrampsjsObject} from './GrampsjsObject.js'
import {heritageFrameStyles} from '../HeritageStyles.js'
import {getCourtesyName, getLineage} from '../charts/util.js'
import {
  ATTR_DEATH_ANNIVERSARY,
  ATTR_GENERATION,
  DEFAULT_HOME_PERSON,
  PERSON_HEADING_ATTRIBUTES,
  READING_GUIDE_PATH,
  TAG_HINTS,
} from '../branding.js'
import './GrampsjsImg.js'
import './GrampsjsEditGender.js'
import './GrampsjsPersonRelationship.js'
import './GrampsjsFormExternalSearch.js'
import {
  fireEvent,
  objectIconPath,
  personProfileDisplayName,
  getAttributeValue,
} from '../util.js'

export class GrampsjsPerson extends GrampsjsObject {
  static get styles() {
    return [
      super.styles,
      heritageFrameStyles,
      css`
        .person-heading h2 {
          margin: 0 0 8px;
          color: var(--md-sys-color-primary);
          line-height: 1.4;
        }
        .courtesy {
          font: 400 16px/1.7 var(--grampsjs-body-font-family);
          color: var(--md-sys-color-on-surface-variant);
          margin: 4px 0 12px;
        }
        .lineage {
          font-size: 14px;
          color: var(--md-sys-color-on-surface-variant);
          margin: 8px 0;
        }
        .memorial {
          margin: 16px 0 4px;
          border-top: 1px solid var(--md-sys-color-outline-variant);
          padding-top: 12px;
          color: var(--md-sys-color-primary);
        }
        .memorial.missing {
          font-size: 14px;
          color: var(--md-sys-color-on-surface-variant);
        }
        /* Chú thích thẻ: chữ nhỏ, nhạt, ngay dưới dãy thẻ */
        .tag-hints {
          margin: 0 0 12px;
          font-size: 13px;
          line-height: 1.6;
          color: var(--md-sys-color-on-surface-variant);
        }
        .tag-hints .tag-hint {
          display: block;
        }
        .tag-hints a {
          color: var(--md-sys-color-primary);
        }
        .person-tools {
          margin-top: 16px;
        }
        .person-tools summary {
          min-height: 44px;
          align-content: center;
          font-size: 14px;
          cursor: pointer;
          color: var(--md-sys-color-on-surface-variant);
        }
        .events-chips {
          margin-bottom: 16px;
        }

        .events-chips md-filter-chip {
          --md-sys-color-secondary-container: var(
            --md-sys-color-surface-variant
          );
          --md-sys-color-on-secondary-container: var(
            --md-sys-color-on-surface-variant
          );
        }

        #qr-dialog .qr {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.8em;
          text-align: center;
        }

        #qr-dialog img {
          width: 240px;
          height: 240px;
          max-width: 70vw;
          max-height: 70vw;
          background: #fff;
          border-radius: var(--grampsjs-frame-radius);
        }

        #qr-dialog .url {
          font-size: 0.8em;
          color: var(--grampsjs-body-font-color-70);
          word-break: break-all;
        }
      `,
    ]
  }

  static get properties() {
    return {
      homePersonDetails: {type: Object},
      timelineData: {type: Array},
      _showFamilyEvents: {type: Boolean},
      _showRelatedEvents: {type: Boolean},
      _qrDataUrl: {type: String},
    }
  }

  constructor() {
    super()
    this.homePersonDetails = {}
    this._objectsName = 'People'
    this._objectEndpoint = 'people'
    this._objectIcon = objectIconPath.person
    this._showReferences = false
    this.timelineData = []
    this._showFamilyEvents = false
    this._showRelatedEvents = false
    this._qrDataUrl = ''
  }

  renderProfileCard() {
    return html`
      <div class="person-heading profile-card heritage-frame">
        <p class="section-label">Hồ sơ gia phả</p>
        <div id="picture">${this.renderPicture()}</div>
        ${this.renderProfile()}
      </div>
      ${this.preview
        ? ''
        : html`<details class="person-tools">
            <summary>Xem trên cây, mã QR và các liên kết</summary>
            <p class="button-list">
              ${this._renderTreeBtn()} ${this._renderQrBtn()}
              ${this._hasDatedEvents() ? this._renderTimelineBtn() : ''}
              ${this._hasPlacedEvents() ? this._renderMapBtn() : ''}
              ${this._renderDnaBtn()}
            </p>
            ${this._renderRelation()}
          </details>`}
      ${this.preview ? '' : this._renderQrDialog()}
    `
  }

  renderProfile() {
    const courtesy = getCourtesyName(this.data)
    const lineage = getLineage(this.data)
    const memorial = getAttributeValue(this.data, ATTR_DEATH_ANNIVERSARY)
    return html`
      <h2>
        <grampsjs-edit-gender
          ?edit="${this.edit}"
          gender="${this.data.gender}"
        ></grampsjs-edit-gender>
        ${this._displayName()}
      </h2>
      ${courtesy ? html`<p class="courtesy">${courtesy}</p>` : ''}
      ${lineage ? html`<p class="lineage">${lineage}</p>` : ''}
      ${this._renderBirth()} ${this._renderDeath()}
      ${memorial
        ? html`<p class="memorial">
            <strong>Ngày giỗ</strong> · ${memorial} âm lịch
          </p>`
        : this._memorialUnknown()
        ? html`<p class="memorial missing">Ngày giỗ: phả chưa chép</p>`
        : ''}
    `
  }

  /*
  Người gần như chắc đã mất mà sổ không chép ngày giỗ: từ đời 13 trở lên, hoặc
  đã có sự kiện Mất/An táng. Nói rõ "phả chưa chép" để người tra biết đây không
  phải trang lỗi, mà là chỗ dòng họ có thể bổ sung.
  */
  _memorialUnknown() {
    const generation = parseInt(
      getAttributeValue(this.data, ATTR_GENERATION),
      10
    )
    if (Number.isFinite(generation) && generation <= 13) {
      return true
    }
    if (Object.keys(this.data?.profile?.death || {}).length > 0) {
      return true
    }
    return (this.data?.extended?.events || []).some(event =>
      ['Death', 'Burial'].includes(this._eventTypeKey(event))
    )
  }

  // Loại sự kiện về từ máy chủ khi là chuỗi, khi là đối tượng EventType.
  // eslint-disable-next-line class-methods-use-this
  _eventTypeKey(event) {
    const {type} = event || {}
    if (!type) {
      return ''
    }
    return typeof type === 'string' ? type : type.string || type.value || ''
  }

  // Dòng thời gian chỉ có gì để xem khi người có ít nhất một ngày dương lịch;
  // ngày giỗ âm lịch của phả là ngày chữ, không có năm.
  _hasDatedEvents() {
    return (this.data?.extended?.events || []).some(
      event =>
        (event?.date?.sortval ?? 0) > 0 || (event?.date?.dateval?.[2] ?? 0) > 0
    )
  }

  // Bản đồ cần địa danh có toạ độ; dữ liệu người không mang toạ độ nên chỉ
  // biết được là có địa danh hay không. Không có địa danh nào thì chắc chắn
  // bản đồ trống, khỏi hiện nút.
  _hasPlacedEvents() {
    return (this.data?.extended?.events || []).some(event => event?.place)
  }

  /*
  Thẻ do pipeline gắn ("Chỉ có tên", "Cần soát lại"...) không tự giải thích;
  in một dòng chú thích cho mỗi thẻ có trong TAG_HINTS, kèm liên kết tới bài
  hướng dẫn đọc gia phả.
  */
  renderTags() {
    const hints = this.edit
      ? []
      : (this.data?.extended?.tags || [])
          .map(tag => (tag.name || '').normalize('NFC').trim())
          .filter((name, index, names) => names.indexOf(name) === index)
          .map(name => [name, TAG_HINTS[name]])
          .filter(([, hint]) => hint)
    return html`${super.renderTags()}
    ${hints.length
      ? html`<p class="tag-hints">
          ${hints.map(
            ([name, hint]) =>
              html`<span class="tag-hint"
                ><strong>${name}</strong>: ${hint}.</span
              >`
          )}
          <a href="${READING_GUIDE_PATH}">Cách đọc gia phả</a>
        </p>`
      : ''}`
  }

  /*
  Bỏ hai mục chỉ lặp lại đầu trang: "Tên" khi người không có tên phụ (1.397
  người chỉ có một tên), và "Thông tin thêm" khi mọi thuộc tính đều đã in ở
  đầu trang. Lúc sửa thì giữ đủ.
  */
  _getTabs(edit) {
    const tabs = super._getTabs(edit)
    if (edit) {
      return tabs
    }
    const hasAlternateNames = this.data?.alternate_names?.length > 0
    const hasMetadata =
      (this.data?.attribute_list || []).some(
        attr => !PERSON_HEADING_ATTRIBUTES.includes((attr.type || '').trim())
      ) ||
      this.data?.urls?.length > 0 ||
      this.data?.address_list?.length > 0
    return tabs.filter(
      key =>
        (key !== 'names' || hasAlternateNames) &&
        (key !== 'metadata' || hasMetadata)
    )
  }

  /*
  Mã QR dẫn thẳng tới trang người này, để in lên sổ họ, ảnh thờ hay bia mộ.
  Các trang dòng họ Việt đều có; ở đây chỉ là đường dẫn hiện tại vẽ thành mã,
  không gửi gì ra ngoài.
  */
  _personUrl() {
    return `${window.location.origin}/person/${this.data?.gramps_id ?? ''}`
  }

  _renderQrBtn() {
    return html`
      <md-outlined-button @click="${this._openQr}">
        ${this._('QR code')}
        <grampsjs-icon
          path="${mdiQrcode}"
          color="var(--mdc-theme-primary)"
          slot="icon"
        ></grampsjs-icon>
      </md-outlined-button>
    `
  }

  _renderQrDialog() {
    return html`
      <md-dialog id="qr-dialog">
        <div slot="headline">${this._('QR code')}</div>
        <div slot="content" class="qr">
          ${this._qrDataUrl
            ? html`<img src="${this._qrDataUrl}" alt="QR" />`
            : ''}
          <div>
            <strong>${this._displayName()}</strong>
            <div class="url">${this._personUrl()}</div>
            <div>${this._('Scan to open this page')}</div>
          </div>
        </div>
        <div slot="actions">
          <md-text-button @click="${this._closeQr}"
            >${this._('Close')}</md-text-button
          >
        </div>
      </md-dialog>
    `
  }

  _openQr() {
    const code = generate(this._personUrl())
    this._qrDataUrl = toSvgDataURL(code, {
      on: '#000000',
      off: '#ffffff',
      padX: 2,
      padY: 2,
    })
    this.shadowRoot.getElementById('qr-dialog')?.show()
  }

  _closeQr() {
    this.shadowRoot.getElementById('qr-dialog')?.close()
  }

  _displayName() {
    if (!this.data.profile) {
      return ''
    }
    const surname = this.data.profile.name_surname || '…'
    const suffix = this.data.profile.name_suffix || ''
    const call = this.data?.primary_name?.call
    let given = this.data.profile.name_given || call || '…'
    const callIndex = call && call !== given ? given.search(call) : -1
    given =
      callIndex > -1
        ? html`
            ${given.substring(0, callIndex)}
            <span class="given-name"
              >${given.substring(callIndex, callIndex + call.length)}</span
            >
            ${given.substring(callIndex + call.length)}
          `
        : given
    // Họ trước, tên sau, theo lối Việt; tên gọi (call name) vẫn được tô đậm.
    return html`${surname} ${given} ${suffix}`
  }

  _renderBirth() {
    const obj = this.data?.profile?.birth
    if (obj === undefined || Object.keys(obj).length === 0) {
      return ''
    }
    return html`
      <span class="event">
        ${this._('Birth')}: ${obj.date || ''} ${obj.place ? this._('in') : ''}
        ${obj.place_name || obj.place || ''}
      </span>
    `
  }

  _renderDeath() {
    const obj = this.data?.profile?.death
    if (obj === undefined || Object.keys(obj).length === 0) {
      return ''
    }
    if (
      getAttributeValue(this.data, ATTR_DEATH_ANNIVERSARY) &&
      /^giỗ(?:\s|$)/iu.test(obj.date || '') &&
      !obj.place &&
      !obj.place_name
    ) {
      return ''
    }
    return html`
      <span class="event">
        ${this._('Death')}: ${obj.date || ''} ${obj.place ? this._('in') : ''}
        ${obj.place_name || obj.place || ''}
      </span>
    `
  }

  _renderRelation() {
    if (
      !this.homePersonDetails.handle ||
      this.homePersonDetails.handle === this.data.handle
    ) {
      // no home person set
      return ''
    }
    // Người gốc mặc định là thuỷ tổ, nhãn gọi đúng tên; ai tự đặt người gốc
    // khác thì dùng nhãn chung.
    const homeGrampsId = this.homePersonDetails.gramps_id ?? ''
    const label =
      homeGrampsId === DEFAULT_HOME_PERSON
        ? 'Quan hệ với thủy tổ'
        : this._('Relationship to home person')
    return html`
      <grampsjs-person-relationship
        person1="${this.homePersonDetails.handle}"
        person2="${this.data.handle}"
        homeGrampsId="${homeGrampsId}"
        generation="${getAttributeValue(this.data, ATTR_GENERATION)}"
        label="${label}"
        .appState="${this.appState}"
      ></grampsjs-person-relationship>
    `
  }

  _renderTreeBtn() {
    return html`
      <md-outlined-button @click="${this._handleTreeButtonClick}">
        ${this._('Show in tree')}
        <grampsjs-icon
          path="${mdiFamilyTree}"
          color="var(--mdc-theme-primary)"
          slot="icon"
        >
        </grampsjs-icon>
      </md-outlined-button>
    `
  }

  _renderTimelineBtn() {
    return html`
      <md-outlined-button @click="${this._handleTimelineButtonClick}">
        ${this._('Show on timeline')}
        <grampsjs-icon
          path="${mdiTimelineOutline}"
          color="var(--mdc-theme-primary)"
          slot="icon"
        ></grampsjs-icon>
      </md-outlined-button>
    `
  }

  _renderMapBtn() {
    return html`
      <md-outlined-button @click="${this._handleMapButtonClick}">
        ${this._('Open in map')}
        <grampsjs-icon
          path="${mdiMap}"
          color="var(--mdc-theme-primary)"
          slot="icon"
        ></grampsjs-icon>
      </md-outlined-button>
    `
  }

  // Không còn được gọi: nút này gửi họ tên, năm sinh, nơi sinh của người trong
  // cây (nhiều người còn sống) sang các dịch vụ phả hệ nước ngoài, mà với
  // dòng họ Việt thì không tìm được gì. Giữ hàm để lần trộn ngược upstream
  // chỉ đụng một dòng gọi.
  _renderExternalSearchBtn() {
    return html`
      <md-outlined-button @click="${this._handleExternalSearchClick}">
        ${this._('External Search')}
        <grampsjs-icon
          path="${mdiSearchWeb}"
          color="var(--mdc-theme-primary)"
          slot="icon"
        >
        </grampsjs-icon>
      </md-outlined-button>
    `
  }

  _renderDnaBtn() {
    if (!this.data?.person_ref_list?.filter(ref => ref.rel === 'DNA').length) {
      // no DNA data
      return ''
    }
    return html`
      <md-outlined-button
        @click="${this._handleDnaButtonClick}"
        class="dna-btn"
      >
        ${this._('DNA matches')}
        <grampsjs-icon
          path="${mdiDna}"
          color="var(--mdc-theme-primary)"
          slot="icon"
        ></grampsjs-icon>
      </md-outlined-button>
    `
  }

  _handleTreeButtonClick() {
    this.dispatchEvent(
      new CustomEvent('pedigree:person-selected', {
        bubbles: true,
        composed: true,
        detail: {grampsId: this.data.gramps_id},
      })
    )
    fireEvent(this, 'nav', {path: 'tree'})
  }

  _handleTimelineButtonClick() {
    window.dispatchEvent(
      new CustomEvent('timeline:person-selected', {
        detail: {object: this.data},
      })
    )
    fireEvent(this, 'nav', {path: 'timeline'})
  }

  _handleMapButtonClick() {
    window.dispatchEvent(
      new CustomEvent('map:person-selected', {
        detail: {person: this.data},
      })
    )
    fireEvent(this, 'nav', {path: 'map'})
  }

  _handleExternalSearchClick() {
    // Helper to extract year from date string (format: "YYYY-MM-DD" or "YYYY")
    const extractYear = dateStr => {
      if (!dateStr) return ''
      const match = dateStr.match(/^\d{4}/)
      return match ? match[0] : ''
    }
    const data = {
      name_given: this.data?.profile?.name_given,
      name_surname: this.data?.profile?.name_surname,
      name_middle: this.data?.profile?.name_given?.split(' ')[1] || '',
      place_name:
        this.data?.profile?.birth?.place_name ||
        this.data?.profile?.birth?.place ||
        this.data?.profile?.death?.place_name ||
        this.data?.profile?.death?.place ||
        '',
      birth_year: extractYear(this.data?.profile?.birth?.date),
      death_year: extractYear(this.data?.profile?.death?.date),
    }
    this.dialogContent = html`
      <div>
        <grampsjs-form-external-search
          @object:cancel=${this._handleCancelDialog}
          .appState="${this.appState}"
          .data=${data}
          .dialogTitle=${this._('External Search')}
          .hideSaveButton=${true}
        >
        </grampsjs-form-external-search>
      </div>
    `
  }

  _handleCancelDialog() {
    this.dialogContent = ''
  }

  _handleDnaButtonClick() {
    fireEvent(this, 'nav', {path: `dna-matches/${this.data.gramps_id}`})
  }

  _handleFamilyEventsToggle(e) {
    this._showFamilyEvents = e.target.selected
    if (this._showFamilyEvents || this._showRelatedEvents) {
      fireEvent(this, 'person:timeline-needed')
    }
  }

  _handleRelatedEventsToggle(e) {
    this._showRelatedEvents = e.target.selected
    if (this._showFamilyEvents || this._showRelatedEvents) {
      fireEvent(this, 'person:timeline-needed')
    }
  }

  // Build a single combined ordered list from the timeline. Personal events
  // are always included; family/related are gated by their toggle. The
  // timeline API returns events in chronological order, so we preserve that
  // ordering.
  _getCombinedTimelineEvents() {
    const personalHandles = new Set(
      (this.data?.extended?.events || []).map(e => e.handle)
    )
    const familyEventHandles = new Set(
      (this.data?.extended?.families || [])
        .flatMap(f => f.event_ref_list || [])
        .map(er => er.ref)
    )

    // The timeline API returns events in chronological order. Use each
    // event's position in that array as a sort key so we can interleave
    // personal and family/related events correctly.
    const timelineOrder = new Map(
      this.timelineData.map((te, i) => [te.handle, i])
    )
    const timelineAge = new Map(
      this.timelineData.map(te => [te.handle, te.age || ''])
    )

    const entries = []

    // Personal events: always from main data (timeline may omit undated ones).
    for (const [i, event] of (this.data?.extended?.events || []).entries()) {
      const sortKey = timelineOrder.has(event.handle)
        ? timelineOrder.get(event.handle)
        : event.date?.sortval ?? Infinity
      const baseProfile = (this.data?.profile?.events || [])[i] || {}
      entries.push({
        sortKey,
        data: event,
        profile: {...baseProfile, age: timelineAge.get(event.handle) || ''},
      })
    }

    // Family/related events: only from timeline.
    for (const te of this.timelineData) {
      if (personalHandles.has(te.handle)) continue
      if (familyEventHandles.has(te.handle)) {
        if (!this._showFamilyEvents) continue
      } else {
        if (!this._showRelatedEvents) continue
      }
      const isRelated = !familyEventHandles.has(te.handle)
      const personName = isRelated ? personProfileDisplayName(te.person) : ''
      entries.push({
        sortKey: timelineOrder.get(te.handle),
        data: {
          gramps_id: te.gramps_id,
          handle: te.handle,
          type: te.type,
          description: te.description || '',
          media_list: (te.media || []).map(h => ({ref: h})),
        },
        profile: {
          type: this._(te.type),
          date: te.date || '',
          place: te.place?.name || '',
          place_name: te.place?.name || '',
          role: isRelated ? te.person?.relationship || '' : '',
          summary: te.label || te.type || '',
          context: isRelated ? personName : this._('Family'),
          age: te.age || '',
        },
      })
    }

    entries.sort((a, b) => a.sortKey - b.sortKey)

    return {
      data: entries.map(e => e.data),
      profile: entries.map(e => e.profile),
    }
  }

  renderSectionContent(sectionKey) {
    if (sectionKey !== 'events' || this.edit) {
      return super.renderSectionContent(sectionKey)
    }

    const hasFamilies =
      (this.data?.family_list?.length || 0) +
        (this.data?.parent_family_list?.length || 0) >
      0

    const chips = hasFamilies
      ? html`
          <div class="events-chips">
            <md-chip-set>
              <md-filter-chip
                label="${this._('Personal')}"
                selected
                @click="${e => {
                  e.target.selected = true
                }}"
              ></md-filter-chip>
              <md-filter-chip
                label="${this._('Family')}"
                ?selected="${this._showFamilyEvents}"
                @click="${this._handleFamilyEventsToggle}"
              ></md-filter-chip>
              <md-filter-chip
                label="${this._('Relatives')}"
                ?selected="${this._showRelatedEvents}"
                @click="${this._handleRelatedEventsToggle}"
              ></md-filter-chip>
            </md-chip-set>
          </div>
        `
      : ''

    // While neither toggle is active (or timeline not yet loaded), show
    // the normal personal events list with full edit capability.
    if (
      (!this._showFamilyEvents && !this._showRelatedEvents) ||
      !this.timelineData.length
    ) {
      return html`
        ${chips}
        <grampsjs-events
          hasShare
          hasAdd
          hasEdit
          defaultRole="Primary"
          .appState="${this.appState}"
          .data=${this.data?.extended?.events}
          .profile=${this.data?.profile?.events}
          .eventRef=${this.data?.event_ref_list}
        ></grampsjs-events>
      `
    }

    // Combined chronological view using the timeline endpoint.
    const {data, profile} = this._getCombinedTimelineEvents()
    return html`
      ${chips}
      <grampsjs-events
        .appState="${this.appState}"
        .data=${data}
        .profile=${profile}
      ></grampsjs-events>
    `
  }
}

window.customElements.define('grampsjs-person', GrampsjsPerson)
