import {describe, it, expect} from 'vitest'
import {TreeChart} from '../../src/charts/TreeChart.js'
import {chartNameDisplayFormat} from '../../src/util.js'

// Hai cụ thật trong cây: Bùi Pháp Thụy (đời 6) và con là Bùi Ánh tự Pháp Độ.
const phapThuy = {
  gramps_id: 'I0016',
  gender: 1,
  primary_name: {first_name: 'Pháp Thụy'},
  alternate_names: [],
  attribute_list: [
    {type: 'Đời', value: '6'},
    {type: 'Ngôi vị', value: 'Chi 2'},
  ],
  profile: {name_given: 'Pháp Thụy', name_surname: 'Bùi'},
}

const buiAnh = {
  gramps_id: 'I0028',
  gender: 1,
  primary_name: {first_name: 'Ánh'},
  alternate_names: [{type: 'Tự', first_name: 'Pháp Độ'}],
  attribute_list: [
    {type: 'Đời', value: '7'},
    {type: 'Ngôi vị', value: 'Chi phái 1'},
    {type: 'Ngày giỗ', value: '4/3'},
  ],
  profile: {
    name_given: 'Ánh',
    name_surname: 'Bùi',
    death: {date: 'Giỗ ngày 4 tháng 3 âm lịch'},
  },
}

const treeData = {
  name_given: 'Pháp Thụy',
  name_surname: 'Bùi',
  id: 'p',
  depth: 0,
  person: phapThuy,
  children: [
    {
      name_given: 'Ánh',
      name_surname: 'Bùi',
      id: 'pc0',
      depth: 1,
      person: buiAnh,
    },
  ],
}

const settings = {
  nDesc: 2,
  nAnc: 0,
  bboxWidth: 800,
  bboxHeight: 600,
  getImageUrl: () => '',
  nameDisplayFormat: chartNameDisplayFormat.surnameThenGiven,
  canEdit: false,
}

const cardTexts = svg =>
  [...svg.querySelectorAll('text.card-line')].map(node => node.textContent)

describe('ô người trong biểu đồ cây', () => {
  it('viết họ tên liền một dòng thay vì tách họ và tên', () => {
    const svg = TreeChart(treeData, null, settings)
    const texts = cardTexts(svg)
    expect(texts).toContain('Bùi Pháp Thụy')
    expect(texts).toContain('Bùi Ánh')
    // Dòng chỉ có mỗi họ là thứ phải biến mất: trong một cuốn phả hệ một dòng
    // họ, nó lặp lại ở mọi ô mà không nói thêm điều gì.
    expect(texts).not.toContain('Bùi')
  })

  it('hiện tên tự, đời kèm chi, và ngày giỗ âm lịch', () => {
    const svg = TreeChart(treeData, null, settings)
    const texts = cardTexts(svg)
    expect(texts).toContain('tự Pháp Độ')
    expect(texts).toContain('Đời 7 · Chi phái 1')
    expect(texts).toContain('Giỗ 4/3 ÂL')
  })

  it('không vẽ dòng rỗng cho người thiếu dữ liệu', () => {
    const svg = TreeChart(treeData, null, settings)
    expect(cardTexts(svg).every(text => text.length > 0)).toBe(true)
    // Cụ Pháp Thụy chỉ có tên và đời: đúng hai dòng, không phải bốn.
    expect(cardTexts(svg).filter(t => t.startsWith('Đời 6')).length).toBe(1)
  })

  it('căn giữa các dòng theo chiều cao ô', () => {
    const svg = TreeChart(treeData, null, settings)
    const ys = [...svg.querySelectorAll('text.card-line')].map(node =>
      Number(node.getAttribute('y'))
    )
    // Ô cao 90, các dòng phải nằm gọn trong nửa trên và nửa dưới quanh tâm 0.
    expect(Math.min(...ys)).toBeGreaterThan(-45)
    expect(Math.max(...ys)).toBeLessThan(45)
  })
})
