import {describe, it, expect} from 'vitest'
import {prefaceExcerpt} from '../../src/components/GrampsjsHomePreface.js'

// Văn bản giả, không lấy từ lời tựa thật.
const TITLE = 'PHẢ HỆ HỌ A'
const PLACE = 'Thôn B, xã C'
const OPENING =
  'Người ta sinh ra ở đời, ai cũng có tổ có tông, như cây có cội, như sông có nguồn. ' +
  'Bản phả này chép lại thứ tự các đời để con cháu về sau biết đường mà kính nhớ. ' +
  'Việc chép lấy sổ cũ làm gốc, chỗ nào chưa rõ thì để trống, không dám thêm bớt. ' +
  'Mong người sau tiếp tục bổ khuyết cho trọn.'

describe('prefaceExcerpt', () => {
  it('bỏ dòng tiêu đề và địa danh ngắn, lấy đoạn văn mở đầu', () => {
    const text = `${TITLE}\n\n${PLACE}\n\n${OPENING}`
    const excerpt = prefaceExcerpt(text, 400)
    expect(excerpt).to.equal(OPENING)
    expect(excerpt).not.to.contain(TITLE)
  })

  it('cắt ở ranh giới câu cuối cùng trước giới hạn, không cắt giữa câu', () => {
    const excerpt = prefaceExcerpt(OPENING, 200)
    expect(excerpt.length).to.be.at.most(201)
    expect(excerpt.endsWith('.')).to.be.true
    expect(OPENING.startsWith(excerpt)).to.be.true
    expect(excerpt).to.contain('như sông có nguồn.')
  })

  it('không có dấu câu thì cắt ở khoảng trắng và thêm dấu ba chấm', () => {
    const words = Array.from({length: 60}, (_, i) => `chữ${i}`).join(' ')
    const excerpt = prefaceExcerpt(words, 100)
    expect(excerpt.endsWith('…')).to.be.true
    expect(excerpt.length).to.be.at.most(101)
    expect(excerpt.slice(0, -1).trim()).to.equal(excerpt.slice(0, -1))
  })

  it('gom dòng xuống dòng đơn trong đoạn thành một câu liền', () => {
    const wrapped = OPENING.replace(/\. /g, '.\n')
    expect(prefaceExcerpt(wrapped, 400)).to.equal(OPENING)
  })

  it('trả về chuỗi rỗng khi chưa có nội dung', () => {
    expect(prefaceExcerpt('')).to.equal('')
    expect(prefaceExcerpt(undefined)).to.equal('')
  })
})
