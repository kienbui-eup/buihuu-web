import {afterEach, describe, expect, it, vi} from 'vitest'
import '../../src/components/GrampsjsObjectPreview.js'

const profile = (handle, name) => ({handle, name_given: name, name_surname: ''})
const anchorRect = {left: 500, right: 680, top: 200, bottom: 280}
const fixture = () => ({
  handle: 'sample',
  gramps_id: 'sample',
  primary_name: {first_name: 'Người mẫu'},
  attribute_list: [
    {type: 'Đời', value: '7'},
    {type: 'Ngày giỗ', value: '12/3'},
  ],
  alternate_names: [{type: 'Tự', first_name: 'Tên tự mẫu'}],
  profile: {
    ...profile('sample', 'Người mẫu'),
    death: {date: 'Giỗ ngày 12/3'},
    primary_parent_family: {
      father: profile('father', 'Cha mẫu'),
      mother: profile('mother', 'Mẹ mẫu'),
    },
    families: [
      {
        father: profile('sample', 'Người mẫu'),
        mother: profile('spouse', 'Người phối ngẫu'),
        children: [
          profile('a', 'Con mẫu A'),
          profile('b', 'Con mẫu B'),
          profile('c', 'Con mẫu C'),
        ],
      },
    ],
  },
})

afterEach(() => {
  document.body.innerHTML = ''
  vi.useRealTimers()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

async function preview(
  apiGet = vi.fn().mockResolvedValue({data: [fixture()]})
) {
  const element = document.createElement('grampsjs-object-preview')
  element.appState = {
    apiGet,
    i18n: {lang: 'vi', strings: {}},
    dbInfo: {tree: {id: 'sample-tree'}},
  }
  document.body.append(element)
  await element.updateComplete
  return element
}

describe('xem nhanh gia phả', () => {
  it('ô người bị vẽ lại không để popup kẹt khi thiếu mouseleave', async () => {
    const element = await preview()
    const anchor = document.createElement('div')
    document.body.append(anchor)
    element._showPreview({
      objectType: 'person',
      grampsId: 'sample',
      anchorRect,
      anchorElement: anchor,
    })
    await element.updateComplete
    element._mouseInPopup = true
    anchor.remove()
    await vi.waitFor(() => expect(element._visible).toBe(false))
  })

  it('con trỏ rời cả ô người lẫn popup sẽ đóng dù cờ mouseenter bị kẹt', async () => {
    vi.useFakeTimers()
    const element = await preview()
    element._showPreview({objectType: 'person', grampsId: 'sample', anchorRect})
    await element.updateComplete
    element._mouseInPopup = true
    for (let i = 0; i < 3; i += 1) {
      window.dispatchEvent(
        new MouseEvent('pointermove', {clientX: 20 + i, clientY: 20})
      )
      vi.advanceTimersByTime(100)
    }
    expect(element._visible).toBe(false)
  })

  it('hủy popup chờ mở nếu con trỏ đã đi khỏi ô hoặc ô bị xóa', async () => {
    vi.useFakeTimers()
    const element = await preview()
    element._handleShow({
      detail: {objectType: 'person', grampsId: 'sample', anchorRect},
    })
    window.dispatchEvent(
      new MouseEvent('pointermove', {clientX: 20, clientY: 20})
    )
    vi.advanceTimersByTime(500)
    expect(element.appState.apiGet).not.toHaveBeenCalled()
    const anchor = document.createElement('div')
    document.body.append(anchor)
    element._handleShow({
      detail: {
        objectType: 'person',
        grampsId: 'sample',
        anchorRect,
        anchorElement: anchor,
      },
    })
    anchor.remove()
    vi.advanceTimersByTime(500)
    expect(element._visible).toBe(false)
    expect(element.appState.apiGet).not.toHaveBeenCalled()
  })

  it('đóng khi con trỏ rời cửa sổ hoặc cửa sổ mất focus', async () => {
    const element = await preview()
    element._visible = true
    window.dispatchEvent(new MouseEvent('pointerout', {relatedTarget: null}))
    expect(element._visible).toBe(false)
    element._visible = true
    window.dispatchEvent(new Event('blur'))
    expect(element._visible).toBe(false)
  })

  it('hiển thị đời, ngày giỗ và quan hệ, không nhúng trang hồ sơ đầy đủ', async () => {
    const element = await preview()
    element._showPreview({objectType: 'person', grampsId: 'sample', anchorRect})
    await element.updateComplete
    await element.updateComplete
    const summary = element.shadowRoot.querySelector('grampsjs-person-preview')
    await summary.updateComplete
    const text = summary.shadowRoot.textContent
    expect(text).toContain('Đời 7')
    expect(text).toContain('12/3 âm lịch')
    expect(text).toContain('Cha mẫu')
    expect(text).toContain('Người phối ngẫu')
    expect(text).toContain('Con (3)')
    expect(text).toContain('và 1 người khác')
    expect(text).not.toContain('Con mẫu C')
    expect(summary.shadowRoot.querySelectorAll('dt').length).toBe(5)
    expect(element.shadowRoot.querySelector('grampsjs-person')).toBeNull()
    const url = new URL(
      element.appState.apiGet.mock.calls[0][0],
      'http://localhost'
    )
    expect(url.searchParams.get('profile')).toBe('families')
    expect(url.searchParams.has('extend')).toBe(false)
    expect(url.searchParams.has('backlinks')).toBe(false)
    element._showPreview({objectType: 'person', grampsId: 'sample', anchorRect})
    expect(element.appState.apiGet).toHaveBeenCalledTimes(1)
  })

  it('bỏ dòng thiếu dữ liệu, không suy đoán quan hệ hay tình trạng còn sống', async () => {
    const element = document.createElement('grampsjs-person-preview')
    element.data = {profile: profile('sparse', 'Người mẫu ít thông tin')}
    document.body.append(element)
    await element.updateComplete
    expect(element.shadowRoot.querySelector('h3').textContent).toContain(
      'Người mẫu ít thông tin'
    )
    expect(element.shadowRoot.querySelector('dl')).toBeNull()
  })

  it('giữ các con trùng tên, loại trùng theo handle giữa nhiều gia đình', async () => {
    const element = document.createElement('grampsjs-person-preview')
    const data = fixture()
    data.profile.families[0].children = [
      profile('a', 'Con mẫu'),
      profile('b', 'Con mẫu'),
    ]
    data.profile.families.push(data.profile.families[0])
    element.data = data
    document.body.append(element)
    await element.updateComplete
    expect(element.shadowRoot.textContent).toContain('Con (2)')
    expect(element.shadowRoot.textContent).toContain('Con mẫu, Con mẫu')
  })

  it('đặt cạnh ô người và giữ popup trong màn hình ở các mép', async () => {
    vi.stubGlobal('innerWidth', 1440)
    vi.stubGlobal('innerHeight', 900)
    const element = await preview()
    element._visible = true
    element._anchorRect = anchorRect
    vi.spyOn(
      element.shadowRoot.querySelector('#popup'),
      'getBoundingClientRect'
    ).mockReturnValue({width: 320, height: 300})
    element._position()
    expect(element._x).toBe(688)
    expect(element._y).toBe(200)
    element._anchorRect = {left: 1250, right: 1430, top: 820, bottom: 890}
    element._position()
    expect(element._x).toBe(922)
    expect(element._y + 300).toBeLessThanOrEqual(892)
    vi.stubGlobal('innerWidth', 390)
    vi.stubGlobal('innerHeight', 400)
    element._anchorRect = {left: 100, right: 280, top: 180, bottom: 260}
    element._position()
    expect(element._x).toBeGreaterThanOrEqual(8)
    expect(element._y).toBeGreaterThanOrEqual(8)
    expect(element._x + 320).toBeLessThanOrEqual(382)
    expect(element._y + 300).toBeLessThanOrEqual(392)
  })

  it('đáp ứng cũ không ghi đè người vừa hover; lỗi tải hiện thông báo', async () => {
    let resolveOld
    const apiGet = vi
      .fn()
      .mockImplementationOnce(
        () =>
          new Promise(resolve => {
            resolveOld = resolve
          })
      )
      .mockResolvedValueOnce({data: [{...fixture(), gramps_id: 'new'}]})
      .mockRejectedValueOnce(new Error('offline'))
    const element = await preview(apiGet)
    element._showPreview({objectType: 'person', grampsId: 'old', anchorRect})
    element._showPreview({objectType: 'person', grampsId: 'new', anchorRect})
    await element.updateComplete
    resolveOld({data: [{...fixture(), gramps_id: 'old'}]})
    await element.updateComplete
    expect(element._data.gramps_id).toBe('new')
    element._showPreview({objectType: 'person', grampsId: 'error', anchorRect})
    await element.updateComplete
    await element.updateComplete
    expect(element._loading).toBe(false)
    expect(element.shadowRoot.querySelector('.status').textContent).toContain(
      'Chưa tải được'
    )
  })

  it('Escape hủy cả popup chờ mở và không bật lại sau điều hướng', async () => {
    vi.useFakeTimers()
    const element = await preview()
    element._handleShow({
      detail: {objectType: 'person', grampsId: 'sample', anchorRect},
    })
    window.dispatchEvent(new KeyboardEvent('keydown', {key: 'Escape'}))
    vi.advanceTimersByTime(500)
    expect(element._visible).toBe(false)
    expect(element.appState.apiGet).not.toHaveBeenCalled()
    element._handleShow({
      detail: {objectType: 'person', grampsId: 'sample', anchorRect},
    })
    window.dispatchEvent(new CustomEvent('nav'))
    vi.advanceTimersByTime(500)
    expect(element._visible).toBe(false)
  })

  it('rời popup sẽ đóng, click ngoài đóng ngay, chạm không mở hover', async () => {
    vi.useFakeTimers()
    const element = await preview()
    element._visible = true
    element._handlePopupMouseEnter()
    element._handleHide()
    vi.advanceTimersByTime(500)
    expect(element._visible).toBe(true)
    element._handlePopupMouseLeave()
    vi.advanceTimersByTime(500)
    expect(element._visible).toBe(false)
    element._visible = true
    window.dispatchEvent(new Event('pointerdown'))
    expect(element._visible).toBe(false)
    vi.spyOn(window, 'matchMedia').mockReturnValue({matches: true})
    element._handleShow({
      detail: {objectType: 'person', grampsId: 'sample', anchorRect},
    })
    vi.advanceTimersByTime(500)
    expect(element._visible).toBe(false)
  })
})
