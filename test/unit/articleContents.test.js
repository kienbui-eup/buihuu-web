import {describe, it, expect} from 'vitest'
import {getArticleSections} from '../../src/articleContents.js'

const sections = html => {
  const container = document.createElement('div')
  container.innerHTML = html
  return getArticleSections(container)
}

describe('mục lục bài viết', () => {
  it('nhận đề mục HTML và đoạn in đậm riêng của StyledText', () => {
    expect(
      sections(
        '<h2>Nguồn tư liệu</h2><p><strong>Cách đối chiếu</strong></p><p>Nội dung <b>nhấn mạnh</b>.</p>'
      ).map(item => item.label)
    ).toEqual(['Nguồn tư liệu', 'Cách đối chiếu'])
  })

  it('bỏ tên dòng và con số trong bảng chuyển thành đoạn văn', () => {
    expect(
      sections(
        '<p><b>Thống kê</b></p><p><b>Nhóm A</b></p><p>Tổng hồ sơ: 12</p><p><b>13</b></p><p>Số mẫu: 2</p><p><b>Việc cần làm</b></p><p>Kiểm tra nguồn.</p>'
      ).map(item => item.label)
    ).toEqual(['Thống kê', 'Việc cần làm'])
  })

  it('giữ hai đề mục trùng tên làm hai đích riêng, không lấy liên kết làm đề mục', () => {
    const result = sections(
      '<h2>Nguồn</h2><p><b><a href="/blog/demo">Bài khác</a></b></p><h2>Nguồn</h2>'
    )
    expect(result).toHaveLength(2)
    expect(result[0].element).not.toBe(result[1].element)
    expect(result[0].key).not.toBe(result[1].key)
  })

  it('nội dung không có đề mục không sinh mục lục', () => {
    expect(sections('<p>Một đoạn văn ngắn.</p>')).toEqual([])
    expect(getArticleSections(null)).toEqual([])
  })

  it('giữ tên chuyên mục khi tên bài liên kết phía sau có dấu hai chấm', () => {
    expect(
      sections(
        '<p><strong>Chuyên mục mẫu</strong></p><p>- <a href="/blog/demo">Bài viết: phần đầu</a></p>'
      ).map(item => item.label)
    ).toEqual(['Chuyên mục mẫu'])
  })

  it('bỏ dòng bảng cả khi giá trị được in đậm hoặc chứa nguồn dẫn', () => {
    expect(
      sections(
        '<p><b>Tổng</b></p><p>Số mẫu: <b>12</b></p><p><b>Nguồn báo</b></p><p>Tư liệu: <a href="https://example.org">[1]</a></p>'
      )
    ).toEqual([])
  })
})
