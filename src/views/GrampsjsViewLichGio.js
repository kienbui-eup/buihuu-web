/*
Trang Lịch giỗ: toàn bộ ngày giỗ trong họ, xem theo hai cách như hai mặt của
một cuốn lịch treo tường, kèm nút tải về lịch điện thoại.

Cách một, "Theo tháng âm": một hàng tab "Sắp tới · Giêng … Chạp · Cả năm" ghim
dưới thanh ứng dụng; mỗi tháng là một bảng gom theo ngày, người giỗ cùng ngày
chung một ô ngày (ngày âm to, thứ và ngày dương nhỏ bên dưới). Cách này thay
cho danh sách 344 dòng nối nhau dài hơn bốn mươi nghìn điểm ảnh trên điện thoại.

Cách hai, "Lịch âm dương": lưới tháng dương bảy cột như tờ lịch treo tường, số
to là ngày dương, số nhỏ là ngày âm, ngày có giỗ đánh dấu; bấm một ngày để xem
ngày âm, can chi và những người giỗ hôm đó. Trả lời câu "cuối tuần này có giỗ
ai không" và "20/9 là ngày âm nào", hai câu mà bảng theo tháng âm trả lời khó.

Mọi mục của bảng theo tháng âm đều được vẽ sẵn và chỉ ẩn bằng thuộc tính
hidden, nên in trang là in cả năm dù đang mở tab nào. Dữ liệu tải khi trang
được mở lần đầu, không tải sẵn lúc khởi động. Khối "Ngày giỗ sắp tới" trên
trang chủ dùng cùng nguồn nhưng chỉ đưa vài người gần nhất.
*/

import {html, css, nothing} from 'lit'
import {heritageFrameStyles} from '../HeritageStyles.js'
import '@material/web/button/filled-tonal-button'
import {
  mdiCalendarExport,
  mdiChevronLeft,
  mdiChevronRight,
  mdiMagnify,
} from '@mdi/js'

import {GrampsjsView} from './GrampsjsView.js'
import '../components/GrampsjsIcon.js'
import '../components/GrampsjsPillToggle.js'
import {fireEvent} from '../util.js'
import {
  ATTR_DEATH_ANNIVERSARY,
  DEFAULT_LANGUAGE,
  GIO_GUIDE_PATH,
} from '../branding.js'
import {formatBranch, getBranch} from '../charts/util.js'
import {canChiYear, canChiDay, canChiMonth, jdFromDate} from '../lunar.js'
import {
  collectAnniversaries,
  buildMonthSections,
  groupByDay,
  upcomingEntries,
  matchesQuery,
  lunarToday,
  lunarMonthName,
  lunarMonthSpan,
  formatSolarShort,
  formatSolarSpan,
  formatSolarLong,
  formatLunarLong,
  weekdayIndex,
  buildCalendarMonth,
  lunarSpanLabel,
  calendarDays,
  WEEKDAY_LONG,
  WEEKDAY_SHORT,
  buildGioIcs,
} from '../gioCalendar.js'

const UPCOMING_DAYS = 30
const TAB_UPCOMING = 'sap-toi'
const TAB_ALL = 'ca-nam'
const TAB_CALENDAR = 'lich'
const TAB_MONTH = month => `thang-${month}`
const TAB_RE =
  /^#?(sap-toi|ca-nam|thang-(?:[1-9]|1[0-2])|lich(?:-(\d{4})-([1-9]|1[0-2]))?)$/
const MODE_KEY = 'lich-gio:mode'
// Thứ hai đứng đầu tuần như lịch in ở Việt Nam.
const WEEK_HEAD = [1, 2, 3, 4, 5, 6, 0]

const sameDate = (a, b) =>
  a && b && a[0] === b[0] && a[1] === b[1] && a[2] === b[2]

