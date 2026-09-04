/*
Tìm người theo tên trong danh sách.

Người trong họ gõ tên trên điện thoại, nhiều khi bỏ dấu ("nhan" thay vì
"Nhân") và gõ liền cả họ lẫn tên ("Bùi Anh") dù trong Gramps họ và tên nằm ở
hai trường. Quy tắc SearchName của Gramps chỉ tìm chuỗi con trong từng
trường, nên "Bùi Anh" không ra ai còn "anh" lại ra cả Thanh, Khanh, Oanh.

Cách làm ở đây: tách câu gõ thành từng từ, mỗi từ thành một quy tắc
RegExpName (các quy tắc giao nhau). Mỗi từ chỉ khớp ở đầu một từ trong tên
(sau đầu chuỗi hoặc khoảng trắng), chữ cái không dấu được mở rộng thành lớp
gồm mọi biến thể có dấu; chữ đã có dấu giữ nguyên vì người gõ đã chủ ý.
Máy chủ biên dịch mẫu với cờ không phân biệt hoa thường. Tên trong cơ sở dữ
liệu ở dạng NFC nên lớp ký tự tổ hợp sẵn là đủ.
*/

const VARIANTS = {
  a: 'aàáảãạăằắẳẵặâầấẩẫậ',
  e: 'eèéẻẽẹêềếểễệ',
  i: 'iìíỉĩị',
  o: 'oòóỏõọôồốổỗộơờớởỡợ',
  u: 'uùúủũụưừứửữự',
  y: 'yỳýỷỹỵ',
  d: 'dđ',
}

export const NAME_SEARCH_SLOT = 'quick:name'

function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

// Mẫu regex cho một từ: "nhan" -> "(^|\s)nh[aàá...]n".
export function wordPattern(word) {
  const chars = [...word.normalize('NFC').toLowerCase()].map(ch =>
    ch in VARIANTS ? `[${VARIANTS[ch]}]` : escapeRegex(ch)
  )
  return `(^|\\s)${chars.join('')}`
}

// Danh sách quy tắc lọc cho câu gõ; câu trống trả về mảng rỗng (bỏ lọc).
export function nameSearchRules(query, slot = NAME_SEARCH_SLOT) {
  return String(query ?? '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map(word => ({
      name: 'RegExpName',
      values: [wordPattern(word)],
      regex: true,
      _slot: slot,
    }))
}
