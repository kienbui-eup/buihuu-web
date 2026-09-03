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

  /* Đầu mỗi trang: nhãn mục nhỏ, tiêu đề serif và một dòng dẫn, cùng nhịp với
     các khối trên trang chủ. Dùng .with-actions khi có nút ở mép phải. */
  .page-heading {
    margin: 0 0 24px;
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
    }
    .page-heading h2 {
      font-size: 26px;
    }
  }
`