export class GrampsjsViewLichGio extends GrampsjsView {
  static get styles() {
    return [
      super.styles,
      heritageFrameStyles,
      css`
        :host {
          display: block;
        }

        .page-heading {
          margin-bottom: 16px;
        }

        /* Ô lọc và nút tải lịch trên một hàng; ô nhập cùng kiểu với ô tìm
           người ở trang chủ. Trên điện thoại nút xuống hàng riêng. */
        .toolbar {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 8px 16px;
          margin: 0 0 8px;
        }

        .toolbar md-filled-tonal-button {
          flex-shrink: 0;
        }

        .toolbar .short {
          display: none;
        }

        /* Điện thoại: nhãn nút rút gọn để nút đứng cùng hàng với ô lọc. */
        @media (max-width: 599px) {
          .toolbar {
            gap: 8px;
          }

          /* Chọn qua .toolbar để thắng quy tắc .search khai báo phía dưới. */
          .toolbar .search {
            flex: 1 1 180px;
            max-width: none;
          }

          .toolbar .long {
            display: none;
          }

          .toolbar .short {
            display: inline;
          }
        }

        .search {
          display: flex;
          flex: 1 1 240px;
          /* min-width 0 để ô co được dưới bề rộng mặc định của input, nhờ đó
             đứng chung hàng với nút tải lịch trên điện thoại. */
          min-width: 0;
          max-width: 420px;
          align-items: center;
          gap: 10px;
          padding: 0 10px 0 14px;
          border: 1px solid var(--md-sys-color-outline);
          border-radius: var(--grampsjs-frame-radius);
          background: var(--md-sys-color-surface);
        }

        .search:focus-within {
          border-color: var(--md-sys-color-primary);
          outline: 2px solid var(--md-sys-color-primary);
          outline-offset: -2px;
        }

        .search grampsjs-icon {
          flex-shrink: 0;
        }

        #anniversary-search {
          flex: 1 1 0;
          width: 100%;
          min-width: 0;
          min-height: 44px;
          border: 0;
          background: transparent;
          font: inherit;
          font-size: 16px;
          color: var(--md-sys-color-on-surface);
          outline: none;
        }

        #anniversary-search::placeholder {
          color: var(--md-sys-color-on-surface-variant);
        }

        /* Dòng "Hôm nay" bên trái, công tắc hai cách xem bên phải; trên điện
           thoại công tắc xuống hàng dưới. */
        .status {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: space-between;
          gap: 0 16px;
          --grampsjs-pill-toggle-font-size: 16px;
        }

        .status .today {
          flex: 1 1 260px;
        }

        .summary,
        .today {
          font-size: 13px;
          line-height: 1.5;
          color: var(--md-sys-color-on-surface-variant);
        }

        .today {
          margin: 0 0 4px;
        }

        .today b {
          font-weight: 600;
          color: var(--md-sys-color-on-surface);
        }

        /* Hàng tab ghim dưới thanh ứng dụng. Chip co giãn để trên điện thoại
           mười bốn ô xếp thành hai hàng, không có ô nào khuất ngoài mép. */
        .tabs {
          position: sticky;
          top: var(--workspace-header-height, 64px);
          z-index: 2;
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          padding: 8px 0 10px;
          margin: 0 0 6px;
          background: var(--md-sys-color-background, #f4f2ed);
        }

        .tabs button {
          flex: 1 0 auto;
          min-width: 44px;
          min-height: 48px;
          padding: 0 10px;
          border: 1px solid var(--heritage-rule);
          border-radius: var(--grampsjs-frame-radius);
          background: var(--grampsjs-frame-paper, var(--md-sys-color-surface));
          color: var(--md-sys-color-on-surface);
          font: 500 16px/1 var(--grampsjs-body-font-family);
          cursor: pointer;
          white-space: nowrap;
        }

        .tabs button.wide {
          flex-grow: 0;
          padding: 0 14px;
        }

        .tabs button:hover,
        .tabs button:focus-visible {
          border-color: var(--heritage-gold);
          color: var(--md-sys-color-primary);
        }

        .tabs button:focus-visible {
          outline: 2px solid var(--md-sys-color-primary);
          outline-offset: 1px;
        }

        .tabs button[aria-selected='true'] {
          border-color: var(--heritage-gold);
          background: var(--md-sys-color-secondary-container);
          color: var(--md-sys-color-on-secondary-container);
        }

        .tabs button:disabled {
          opacity: 0.5;
          cursor: default;
        }

        /* Chấm nhỏ đánh dấu tháng âm đang đứng. */
        .tabs button.now::after {
          content: '';
          display: inline-block;
          width: 5px;
          height: 5px;
          margin-left: 5px;
          border-radius: 50%;
          background: var(--md-sys-color-primary);
          vertical-align: 2px;
        }

        /* Thanh lật tháng dương của lịch âm dương: mũi tên hai bên, tên tháng
           ở giữa kèm tháng âm tương ứng, nút "Hôm nay" ở mép phải. */
        .tabs.nav {
          flex-wrap: nowrap;
          align-items: center;
        }

        .nav .arrow {
          flex: 0 0 40px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 40px;
          padding: 0;
        }

        .nav .label {
          flex: 1 1 auto;
          display: flex;
          flex-direction: column;
          align-items: center;
          min-width: 0;
          text-align: center;
        }

        .nav .label strong {
          font: 600 17px/1.25 var(--grampsjs-heading-font-family);
          color: var(--md-sys-color-on-surface);
          white-space: nowrap;
        }

        /* Tháng âm tương ứng; tháng có Tết dài gấp đôi nên cho xuống dòng. */
        .nav .label small {
          max-width: 100%;
          font-size: 12px;
          line-height: 1.3;
          color: var(--md-sys-color-on-surface-variant);
          text-wrap: balance;
        }

        /* Dưới 840 px: lưới bảy cột, hai hàng. "Sắp tới" và "Cả năm" đứng đầu
           mỗi hàng, sáu tháng nối theo sau như hai nửa của một tờ lịch, nên
           không ô nào khuất ngoài mép mà hàng tab vẫn gọn. */
        @media (max-width: 839px) {
          .tabs {
            display: grid;
            grid-template-columns: auto repeat(6, minmax(0, 1fr));
            gap: 4px;
          }

          .tabs.nav {
            display: flex;
            gap: 6px;
          }

          .tabs button {
            min-width: 0;
            padding: 0 2px;
            font-size: 13px;
          }

          .tabs button.wide {
            padding: 0 8px;
          }

          .tabs button.wide:last-child {
            grid-row: 2;
            grid-column: 1;
          }
        }

        @media (max-width: 359px) {
          .tabs button {
            font-size: 12px;
            letter-spacing: -0.01em;
          }
        }

        .sections {
          display: flex;
          flex-direction: column;
        }

        .month {
          margin: 0 0 22px;
        }

        .month[hidden] {
          display: none;
        }

        .month h3 {
          display: flex;
          flex-wrap: wrap;
          align-items: baseline;
          gap: 2px 10px;
          margin: 8px 0 8px;
          font-size: 19px;
          font-weight: 600;
        }

        .month h3 .sub {
          font: 400 13px/1.5 var(--grampsjs-body-font-family);
          color: var(--md-sys-color-on-surface-variant);
        }

        .days {
          overflow: hidden;
        }

        .caption {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          padding: 5px 12px 5px 0;
          border-bottom: 1px solid var(--heritage-rule);
          background: color-mix(
            in srgb,
            var(--heritage-gold) 9%,
            var(--grampsjs-frame-paper)
          );
          font-size: 11px;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: var(--md-sys-color-on-surface-variant);
        }

        .caption span:first-child {
          flex: 0 0 72px;
          text-align: center;
        }

        /* Một ngày giỗ: ô ngày bên trái, những người giỗ ngày đó bên phải. */
        .day {
          display: grid;
          grid-template-columns: 72px minmax(0, 1fr);
          border-bottom: 1px solid var(--md-sys-color-outline-variant);
          break-inside: avoid;
        }

        .day:last-child {
          border-bottom: 0;
        }

        .when {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 8px 4px;
          border-right: 1px solid var(--md-sys-color-outline-variant);
          text-align: center;
          color: var(--md-sys-color-primary);
        }

        .when strong {
          font: 500 22px/1.15 var(--grampsjs-heading-font-family);
          white-space: nowrap;
        }

        .when small {
          font: 400 11.5px/1.4 var(--grampsjs-body-font-family);
          color: var(--md-sys-color-on-surface-variant);
          white-space: nowrap;
        }

        .when .due {
          margin-top: 2px;
          font-size: 11px;
          font-weight: 600;
          color: var(--md-sys-color-primary);
        }

        .day.soon .when {
          background: color-mix(in srgb, var(--heritage-gold) 16%, transparent);
        }

        .day.today .when {
          background: var(--md-sys-color-primary);
          color: var(--md-sys-color-on-primary);
        }

        .day.today .when small,
        .day.today .when .due {
          color: inherit;
        }

        .row {
          display: grid;
          grid-template-columns: minmax(0, 1fr);
          gap: 0 12px;
          padding: 7px 12px;
          border-bottom: 1px solid
            color-mix(
              in srgb,
              var(--md-sys-color-outline-variant) 55%,
              transparent
            );
          color: var(--md-sys-color-on-surface);
          text-decoration: none;
        }

        .row:last-child {
          border-bottom: 0;
        }

        .row:hover,
        .row:focus-visible {
          background: var(--md-sys-color-surface-container);
          color: var(--md-sys-color-primary);
          text-decoration: none;
        }

        .row .name {
          font-size: 18px;
          font-weight: 600;
          line-height: 1.35;
          overflow-wrap: anywhere;
        }

        .row .meta {
          display: block;
          font-size: 16px;
          line-height: 1.5;
          color: var(--md-sys-color-on-surface-variant);
        }

        .row .meta .gen + .branch::before {
          content: ' · ';
        }

        /* Trong tháng đang đứng: vạch ngăn giữa giỗ còn lại năm nay và giỗ đã
           qua, lần tới rơi vào năm âm sau. */
        .year-break {
          padding: 5px 12px;
          border-bottom: 1px solid var(--heritage-rule);
          background: color-mix(
            in srgb,
            var(--heritage-gold) 9%,
            var(--grampsjs-frame-paper)
          );
          font-size: 16px;
          color: var(--md-sys-color-on-surface-variant);
        }

        .empty {
          padding: 14px 12px;
          font-size: 14px;
          color: var(--md-sys-color-on-surface-variant);
        }

        /* Lịch âm dương: tờ lịch bảy cột trong khung giấy. Kẻ ô bằng nền của
           lưới lộ qua khe 1 px giữa các ô, đỡ phải xử lý viền trùng. */
        .calendar {
          margin: 0 0 14px;
          padding: 6px;
        }

        .weekdays {
          display: grid;
          grid-template-columns: repeat(7, minmax(0, 1fr));
          padding: 4px 0 6px;
          font-size: 11px;
          letter-spacing: 0.06em;
          text-align: center;
          text-transform: uppercase;
          color: var(--md-sys-color-on-surface-variant);
        }

        .weekdays span:last-child,
        .cell.sunday .solar {
          color: var(--heritage-roof);
        }

        .grid {
          display: grid;
          grid-template-columns: repeat(7, minmax(0, 1fr));
          gap: 1px;
          border: 1px solid var(--md-sys-color-outline-variant);
          background: var(--md-sys-color-outline-variant);
        }

        .cell {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1px;
          box-sizing: border-box;
          min-width: 0;
          min-height: 62px;
          margin: 0;
          padding: 5px 2px 4px;
          border: 0;
          background: var(--grampsjs-frame-paper, var(--md-sys-color-surface));
          color: var(--md-sys-color-on-surface);
          font: inherit;
          text-align: center;
          cursor: pointer;
        }

        .cell:hover {
          background: var(--md-sys-color-surface-container);
        }

        .cell:focus-visible {
          position: relative;
          z-index: 1;
          outline: 2px solid var(--md-sys-color-primary);
          outline-offset: -2px;
        }

        .cell .solar {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 26px;
          height: 26px;
          border-radius: 50%;
          font: 500 17px/1 var(--grampsjs-heading-font-family);
        }

        .cell .lunar {
          font-size: 11px;
          line-height: 1.2;
          color: var(--md-sys-color-on-surface-variant);
        }

        /* Mùng một và rằm nổi lên như trên lịch in. */
        .cell.moon .lunar {
          font-weight: 600;
          color: var(--md-sys-color-primary);
        }

        .cell.other .solar,
        .cell.other .lunar,
        .cell.other .mark {
          opacity: 0.45;
        }

        .cell.today .solar {
          background: var(--md-sys-color-primary);
          color: var(--md-sys-color-on-primary);
        }

        .cell[aria-pressed='true'] {
          background: var(--md-sys-color-secondary-container);
          box-shadow: inset 0 0 0 2px var(--heritage-gold);
        }

        /* Dấu giỗ: một chấm khi có một người, số khi nhiều người; ô không có
           giỗ vẫn chừa chỗ để các hàng cao bằng nhau. */
        .cell .mark {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 16px;
          height: 16px;
          margin-top: 1px;
          padding: 0 4px;
          border-radius: 8px;
          box-sizing: border-box;
          background: var(--heritage-gold);
          color: var(--heritage-wood, #35271f);
          font: 600 10px/1 var(--grampsjs-body-font-family);
        }

        .cell .mark.dot {
          min-width: 0;
          width: 6px;
          height: 6px;
          margin: 6px 0 5px;
          padding: 0;
        }

        .cell .mark.none {
          visibility: hidden;
        }

        /* Ngày đang chọn: số dương to bên trái như tờ lịch bloc, bên phải là
           ngày âm và can chi, dưới là những người giỗ hôm đó. */
        .detail {
          margin: 0 0 20px;
        }

        .detail-head {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 10px 12px;
          border-bottom: 1px solid var(--heritage-rule);
          background: color-mix(
            in srgb,
            var(--heritage-gold) 9%,
            var(--grampsjs-frame-paper)
          );
        }

        .detail-head .big {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          flex: 0 0 auto;
          min-width: 60px;
          padding: 5px 8px 6px;
          border-radius: var(--grampsjs-frame-radius);
          background: var(--md-sys-color-primary);
          color: var(--md-sys-color-on-primary);
        }

        .detail-head .big strong {
          font: 500 28px/1.05 var(--grampsjs-heading-font-family);
        }

        .detail-head .big small {
          font-size: 11px;
          line-height: 1.4;
          white-space: nowrap;
        }

        .detail-text {
          display: flex;
          flex-direction: column;
          gap: 1px;
          min-width: 0;
          font-size: 13px;
          line-height: 1.45;
          color: var(--md-sys-color-on-surface-variant);
        }

        .detail-text b {
          font-size: 15.5px;
          font-weight: 600;
          color: var(--md-sys-color-on-surface);
        }

        .detail-text .due {
          font-weight: 600;
          color: var(--md-sys-color-primary);
        }

        @media (max-width: 599px) {
          .tabs {
            top: var(--workspace-header-height, 56px);
          }
        }

        /* Máy tính bảng trở lên: đời và ngành chi thành cột riêng để dò theo
           hàng dọc được. */
        @media (min-width: 840px) {
          .day {
            grid-template-columns: 84px minmax(0, 1fr);
          }

          .caption span:first-child {
            flex-basis: 84px;
          }

          .row {
            grid-template-columns: minmax(0, 1fr) 64px 150px;
            align-items: baseline;
            padding: 6px 16px;
          }

          .row .meta {
            display: contents;
          }

          .row .meta .gen,
          .row .meta .branch {
            font-size: 13px;
            color: var(--md-sys-color-on-surface-variant);
            white-space: nowrap;
          }

          .row .meta .gen + .branch::before {
            content: none;
          }

          .row:hover .meta .gen,
          .row:hover .meta .branch {
            color: inherit;
          }

          .cell {
            min-height: 74px;
            padding-top: 8px;
          }

          .cell .solar {
            font-size: 19px;
          }

          .cell .lunar {
            font-size: 12px;
          }

          .nav .label strong {
            font-size: 19px;
          }

          /* Màn rộng: mũi tên ôm sát tên tháng, "Hôm nay" ra mép phải. */
          .nav .label {
            flex: 0 1 auto;
            min-width: 300px;
          }

          .nav button.wide {
            margin-left: auto;
          }
        }

        /* Màn hình rộng: bảng của một tháng chia hai cột, mỗi ngày trọn trong
           một cột. Lịch âm dương và ngày đang chọn đứng cạnh nhau. */
        @media (min-width: 1200px) {
          .overview {
            display: grid;
            grid-template-columns: minmax(0, 1fr) minmax(0, 1.15fr);
            column-gap: 36px;
            align-items: start;
            margin-bottom: 12px;
          }
          .overview .page-heading {
            grid-row: 1 / 3;
            margin-bottom: 0;
          }
          .overview .toolbar {
            grid-column: 2;
            margin-bottom: 12px;
          }
          .overview .search {
            max-width: none;
          }
          .overview .status {
            grid-column: 2;
            gap: 12px;
          }
          .overview .today {
            flex-basis: 100%;
            font-size: 14px;
          }
          .sections.multi-month {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 24px;
            align-items: start;
          }
          .sections.multi-month .days.split {
            column-count: 1;
          }
          .days.split .row,
          .multi-month .row {
            grid-template-columns: minmax(0, 1fr);
            padding: 8px 14px;
          }
          .days.split .row .meta,
          .multi-month .row .meta {
            display: flex;
            flex-wrap: wrap;
            gap: 4px 12px;
          }
          .days.split .row .meta .gen,
          .days.split .row .meta .branch,
          .multi-month .row .meta .gen,
          .multi-month .row .meta .branch {
            font-size: 14px;
          }

          .days.split {
            column-count: 2;
            column-gap: 0;
            column-rule: 1px solid var(--heritage-rule);
          }

          .days.split .caption {
            column-span: all;
          }

          .days.split .day {
            border-bottom: 1px solid var(--md-sys-color-outline-variant);
          }

          .calendar-row {
            display: grid;
            grid-template-columns: minmax(0, 7fr) minmax(0, 5fr);
            gap: 20px;
            align-items: start;
          }

          .calendar-row .calendar,
          .calendar-row .detail {
            margin: 0 0 22px;
          }
        }

        @media print {
          .overview,
          .sections.multi-month {
            display: block;
          }
          .days.split {
            column-count: 1;
          }

          .toolbar,
          .tabs,
          .today,
          grampsjs-pill-toggle,
          md-filled-tonal-button {
            display: none;
          }

          .month[hidden] {
            display: block;
          }

          .month.upcoming {
            display: none;
          }

          .heritage-frame {
            box-shadow: none;
          }
        }
      `,
    ]
  }

