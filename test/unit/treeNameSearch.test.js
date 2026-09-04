import {afterEach, describe, expect, it, vi} from 'vitest'

import '../../src/components/GrampsjsObjectPickerDialog.js'
import '../../src/components/GrampsjsChartToolbar.js'

afterEach(() => document.body.replaceChildren())

describe('tìm theo tên trên phả đồ', () => {
  it('nút tìm gửi đúng thao tác cho phả đồ', () => {
    const toolbar = document.createElement('grampsjs-chart-toolbar')
    const onAction = vi.fn()
    toolbar.state = {view: 'main', onAction}

    toolbar._act('search')

    expect(onAction).toHaveBeenCalledWith('search', undefined)
  })

  it('tìm người bằng quy tắc tên và đổi kết quả sang dạng danh sách chọn', async () => {
    const apiGet = vi.fn(async () => ({
      data: [
        {
          handle: 'person-test',
          gramps_id: 'TEST-1',
          profile: {name_given: 'Tên mẫu', name_surname: 'Họ A'},
        },
      ],
    }))
    const picker = document.createElement('grampsjs-object-picker-dialog')
    picker.appState = {i18n: {lang: 'vi', strings: {}}, apiGet}
    picker._fetchId = 4

    await picker._fetchNameData('ho ten', 4)

    const url = new URL(apiGet.mock.calls[0][0], 'https://example.test')
    const {rules} = JSON.parse(url.searchParams.get('rules'))
    expect(url.pathname).toBe('/api/people/')
    expect(rules).toHaveLength(2)
    expect(rules.every(rule => rule.name === 'RegExpName')).toBe(true)
    expect(picker._data).toEqual([
      {
        object_type: 'person',
        object: expect.objectContaining({gramps_id: 'TEST-1'}),
        handle: 'person-test',
      },
    ])
  })

  it('không gọi máy chủ khi chưa gõ tên', async () => {
    const apiGet = vi.fn()
    const picker = document.createElement('grampsjs-object-picker-dialog')
    picker.appState = {i18n: {lang: 'vi', strings: {}}, apiGet}
    picker._fetchId = 2

    await picker._fetchNameData('   ', 2)

    expect(apiGet).not.toHaveBeenCalled()
    expect(picker._data).toEqual([])
  })
})
