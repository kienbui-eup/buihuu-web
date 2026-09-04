/*
Cấu hình phía trình duyệt, được sao chép nguyên vào dist/config.js và nạp lúc
chạy (không đi qua bundler), nên sửa file này không cần dựng lại.

  familyCodeLogin  true thì trang đăng nhập hiện ô "Mã dòng họ". Mã là họ tên
                   đầy đủ của một người trong cây, viết liền, không phân biệt
                   hoa thường; máy chủ so mã (POST /api/token/family-code/) và
                   cấp token cho tài khoản khách chỉ xem đặt trong cấu hình
                   GRAMPSWEB_FAMILY_CODE_USERNAME của API (mặc định "khach",
                   vai trò 0 Guest, phải tạo sẵn trên máy chủ). Bỏ hoặc để
                   false là ẩn khối đó.
  hideRegisterLink ẩn nút đăng ký, vì trang đã tắt đăng ký tự do.
*/
window.grampsjsConfig = {
  familyCodeLogin: true,
  hideRegisterLink: true,
}
