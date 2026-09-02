import {LitElement, css, html, nothing} from 'lit'
import {getCourtesyName, getLineage} from '../charts/util.js'
import {
  getAttributeValue,
  personDisplayName,
  personProfileDisplayName,
} from '../util.js'

// A summary for following a branch, without mounting the full person page.
export class GrampsjsPersonPreview extends LitElement {
  static get properties() {
    return {data: {type: Object}}
  }

  static get styles() {
    return css`
      :host {
        display: block;
        font: 400 13px/1.5 var(--grampsjs-body-font-family, sans-serif);
        overflow-wrap: anywhere;
      }
      h3 {
        margin: 0;
        font: 600 18px/1.5 var(--grampsjs-heading-font-family, serif);
        color: var(--md-sys-color-primary);
      }
      p {
        margin: 4px 0 0;
      }
      .courtesy,
      dt {
        color: var(--md-sys-color-on-surface-variant);
      }
      .lineage {
        display: inline-block;
        margin-top: 8px;
        padding: 2px 8px;
        border-left: 2px solid var(--md-sys-color-primary);
        font-weight: 500;
      }
      dl {
        display: grid;
        grid-template-columns: 66px minmax(0, 1fr);
        gap: 5px 8px;
        margin: 12px 0 0;
      }
      dt,
      dd {
        margin: 0;
      }
      .family {
        border-top: 1px solid var(--md-sys-color-outline-variant);
        padding-top: 10px;
      }
    `
  }

  // eslint-disable-next-line class-methods-use-this
  _row(label, value) {
    return value
      ? html`<dt>${label}</dt>
          <dd>${value}</dd>`
      : nothing
  }

  // eslint-disable-next-line class-methods-use-this
  _names(people) {
    const names = people.map(personProfileDisplayName).filter(Boolean)
    return [
      names.slice(0, 2).join(', '),
      names.length > 2 ? `và ${names.length - 2} người khác` : '',
    ]
      .filter(Boolean)
      .join('; ')
  }

  render() {
    if (!this.data) return nothing
    const person = this.data
    const profile = person.profile || {}
    const courtesy = getCourtesyName(person)
    const lineage = getLineage(person)
    const memorial = getAttributeValue(person, 'Ngày giỗ')
    const parents = profile.primary_parent_family || {}
    const spouses = new Map()
    const children = new Map()
    ;(profile.families || []).forEach(family => {
      const other =
        family.father?.handle === person.handle
          ? family.mother
          : family.mother?.handle === person.handle
          ? family.father
          : null
      if (other?.handle) spouses.set(other.handle, other)
      ;(family.children || []).forEach(child => {
        if (child.handle) children.set(child.handle, child)
      })
    })
    const father = personProfileDisplayName(parents.father)
    const mother = personProfileDisplayName(parents.mother)
    const spouseNames = this._names([...spouses.values()])
    const childNames = this._names([...children.values()])
    const birth = profile.birth?.date
    const death = /^giỗ(?:\s|$)/iu.test(profile.death?.date || '')
      ? ''
      : profile.death?.date
    return html`
      <h3>${personProfileDisplayName(profile) || personDisplayName(person)}</h3>
      ${courtesy ? html`<p class="courtesy">${courtesy}</p>` : nothing}
      ${lineage ? html`<p class="lineage">${lineage}</p>` : nothing}
      ${birth || death || memorial
        ? html`<dl>
            ${this._row('Sinh', birth)} ${this._row('Mất', death)}
            ${this._row('Ngày giỗ', memorial ? `${memorial} âm lịch` : '')}
          </dl>`
        : nothing}
      ${father || mother || spouseNames || children.size
        ? html`<dl class="family">
            ${this._row('Cha', father)} ${this._row('Mẹ', mother)}
            ${this._row('Vợ/chồng', spouseNames)}
            ${this._row(
              `Con (${children.size})`,
              childNames || (children.size ? 'Có ghi trong gia phả' : '')
            )}
          </dl>`
        : nothing}
    `
  }
}

window.customElements.define('grampsjs-person-preview', GrampsjsPersonPreview)
