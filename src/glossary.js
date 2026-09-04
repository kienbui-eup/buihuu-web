/*
Lớp thuật ngữ tiếng Việt của bản triển khai này.

Chuỗi tiếng Việt trong giao diện đến từ hai nguồn: `lang/vi.json` (chuỗi riêng
của phần web) và bản dịch của Gramps bản gốc do máy chủ trả về ở
`/api/translations/vi`. Trong `GrampsJs._loadStrings`, bản của máy chủ được trộn
sau nên luôn đè lên `lang/vi.json` - kể cả với những chuỗi mà `lang/vi.json` dịch
đúng hơn. Nghĩa là phần lớn nhãn người xem thấy (Sinh, Chết, Gia đình, Nguồn,
Đa phương tiện...) không sửa được từ `lang/vi.json`.

File này là lớp cuối cùng, trộn sau cả hai, nên nói được tiếng nói sau cùng.

Có hai việc phải làm ở đây:

1. Bản dịch tiếng Việt của Gramps bản gốc dịch từng chữ và có nhiều chỗ sai
   nghĩa hẳn: `Confidence` (độ tin cậy của một nguồn) thành "Mật",
   `Association` thành "Hiệp hội", `Child` thành "Con trai", `Engagement`
   (đính hôn) thành "Kết hôn", `Residence` thành "Cư dân", `Census` thành
   "Thống kê", `Select an existing person` thành "Chọn một nơi đang có",
   `Language` thành "Ngôn nữa". Những chỗ đó phải sửa.

2. Đây là gia phả một dòng họ Việt, không phải phần mềm nghiên cứu phả hệ
   phương Tây. Người xem là con cháu trong họ, nên dùng chữ của nhà: tổ tiên
   "mất" chứ không "chết", "an táng" chứ không "lễ an táng", đây là "gia phả"
   chứ không phải "cây gia đình", có "hình ảnh, tư liệu" chứ không có "đối
   tượng đa phương tiện". Địa danh cũng theo cấp hành chính Việt Nam: tỉnh,
   huyện, xã, thôn.

Chỉ ghi vào đây những chuỗi cần đổi. Chuỗi nào bản gốc đã dịch ổn thì để nguyên,
để lần nâng cấp Gramps sau còn hưởng bản dịch mới của họ.
*/