  static get properties() {
    return {
      _people: {type: Array},
      _loaded: {type: Boolean},
      _fetching: {type: Boolean},
      _search: {state: true},
      _tab: {state: true},
      _calMonth: {state: true},
      _selected: {state: true},
    }
  }

  constructor() {
    super()
    this._people = []
    this._loaded = false
    this._fetching = false
    this._search = ''
    this._tab = TAB_UPCOMING
    this._entries = []
    const today = new Date()
    this._calMonth = {year: today.getFullYear(), month: today.getMonth() + 1}
    this._selected = [
      today.getDate(),
      today.getMonth() + 1,
      today.getFullYear(),
    ]
  }

  connectedCallback() {
    super.connectedCallback()
    if (!this._applyHash() && this._storedMode() === TAB_CALENDAR) {
      this._tab = TAB_CALENDAR
    }
  }

  /*
  Đọc tab hoặc tháng lịch từ #hash của liên kết. Trả về true khi hash thuộc
  trang này. Gọi lúc gắn phần tử và mỗi lần trang được mở, vì phần tử được tạo
  từ khi khởi động ứng dụng chứ không phải lúc người dùng vào trang.
  */
  _applyHash() {
    const match = window.location.hash.match(TAB_RE)
    if (!match) return false
    this._tab = match[1].startsWith(TAB_CALENDAR) ? TAB_CALENDAR : match[1]
    if (match[2]) {
      this._showMonth(Number(match[2]), Number(match[3]))
    }
    return true
  }

