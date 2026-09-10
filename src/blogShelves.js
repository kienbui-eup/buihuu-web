// Ngăn tư liệu của Kho sử tộc Bùi Hữu: tên, thứ tự đọc và lời dẫn từng ngăn.
//
// Mỗi bài là một Source mang thẻ "Blog". Thẻ "Chuyên mục: <tên ngăn>" đưa bài vào
// ngăn ấy. Bài không có thẻ chuyên mục là văn bản gốc của dòng họ (Lời tựa, bản
// dịch phả chữ Nho, văn khấn, bài phát biểu), trừ bài mục lục mang thẻ INDEX_TAG.
// Thứ tự trong SHELF_ORDER là thứ tự đọc; ngăn không có trong danh sách xếp sau
// cùng theo bảng chữ cái tiếng Việt.

export const INDEX_TAG = 'Mục lục kho sử'
export const ORIGINAL_TEXTS = 'Văn bản gốc'

export const SHELF_ORDER = [
  INDEX_TAG,
  ORIGINAL_TEXTS,
  'Nguồn gốc và thế thứ',
  'Nhân vật trong họ',
  'Quê hương và nhà thờ tổ',
  'Tra cứu tư liệu và câu hỏi còn mở',
  'Hướng dẫn tra cứu và góp tư liệu',
]

export const SHELF_DESCRIPTIONS = {
  [INDEX_TAG]: 'Lối vào kho sử: các ngăn tư liệu và thứ tự nên đọc.',
  [ORIGINAL_TEXTS]:
    'Gia phả chữ Nho bản dịch, Lời tựa, văn khấn và bài phát biểu của dòng họ, chép nguyên văn để đối chiếu.',
  'Nguồn gốc và thế thứ':
    'Thủy tổ, các cụ tổ, ba ngành năm chi, các lớp biên soạn phả và giới hạn của việc tìm gốc tích.',
  'Nhân vật trong họ':
    'Người trong họ được sử sách, báo chí và lưu trữ ghi lại, đối chiếu với gia phả.',
  'Quê hương và nhà thờ tổ':
    'Làng Chỉ Bồ, đền Chòi, nhà thờ tổ, xứ đồng có mộ và ngày giỗ các cụ.',
  'Tra cứu tư liệu và câu hỏi còn mở':
    'Kho Hán Nôm, lưu trữ Pháp, thư mục nguồn và những câu hỏi chưa có lời giải.',
  'Hướng dẫn tra cứu và góp tư liệu':
    'Cách đọc hồ sơ, xem lịch giỗ, dùng trang trên điện thoại và gửi tư liệu bổ sung.',
}

export const searchableBlogText = text =>
  (text || '')
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/đ/gi, 'd')
    .toLowerCase()

const tagNames = post => (post.extended?.tags || []).map(tag => tag.name)

export const getBlogCategories = post => {
  const named = tagNames(post)
    .filter(name => name.startsWith('Chuyên mục:'))
    .map(name => name.slice('Chuyên mục:'.length).trim())
    .filter(Boolean)
  if (named.length) return named
  return [tagNames(post).includes(INDEX_TAG) ? INDEX_TAG : ORIGINAL_TEXTS]
}

const shelfRank = name => {
  const rank = SHELF_ORDER.indexOf(name)
  return rank < 0 ? SHELF_ORDER.length : rank
}

export const compareBlogCategories = (a, b) =>
  shelfRank(a) - shelfRank(b) || a.localeCompare(b, 'vi')

// Theo ngăn rồi theo tiêu đề.
export const compareBlogPosts = (a, b) =>
  compareBlogCategories(getBlogCategories(a)[0], getBlogCategories(b)[0]) ||
  (a.title || '').localeCompare(b.title || '', 'vi')

export const filterBlogPosts = (posts, query = '', category = '') => {
  const needle = searchableBlogText(query.trim())
  return posts
    .filter(
      post =>
        (!category || getBlogCategories(post).includes(category)) &&
        searchableBlogText(post.title).includes(needle)
    )
    .sort(compareBlogPosts)
}