/*
Thuật ngữ gia phả, ghi đè bản dịch của Gramps bản gốc.

Khoá là chuỗi tiếng Anh gốc, đúng như Gramps gửi lên trong `grampsStrings`.
*/
export const VI_GLOSSARY = {
  // Gia phả và các nhóm dữ liệu chính
  // "Family Tree" của Gramps là cả cơ sở dữ liệu gia phả; trang biểu đồ gọi là
  // "Phả đồ" (đặt thẳng trong siteNav.js và tiêu đề trang ở GrampsJs.js), tên
  // trang là "Phả hệ Bùi Hữu", ba thứ không lẫn nhau.
  'Family Tree': 'Cây gia phả',
  'Family Tree name': 'Tên gia phả',
  'Family Tree Processing': 'Xử lý gia phả',
  'Import Family Tree': 'Nhập gia phả',
  Person: 'Người',
  'Person Details': 'Thông tin người',
  'Number of people': 'Số người',
  Media: 'Hình ảnh, tư liệu',
  'Media Object': 'Tư liệu',
  'Media Objects': 'Hình ảnh, tư liệu',
  'New Media': 'Tư liệu mới',
  '_Media Type:': 'Loại tư liệu:',
  'Add a new media object': 'Thêm tư liệu mới',
  'Select an existing media object': 'Chọn tư liệu đã có',
  'Total size of media objects': 'Tổng dung lượng tư liệu',
  Gallery: 'Thư viện ảnh',
  Citation: 'Trích dẫn',
  Citations: 'Trích dẫn',
  'New Citation': 'Trích dẫn mới',
  Repository: 'Kho tư liệu',
  Repositories: 'Kho tư liệu',
  'New Repository': 'Kho tư liệu mới',
  'Add an existing repository': 'Thêm kho tư liệu đã có',
  Place: 'Địa điểm',
  'New Place': 'Địa điểm mới',
  Timeline: 'Dòng thời gian',

  // Người gốc của cây: bản gốc gọi là "người mặc định", ở đây là cụ thuỷ tổ
  'Home Person': 'Người gốc',
  'No Home Person set.': 'Chưa đặt người gốc.',
  'Set _Home Person': 'Đặt làm người gốc',
  'Relationship to home person': 'Quan hệ với người gốc',

  // Sự kiện đời người. "Chết" là chữ của bản gốc, phả hệ Việt viết "mất".
  Birth: 'Sinh',
  Death: 'Mất',
  Burial: 'An táng',
  Cremation: 'Hỏa táng',
  'Cause Of Death': 'Nguyên nhân mất',
  'Death year': 'Năm mất',
  Marriage: 'Kết hôn',
  'Alternate Marriage': 'Kết hôn lần khác',
  'Number of Marriages': 'Số lần kết hôn',
  'Marriage Contract': 'Hôn ước',
  Engagement: 'Đính hôn',
  Divorce: 'Ly hôn',
  'Divorce Filing': 'Nộp đơn ly hôn',
  Residence: 'Nơi ở',
  Census: 'Điều tra dân số',
  Christening: 'Lễ rửa tội',
  'Nobility Title': 'Tước vị',
  'Military Service': 'Quân ngũ',
  Probate: 'Chứng thực di chúc',
  'Medical Information': 'Thông tin y tế',
  Retirement: 'Nghỉ hưu',

  // Quan hệ họ hàng
  Child: 'Con',
  Children: 'Các con',
  Sibling: 'Anh chị em',
  Siblings: 'Anh chị em',
  Spouse: 'Vợ/chồng',
  Partner: 'Vợ/chồng',
  'Maximum number of _spouses for a person': 'Số vợ/chồng tối đa của một người',
  Relatives: 'Họ hàng',
  'Not Related': 'Không cùng huyết thống',
  'Add a new set of parents': 'Thêm cha mẹ',
  'Add a new family with person as parent':
    'Thêm gia đình mới, lấy người này làm cha/mẹ',
  'Select an existing person': 'Chọn người đã có',
  Stepchild: 'Con riêng',
  Adopted: 'Con nuôi',
  // Loại quan hệ của một gia đình, không phải tình trạng hôn nhân của một người
  Married: 'Vợ chồng',
  Unmarried: 'Chưa kết hôn',

  // Bộ lọc trang Người. Bản gốc dịch "without a known death date" thành
  // "không có ngày sinh" (sai nghĩa) và "Adopted" thành "thừa nhận".
  'People without a known birth date': 'Người chưa rõ ngày sinh',
  'People without a known death date': 'Người chưa rõ ngày mất',
  'Adopted people': 'Con nuôi',
  'Disconnected people': 'Người chưa nối vào cây',
  'People with an alternate name': 'Người có tên tự, hiệu',
  'People with a nickname': 'Người có tên gọi khác',
  'People with incomplete names': 'Người chưa đủ họ tên',
  'People with no marriage records': 'Người chưa ghi hôn nhân',
  'People with multiple marriage records': 'Người có nhiều đời vợ/chồng',
  'People with children': 'Người có con',
  'People with unknown gender': 'Người chưa rõ giới tính',

  // Tên người. Tổ tiên thế kỷ 17 không có "tên khai sinh"; đây là tên chép
  // trong sổ họ.
  'Birth Name': 'Tên trong phả',
  'Married Name': 'Tên sau khi kết hôn',
  'Call name': 'Tên thường gọi',
  'Family nick name': 'Tên tục của dòng họ',
  Title: 'Tiêu đề',
  Primary: 'Chính',

  // Độ tin cậy của một trích dẫn
  Confidence: 'Độ tin cậy',
  'Very Low': 'Rất thấp',
  'Very High': 'Rất cao',

  // Địa danh theo cấp hành chính Việt Nam. Pipeline phahe-import dùng đúng bộ
  // này: Province = tỉnh, District = huyện, Municipality = xã, Village = thôn,
  // Locality = xứ đồng (nơi đặt mộ), Building = nhà thờ tổ.
  Country: 'Quốc gia',
  State: 'Tỉnh/Thành phố',
  Province: 'Tỉnh',
  County: 'Huyện/Quận',
  District: 'Huyện',
  City: 'Thành phố',
  Municipality: 'Xã',
  Town: 'Thị trấn',
  Village: 'Thôn',
  Hamlet: 'Xóm',
  Locality: 'Xứ đồng',
  Street: 'Đường/Ngõ',
  Building: 'Công trình',
  Parish: 'Giáo xứ',

  // Vai trò trong một sự kiện
  Clergy: 'Người hành lễ',
  Informant: 'Người cung cấp thông tin',
  Witness: 'Người làm chứng',

  // Chuỗi máy chủ trả nguyên tiếng Anh
  Help: 'Hướng dẫn',
  _Copy: 'Sao chép',

  // Sửa những chỗ bản gốc dịch sai nghĩa hoặc sai chính tả
  Language: 'Ngôn ngữ',
  Association: 'Người liên quan',
  Associations: 'Người liên quan',
  Attributes: 'Thuộc tính',
  Type: 'Loại',
  Action: 'Thao tác',
  Count: 'Số lượng',
  Span: 'Khoảng cách',
  Role: 'Vai trò',
  Update: 'Cập nhật',
  Undo: 'Hoàn tác',
  Redo: 'Làm lại',
  Refresh: 'Tải lại',
  'Sort by': 'Sắp xếp theo',
  // Nút cạnh "Chọn" trên trang danh sách: viết hoa chữ đầu như nút bên cạnh.
  filter: 'Bộ lọc',
  // Dấu gạch dưới là phím tắt của Gramps; bỏ đi thì chuỗi gốc dính chữ.
  'Clear _All': 'Xóa hết',
  OK: 'Đồng ý',
  Next: 'Tiếp',
  Preferences: 'Tùy chọn',
  Custom: 'Tùy biến',
  Link: 'Liên kết',
  'To Do': 'Việc cần làm',
  Transcript: 'Bản chép lại',
  'Call Number': 'Số hiệu lưu trữ',
  'Record is private': 'Bản ghi riêng tư',
  'Record is public': 'Bản ghi công khai',
  'Enclosed By': 'Nằm trong',
  Encloses: 'Bao gồm',
  Unknown: 'Chưa rõ',
  unknown: 'chưa rõ',
  Data: 'Dữ liệu',
  'Verify the Data': 'Kiểm tra dữ liệu',
  'Data Verification Results': 'Kết quả kiểm tra dữ liệu',
  'Verifies the data against user-defined tests':
    'Kiểm tra dữ liệu theo các ngưỡng do người dùng đặt',
  'Maximum age for an _unmarried person':
    'Tuổi tối đa của người chưa lập gia đình',
  'Maximum number of chil_dren': 'Số con tối đa',
  'Maximum number of years _between children':
    'Số năm tối đa giữa hai lần sinh',
  'Ma_ximum age to bear a child': 'Tuổi tối đa còn sinh con',
  'Ma_ximum age to father a child': 'Tuổi tối đa còn có con',
  'Mi_nimum age to bear a child': 'Tuổi tối thiểu để sinh con',
  'Mi_nimum age to father a child': 'Tuổi tối thiểu để có con',
  'Mi_nimum age to marry': 'Tuổi tối thiểu để kết hôn',
  'Ma_ximum age to marry': 'Tuổi tối đa để kết hôn',
  'Maximum husband-wife age _difference': 'Chênh lệch tuổi vợ chồng tối đa',
  'Maximum _span of years for all children':
    'Khoảng năm tối đa giữa con đầu và con út',
  'Max Ancestor Generations': 'Số đời tổ tiên tối đa',
  'Max Descendant Generations': 'Số đời con cháu tối đa',
  Strikethrough: 'Gạch ngang',
}

