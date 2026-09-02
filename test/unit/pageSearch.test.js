import {describe, expect, it, vi} from 'vitest'
import {
  requestPageSearch,
  handleSearchLink,
  normalizeSearchText,
} from '../../src/pageSearch.js'
import '../../src/views/GrampsjsViewSearch.js'

describe('tìm kiếm theo trang', () => {
  it('ưu tiên trang đang xem, không điều hướng khi trang đã nhận tìm kiếm', () => {
    const target = new EventTarget()
    const nav = vi.fn()
    target.addEventListener('nav', nav)
    const localSearch = vi.fn(event => event.preventDefault())
    window.addEventListener('page:search', localSearch, {once: true})
    requestPageSearch(target)
    expect(localSearch).toHaveBeenCalledOnce()
    expect(nav).not.toHaveBeenCalled()
  })

  it('mở tìm kiếm chung nếu không có trang nhận yêu cầu', () => {
    const target = new EventTarget()
    const nav = vi.fn()
    target.addEventListener('nav', nav)
    requestPageSearch(target)
    expect(nav.mock.calls[0][0].detail).toEqual({path: 'search'})
  })

  it('giữ thao tác mở liên kết trong tab mới', () => {
    const event = {ctrlKey: true, preventDefault: vi.fn()}
    handleSearchLink(event, new EventTarget())
    expect(event.preventDefault).not.toHaveBeenCalled()
  })

  it('lọc tên tiếng Việt có dấu, không dấu và dấu tách rời', () => {
    expect(normalizeSearchText('  Đỗ Mẫu  ')).toBe('do mau')
    expect(normalizeSearchText('Đỗ Mẫu'.normalize('NFD'))).toBe('do mau')
  })

  it('đổi phạm vi không giữ kết quả của loại dữ liệu trước', () => {
    const view = document.createElement('grampsjs-view-search')
    view.renderRoot = document.createDocumentFragment()
    view._data = [{object_type: 'person'}]
    view.setSearchScope('place')
    expect(view._getSelectedObjectTypes()).toEqual(['place'])
    expect(view._data).toEqual([])
    view.setSearchScope()
    expect(view._getSelectedObjectTypes()).toContain('person')
    expect(view._getSelectedObjectTypes()).toContain('place')
  })

  it('bỏ phản hồi cũ nếu người dùng đã chuyển sang phạm vi khác', async () => {
    const view = document.createElement('grampsjs-view-search')
    view.renderRoot = document.createDocumentFragment()
    let finish
    view.appState = {
      apiGet: () =>
        new Promise(resolve => {
          finish = resolve
        }),
      i18n: {lang: 'vi'},
    }
    const pending = view._fetchData('Mẫu', 1)
    view.setSearchScope('place')
    finish({data: [{object_type: 'person'}], total_count: 1})
    await pending
    expect(view._data).toEqual([])
    expect(view._getSelectedObjectTypes()).toEqual(['place'])
  })
})
