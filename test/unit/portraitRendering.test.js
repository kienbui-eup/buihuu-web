import {describe, it, expect} from 'vitest'
import {create} from 'd3-selection'
import {appendPersonCardDecoration} from '../../src/charts/heritageFrame.js'
import {TreeChart} from '../../src/charts/TreeChart.js'

const decorate = () => {
  const svg = create('svg')
  const nodes = svg.selectAll('g').data(['unknown', 'female', 'male']).join('g')
  appendPersonCardDecoration(nodes, 204, 90, {gender: d => d})
  return svg.node()
}

describe('khung ảnh trong thẻ người', () => {
  it('giữ đúng vùng cắt khi có người chưa rõ giới tính', () => {
    const svg = decorate()
    for (const img of svg.querySelectorAll('image')) {
      const clip = img.parentNode.querySelector('clipPath')
      expect(img.getAttribute('clip-path')).toBe(`url(#${clip.id})`)
    }
  })

  it('không trùng mã vùng cắt giữa các biểu đồ', () => {
    const ids = [decorate(), decorate()].flatMap(svg =>
      [...svg.querySelectorAll('[id]')].map(node => node.id)
    )
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('ảnh thật vừa khung và không tham chiếu nhầm ảnh của cây khác', () => {
    const data = {
      id: 'p',
      name_given: 'Mẫu',
      name_surname: 'Kiểm thử',
      person: {gender: 1, gramps_id: 'TEST', profile: {}},
    }
    const settings = {
      nDesc: 1,
      nAnc: 0,
      bboxWidth: 800,
      bboxHeight: 600,
      getImageUrl: () => '/test-portrait.jpg',
    }
    const svgs = [
      TreeChart(data, null, settings),
      TreeChart(data, null, settings),
    ]
    const ids = svgs.flatMap(svg =>
      [...svg.querySelectorAll('pattern')].map(p => p.id)
    )
    expect(new Set(ids).size).toBe(ids.length)
    for (const svg of svgs) {
      const pattern = svg.querySelector('pattern')
      expect(pattern.getAttribute('viewBox')).toBe('0 0 1 1')
      const img = pattern.querySelector('image')
      expect(img.getAttribute('width')).toBe('1')
      expect(img.getAttribute('height')).toBe('1')
      expect(img.getAttribute('preserveAspectRatio')).toBe('xMidYMid slice')
      expect(
        svg.querySelector('.living-avatar-photo').getAttribute('fill')
      ).toBe(`url(#${pattern.id})`)
    }
  })
})
