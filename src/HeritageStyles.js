import {css} from 'lit'

// Khung trang phả: góc vuông, hai nét chỉ và dấu góc nhỏ, dùng chung các thẻ.
export const heritageFrameStyles = css`
  .heritage-frame {
    position: relative;
    border: 1px solid var(--md-sys-color-outline-variant);
    border-radius: 2px;
    background: var(--md-sys-color-surface);
    box-shadow: inset 0 0 0 5px var(--md-sys-color-surface),
      inset 0 0 0 6px var(--md-sys-color-outline-variant);
  }
  .heritage-frame::before,
  .heritage-frame::after {
    content: '';
    position: absolute;
    width: 16px;
    height: 16px;
    pointer-events: none;
    border-color: var(--md-sys-color-primary);
    border-style: solid;
  }
  .heritage-frame::before {
    top: -1px;
    left: -1px;
    border-width: 2px 0 0 2px;
  }
  .heritage-frame::after {
    right: -1px;
    bottom: -1px;
    border-width: 0 2px 2px 0;
  }
  .section-label {
    margin: 0 0 12px;
    font: 500 11px/1.6 var(--grampsjs-body-font-family);
    letter-spacing: 0.12em;
    color: var(--md-sys-color-primary);
    text-transform: uppercase;
  }
`
