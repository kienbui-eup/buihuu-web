/*
Cấu hình phía trình duyệt, được sao chép nguyên vào dist/config.js và nạp lúc
chạy (không đi qua bundler), nên sửa file này không cần dựng lại.

  guestUsername    tên tài khoản khách chỉ xem; trang đăng nhập hiện ô "Mã dòng
                   họ" và dùng mã đó làm mật khẩu của tài khoản này. Để rỗng
                   hoặc bỏ đi là ẩn khối đó. Tài khoản phải được tạo trên máy
                   chủ với vai trò 0 (Guest).
  hideRegisterLink ẩn nút đăng ký, vì trang đã tắt đăng ký tự do.
*/
window.grampsjsConfig = {
  guestUsername: 'khach',
  hideRegisterLink: true,
}
