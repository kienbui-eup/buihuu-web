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
  extended: {tags: [{name: 'Ngành 2 - Chi 1'}]},
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

  it('chỉ hiện đời, ngành và chi', () => {
    const svg = TreeChart(treeData, null, settings)
    const texts = cardTexts(svg)
    expect(texts).not.toContain('tự Pháp Độ')
    expect(texts).not.toContain('Chi phái 1')
    expect(texts).toContain('Đời 7 · Ngành 2 · Chi 1')
    expect(texts).not.toContain('Giỗ 4/3 ÂL')
  })

  it('không cắt nội dung bằng dấu ba chấm', () => {
    const data = structuredClone(treeData)
    data.person.profile.name_given = 'Hữu Nguyễn Văn Minh'
    data.name_given = 'Hữu Nguyễn Văn Minh'
    const svg = TreeChart(data, null, settings)
    const texts = cardTexts(svg)
    expect(texts.join(' ')).toContain('Bùi Hữu Nguyễn Văn Minh')
    expect(texts.every(text => !text.includes('…'))).toBe(true)
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

  it('dùng bài vị có chân dung cho người đã mất và bảng tên cho người sống', () => {
    const data = structuredClone(treeData)
    data.person.attribute_list[0].value = '13'
    data.person.profile.birth = {date: '1960'}
    const svg = TreeChart(data, null, settings)
    const living = svg.querySelector('[data-gramps-id="I0016"]')
    const deceased = svg.querySelector('[data-gramps-id="I0028"]')

    expect(living.classList.contains('person-living')).toBe(true)
    expect(living.querySelector('.nameplate-decoration')).not.toBeNull()
    expect(living.querySelector('.nameplate-body')).not.toBeNull()
    expect(living.querySelector('.living-avatar-halo')).not.toBeNull()
    expect(living.querySelector('.living-avatar-image')).not.toBeNull()
    expect(
      living.querySelector('.living-avatar').getAttribute('transform')
    ).toBe('translate(-74,-37)')
    expect(
      living.querySelector('.living-avatar-image').getAttribute('href')
    ).toBe('images/heritage/avatar-cu-ong.png')
    expect(living.querySelector('.memorial-portrait')).toBeNull()
    expect(cardTexts(svg)).not.toContain('Sinh 1960')
    expect(deceased.classList.contains('person-deceased')).toBe(true)
    expect(deceased.classList.contains('person-male')).toBe(true)
    expect(deceased.querySelector('.memorial-inset')).not.toBeNull()
    expect(deceased.querySelector('.memorial-portrait')).not.toBeNull()
    expect(deceased.querySelector('.memorial-portrait-image')).not.toBeNull()
    expect(
      deceased.querySelector('.memorial-portrait').getAttribute('transform')
    ).toBe('translate(-74,-37)')
  })

  it('dùng chân dung cụ bà cho người nữ chưa có ảnh', () => {
    const data = structuredClone(treeData)
    data.person.gender = 0
    data.person.attribute_list[0].value = '13'
    data.person.profile.birth = {date: '1960'}
    const svg = TreeChart(data, null, settings)
    const portrait = svg.querySelector(
      '[data-gramps-id="I0016"] .living-avatar-image'
    )

    expect(portrait.getAttribute('href')).toBe(
      'images/heritage/avatar-cu-ba.png'
    )
  })

  it('đặt ảnh thật cùng kích thước và vị trí trên mọi bảng tên', () => {
    const svg = TreeChart(treeData, null, {
      ...settings,
      getImageUrl: () => 'data:image/png;base64,AA==',
    })
    const photos = [...svg.querySelectorAll('.person-avatar-photo')]

    expect(photos).toHaveLength(2)
    expect(new Set(photos.map(photo => photo.getAttribute('r')))).toEqual(
      new Set(['22'])
    )
    expect(new Set(photos.map(photo => photo.getAttribute('cy')))).toEqual(
      new Set(['-37'])
    )
  })
})
