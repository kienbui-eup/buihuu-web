import {fireEvent} from './util.js'

// Header, navigation and keyboard shortcuts share the active page's search.
export function requestPageSearch(target) {
  const event = new CustomEvent('page:search', {cancelable: true})
  if (window.dispatchEvent(event)) fireEvent(target, 'nav', {path: 'search'})
}

export function pageSearchLabel(page) {
  if (page === 'tree') return 'Tìm người trong cây'
  if (page === 'lich-gio') return 'Tìm trong ngày giỗ'
  return 'Tìm kiếm'
}

export function handleSearchLink(event, target) {
  if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return
  event.preventDefault()
  requestPageSearch(target)
}

export function normalizeSearchText(text) {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/gi, 'd')
    .toLowerCase()
    .trim()
}
