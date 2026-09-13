import {afterEach, describe, expect, it, vi} from 'vitest'
import '../../src/components/GrampsjsLineageChart.js'

afterEach(() => {
  document.body.replaceChildren()
  vi.unstubAllGlobals()
})

describe('ảnh hồ sơ trên phả đồ nhánh chính', () => {
  it.each([false, true])('ưu tiên ảnh hồ sơ, đã mất: %s', async deceased => {
    vi.stubGlobal('__APIHOST__', '')
    const chart = document.createElement('grampsjs-lineage-chart')
    chart.grampsId = 'TEST'
    chart.appState = {i18n: {strings: {}}}
    const person = {
      handle: 'test-person',
      gramps_id: 'TEST',
      gender: 1,
      profile: {name_given: 'Người mẫu', ...(deceased ? {death: {}} : {})},
      media_list: [{ref: 'test-photo', rect: [10, 5, 90, 95]}],
    }
    chart.data = [person]
    document.body.append(chart)
    await chart.updateComplete
    const svg = chart.shadowRoot.querySelector('svg')
    expect(svg.querySelector('pattern image').getAttribute('href')).toContain(
      '/api/media/test-photo/cropped/10/5/90/95/thumbnail/100'
    )
    expect(
      svg.querySelector('.living-avatar-image, .memorial-portrait-image')
    ).toBeNull()

    chart.data = [{...person, media_list: []}]
    await chart.updateComplete
    expect(
      chart.shadowRoot.querySelector(
        '.living-avatar-image, .memorial-portrait-image'
      )
    ).not.toBeNull()
    expect(
      chart.shadowRoot.querySelector('.living-avatar-photo, .memorial-photo')
    ).toBeNull()
  })
})
