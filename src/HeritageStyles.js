import {css} from 'lit'

// Nền giấy và một đường viền cho mỗi khối, tránh khung lồng trong khung.
export const heritageFrameStyles = css`
  :host {
    --grampsjs-frame-radius: 2px;
    --grampsjs-frame-paper: var(--md-sys-color-surface);
  }

  .heritage-frame {
    position: relative;
    border: 1px solid var(--md-sys-color-outline-variant);
    border-radius: var(--grampsjs-frame-radius);
    background: var(--grampsjs-frame-paper);
    box-sizing: border-box;
  }
  .section-label {
    margin: 0 0 12px;
    font: 500 11px/1.6 var(--grampsjs-body-font-family);
    letter-spacing: 0.12em;
    color: var(--md-sys-color-primary);
    text-transform: uppercase;
  }
`
