import {describe, expect, it} from 'vitest'
import {TreeNavigationHistory} from '../../src/treeNavigation.js'

describe('lịch sử điều hướng phả đồ', () => {
  it('khôi phục đồng thời người và phạm vi khi quay lại', () => {
    const history = new TreeNavigationHistory()
    history.observe('I0001', 'main')
    history.observe('I0100', 'branch')
    history.observe('I0105', 'descendants')

    expect(history.back()).toEqual({grampsId: 'I0100', view: 'branch'})
    expect(history.back()).toEqual({grampsId: 'I0001', view: 'main'})
    expect(history.canBack).toBe(false)
  })

  it('không tạo lượt quay lại khi trạng thái không đổi', () => {
    const history = new TreeNavigationHistory()
    history.observe('I0001', 'main')
    history.observe('I0001', 'main')
    expect(history.canBack).toBe(false)
  })
})
