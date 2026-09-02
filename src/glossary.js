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
  'Family Tree': 'Gia phả',
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
  Married: 'Đã kết hôn',
  Unmarried: 'Chưa kết hôn',

  // Tên người
  'Birth Name': 'Tên khai sinh',
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
    return strings
  }
  const trimmed = {}
  Object.entries(strings).forEach(([key, value]) => {
    trimmed[key] = typeof value === 'string' ? value.trim() : value
  })
  return {...trimmed, ...VI_GLOSSARY}
}
