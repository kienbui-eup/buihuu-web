/*
Tên thương hiệu của bản triển khai này.

Bản gốc Gramps Web dùng chuỗi 'Gramps Web' rải rác làm tên hiển thị dự phòng.
Gom về một chỗ để đổi tên chỉ sửa một file, và để lần trộn ngược lên upstream
chỉ đụng đúng những dòng đã thay.

Đây chỉ là giá trị dự phòng: quản trị viên vẫn có thể đặt tên khác trong
Cài đặt > Tùy chỉnh > App title (khoá cấu hình `frontend.appTitle`), giá trị đó
được ưu tiên hơn.

Không dùng file này cho các chỗ nhắc tới phần mềm Gramps với tư cách phần mềm:
tên định dạng Gramps XML, phiên bản Gramps Web API trong màn hình thông tin hệ
thống, hay dòng bản quyền. Những chỗ đó phải giữ nguyên.
*/

export const APP_NAME = 'Phả hệ Bùi Hữu'

export const APP_SHORT_NAME = 'Phả hệ Bùi Hữu'

export const APP_DESCRIPTION =
  'Phả hệ dòng họ Bùi Hữu - thôn Chỉ Bồ, xã Thụy Trường, Thái Thụy, Thái Bình'

/*
Ngôn ngữ mặc định của bản triển khai này.

Bản gốc dò theo ngôn ngữ trình duyệt rồi mới lùi về tiếng Anh. Đây là trang của
một dòng họ Việt Nam nên mặc định luôn là tiếng Việt, kể cả khi trình duyệt của
người xem đặt ngôn ngữ khác. Người dùng vẫn đổi được trong Cài đặt và lựa chọn
đó được lưu lại, nên chỉ ảnh hưởng tới lần vào đầu tiên.
*/
export const DEFAULT_LANGUAGE = 'vi'

/*
Thứ tự tên của bản triển khai này.

Bản gốc dựng tên theo lối phương Tây: tên riêng trước, họ sau ("Đức Anh Bùi"),
hoặc "Bùi, Đức Anh" khi cần xếp theo họ. Tiếng Việt viết họ trước, không có dấu
phẩy: "Bùi Đức Anh". Đây là quy ước ngôn ngữ, không phải tuỳ chọn của người
dùng, nên đặt cứng ở đây thay vì làm một mục trong Cài đặt.
*/
export const SURNAME_FIRST = true

/*
Ghép các phần của một tên theo thứ tự của bản triển khai.

Nhận vào phần họ và phần tên riêng đã tách sẵn (mỗi chỗ gọi lấy chúng từ một
nguồn khác nhau: `profile` rút gọn hay đối tượng `person` đầy đủ), trả về chuỗi
đã ghép. Bỏ qua phần rỗng để không sinh ra khoảng trắng thừa.
*/
export function joinName(surname, given, suffix = '') {
  const parts = SURNAME_FIRST
    ? [surname, given, suffix]
    : [given, surname, suffix]
  return parts
    .map(part => (part || '').trim())
    .filter(Boolean)
    .join(' ')
}

/*
Tên các thuộc tính mang nghĩa riêng của phả hệ Việt Nam.

Bộ dữ liệu nhập vào gắn chúng ở mức thuộc tính của từng người, vì Gramps không
có trường sẵn cho những khái niệm này:
  Đời      - thứ tự thế hệ tính từ thuỷ tổ, ví dụ "8"
  Ngày giỗ - ngày mất theo âm lịch, ví dụ "21/5"
Gom tên chuỗi về đây để chỗ đọc và chỗ nhập cùng dùng một hằng số.
*/
export const ATTR_GENERATION = 'Đời'

export const ATTR_DEATH_ANNIVERSARY = 'Ngày giỗ'

/*
Người gốc mặc định của cây.

Bản gốc để trống cho tới khi mỗi người tự chọn một "người gốc", vì nó dựng cho
người nghiên cứu cây nhà mình. Ở đây thì ngược lại: khách vào là con cháu trong
họ, mở mục Gia phả ra phải thấy cây, không phải thấy dòng chữ "Chưa đặt người
chính". Mặc định là thuỷ tổ - người đời thứ nhất của dòng họ.

Vẫn chỉ là mặc định: ai đặt người gốc riêng thì lựa chọn đó được giữ.
*/
export const DEFAULT_HOME_PERSON = 'I0001'
