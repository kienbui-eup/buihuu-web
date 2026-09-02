import {afterEach, describe, expect, it, vi} from 'vitest'
import {GrampsjsViewSearch} from '../../src/views/GrampsjsViewSearch.js'

const result = (id = 'sample-person') => ({
  object_type: 'person',
  object: {
    gramps_id: id,
    primary_name: {first_name: 'Người mẫu', surname_list: []},
    attribute_list: [{type: 'Đời', value: '8'}],
    profile: {},
  },
})

function makeView(
  apiGet = vi.fn().mockResolvedValue({data: [], total_count: '0'})
) {
  const view = new GrampsjsViewSearch()
  view.appState = {apiGet, i18n: {lang: 'vi', strings: {}}, path: {}}
  view._query = 'Người mẫu'
  document.body.append(view)
  return view
}

afterEach(() => {
  document.body.replaceChildren()
  delete window._oldSearchBackend
  vi.useRealTimers()
})

describe('tìm kiếm gia phả', () => {
  it('mặc định tìm người và bỏ khoảng trắng quanh từ khóa', async () => {
    const view = makeView()
    view._query = '  Người mẫu  '
    await view._executeSearch()
    const url = new URL(
      view.appState.apiGet.mock.calls[0][0],
      'http://localhost'
    )
    expect(url.searchParams.get('type')).toBe('person')
    expect(url.searchParams.get('query')).toBe('Người mẫu')
    expect(url.searchParams.get('page')).toBe('1')
    expect(view._submittedQuery).toBe('Người mẫu')
  })

  it('xóa từ khóa vô hiệu hóa phản hồi đang chờ', async () => {
    let finish
    const view = makeView(
      vi.fn(
        () =>
          new Promise(resolve => {
            finish = resolve
          })
      )
    )
    const pending = view._executeSearch()
    view._clearAll()
    finish({data: [result()], total_count: '1'})
    await pending
    expect(view._data).toEqual([])
    expect(view._totalCount).toBe(-1)
    expect(view.loading).toBe(false)
  })

  it('phản hồi tìm cũ không ghi đè lần tìm mới', async () => {
    let finish
    const apiGet = vi
      .fn()
      .mockImplementationOnce(
        () =>
          new Promise(resolve => {
            finish = resolve
          })
      )
      .mockResolvedValueOnce({data: [result('sample-new')], total_count: '1'})
    const view = makeView(apiGet)
    const pending = view._executeSearch()
    await view._executeSearch(1, 'Từ khóa mới')
    finish({data: [result('sample-old')], total_count: '1'})
    await pending
    expect(view._data[0].object.gramps_id).toBe('sample-new')
  })

  it('tìm mới trở về trang đầu và phân trang dùng từ khóa đã gửi', async () => {
    const view = makeView(
      vi.fn().mockResolvedValue({data: [result()], total_count: '42'})
    )
    await view._executeSearch(2)
    view._query = 'Từ khóa chưa gửi'
    await view._changePage(3)
    let url = new URL(view.appState.apiGet.mock.lastCall[0], 'http://localhost')
    expect(url.searchParams.get('query')).toBe('Người mẫu')
    expect(url.searchParams.get('page')).toBe('3')
    await view._executeSearch()
    url = new URL(view.appState.apiGet.mock.lastCall[0], 'http://localhost')
    expect(url.searchParams.get('page')).toBe('1')
    expect(view._page).toBe(1)
  })

  it('đổi nhiều bộ lọc liên tiếp chỉ gửi một yêu cầu và luôn giữ một loại', async () => {
    vi.useFakeTimers()
    const view = makeView()
    view._handleFilterToggle('person')
    expect(view._getSelectedObjectTypes()).toEqual(['person'])
    view._handleFilterToggle('family')
    view._handleFilterToggle('person')
    await vi.advanceTimersByTimeAsync(300)
    expect(view.appState.apiGet).toHaveBeenCalledOnce()
    expect(view.appState.apiGet.mock.calls[0][0]).toContain('type=family')
  })

  it('đổi phạm vi từ thanh điều hướng hủy bộ lọc đang chờ', async () => {
    vi.useFakeTimers()
    const view = makeView()
    view._handleFilterToggle('place')
    view.setSearchScope('family')
    await vi.advanceTimersByTimeAsync(300)
    expect(view.appState.apiGet).not.toHaveBeenCalled()
    expect(view._getSelectedObjectTypes()).toEqual(['family'])
    expect(view._query).toBe('')
  })

  it('đọc ngành chi từ nhãn và không hiện các nhãn biên tập', async () => {
    const entry = result()
    entry.object.tag_list = ['branch', 'editor']
    const view = makeView(
      vi
        .fn()
        .mockResolvedValueOnce({data: [entry], total_count: '1'})
        .mockResolvedValueOnce({
          data: [
            {handle: 'branch', name: 'Ngành mẫu - Chi A'},
            {handle: 'editor', name: 'Đã kiểm tra'},
          ],
        })
    )
    await view._executeSearch()
    expect(view._personLineage(view._data[0].object)).toBe(
      'Đời 8 · Ngành mẫu - Chi A'
    )
    expect(view.appState.apiGet.mock.lastCall[0]).toBe('/api/tags/')
  })

  it('vẫn hiện người khi không tải được nhãn ngành chi', async () => {
    const entry = result()
    entry.object.tag_list = ['branch']
    const view = makeView(
      vi
        .fn()
        .mockResolvedValueOnce({data: [entry], total_count: '1'})
        .mockResolvedValueOnce({error: 'Network error'})
    )
    await view._executeSearch()
    expect(view._data).toHaveLength(1)
    expect(view._personLineage(view._data[0].object)).toBe('Đời 8')
    expect(view.error).toBe(false)
  })

  it('lỗi tìm kiếm bỏ kết quả cũ và có thể thử lại', async () => {
    const view = makeView(
      vi
        .fn()
        .mockResolvedValueOnce({error: 'Network error'})
        .mockResolvedValueOnce({data: [result()], total_count: '1'})
    )
    view._data = [result('old')]
    await view._executeSearch()
    expect(view.error).toBe(true)
    expect(view.loading).toBe(false)
    expect(view._data).toEqual([])
    await view._executeSearch()
    expect(view.error).toBe(false)
    expect(view._data).toHaveLength(1)
  })

  it('giữ bộ lọc đúng với máy chủ tìm kiếm cũ', async () => {
    window._oldSearchBackend = true
    const view = makeView()
    view._objectTypes = {person: true, place: true}
    await view._executeSearch()
    const url = new URL(
      view.appState.apiGet.mock.calls[0][0],
      'http://localhost'
    )
    expect(url.searchParams.get('query')).toBe(
      'Người mẫu (type:person OR type:place)'
    )
    expect(url.searchParams.has('type')).toBe(false)
  })
})
