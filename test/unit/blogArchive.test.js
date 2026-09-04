import {describe, expect, it} from 'vitest'
import {
  filterBlogPosts,
  getBlogCategories,
} from '../../src/components/GrampsjsBlogArchive.js'

const post = (title, tags = []) => ({
  title,
  extended: {tags: tags.map(name => ({name}))},
})

describe('kho sử dòng họ', () => {
  it('tìm tiêu đề có hoặc không dấu', () => {
    const posts = [
      post('Chỉ Bồ và những thay đổi địa danh'),
      post('Ngày giỗ trong gia phả'),
    ]
    expect(filterBlogPosts(posts, 'chi bo')).toEqual([posts[0]])
    expect(filterBlogPosts(posts, 'ngay gio')).toEqual([posts[1]])
  })

  it('xếp mục lục và văn bản gốc vào ngăn riêng', () => {
    expect(getBlogCategories(post('Mục lục', ['Mục lục nghiên cứu']))).toEqual([
      'Mục lục nghiên cứu',
    ])
    expect(getBlogCategories(post('Lời tựa'))).toEqual(['Văn bản gốc'])
  })

  it('lọc đúng chuyên mục và đưa các ngăn dẫn nhập lên trước', () => {
    const research = post('Một bài nghiên cứu', [
      'Chuyên mục: Tư liệu và tra cứu',
    ])
    const preface = post('Lời tựa')
    const index = post('Mục lục', ['Mục lục nghiên cứu'])
    expect(filterBlogPosts([research, preface, index])).toEqual([
      index,
      preface,
      research,
    ])
    expect(
      filterBlogPosts([research, preface], '', 'Tư liệu và tra cứu')
    ).toEqual([research])
  })
})
