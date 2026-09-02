import {css} from 'lit'

export const anniversaryStyles = css`
  .remembrance {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 18px 0;
    border-bottom: 1px solid var(--md-sys-color-outline-variant);
    text-decoration: none;
    color: var(--md-sys-color-on-surface);
    min-height: 52px;
  }
  .remembrance:last-child {
    border-bottom: 0;
  }
  .remembrance:hover {
    color: var(--md-sys-color-primary);
    background: var(--md-sys-color-surface-container);
    text-decoration: none;
  }
  .remembrance .date {
    flex: 0 0 48px;
    height: 54px;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    border-right: 1px solid var(--md-sys-color-outline-variant);
    background: transparent;
    color: var(--md-sys-color-primary);
  }
  .date strong {
    font: 500 28px/1.25 var(--grampsjs-heading-font-family);
  }
  .date small {
    font: 400 11px/1.7 var(--grampsjs-body-font-family);
  }
  .remembrance .date.soon {
    border-right: 2px solid var(--md-sys-color-primary);
  }
  .remembrance .details {
    min-width: 0;
  }
  .remembrance .name {
    display: block;
    font-size: 16px;
    font-weight: 600;
    overflow-wrap: anywhere;
  }
  .remembrance .meta {
    display: block;
    font-size: 13px;
    color: var(--md-sys-color-on-surface-variant);
    margin-top: 3px;
    line-height: 1.6;
  }
  .calendar-note {
    font-size: 13px;
    color: var(--md-sys-color-on-surface-variant);
    margin: 0 0 8px;
  }
`
