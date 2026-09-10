import {describe, it, expect} from 'vitest'
import {create} from 'd3-selection'
import {appendPersonCardDecoration} from '../../src/charts/heritageFrame.js'

describe('nhãn sống/mất trên thẻ phả đồ', () => {
  it('ghi rõ người đã mất, không khẳng định còn sống khi thiếu thông tin', () => {
    const svg = create('svg')
    const nodes = svg.selectAll('g').data([true, false]).join('g')
    appendPersonCardDecoration(nodes, 204, 90, {
      deceased: d => d,
      portraitUrl: () => '',
    })
    const cards = nodes.nodes()
    expect(cards[0].querySelector('.life-status').textContent).toBe('Đã mất')
    expect(cards[1].querySelector('.life-status').textContent).toBe('Chưa rõ')
    expect(cards[1].querySelector('title').textContent).toContain(
      'chưa xác nhận còn sống'
    )
    cards.forEach(card => {
      expect(card.lastElementChild.classList.contains('life-status')).toBe(true)
      expect(Number(card.lastElementChild.getAttribute('y'))).toBeLessThan(90)
    })
  })
})