  openSearch() {
    const field = this.renderRoot.querySelector('#anniversary-search')
    field?.scrollIntoView({block: 'center'})
    field?.focus({preventScroll: true})
  }

  willUpdate(changed) {
    super.willUpdate(changed)
    if (changed.has('_people')) {
      this._entries = collectAnniversaries(this._people)
    }
  }

  updated(changed) {
    super.updated(changed)
    if (
      changed.has('active') &&
      this.active &&
      changed.get('active') === false
    ) {
      this._applyHash()
    }
    if (this.active && !this._loaded && !this._fetching) {
      this._fetch()
    }
  }

  async _fetch() {
    this._fetching = true
    this.loading = true
    const rules = encodeURIComponent(
      JSON.stringify({
        rules: [{name: 'HasAttribute', values: [ATTR_DEATH_ANNIVERSARY, '']}],
      })
    )
    // extend=tag_list để có tên thẻ ngành chi trong extended.tags.
    const url =
      `/api/people/?rules=${rules}` +
      `&keys=gramps_id,attribute_list,profile,extended` +
      `&profile=self&extend=tag_list` +
      `&locale=${this.appState.i18n.lang || DEFAULT_LANGUAGE}` +
      `&pagesize=2000&page=1`
    const result = await this.appState.apiGet(url)
    this._fetching = false
    this.loading = false
    if ('data' in result) {
      this._people = result.data
      this._loaded = true
    } else if ('error' in result) {
      fireEvent(this, 'grampsjs:error', {message: result.error})
    }
  }

