import {css} from 'lit'

// Khung trang phả: góc vuông, hai nét chỉ và dấu góc nhỏ, dùng chung các thẻ.
export const heritageFrameStyles = css`
  :host {
    --grampsjs-frame-radius: 2px;
    --grampsjs-frame-paper: linear-gradient(
          var(--md-sys-color-primary),
          var(--md-sys-color-primary)
        )
        left top / 16px 2px no-repeat,
      linear-gradient(var(--md-sys-color-primary), var(--md-sys-color-primary))
        left top / 2px 16px no-repeat,
      linear-gradient(var(--md-sys-color-primary), var(--md-sys-color-primary))
        right bottom / 16px 2px no-repeat,
      linear-gradient(var(--md-sys-color-primary), var(--md-sys-color-primary))
        right bottom / 2px 16px no-repeat,
      linear-gradient(var(--md-sys-color-surface), var(--md-sys-color-surface))
        center / calc(100% - 12px) calc(100% - 12px) no-repeat,
      linear-gradient(
          var(--md-sys-color-outline-variant),
          var(--md-sys-color-outline-variant)
        )
        center / calc(100% - 10px) calc(100% - 10px) no-repeat,
      linear-gradient(var(--md-sys-color-surface), var(--md-sys-color-surface))
        center / calc(100% - 2px) calc(100% - 2px) no-repeat,
      var(--md-sys-color-outline-variant);
  }

  .heritage-frame {
    position: relative;
    border: 1px solid transparent;
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