/*
Trộn lớp thuật ngữ vào bảng chuỗi đã tải.

Ngoài việc ghi đè, hàm còn cắt khoảng trắng thừa ở hai đầu mọi chuỗi: bản dịch
tiếng Việt của Gramps bản gốc để dấu cách cuối ở hơn 700 chuỗi ("Người ",
"Sinh ", "Gia đình "), nên chỗ nào ghép chuỗi cũng lòi ra khoảng trắng
("Sinh : 1920"), còn nhãn trong bảng thì lệch.

Chỉ chạy cho tiếng Việt; ngôn ngữ khác trả về nguyên bảng cũ.
*/
export function applyVietnameseGlossary(strings, lang) {
  if (lang !== 'vi') {
    serverTermMap = new Map()
    return strings
  }
  const trimmed = {}
  Object.entries(strings).forEach(([key, value]) => {
    trimmed[key] = typeof value === 'string' ? value.trim() : value
  })
  serverTermMap = new Map()
  Object.entries(VI_GLOSSARY).forEach(([key, value]) => {
    const server = trimmed[key]
    if (typeof server === 'string' && server && server !== value) {
      serverTermMap.set(server, value)
    }
  })
  return {...trimmed, ...VI_GLOSSARY}
}

/*
Chữ máy chủ đã dịch sẵn → chữ của nhà.

Ngoài bảng chuỗi, máy chủ còn dịch sẵn một số giá trị rồi gửi lên trong
`profile` của từng đối tượng: loại sự kiện (`profile.events[].type`,
`profile.type`), vai trò (`role`), loại quan hệ gia đình
(`profile.relationship`). Những chỗ đó không đi qua `_()`, nên VI_GLOSSARY ở
trên không với tới được: người xem vẫn thấy "Chết", "Chủ yếu", "Kêt hôn/ có
gia đình" (lỗi chính tả của bản gốc). Bảng này đối chiếu ngược từ chữ máy chủ
gửi lên. Ghi cả khoá tiếng Anh gốc để khi máy chủ chưa dịch (locale khác, hoặc
kiểu tuỳ biến) vẫn ra đúng chữ.
*/
export const SERVER_VALUES = {
  // Loại sự kiện
  Chết: 'Mất',
  Death: 'Mất',
  'Lễ an táng': 'An táng',
  Burial: 'An táng',
  Cremation: 'Hỏa táng',
  Birth: 'Sinh',
  Marriage: 'Kết hôn',

  // Vai trò trong sự kiện
  'Chủ yếu': 'Chính',
  Primary: 'Chính',
  Family: 'Gia đình',

  // Loại quan hệ của gia đình
  'Kêt hôn/ có gia đình': 'Vợ chồng',
  'Kết hôn/ có gia đình': 'Vợ chồng',
  Married: 'Vợ chồng',
  'Không kết hôn': 'Chưa kết hôn',
  Unmarried: 'Chưa kết hôn',
  'Bà con': 'Họ hàng',
}

