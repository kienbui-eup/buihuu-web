import {describe, expect, it} from 'vitest'
import {TreeChart} from '../../src/charts/TreeChart.js'

const node = (id, children = []) => ({
  id,
  name_given: `Người mẫu ${id}`,
  name_surname: '',
  person: {gramps_id: id, gender: 1, profile: {}},
  children,
})

const settings = {
  bboxWidth: 1200,
  bboxHeight: 900,
  getImageUrl: () => '',
  childrenTriangle: false,
}

function position(svg, id) {
  const card = svg.querySelector(`.person-card[id="${id}"]`)
  return card.parentNode
    .getAttribute('transform')
    .match(/[-\d.]+/g)
    .map(Number)
}

describe('biểu đồ cây từ trên xuống', () => {
  it('đặt con dưới cha mẹ, giữ anh chị em cùng hàng và không chồng ô', () => {
    const data = node('root', [node('a'), node('b', [node('c')]), node('d')])
    const svg = TreeChart(data, null, settings)
    const [, rootY] = position(svg, 'root')
    const [ax, ay] = position(svg, 'a')
    const [bx, by] = position(svg, 'b')
    const [dx, dy] = position(svg, 'd')
    expect(ay - rootY).toBeGreaterThan(90)
    expect(by).toBe(ay)
    expect(dy).toBe(ay)
    expect(bx - ax).toBeGreaterThan(190)
    expect(dx - bx).toBeGreaterThan(190)
    expect(position(svg, 'c')[1] - by).toBeGreaterThan(90)
  })

  it('đặt tổ tiên trên người đang xem', () => {
    const svg = TreeChart(
      null,
      node('root', [node('parent', [node('grandparent')])]),
      settings
    )
    const [rootX, rootY] = position(svg, 'root')
    const [parentX, parentY] = position(svg, 'parent')
    const [grandparentX, grandparentY] = position(svg, 'grandparent')
    expect(grandparentY).toBeLessThan(parentY)
    expect(parentY).toBeLessThan(rootY)
    expect(parentX).toBe(rootX)
    expect(grandparentX).toBe(rootX)
  })

  it('đồng hồ cát nối tổ tiên ở trên và con cháu ở dưới qua một ô gốc', () => {
    const svg = TreeChart(
      node('root', [node('child')]),
      node('root', [node('parent')]),
      settings
    )
    expect(svg.querySelectorAll('.tree-root .person-card')).toHaveLength(1)
    expect(position(svg, 'root')).toEqual([0, 0])
    expect(position(svg, 'parent')[1]).toBeLessThan(0)
    expect(position(svg, 'child')[1]).toBeGreaterThan(0)
    expect(svg.querySelectorAll('.tree-link')).toHaveLength(2)
  })

  it.each([false, true])(
    'đường nối chạm mép trên/dưới của ô (tổ tiên: %s)',
    ancestors => {
      const data = node('root', [node('relative')])
      const svg = TreeChart(
        ancestors ? null : data,
        ancestors ? data : null,
        settings
      )
      const path = svg.querySelector('.tree-link').getAttribute('d')
      const numbers = path.match(/-?\d+(?:\.\d+)?/g).map(Number)
      const direction = ancestors ? -1 : 1
      expect(numbers.slice(0, 2)).toEqual([0, direction * 45])
      expect(numbers.slice(-2)).toEqual([
        0,
        position(svg, 'relative')[1] - direction * 45,
      ])
    }
  )

  it.each([false, true])(
    'mũi tên mở họ hàng nằm đúng phía dọc (tổ tiên: %s)',
    ancestors => {
      const svg = TreeChart(
        ancestors ? null : node('root'),
        ancestors ? node('root') : null,
        {
          ...settings,
          childrenTriangle: true,
        }
      )
      const triangle = svg.querySelector('#triangle-children')
      expect(triangle.getAttribute('transform')).toBe(
        ancestors ? 'translate(0,59) rotate(180)' : 'translate(0,-59) rotate(0)'
      )
    }
  )
})
