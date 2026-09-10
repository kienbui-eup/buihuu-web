import {describe, expect, it} from 'vitest'
import {
  INDEX_TAG,
  ORIGINAL_TEXTS,
  SHELF_DESCRIPTIONS,
  SHELF_ORDER,
  filterBlogPosts,
  getBlogCategories,
} from '../../src/blogShelves.js'

const post = (title, tags = []) => ({
  title,
  extended: {tags: tags.map(name => ({name}))},
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
