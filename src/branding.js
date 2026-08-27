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
