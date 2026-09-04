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
    background-color: var(--grampsjs-frame-paper);
    background-image: var(--heritage-panel-background);
    box-sizing: border-box;
    box-shadow: var(--heritage-panel-shadow),
      inset 0 0 0 4px color-mix(in srgb, var(--heritage-gold) 5%, transparent),
      inset 0 0 0 5px color-mix(in srgb, var(--heritage-gold) 18%, transparent);
  }
  .section-label {
    margin: 0 0 12px;
    font: 500 11px/1.6 var(--grampsjs-body-font-family);
    letter-spacing: 0.16em;
    color: var(--md-sys-color-primary);
    text-transform: uppercase;
  }

  /* Đầu mỗi trang: nhãn mục nhỏ, tiêu đề serif và một dòng dẫn, cùng nhịp với
     các khối trên trang chủ. Dùng .with-actions khi có nút ở mép phải. */
  .page-heading {
    position: relative;
    margin: 0 0 24px;
    padding: 0 0 16px 18px;
    border-bottom: 1px solid var(--heritage-rule);
  }
  .page-heading::before {
    content: '';
    position: absolute;
    left: 0;
    top: 4px;
    bottom: 16px;
    width: 4px;
    background: linear-gradient(
      to bottom,
      var(--heritage-roof),
      var(--heritage-gold)
    );
  }
  .page-heading::after {
    content: '';
    position: absolute;
    left: 18px;
    bottom: -1px;
    width: min(150px, 36vw);
    height: 2px;
    background: var(--heritage-gold);
  }
  .page-heading .section-label {
    margin-bottom: 6px;
  }
  .page-heading h2 {
    margin: 0;
    font-size: 30px;
    line-height: 1.3;
    color: var(--heritage-ink);
  }
  .page-heading .lead {
    max-width: 42em;
    margin: 10px 0 0;
    font-size: 15px;
    line-height: 1.8;
    color: var(--md-sys-color-on-surface-variant);
  }
  .page-heading.with-actions {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 12px 24px;
  }
  .page-heading.with-actions > div {
    min-width: 0;
  }

  /* Danh sách md-list đặt trong khung giấy. */
  .heritage-frame > md-list {
    background: transparent;
    padding: 4px 0;
  }
  .heritage-frame.list-frame {
    padding: 6px;
  }

  @media (max-width: 768px) {
    .page-heading {
      margin-bottom: 18px;
      padding-left: 14px;
    }
    .page-heading h2 {
      font-size: 26px;
    }
  }
`
