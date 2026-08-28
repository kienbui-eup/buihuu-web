import {describe, it, expect} from 'vitest'
import {applyVietnameseGlossary, VI_GLOSSARY} from '../../src/glossary.js'

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
