import {html, css} from 'lit'

import '@material/web/button/outlined-button.js'
import '@material/web/iconbutton/icon-button.js'

import {mdiTimelineOutline, mdiPencil} from '@mdi/js'
import {GrampsjsObject} from './GrampsjsObject.js'
import './GrampsjsFormEditEventDetails.js'
import './GrampsjsFormEditTitle.js'
import './GrampsjsIcon.js'
import './GrampsjsTooltip.js'
import {
  emptyDate,
  fireEvent,
  objectIconPath,
  personProfileDisplayName,
} from '../util.js'
import './GrampsjsObjectLink.js'
import {localizeServerValue, describesSameLunarDate} from '../glossary.js'

// Vai trò "người chính" và "gia đình" của một sự kiện, ở cả ba dạng có thể
// gặp: khoá gốc, bản dịch máy chủ và chữ của nhà.
const PRIMARY_ROLES = ['Primary', 'Chủ yếu', 'Chính']

const FAMILY_ROLES = ['Family', 'Gia đình']

export class GrampsjsEvent extends GrampsjsObject {
  static get styles() {
    return [
      super.styles,
      css`
        p.button-list {
          margin-top: 1.5em;
        }
      `,
    ]
  }

  constructor() {
    super()
    this._objectsName = 'Events'
    this._objectIcon = objectIconPath.event
    this._objectEndpoint = 'events'
    this._showReferences = false
  }

  renderProfile() {
    return html`
      <h2>
        ${this._renderTitle()}
        ${this.edit
          ? html`
              <md-icon-button
                id="btn-edit-type"
                class="edit"
                aria-label="${this._('Edit event type')}"
                @click="${this._handleEditType}"
              >
                <grampsjs-icon
                  path="${mdiPencil}"
                  color="var(--mdc-theme-secondary)"
                ></grampsjs-icon>
              </md-icon-button>
              <grampsjs-tooltip for="btn-edit-type"
                >${this._('Edit event type')}</grampsjs-tooltip
              >
            `
          : ''}
      </h2>
      ${(this.data.description &&
        !describesSameLunarDate(
          this.data.description,
          this.data?.profile?.date
        )) ||
      this.edit
        ? html` <dl>
            <div>
              <dt>${this._('Description')}</dt>
              <dd>${this.data.description}</dd>
            </div>
          </dl>`
        : ''}
      ${this.edit
        ? html`
            <md-icon-button
              class="edit"
              aria-label="${this._('Edit')}"
              @click="${this._handleEditDesc}"
            >
              <grampsjs-icon
                path="${mdiPencil}"
                color="var(--mdc-theme-secondary)"
              ></grampsjs-icon>
            </md-icon-button>
          `
        : ''}

      <dl style="clear:left;">
        ${this.data?.profile?.date || this.edit
          ? html`
              <div>
                <dt>${this._('Date')}</dt>
                <dd>${this.data.profile.date}</dd>
              </div>
            `
          : ''}
        ${this.data?.profile?.place || this.edit
          ? html`
              <div>
                <dt>${this._('Place')}</dt>
                <dd>
                  <grampsjs-object-link
                    object-type="place"
                    gramps-id="${this.data.extended.place.gramps_id}"
                    >${this.data.profile.place_name ||
                    this.data.profile.place}</grampsjs-object-link
                  >
                </dd>
              </div>
            `
          : ''}
      </dl>
      ${this.edit
        ? html`
            <md-icon-button
              class="edit"
              aria-label="${this._('Edit')}"
              @click="${this._handleEditDetails}"
            >
              <grampsjs-icon
                path="${mdiPencil}"
                color="var(--mdc-theme-secondary)"
              ></grampsjs-icon>
            </md-icon-button>
          `
        : ''}
      ${!this.preview && this.data?.profile?.date
        ? html`
            <div style="clear:left;"></div>
            <p class="button-list">
              <md-outlined-button @click="${this._handleTimelineButtonClick}">
                ${this._('Show on timeline')}
                <grampsjs-icon
                  path="${mdiTimelineOutline}"
                  color="var(--mdc-theme-primary)"
                  slot="icon"
                ></grampsjs-icon>
              </md-outlined-button>
            </p>
          `
        : ''}
    `
  }

