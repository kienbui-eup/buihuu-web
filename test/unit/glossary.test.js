import {describe, it, expect} from 'vitest'
import {
  applyVietnameseGlossary,
  describesSameLunarDate,
  localizeServerValue,
  lunarDateKey,
  VI_GLOSSARY,
} from '../../src/glossary.js'

describe('applyVietnameseGlossary', () => {
  it('không đụng tới ngôn ngữ khác tiếng Việt', () => {
    const strings = {Death: 'Tod ', Birth: 'Geburt'}
    expect(applyVietnameseGlossary(strings, 'de')).toBe(strings)
  })

  // Bản dịch của Gramps bản gốc để dấu cách cuối ở hơn 700 chuỗi.
  it('cắt khoảng trắng thừa ở hai đầu', () => {
    const strings = {People: 'Người ', Father: ' Cha '}
    const out = applyVietnameseGlossary(strings, 'vi')
    expect(out.People).to.equal('Người')
    expect(out.Father).to.equal('Cha')
  })

  it('đè lên bản dịch của Gramps bản gốc', () => {
    const strings = {Death: 'Chết ', Confidence: 'Mật ', Child: 'Con trai '}
    const out = applyVietnameseGlossary(strings, 'vi')
    expect(out.Death).to.equal('Mất')
    expect(out.Confidence).to.equal('Độ tin cậy')
    expect(out.Child).to.equal('Con')
  })

  it('giữ lại chuỗi không nằm trong lớp thuật ngữ', () => {
    const out = applyVietnameseGlossary({'Zoom in': 'Phóng to'}, 'vi')
    expect(out['Zoom in']).to.equal('Phóng to')
  })

  // Hàm `_()` trong GrampsJs cắt dấu gạch dưới đầu tiên của chuỗi đã dịch,
  // nên bản dịch có '_' sẽ mất một ký tự khi hiển thị.
  it('không có bản dịch nào chứa dấu gạch dưới', () => {
    const withUnderscore = Object.entries(VI_GLOSSARY).filter(([, value]) =>
      value.includes('_')
    )
    expect(withUnderscore).to.deep.equal([])
  })
})

// Giá trị máy chủ dịch sẵn trong profile (có dấu cách cuối, có lỗi chính tả)
describe('localizeServerValue', () => {
  it('đổi chữ máy chủ sang chữ của nhà, bỏ khoảng trắng thừa', () => {
    expect(localizeServerValue('Chết ')).toBe('Mất')
    expect(localizeServerValue('Chủ yếu')).toBe('Chính')
    expect(localizeServerValue('Kêt hôn/ có gia đình ')).toBe('Vợ chồng')
    expect(localizeServerValue('Lễ an táng')).toBe('An táng')
  })

  it('nhận cả khoá tiếng Anh gốc', () => {
    expect(localizeServerValue('Death')).toBe('Mất')
    expect(localizeServerValue('Primary')).toBe('Chính')
    expect(localizeServerValue('Married')).toBe('Vợ chồng')
  })

  it('tra được bảng động sau khi tải bản dịch máy chủ', () => {
    applyVietnameseGlossary({Confidence: 'Mật ', Residence: 'Cư dân'}, 'vi')
    expect(localizeServerValue('Cư dân')).toBe('Nơi ở')
    expect(localizeServerValue('Mật')).toBe('Độ tin cậy')
  })

  it('không có trong bảng thì trả nguyên chuỗi đã cắt', () => {
    expect(localizeServerValue(' Sinh ')).toBe('Sinh')
    expect(localizeServerValue(undefined)).toBe('')
  })
})

describe('lunarDateKey', () => {
  it('đọc ngày tháng từ nhiều cách viết', () => {
    expect(lunarDateKey('Giỗ ngày 21 tháng 12')).toBe('21/12')
    expect(lunarDateKey('Giỗ ngày 21 tháng 12 âm lịch')).toBe('21/12')
    expect(lunarDateKey('21/12')).toBe('21/12')
    expect(lunarDateKey('Giỗ ngày 15 tháng chạp')).toBe('15/12')
    expect(lunarDateKey('mùng 3 tháng Giêng')).toBe('3/1')
  })

  it('không có ngày thì rỗng', () => {
    expect(lunarDateKey('nhà tiền bối cách mạng')).toBe('')
    expect(lunarDateKey('')).toBe('')
  })
})

describe('describesSameLunarDate', () => {
  it('mô tả chỉ chép lại ngày giỗ thì coi là trùng', () => {
    expect(
      describesSameLunarDate(
        'Giỗ ngày 21 tháng 12',
        'Giỗ ngày 21 tháng 12 âm lịch'
      )
    ).toBe(true)
    expect(
      describesSameLunarDate(
        'Giỗ ngày 15 tháng chạp',
        'Giỗ ngày 15 tháng 12 âm lịch'
      )
    ).toBe(true)
  })

  it('mô tả có thêm năm hay lời kể thì giữ', () => {
    expect(
      describesSameLunarDate(
        'Giỗ ngày 21 tháng 12 (1935 - nhà tiền bối cách mạng)',
        'Giỗ ngày 21 tháng 12 âm lịch'
      )
    ).toBe(false)
  })

  it('ngày khác nhau hoặc thiếu thì không trùng', () => {
    expect(
      describesSameLunarDate('Giỗ ngày 2 tháng 3', 'Giỗ ngày 21 tháng 12')
    ).toBe(false)
    expect(describesSameLunarDate('', 'Giỗ ngày 21 tháng 12')).toBe(false)
    expect(describesSameLunarDate('Giỗ ngày 21 tháng 12', '')).toBe(false)
  })
})