/*
Bảng động bổ sung cho SERVER_VALUES: dựng lại mỗi lần tải bản dịch máy chủ,
từ những khoá VI_GLOSSARY có bản dịch máy chủ khác chữ của nhà ("Chết " →
"Mất"). Nhờ đó những giá trị chưa kịp ghi vào bảng tĩnh (loại địa điểm, vai
trò ít gặp) vẫn được đổi, miễn là khoá tiếng Anh có trong VI_GLOSSARY.
*/
let serverTermMap = new Map()

/*
Đổi một giá trị máy chủ đã dịch sang chữ của nhà. Cắt khoảng trắng hai đầu
trước khi tra (bản dịch gốc để dấu cách cuối); tra bảng tĩnh trước, bảng động
sau, không có ở đâu thì trả về nguyên chuỗi đã cắt.
*/
export function localizeServerValue(value) {
  if (typeof value !== 'string') {
    return value ?? ''
  }
  const trimmed = value.trim()
  return SERVER_VALUES[trimmed] ?? serverTermMap.get(trimmed) ?? trimmed
}

// Tên cũ của localizeServerValue, giữ cho các chỗ đã gọi.
export function localizeServerTerm(text) {
  return localizeServerValue(text)
}

/*
Khoá ngày/tháng âm lịch đọc từ một câu tiếng Việt: "Giỗ ngày 21 tháng 12",
"21/12", "Giỗ ngày 15 tháng chạp" đều cho "21/12" hoặc "15/12". Không đọc được
thì trả chuỗi rỗng.
*/
const LUNAR_MONTH_WORDS = {giêng: 1, chạp: 12}

export function lunarDateKey(text) {
  const lower = String(text ?? '')
    .normalize('NFC')
    .toLowerCase()
  const match = lower.match(
    /(\d{1,2})\s*(?:tháng|\/|-)\s*(\d{1,2}|giêng|chạp)(?!\d)/u
  )
  if (!match) {
    return ''
  }
  const month = LUNAR_MONTH_WORDS[match[2]] ?? Number(match[2])
  return `${Number(match[1])}/${month}`
}

/*
Mô tả của sự kiện có nói gì hơn ngày của nó không.

Pipeline ghi vào 344 sự kiện Mất cả mô tả "Giỗ ngày 21 tháng 12" lẫn ngày
"Giỗ ngày 21 tháng 12 âm lịch", nên trang in cùng một điều hai lần. Trả về
true khi mô tả chỉ gồm đúng ngày ấy (và vài chữ đệm "giỗ", "ngày", "âm lịch"),
tức là in thêm cũng không cho người đọc biết gì mới. Mô tả có năm mất hay lời
kể kèm theo thì vẫn là thông tin riêng, giữ nguyên.
*/
export function describesSameLunarDate(description, date) {
  const key = lunarDateKey(description)
  if (!key || key !== lunarDateKey(date)) {
    return false
  }
  const residual = String(description)
    .normalize('NFC')
    .toLowerCase()
    .replace(/(\d{1,2})\s*(?:tháng|\/|-)\s*(\d{1,2}|giêng|chạp)/u, '')
    .replace(/giỗ|ngày|tháng|âm lịch|âl/gu, '')
    .replace(/[\s.,;:()-]/gu, '')
  return residual === ''
}