  renderContent() {
    const today = new Date()
    const searching = this._search.trim() !== ''
    const calendar = !searching && this._tab === TAB_CALENDAR
    const entries = searching
      ? this._entries.filter(entry => matchesQuery(entry, this._search))
      : this._entries
    const sections = buildMonthSections(entries, today)
    const lunar = lunarToday(today)
    const upcoming = upcomingEntries(entries, UPCOMING_DAYS)
    return html`
      <div class="overview">
        <header class="page-heading">
          <p class="section-label">Tưởng niệm</p>
          <h2>${this._('Death anniversary calendar')}</h2>
          <p class="lead">
            Giỗ cả họ theo tháng âm lịch, kèm thứ và ngày dương của lần giỗ sắp
            tới; hoặc lật lịch âm dương từng tháng để xem ngày nào có giỗ.
            <a href="${GIO_GUIDE_PATH}">Cách đọc và cách bổ sung</a>
          </p>
        </header>
        <div class="toolbar">
          <label class="search">
            <grampsjs-icon
              path="${mdiMagnify}"
              color="var(--md-sys-color-primary)"
            ></grampsjs-icon>
            <input
              id="anniversary-search"
              type="search"
              aria-label="Tìm trong ngày giỗ"
              placeholder="Tìm tên hoặc ngày"
              title="Gõ tên, hoặc ngày âm như 24/7, hoặc chỉ ngày như 24"
              autocomplete="off"
              .value=${this._search}
              @input=${event => {
                this._search = event.target.value
              }}
            />
          </label>
          <md-filled-tonal-button
            @click="${this._download}"
            ?disabled="${this._entries.length === 0}"
          >
            <span class="long">${this._('Download calendar (.ics)')}</span>
            <span class="short" aria-hidden="true">Tải lịch</span>
            <grampsjs-icon
              slot="icon"
              path="${mdiCalendarExport}"
              color="currentColor"
            ></grampsjs-icon>
          </md-filled-tonal-button>
        </div>
        <div class="status">
          <p class="today">
            Hôm nay
            <b
              >${WEEKDAY_LONG[today.getDay()]}
              ${today.getDate()}/${today.getMonth() +
              1}/${today.getFullYear()}</b
            >, tức ${lunar.day} tháng ${lunarMonthName(lunar.month)} năm
            ${canChiYear(lunar.year)} âm lịch, ngày
            ${canChiDay(
              today.getDate(),
              today.getMonth() + 1,
              today.getFullYear()
            )}.
            <span class="summary" aria-live="polite"
              >${this.loading
                ? this._('Loading items...')
                : this._countLabel(entries.length, searching)}</span
            >
          </p>
          ${searching
            ? nothing
            : html`<grampsjs-pill-toggle
                .options=${[
                  {label: 'Theo tháng âm', value: false},
                  {label: 'Lịch âm dương', value: true},
                ]}
                .selected=${this._tab === TAB_CALENDAR}
                .appState=${this.appState}
                ariaLabel="Cách xem lịch giỗ"
                @pill-toggle:change=${event =>
                  this._setMode(event.detail.value)}
              ></grampsjs-pill-toggle>`}
        </div>
      </div>
      ${searching || calendar ? nothing : this._renderTabs(sections)}
      ${calendar
        ? this._renderCalendar(entries, today)
        : html`<div
            class="sections ${searching || this._tab === TAB_ALL
              ? 'multi-month'
              : ''}"
          >
            ${searching
              ? nothing
              : this._renderUpcoming(upcoming, lunar, today)}
            ${sections.map(section =>
              this._renderMonth(section, lunar, searching)
            )}
            ${searching && entries.length === 0 && !this.loading
              ? html`<p class="empty">
                  Không có ngày giỗ nào khớp "${this._search.trim()}".
                </p>`
              : nothing}
          </div>`}
    `
  }

  /*
  "344 người có ngày giỗ" một mình khiến người tra không biết hơn nghìn người
  còn lại là trang lỗi hay phả không có. Nói rõ phần còn lại phả chưa chép,
  tổng số người lấy từ dbInfo để không phải tải cả cây.
  */
  _countLabel(shown, searching) {
    const total = this._entries.length
    const withMemorial = `${total} ${this._('people with a death anniversary')}`
    if (searching) {
      return `${shown} kết quả trong ${withMemorial}`
    }
    const people = this.appState.dbInfo?.object_counts?.people
    if (!people || people <= total) {
      return withMemorial
    }
    return `${withMemorial} · ${(people - total).toLocaleString(
      'vi-VN'
    )} người phả chưa chép giỗ`
  }

  _renderTabs(sections) {
    const tabs = [
      {id: TAB_UPCOMING, label: 'Sắp tới', wide: true, title: '30 ngày tới'},
      ...sections.map(section => ({
        id: TAB_MONTH(section.month),
        label: section.name,
        now: section.current,
        title: `Tháng ${section.name} âm lịch, ${section.entries.length} giỗ`,
      })),
      {
        id: TAB_ALL,
        label: 'Cả năm',
        wide: true,
        title: 'Mười hai tháng nối nhau',
      },
    ]
    return html`
      <div
        class="tabs"
        role="tablist"
        aria-label="Chọn tháng âm lịch"
        @keydown=${this._onTabKeydown}
      >
        ${tabs.map(
          tab =>
            html`<button
              type="button"
              role="tab"
              id="tab-${tab.id}"
              class="${tab.wide ? 'wide' : ''} ${tab.now ? 'now' : ''}"
              aria-selected="${this._tab === tab.id ? 'true' : 'false'}"
              aria-controls="${tab.id}"
              tabindex="${this._tab === tab.id ? '0' : '-1'}"
              title="${tab.title}"
              data-tab="${tab.id}"
              @click=${() => this._selectTab(tab.id)}
            >
              ${tab.label}
            </button>`
        )}
      </div>
    `
  }

  _onTabKeydown(event) {
    const keys = ['ArrowLeft', 'ArrowRight', 'Home', 'End']
    if (!keys.includes(event.key)) return
    const buttons = [...event.currentTarget.querySelectorAll('button')]
    const index = buttons.findIndex(button => button.dataset.tab === this._tab)
    let next = index
    if (event.key === 'ArrowLeft')
      next = (index - 1 + buttons.length) % buttons.length
    if (event.key === 'ArrowRight') next = (index + 1) % buttons.length
    if (event.key === 'Home') next = 0
    if (event.key === 'End') next = buttons.length - 1
    event.preventDefault()
    this._selectTab(buttons[next].dataset.tab)
    this.updateComplete.then(() => {
      this.renderRoot.querySelector(`#tab-${this._tab}`)?.focus()
    })
  }

  _selectTab(id) {
    if (id === this._tab) return
    const tabs = this.renderRoot.querySelector('.tabs')
    const stuck =
      tabs && tabs.getBoundingClientRect().top <= this._headerHeight() + 1
    this._tab = id
    this._writeHash()
    if (!stuck) return
    // Hàng tab đang ghim, nội dung phía trên đã cuộn khuất: kéo mục vừa chọn
    // lên ngay dưới hàng tab để người dùng không rơi vào giữa bảng.
    this.updateComplete.then(() => {
      const section =
        this.renderRoot.querySelector(`#${id}`) ??
        this.renderRoot.querySelector('.month:not([hidden])')
      if (!section) return
      section.style.scrollMarginTop = `${
        this._headerHeight() + tabs.offsetHeight + 4
      }px`
      section.scrollIntoView({block: 'start'})
    })
  }

  _headerHeight() {
    const value = getComputedStyle(this).getPropertyValue(
      '--workspace-header-height'
    )
    return parseInt(value, 10) || 64
  }

  /*
  Chuyển giữa bảng theo tháng âm và lịch âm dương. Cách xem được nhớ lại cho
  lần mở sau; mở lịch thì đứng ở tháng dương hiện tại và chọn sẵn hôm nay.
  */
  _setMode(calendar) {
    if (calendar === (this._tab === TAB_CALENDAR)) return
    if (calendar) {
      const today = new Date()
      this._showMonth(today.getFullYear(), today.getMonth() + 1)
      this._tab = TAB_CALENDAR
    } else {
      this._tab = TAB_UPCOMING
    }
    this._writeHash()
    try {
      window.localStorage.setItem(MODE_KEY, this._tab)
    } catch (e) {
      // Trình duyệt chặn bộ nhớ cục bộ: không nhớ được, không sao.
    }
  }

  _storedMode() {
    try {
      return window.localStorage.getItem(MODE_KEY)
    } catch (e) {
      return null
    }
  }

  _writeHash() {
    const hash =
      this._tab === TAB_CALENDAR
        ? `#${TAB_CALENDAR}-${this._calMonth.year}-${this._calMonth.month}`
        : `#${this._tab}`
    window.history.replaceState(window.history.state, '', hash)
  }

  /* Lật tới một tháng dương; chọn sẵn hôm nay nếu là tháng này, không thì mùng 1. */
  _showMonth(year, month) {
    const today = new Date()
    this._calMonth = {year, month}
    this._selected =
      today.getFullYear() === year && today.getMonth() + 1 === month
        ? [today.getDate(), month, year]
        : [1, month, year]
  }

  _shiftMonth(delta) {
    const date = new Date(this._calMonth.year, this._calMonth.month - 1 + delta)
    this._showMonth(date.getFullYear(), date.getMonth() + 1)
    this._writeHash()
  }

  _goToday() {
    const today = new Date()
    this._showMonth(today.getFullYear(), today.getMonth() + 1)
    this._writeHash()
  }

  /* Chọn một ngày dương trên lưới; ngày thuộc tháng khác thì lật sang tháng đó. */
  _selectDate([d, m, y]) {
    if (m !== this._calMonth.month || y !== this._calMonth.year) {
      this._calMonth = {year: y, month: m}
      this._writeHash()
    }
    this._selected = [d, m, y]
  }

  _onGridKeydown(event) {
    const [d, m, y] = this._selected
    const jd = jdFromDate(d, m, y)
    const shift = {
      ArrowLeft: -1,
      ArrowRight: 1,
      ArrowUp: -7,
      ArrowDown: 7,
    }[event.key]
    let target = null
    if (shift) {
      const date = new Date(y, m - 1, d + shift)
      target = [date.getDate(), date.getMonth() + 1, date.getFullYear()]
    } else if (event.key === 'Home') {
      target = [1, m, y]
    } else if (event.key === 'End') {
      target = [new Date(y, m, 0).getDate(), m, y]
    } else if (event.key === 'PageUp' || event.key === 'PageDown') {
      const date = new Date(y, m - 1 + (event.key === 'PageUp' ? -1 : 1), 1)
      target = [
        Math.min(
          d,
          new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
        ),
        date.getMonth() + 1,
        date.getFullYear(),
      ]
    }
    if (!target || jdFromDate(...target) === jd) return
    event.preventDefault()
    this._selectDate(target)
    this.updateComplete.then(() => {
      this.renderRoot.querySelector('.cell[aria-pressed="true"]')?.focus()
    })
  }

  _renderCalendar(entries, today) {
    const {year, month} = this._calMonth
    const cal = buildCalendarMonth(entries, year, month, today)
    const selectedCell = cal.cells.find(cell =>
      sameDate(cell.solar, this._selected)
    )
    const days = calendarDays(cal.cells)
    const count = days.reduce((sum, day) => sum + day.entries.length, 0)
    const isCurrentMonth =
      today.getFullYear() === year && today.getMonth() + 1 === month
    return html`
      <div class="tabs nav" role="group" aria-label="Chọn tháng dương lịch">
        <button
          type="button"
          class="arrow"
          title="Tháng trước"
          aria-label="Tháng trước"
          @click=${() => this._shiftMonth(-1)}
        >
          <grampsjs-icon
            path="${mdiChevronLeft}"
            color="currentColor"
          ></grampsjs-icon>
        </button>
        <div class="label" aria-live="polite">
          <strong>Tháng ${month}/${year}</strong>
          <small title="Tháng âm lịch tương ứng"
            >${lunarSpanLabel(cal.cells)}</small
          >
        </div>
        <button
          type="button"
          class="arrow"
          title="Tháng sau"
          aria-label="Tháng sau"
          @click=${() => this._shiftMonth(1)}
        >
          <grampsjs-icon
            path="${mdiChevronRight}"
            color="currentColor"
          ></grampsjs-icon>
        </button>
        <button
          type="button"
          class="wide"
          title="Về tháng này"
          ?disabled=${isCurrentMonth && selectedCell?.daysAway === 0}
          @click=${this._goToday}
        >
          Hôm nay
        </button>
      </div>
      <div class="calendar-row">
        <div class="calendar heritage-frame">
          <div class="weekdays" aria-hidden="true">
            ${WEEK_HEAD.map(
              weekday => html`<span>${WEEKDAY_SHORT[weekday]}</span>`
            )}
          </div>
          <div
            class="grid"
            aria-label="Lịch tháng ${month} năm ${year}"
            @keydown=${this._onGridKeydown}
          >
            ${cal.cells.map(cell =>
              this._renderCell(cell, cell === selectedCell)
            )}
          </div>
        </div>
        ${this._renderSelectedDay(selectedCell)}
      </div>
      <section class="month solar">
        <h3>
          Giỗ trong tháng ${month}/${year}
          <span class="sub">dương lịch · ${count} giỗ</span>
        </h3>
        <div class="days heritage-frame ${days.length > 6 ? 'split' : ''}">
          <div class="caption">
            <span>Âm · dương</span><span>Họ tên · đời · ngành, chi</span>
          </div>
          ${days.length === 0
            ? html`<p class="empty">Phả chưa chép giỗ nào trong tháng này.</p>`
            : days.map(day => this._renderDay(day, true))}
        </div>
      </section>
    `
  }

  _renderCell(cell, selected) {
    const [d] = cell.solar
    const classes = ['cell']
    if (!cell.inMonth) classes.push('other')
    if (cell.daysAway === 0) classes.push('today')
    if (weekdayIndex(cell.solar) === 0) classes.push('sunday')
    if (cell.lunar.day === 1 || cell.lunar.day === 15) classes.push('moon')
    const count = cell.entries.length
    const label =
      `${formatSolarLong(cell.solar)}, ${formatLunarLong(cell.lunar)} âm lịch` +
      (count ? `, ${count} giỗ` : '')
    let mark = html`<span class="mark none"></span>`
    if (count === 1) mark = html`<span class="mark dot"></span>`
    if (count > 1) mark = html`<span class="mark">${count}</span>`
    return html`
      <button
        type="button"
        class="${classes.join(' ')}"
        aria-label="${label}"
        aria-pressed="${selected ? 'true' : 'false'}"
        tabindex="${selected ? '0' : '-1'}"
        @click=${() => this._selectDate(cell.solar)}
      >
        <span class="solar">${d}</span>
        <span class="lunar"
          >${cell.lunar.day === 1
            ? `${cell.lunar.day}/${cell.lunar.month}`
            : cell.lunar.day}</span
        >
        ${mark}
      </button>
    `
  }

  _renderSelectedDay(cell) {
    if (!cell) return nothing
    const [d, m, y] = cell.solar
    const due =
      cell.daysAway >= 0 && cell.daysAway <= UPCOMING_DAYS
        ? this._daysAwayLabel(cell.daysAway)
        : ''
    return html`
      <section class="detail heritage-frame" aria-live="polite">
        <div class="detail-head">
          <div class="big">
            <strong>${d}</strong>
            <small>tháng ${m}</small>
          </div>
          <div class="detail-text">
            <b>${WEEKDAY_LONG[weekdayIndex(cell.solar)]}, ${d}/${m}/${y}</b>
            <span>${formatLunarLong(cell.lunar)} âm lịch</span>
            <span
              >Ngày ${canChiDay(d, m, y)}, tháng
              ${canChiMonth(cell.lunar.month, cell.lunar.year)}</span
            >
            ${due ? html`<span class="due">${due}</span>` : nothing}
          </div>
        </div>
        ${cell.entries.length === 0
          ? html`<p class="empty">Phả không chép giỗ nào vào ngày này.</p>`
          : html`<div class="people">
              ${cell.entries.map(entry => this._renderEntry(entry))}
            </div>`}
      </section>
    `
  }

  _renderUpcoming(upcoming, lunar, today) {
    const days = groupByDay(upcoming)
    const end = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() + UPCOMING_DAYS
    )
    const span = formatSolarSpan(
      [today.getDate(), today.getMonth() + 1, today.getFullYear()],
      [end.getDate(), end.getMonth() + 1, end.getFullYear()]
    )
    return html`
      <section
        class="month upcoming"
        id="${TAB_UPCOMING}"
        role="tabpanel"
        aria-labelledby="tab-${TAB_UPCOMING}"
        ?hidden=${this._tab !== TAB_UPCOMING}
      >
        <h3>
          Sắp tới
          <span class="sub"
            >${UPCOMING_DAYS} ngày tới · ${span} · ${upcoming.length} giỗ</span
          >
        </h3>
        <div class="days heritage-frame ${days.length > 6 ? 'split' : ''}">
          <div class="caption">
            <span>Âm · dương</span><span>Họ tên · đời · ngành, chi</span>
          </div>
          ${days.length
            ? days.map(day => this._renderDay(day, true))
            : html`<p class="empty">
                Trong ${UPCOMING_DAYS} ngày tới phả không chép giỗ nào.
              </p>`}
        </div>
      </section>
    `
  }

  _renderMonth(section, lunar, searching) {
    if (searching && section.entries.length === 0) return nothing
    const visible =
      searching ||
      this._tab === TAB_ALL ||
      this._tab === TAB_MONTH(section.month)
    const nextYear = canChiYear(section.lunarYear + 1)
    const span = lunarMonthSpan(section.month, section.lunarYear)
    return html`
      <section
        class="month"
        id="${TAB_MONTH(section.month)}"
        role="${searching ? nothing : 'tabpanel'}"
        aria-labelledby="${searching
          ? nothing
          : `tab-${TAB_MONTH(section.month)}`}"
        style="order: ${(section.month - lunar.month + 12) % 12}"
        ?hidden=${!visible}
      >
        <h3>
          Tháng ${section.name}
          <span class="sub"
            >âm lịch · năm ${section.yearName} ·
            ${formatSolarSpan(span.first, span.last)} dương lịch ·
            ${section.entries.length}
            giỗ${section.current ? ' · tháng này' : ''}</span
          >
        </h3>
        <div
          class="days heritage-frame ${section.days.length > 6 ? 'split' : ''}"
        >
          <div class="caption">
            <span>Âm · dương</span><span>Họ tên · đời · ngành, chi</span>
          </div>
          ${section.days.length === 0
            ? html`<p class="empty">Phả chưa chép giỗ nào trong tháng này.</p>`
            : section.days.map(
                (day, index) =>
                  html`${index === section.nextYearFrom
                    ? html`<div class="year-break">
                        Đã qua trong năm nay, lần giỗ tới thuộc năm ${nextYear}
                        (${section.lunarYear + 1})
                      </div>`
                    : nothing}${this._renderDay(day, false)}`
              )}
        </div>
      </section>
    `
  }

  _renderDay(day, withMonth) {
    const classes = ['day']
    if (day.daysAway === 0) classes.push('today')
    else if (day.daysAway > 0 && day.daysAway <= 7) classes.push('soon')
    const [d, m, y] = day.solar
    const label =
      `Ngày ${day.day} tháng ${lunarMonthName(day.month)} âm lịch, ` +
      `${WEEKDAY_LONG[
        new Date(y, m - 1, d).getDay()
      ].toLowerCase()} ${d}/${m}/${y}`
    return html`
      <div class="${classes.join(' ')}">
        <div class="when" aria-label="${label}">
          <strong>${withMonth ? `${day.day}/${day.month}` : day.day}</strong>
          <small>${formatSolarShort(day.solar)}</small>
          ${day.daysAway >= 0 && day.daysAway <= UPCOMING_DAYS
            ? html`<span class="due"
                >${this._daysAwayLabel(day.daysAway)}</span
              >`
            : nothing}
        </div>
        <div class="people">
          ${day.entries.map(entry => this._renderEntry(entry))}
        </div>
      </div>
    `
  }

  _renderEntry({person, name, generation}) {
    const branch = formatBranch(getBranch(person.extended?.tags))
    return html`
      <a class="row" href="/person/${person.gramps_id}">
        <span class="name">${name}</span>
        <span class="meta">
          ${generation
            ? html`<span class="gen"
                >${this._('Generation')} ${generation}</span
              >`
            : nothing}${branch
            ? html`<span class="branch">${branch}</span>`
            : nothing}
        </span>
      </a>
    `
  }

  _daysAwayLabel(days) {
    if (days === 0) return this._('Today')
    if (days === 1) return this._('Tomorrow')
    return this._('in %s days', days)
  }

  _download() {
    const ics = buildGioIcs(this._entries, {
      baseUrl: window.location.origin,
      domain: window.location.hostname || 'phahe.troly.me',
    })
    const blob = new Blob([ics], {type: 'text/calendar;charset=utf-8'})
    const href = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = href
    link.download = 'lich-gio.ics'
    document.body.appendChild(link)
    link.click()
    link.remove()
    setTimeout(() => URL.revokeObjectURL(href), 10000)
  }
}

window.customElements.define('grampsjs-view-lich-gio', GrampsjsViewLichGio)