  _handleTimelineButtonClick() {
    window.dispatchEvent(
      new CustomEvent('timeline:event-selected', {
        detail: {handle: this.data.handle},
      })
    )
    fireEvent(this, 'nav', {path: 'timeline'})
  }

  // eslint-disable-next-line class-methods-use-this
  _renderPerson(obj) {
    if (obj === undefined) {
      return ''
    }
    return personProfileDisplayName(obj) || '…'
  }

  // eslint-disable-next-line class-methods-use-this
  _renderFamily(obj) {
    if (obj === undefined) {
      return ''
    }
    return `${this._renderPerson(obj.family?.father)} & ${this._renderPerson(
      obj.family?.mother
    )}`
  }

  _renderPrimaryPeople() {
    // Vai trò về từ máy chủ đã dịch ("Chủ yếu"); so với "Chính" của lớp thuật
    // ngữ mà không đổi trước thì không nhận ra ai là người chính, tiêu đề chỉ
    // còn "Mất:" trống.
    const primary = [...PRIMARY_ROLES, this._('Primary')]
    const family = [...FAMILY_ROLES, this._('Family')]
    const people =
      this.data?.profile?.participants?.people?.filter(obj =>
        primary.includes(localizeServerValue(obj.role))
      ) || []
    const families =
      this.data?.profile?.participants?.families?.filter(obj =>
        family.includes(localizeServerValue(obj.role))
      ) || []
    return `${people
      .map(obj => this._renderPerson(obj.person), this)
      .join(', ')}
            ${families.map(obj => this._renderFamily(obj), this).join(', ')}`
  }

  _renderTitle() {
    if (
      !this.data?.profile?.participants?.people?.length &&
      !this.data?.profile?.participants?.families?.length
    ) {
      // event without participants
      return html`${localizeServerValue(this.data.profile.type)}`
    }
    return html`${localizeServerValue(this.data.profile.type)}:
    ${this._renderPrimaryPeople()}`
  }

  _handleEditDetails() {
    const data = {date: this.data.date ?? emptyDate}
    if (this.data.place) {
      data.place = this.data.place
    }
    const place = this.data?.extended?.place
    this.dialogContent = html`
      <grampsjs-form-edit-event-details
        @object:save="${this._handleSaveDetails}"
        @object:cancel="${this._handleCancelDialog}"
        .appState="${this.appState}"
        .data=${data}
        .place=${place}
      >
      </grampsjs-form-edit-event-details>
    `
  }

  _handleSaveDetails(e) {
    fireEvent(this, 'edit:action', {action: 'updateProp', data: e.detail.data})
    e.preventDefault()
    e.stopPropagation()
    this.dialogContent = ''
  }

  _handleEditDesc() {
    this.dialogContent = html`
      <grampsjs-form-edit-title
        @object:save="${this._handleSaveDesc}"
        @object:cancel="${this._handleCancelDialog}"
        .appState="${this.appState}"
        .data=${{description: this.data?.description || ''}}
        prop="description"
      >
      </grampsjs-form-edit-title>
    `
  }

  _handleSaveDesc(e) {
    fireEvent(this, 'edit:action', {action: 'updateProp', data: e.detail.data})
    e.preventDefault()
    e.stopPropagation()
    this.dialogContent = ''
  }

  _handleEditType() {
    this.dialogContent = html`
      <grampsjs-form-edit-type
        dialogTitle="${this._('Edit event type')}"
        formId="event-type"
        typeName="event_types"
        @object:save="${this._handleSaveType}"
        @object:cancel="${this._handleCancelDialog}"
        .appState="${this.appState}"
        .data=${{
          type: this.data?.type?.string || this.data?.type || '',
        }}
        prop="value"
      >
      </grampsjs-form-edit-type>
    `
  }
}

window.customElements.define('grampsjs-event', GrampsjsEvent)
