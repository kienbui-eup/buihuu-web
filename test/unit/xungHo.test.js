import {describe, it, expect} from 'vitest'
import {parseDoi, vaiVe} from '../../src/xungHo.js'

describe('parseDoi', () => {
  it('lấy số đời từ nhiều cách ghi', () => {
    expect(parseDoi('12')).toBe(12)
    expect(parseDoi('Đời 7')).toBe(7)
    expect(parseDoi('9 (dòng trưởng)')).toBe(9)
  })
  it('không có số thì trả về null', () => {
    expect(parseDoi('')).toBeNull()
    expect(parseDoi(null)).toBeNull()
    expect(parseDoi('chưa rõ')).toBeNull()
  })
})

describe('vaiVe theo đời', () => {
  it('cùng một người là chính bạn', () => {
    expect(vaiVe({doiSelf: 10, doiOther: 10, sameHandle: true})).toEqual({
      kind: 'self',
    })
  })

  it('thiếu đời một bên thì chưa xác định', () => {
    expect(vaiVe({doiSelf: null, doiOther: 8}).kind).toBe('unknown')
    expect(vaiVe({doiSelf: 8, doiOther: null}).kind).toBe('unknown')
  })

  it('ngang đời là ngang vai, hàng anh chị em, còn ngờ thứ bậc', () => {
    const r = vaiVe({doiSelf: 11, doiOther: 11})
    expect(r.direction).toBe('same')
    expect(r.vai).toBe('Ngang vai')
    expect(r.uncertain).toBe(true)
  })

  it('người kia đời nhỏ hơn là bậc trên; cách 1 đời là chú/bác/cô theo giới', () => {
    const nam = vaiVe({doiSelf: 12, doiOther: 11, genderOther: 1})
    expect(nam.direction).toBe('up')
    expect(nam.level).toBe(1)
    expect(nam.youCall).toBe('chú hoặc bác')
    expect(nam.theyCall).toBe('cháu')
    expect(nam.uncertain).toBe(true)
    const nu = vaiVe({doiSelf: 12, doiOther: 11, genderOther: 0})
    expect(nu.youCall).toBe('cô hoặc bác')
  })

  it('cách 2 đời trên là ông/bà, cách 3 là cụ', () => {
    expect(vaiVe({doiSelf: 12, doiOther: 10, genderOther: 1}).youCall).toBe(
      'ông'
    )
    expect(vaiVe({doiSelf: 12, doiOther: 10, genderOther: 0}).youCall).toBe(
      'bà'
    )
    expect(vaiVe({doiSelf: 12, doiOther: 9}).youCall).toBe('cụ')
  })

  it('người kia đời lớn hơn là bậc dưới; bạn gọi cháu, họ gọi bạn theo giới bạn', () => {
    const r = vaiVe({doiSelf: 10, doiOther: 11, genderSelf: 1})
    expect(r.direction).toBe('down')
    expect(r.level).toBe(1)
    expect(r.youCall).toBe('cháu')
    expect(r.theyCall).toBe('chú hoặc bác')
    const xuong2 = vaiVe({doiSelf: 10, doiOther: 12})
    expect(xuong2.youCall).toBe('cháu')
    expect(xuong2.uncertain).toBe(false)
  })
})
