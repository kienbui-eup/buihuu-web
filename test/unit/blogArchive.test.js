import {describe, expect, it} from 'vitest'
import {
  INDEX_TAG,
  ORIGINAL_TEXTS,
  SHELF_DESCRIPTIONS,
  SHELF_ORDER,
  filterBlogPosts,
  getBlogCategories,
  isIndexPost,
  latestBlogUpdate,
} from '../../src/blogShelves.js'

const post = (title, tags = [], extra = {}) => ({
  title,
  extended: {tags: tags.map(name => ({name}))},
  ...extra,
})

describe('kho sử tộc Bùi Hữu', () => {
  it('tìm tiêu đề có hoặc không dấu', () => {
    const posts = [
      post('Chỉ Bồ và những thay đổi địa danh'),
      post('Ngày giỗ trong gia phả'),
    ]
    expect(filterBlogPosts(posts, 'chi bo')).toEqual([posts[0]])
    expect(filterBlogPosts(posts, 'ngay gio')).toEqual([posts[1]])
  })

  it('tìm cả người soạn, dòng nơi và năm, tên ngăn', () => {
    const speech = post('Bài phát biểu', [], {
      author: 'Ban biên soạn',
      pubinfo: 'Đọc tại nhà thờ tổ, năm Bính Ngọ',
    })
    const guide = post('Cách đọc hồ sơ', [
      'Chuyên mục: Hướng dẫn tra cứu và góp tư liệu',
    ])
    expect(filterBlogPosts([speech, guide], 'ban bien soan')).toEqual([speech])
    expect(filterBlogPosts([speech, guide], 'binh ngo')).toEqual([speech])
    expect(filterBlogPosts([speech, guide], 'huong dan')).toEqual([guide])
    expect(filterBlogPosts([speech, guide], '  ')).toEqual([speech, guide])
  })

  it('nhận ra bài mục lục và ngày cập nhật gần nhất', () => {
    const index = post('Mục lục', [INDEX_TAG], {change: 1_757_500_000})
    const older = post('Lời tựa', [], {change: 1_700_000_000})
    expect(isIndexPost(index)).toBe(true)
    expect(isIndexPost(older)).toBe(false)
    expect(latestBlogUpdate([older, index])).toBe(
      new Date(1_757_500_000 * 1000).toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
    )
    expect(latestBlogUpdate([post('Không có ngày')])).toBe('')
    expect(latestBlogUpdate([])).toBe('')
  })

  it('xếp mục lục và văn bản gốc vào ngăn riêng', () => {
    expect(getBlogCategories(post('Mục lục', [INDEX_TAG]))).toEqual([INDEX_TAG])
    expect(getBlogCategories(post('Lời tựa'))).toEqual([ORIGINAL_TEXTS])
    expect(
      getBlogCategories(post('Bài', ['Blog', 'Chuyên mục: Nhân vật trong họ']))
    ).toEqual(['Nhân vật trong họ'])
  })

  it('xếp các ngăn theo thứ tự đọc, không theo bảng chữ cái', () => {
    const guide = post('A. Hướng dẫn', [
      'Chuyên mục: Hướng dẫn tra cứu và góp tư liệu',
    ])
    const origin = post('Z. Nguồn gốc', ['Chuyên mục: Nguồn gốc và thế thứ'])
    const other = post('B. Ngăn lạ', ['Chuyên mục: Ngăn chưa đặt tên'])
    const preface = post('Lời tựa')
    const index = post('Mục lục', [INDEX_TAG])
    expect(filterBlogPosts([guide, other, origin, preface, index])).toEqual([
      index,
      preface,
      origin,
      guide,
      other,
    ])
    expect(
      filterBlogPosts([guide, origin], '', 'Nguồn gốc và thế thứ')
    ).toEqual([origin])
  })

  it('mỗi ngăn trong thứ tự đọc đều có lời dẫn', () => {
    for (const name of SHELF_ORDER) {
      expect(SHELF_DESCRIPTIONS[name]).toBeTruthy()
    }
  })
})
