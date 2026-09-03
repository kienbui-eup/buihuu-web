import {css} from 'lit'

// Bề mặt sáng như tường đá, nét viền vàng trầm gợi chi tiết nhà thờ tổ.
export const heritageFrameStyles = css`
  :host {
    --grampsjs-frame-radius: 4px;
    --grampsjs-frame-paper: var(--md-sys-color-surface);
  }

  .heritage-frame {
    position: relative;
    border: 1px solid var(--heritage-rule);
    border-radius: var(--grampsjs-frame-radius);
    background: var(--grampsjs-frame-paper);
    box-sizing: border-box;
    box-shadow: 0 3px 16px var(--grampsjs-body-font-color-5);
  }
  .section-label {
    margin: 0 0 12px;
    font: 500 11px/1.6 var(--grampsjs-body-font-family);
    letter-spacing: 0.16em;
    color: var(--md-sys-color-primary);
    text-transform: uppercase;
  }
`
