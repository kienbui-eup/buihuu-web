import {afterEach, describe, expect, it} from 'vitest'
import {zoomIdentity} from 'd3-zoom'
import '../../src/components/GrampsjsTreeChart.js'
import '../../src/views/GrampsjsViewDescendantChart.js'

const person = id => ({
  handle: id,
  gramps_id: id,
  gender: 1,
  profile: {name_given: `Người mẫu ${id}`, name_surname: ''},
})

async function makeChart() {
  const chart = document.createElement('grampsjs-tree-chart')
  chart.data = [person('TEST-A'), person('TEST-B')]
  chart.grampsId = 'TEST-A'
  chart.descendants = true
  chart.appState = {i18n: {strings: {}}}
  document.body.append(chart)
  await chart.updateComplete
  return chart
}

const svgOf = chart => chart.shadowRoot.querySelector('svg')

afterEach(() => document.body.replaceChildren())

describe('khung nhìn khi tìm người trong biểu đồ', () => {
  it('giữ cả viewBox lẫn mức kéo/phóng khi vẽ lại cùng người', async () => {
    const chart = await makeChart()
    const viewport = '-100 -200 900 700'
    const transform = zoomIdentity.translate(-600, 320).scale(2)
    svgOf(chart).setAttribute('viewBox', viewport)
    svgOf(chart).__zoom = transform
    chart.canEdit = true
    await chart.updateComplete
    expect(svgOf(chart).getAttribute('viewBox')).toBe(viewport)
    expect(svgOf(chart).__zoom).toEqual(transform)
  })

  it('bỏ khung nhìn của người cũ khi chuyển sang người khác', async () => {
    const chart = await makeChart()
    svgOf(chart).__zoom = zoomIdentity.translate(-600, 320).scale(2)
    chart.grampsId = 'TEST-B'
    await chart.updateComplete
    expect(svgOf(chart).__zoom).toEqual(zoomIdentity)
    expect(chart._focusPending).toBe(true)
  })

  it('đợi dữ liệu của người vừa chọn rồi mới focus', async () => {
    const chart = await makeChart()
    chart.grampsId = 'TEST-C'
    await chart.updateComplete
    expect(svgOf(chart)).toBeNull()
    expect(chart._focusPending).toBe(true)
    chart.data = [person('TEST-C')]
    await chart.updateComplete
    expect(svgOf(chart).querySelector('.tree-root .person-card')).not.toBeNull()
    expect(svgOf(chart).__zoom).toEqual(zoomIdentity)
    expect(chart._focusPending).toBe(true)
  })

  it('tìm lại người đang xem cũng bỏ vị trí đã kéo ra xa', async () => {
    const chart = await makeChart()
    svgOf(chart).__zoom = zoomIdentity.translate(-600, 320).scale(2)
    chart.focusPerson()
    await chart.updateComplete
    expect(svgOf(chart).__zoom).toEqual(zoomIdentity)
    expect(chart._focusPending).toBe(true)
  })
})

describe('dữ liệu khi tìm liên tiếp nhiều người', () => {
  it('bỏ kết quả cũ về muộn để không ghi đè người vừa chọn', async () => {
    const view = document.createElement('grampsjs-view-descendant-chart')
    const requests = []
    view.appState = {
      i18n: {lang: 'vi', strings: {}},
      apiGet: () =>
        new Promise(resolve => {
          requests.push(resolve)
        }),
    }
    const oldRequest = view._fetchData('TEST-A')
    const newRequest = view._fetchData('TEST-B')
    requests[1]({data: [person('TEST-B')]})
    await newRequest
    requests[0]({data: [person('TEST-A')]})
    await oldRequest
    expect(view._data.map(p => p.gramps_id)).toEqual(['TEST-B'])
  })

  it('phản hồi cũ không kết thúc trạng thái chờ của người mới', async () => {
    const view = document.createElement('grampsjs-view-descendant-chart')
    const requests = []
    view.appState = {
      i18n: {lang: 'vi', strings: {}},
      apiGet: () =>
        new Promise(resolve => {
          requests.push(resolve)
        }),
    }
    const oldRequest = view._fetchData('TEST-A')
    const newRequest = view._fetchData('TEST-B')
    requests[0]({error: 'Lỗi yêu cầu cũ'})
    await oldRequest
    expect(view.loading).toBe(true)
    expect(view.error).toBe(false)
    requests[1]({data: [person('TEST-B')]})
    await newRequest
    expect(view.loading).toBe(false)
    expect(view._data.map(p => p.gramps_id)).toEqual(['TEST-B'])
  })
})
