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
  'Phả hệ dòng họ Bùi Hữu - thôn Chỉ Bồ, xã Thụy Trường, Thái Thụy, Thái Bình (từ 7/2025: xã Đông Thụy Anh, tỉnh Hưng Yên)'

/*
Địa danh của dòng họ, viết một chỗ để mọi màn hình ghi giống nhau.

Tên quen (Thụy Trường, Thái Bình) vẫn là tên trên bia mộ, lời tựa và trong lời
ăn tiếng nói của người trong họ; tên hành chính mới có từ 01/07/2025 theo Nghị
quyết 1666/NQ-UBTVQH15. Ghi cả hai, tên quen trước.
*/
export const PLACE_SHORT = 'Thôn Chỉ Bồ · Thụy Trường'

export const PLACE_FULL =
  'Thôn Chỉ Bồ, xã Thụy Trường, huyện Thái Thụy, tỉnh Thái Bình'

export const PLACE_NOW = 'từ 7/2025: xã Đông Thụy Anh, tỉnh Hưng Yên'

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

/*
Số đời và số ngành chi của bản phả đang chạy, dùng cho các câu giới thiệu.

Hai con số này đến từ Lời tựa và bộ thẻ "Đời N", "Ngành x - Chi y" do pipeline
gắn; cập nhật khi nhập lại dữ liệu có đời mới. Không đọc từ API để trang chủ
không phải tải toàn bộ danh sách thẻ chỉ để in một con số.
*/
export const GENERATIONS = 17

export const BRANCHES_LABEL = '3 ngành · 5 chi'

export const ATTR_DEATH_ANNIVERSARY = 'Ngày giỗ'

/*
Hai thuộc tính nữa do pipeline gắn cho từng người:
  Độ tin cậy  - căn cứ để nối người này với cha: "gốc" (thuỷ tổ), "cao" (sổ
                ghi rõ cha), "vừa" (suy từ vị trí trong sổ)
  Dòng trưởng - mã ngành chi của bảng hệ thống dòng trưởng, ví dụ "N2C1"
*/
export const ATTR_CONFIDENCE = 'Độ tin cậy'

export const ATTR_SENIOR_LINE = 'Dòng trưởng'

/*
Thuộc tính đã in ở đầu trang người (dòng "Đời 12", dòng "Ngày giỗ"), nên mục
Thông tin thêm không lặp lại nữa.
*/
export const PERSON_HEADING_ATTRIBUTES = [
  ATTR_GENERATION,
  ATTR_DEATH_ANNIVERSARY,
]

/*
Lời giải thích ngắn cho các thẻ mà pipeline gắn lên người, in ngay dưới dãy
thẻ trên hồ sơ. Thẻ "Đời N" và "Ngành x - Chi y" tự nói lên nghĩa nên không
có ở đây. Chữ viết cho con cháu trong họ đọc, không phải cho người làm dữ liệu.
*/
export const TAG_HINTS = {
  'Chỉ có tên':
    'chỉ được nhắc tên trong câu kể con của cha, sổ chưa có dòng riêng nên chưa có vợ con, ngày giỗ, phần mộ',
  'Cần soát lại':
    'quan hệ với cha được nối bằng phỏng đoán từ vị trí trong sổ, dòng họ cần xác nhận',
  'Dòng trưởng': 'có tên trong bảng hệ thống dòng trưởng của sổ họ',
  'Tuyệt tự': 'sổ ghi không có con trai nối dõi',
  'Không người nối dõi': 'sổ ghi không có con trai nối dõi',
  'Thất truyền':
    'sổ họ mất mạch ghi chép từ đây, chưa chắc là không còn hậu duệ',
  'Thủy tổ':
    'người đời thứ nhất của dòng họ, mọi người trong cây đều nối về cụ',
}

/*
Hai bài hướng dẫn trong mục Bài viết: cách đọc các chữ trên hồ sơ (đời, ngành
chi, thẻ, căn cứ nối cha) và cách đọc lịch giỗ âm lịch, cách gửi bổ sung.
*/
export const READING_GUIDE_PATH = '/blog/SBHNC15'

export const GIO_GUIDE_PATH = '/blog/SBHNC16'

/*
Người gốc mặc định của cây.

Bản gốc để trống cho tới khi mỗi người tự chọn một "người gốc", vì nó dựng cho
người nghiên cứu cây nhà mình. Ở đây thì ngược lại: khách vào là con cháu trong
họ, mở mục Gia phả ra phải thấy cây, không phải thấy dòng chữ "Chưa đặt người
chính". Mặc định là thuỷ tổ - người đời thứ nhất của dòng họ.

Vẫn chỉ là mặc định: ai đặt người gốc riêng thì lựa chọn đó được giữ.
*/
export const DEFAULT_HOME_PERSON = 'I0001'

/*
Tâm bản đồ mặc định: nhà thờ tổ họ Bùi Hữu, thôn Chỉ Bồ, xã Thụy Trường.

Bản gốc mở bản đồ ở tâm thế giới [20, 0] mức phóng 2 vì không biết người dùng ở
đâu. Ở đây thì biết: mọi mộ phần và nhà thờ tổ đều nằm trong một thôn ở Thái
Thụy, nên bản đồ mở thẳng ở đó.

Toạ độ là ước lượng theo tâm xã Thụy Trường (Wikidata Q10826720, 20,609°B
106,609°Đ); chưa có nguồn công khai nào ghi toạ độ thôn Chỉ Bồ hay nhà thờ tổ.
Khi đo được tại chỗ thì sửa hai số này, và sửa cả địa điểm cùng tên trong
phahe-import/phahe/emit.py để hai nơi khớp nhau.
*/
export const DEFAULT_MAP_CENTER = [20.6089, 106.6092]

export const DEFAULT_MAP_ZOOM = 15
