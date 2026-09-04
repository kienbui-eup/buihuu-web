import {fireEvent} from './util.js'

/*
Tìm kiếm trên trang: nút kính lúp ở header, mục Tìm kiếm ở thanh dưới, phím
tắt và ô tìm trên trang chủ dùng chung một lối.

Trang nào có ô tìm riêng (phả đồ, lịch giỗ) bắt sự kiện page:search và
tự mở ô của mình. Mọi trang khác dẫn về ô tìm tên trên trang Người trong họ:
câu hỏi của con cháu gần như luôn là "ông X ở đời mấy, chi nào", nên không
cần trang tìm kiếm riêng của bản gốc (trang đó vẫn còn ở /search cho người
biên soạn, mở từ nhóm Tư liệu & nghiên cứu trong menu tài khoản).
*/

// Yêu cầu tìm người đang chờ trang Người trong họ nhận: view chưa chắc đã
// được tạo lúc bấm nút (view nạp lười khi vào trang lần đầu), nên giữ ở đây
// và view lấy về khi hiện ra.
let pendingPeopleSearch = null

export function openPeopleSearch(target, query = '') {
  pendingPeopleSearch = {query: String(query ?? '').trim()}
  fireEvent(target, 'nav', {path: 'people'})
  // View đã có sẵn thì cập nhật ngay, không chờ lần render kế.
  window.dispatchEvent(new CustomEvent('people:search'))
}

export function takePendingPeopleSearch() {
  const pending = pendingPeopleSearch
  pendingPeopleSearch = null
  return pending
}

export function requestPageSearch(target) {
  const event = new CustomEvent('page:search', {cancelable: true})
  if (window.dispatchEvent(event)) openPeopleSearch(target)
}

export function pageSearchLabel(page) {
  if (page === 'tree') return 'Tìm người trong cây'
  if (page === 'lich-gio') return 'Tìm trong ngày giỗ'
  return 'Tìm người trong họ'
}

export function handleSearchLink(event, target) {
  if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return
  event.preventDefault()
  requestPageSearch(target)
}

// Dấu tổ hợp sau khi tách NFD (U+0300 đến U+036F); viết bằng fromCharCode để
// không có dãy thoát trong nguồn.
const COMBINING_MARKS = new RegExp(
  `[${String.fromCharCode(0x300)}-${String.fromCharCode(0x36f)}]`,
  'g'
)

export function normalizeSearchText(text) {
  return text
    .normalize('NFD')
    .replace(COMBINING_MARKS, '')
    .replace(/đ/gi, 'd')
    .toLowerCase()
    .trim()
}
