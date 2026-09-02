import {afterEach, describe, expect, it, vi} from 'vitest'
import '../../src/views/GrampsjsViewSearch.js'
import {searchPlaces} from '../../src/placeSearch.js'

vi.stubGlobal('BASE_DIR', '')

afterEach(() => {
  document.body.replaceChildren()
})

async function createSearch(
  apiGet = vi.fn(async () => ({data: [], total_count: 0}))
) {
  const view = document.createElement('grampsjs-view-search')
  view.appState = {apiGet, i18n: {lang: 'vi', strings: {}}, path: {}}
  view.active = true
  document.body.append(view)
  await view.updateComplete
  const field = view.renderRoot.querySelector('#search-field')
  return {view, field, apiGet}
}

describe('tìm kiếm chung trong gia phả', () => {
  it('focus ô nhập sau khi mở trang và khi quay lại trang', async () => {
    const {view, field} = await createSearch()
    await view._focus()
    expect(view.shadowRoot.activeElement).toBe(field)
    view.active = false
    field.blur()
    await view._focus()
    expect(view.shadowRoot.activeElement).not.toBe(field)
    await view.updateComplete
    view.active = true
    await view.updateComplete
    await view._focus()
    expect(view.shadowRoot.activeElement).toBe(field)
  })

  it('đổi sang địa danh giữ từ khóa và đọc đúng hồ sơ địa chỉ', async () => {
    const {view, field, apiGet} = await createSearch()
    view._query = 'Xã mẫu'
    view._selectScope('place')
    await view.updateComplete
    expect(field.value).toBe('Xã mẫu')
    const url = new URL(apiGet.mock.calls[0][0], 'http://localhost')
    expect(url.pathname).toBe('/api/places/')
    expect(url.searchParams.get('profile')).toBe('all')
  })

  it('xóa từ khóa hủy hiệu lực phản hồi đang chờ', async () => {
    let finish
    const {view} = await createSearch(
      () =>
        new Promise(resolve => {
          finish = resolve
        })
    )
    const pending = view._fetchData('Mẫu', 1)
    view._clearAll()
    finish({data: [{object_type: 'place'}], total_count: 1})
    await pending
    expect(view._data).toEqual([])
    expect(view._totalCount).toBe(-1)
    expect(view.loading).toBe(false)
  })

  it('không tìm chuỗi toàn khoảng trắng', async () => {
    const {view, apiGet} = await createSearch()
    view._query = '   '
    view._executeSearch()
    expect(apiGet).not.toHaveBeenCalled()
    expect(view._totalCount).toBe(-1)
  })

  it('tìm từ khóa mới quay về trang 1 và chỉ gửi một yêu cầu', async () => {
    const {view, apiGet} = await createSearch(
      vi.fn(async () => ({data: [], total_count: 50}))
    )
    view._query = 'Mẫu'
    view._page = 3
    view._totalCount = 50
    await view._executeSearch()
    await view.updateComplete
    expect(view._page).toBe(1)
    expect(apiGet).toHaveBeenCalledOnce()
    expect(apiGet.mock.calls[0][0]).toContain('page=1&')
    view._query = 'Từ khóa chưa gửi'
    await view._executeSearch(2, view._submittedQuery)
    expect(apiGet).toHaveBeenCalledTimes(2)
    expect(apiGet.mock.calls[1][0]).toContain('page=2&')
    expect(
      new URL(apiGet.mock.calls[1][0], 'http://localhost').searchParams.get(
        'query'
      )
    ).toBe('Mẫu')
  })

  it('gửi biểu mẫu tìm kiếm từ bàn phím hoặc nút Tìm', async () => {
    const {view, apiGet} = await createSearch()
    view._query = 'Mẫu'
    view._handleSubmit({preventDefault: vi.fn()})
    expect(apiGet).toHaveBeenCalledOnce()
  })

  it('hiện cấp địa chỉ và tên khác từ hồ sơ, bấm mở đúng mã địa danh', async () => {
    const {view} = await createSearch()
    view._data = [
      {
        object_type: 'place',
        object: {
          gramps_id: 'P_TEST',
          profile: {
            name: 'Địa danh mẫu',
            type: 'Thôn',
            parent_places: [{name: 'Xã mẫu'}, {name: 'Tỉnh mẫu'}],
            alternate_names: ['Tên cũ mẫu'],
          },
        },
      },
    ]
    view._totalCount = 1
    await view.updateComplete
    const item = view.renderRoot.querySelector('.result-link')
    expect(item.textContent).toContain('Xã mẫu, Tỉnh mẫu')
    expect(item.textContent).toContain('Tên khác: Tên cũ mẫu')
    const nav = vi.fn()
    view.addEventListener('nav', nav)
    item.click()
    expect(nav.mock.calls[0][0].detail.path).toBe('place/P_TEST')
  })

  it('tìm không dấu theo xã/tỉnh và tên cũ, không lấy địa danh ngoài phạm vi', () => {
    const places = [
      {
        gramps_id: 'P_TEST',
        profile: {
          name: 'Thôn mẫu',
          parent_places: [
            {name: 'Xã thử', alternate_names: ['Xã cũ']},
            {name: 'Tỉnh mẫu'},
          ],
        },
      },
      {
        gramps_id: 'P_OTHER',
        profile: {name: 'Nơi khác', parent_places: [{name: 'Tỉnh khác'}]},
      },
    ]
    expect(searchPlaces(places, 'xa thu, tinh mau')).toEqual([places[0]])
    expect(searchPlaces(places, 'xa cu')).toEqual([places[0]])
    expect(searchPlaces(places, 'thon mau tinh khac')).toEqual([])
    expect(searchPlaces(places, ' ')).toEqual([])
  })

  it('phân trang địa danh theo kết quả khớp địa chỉ', async () => {
    const places = Array.from({length: 25}, (_, index) => ({
      gramps_id: `P_TEST_${index}`,
      profile: {
        name: `Địa danh mẫu ${index}`,
        parent_places: [{name: 'Xã mẫu'}],
      },
    }))
    const {view} = await createSearch(vi.fn(async () => ({data: places})))
    view.setSearchScope('place')
    await view._executeSearch(2, 'xa mau')
    expect(view._totalCount).toBe(25)
    expect(view._pages).toBe(2)
    expect(view._data).toHaveLength(5)
    expect(view._data[0].object.gramps_id).toBe('P_TEST_20')
  })

  it('ưu tiên đúng tên địa danh trước các nơi có cùng địa chỉ cha', () => {
    const child = {
      profile: {name: 'Thôn mẫu', parent_places: [{name: 'Xã thử'}]},
    }
    const parent = {profile: {name: 'Xã thử'}}
    const places = [child, parent]
    expect(searchPlaces(places, 'xa thu')).toEqual([parent, child])
    expect(places).toEqual([child, parent])
  })

  it('không hiện lại địa chỉ từ phản hồi cũ sau khi đổi sang tìm người', async () => {
    let finish
    const {view} = await createSearch(
      () =>
        new Promise(resolve => {
          finish = resolve
        })
    )
    view.setSearchScope('place')
    const pending = view._executeSearch(1, 'xa mau')
    view.setSearchScope('person')
    finish({data: [{profile: {name: 'Xã mẫu'}}]})
    await pending
    expect(view._data).toEqual([])
    expect(view._totalCount).toBe(-1)
    expect(view.loading).toBe(false)
    expect(view._getSelectedObjectTypes()).toEqual(['person'])
  })
})
