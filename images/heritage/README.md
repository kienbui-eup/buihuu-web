# Ảnh minh họa thẻ người

## Bộ 17 đời (08/09/2026)

`generations-v3/doi-01-nam.jpg` đến `doi-17-nu.jpg`: mỗi đời một cặp nam–nữ
riêng. Hai ảnh `thieu-nien-nam.jpg` và `thieu-nien-nu.jpg` phục vụ hồ sơ có
năm sinh cho thấy tuổi 12–17, để không dùng ảnh trẻ nhỏ cho thiếu niên.

Ảnh được tạo bằng ImageGen, dùng nhân vật hư cấu và mô tả trang phục chung.
Không dùng ảnh hoặc dữ liệu cá nhân trong cây làm đầu vào. Đây là minh họa
giao diện, không phải chân dung xác thực hoặc phục dựng niên đại của dòng họ.

| Đời | Hướng tạo hình ước lệ khi thiếu năm sinh |
| --- | --- |
| 1–4 | Tiền nhân: áo vải giao lĩnh giản dị, khăn vấn, màu nâu/chàm |
| 5–8 | Nếp nhà xưa: áo cổ đứng, áo tứ thân, khăn vấn hoặc khăn mỏ quạ |
| 9–12 | Các thế hệ trước: áo dài mộc mạc, áo cánh và áo sơ mi vải |
| 13 | Lớp ông bà, tóc bạc, trang phục hiện đại giản dị |
| 14 | Trung niên, trang phục hiện đại |
| 15 | Trưởng thành, trang phục hiện đại |
| 16 | Thanh niên/người trẻ trưởng thành, trang phục hiện đại |
| 17 | Trẻ nhỏ, sinh khoảng 2018–2022 theo thông tin người quản lý |

Mốc đời 17 do người quản lý cung cấp ngày 08/09/2026. Khi thiếu năm sinh,
bộ chọn ảnh dùng khoảng năm 2020; ở năm 2026 tương ứng khoảng 6 tuổi.
Đây chỉ là quy ước chọn ảnh, không bổ sung năm sinh vào hồ sơ. Không lùi đều
25–30 năm để suy ra năm sinh các đời trước: các chi có thế thứ và lứa tuổi chồng lấn.

`src/charts/personPortrait.js` chọn ảnh dùng chung cho cây chính và biểu đồ quan hệ:

1. Có ảnh trong hồ sơ: lớp vẽ ưu tiên ảnh thật cùng vùng cắt đã lưu.
2. Có năm sinh: chọn nhóm tuổi phù hợp, tính đến năm mất nếu có năm mất.
3. Có thông tin mất nhưng thiếu năm mất: không lấy năm hiện tại tính tuổi thọ.
4. Thiếu năm sinh: dùng mẫu theo đời, với mốc khoảng 2020 riêng cho đời 17.
5. Chưa rõ giới tính: dùng biểu tượng trung tính.

Nguồn tham khảo tạo hình, không dùng để gán niên đại cho dòng họ:

- [Tạo hình trang phục phụ nữ Kinh Bắc truyền thống – Văn hóa Nghệ thuật](https://vanhoanghethuat.vn/tao-hinh-trang-phuc-phu-nu-kinh-bac-truyen-thong-77748003.html).
- [Áo ngũ thân tay chẽn – Việt Phục Hoàng Thành](https://vietphuchoangthanh.com/ao-ngu-than-tay-chen/).

Ảnh giao diện xuất JPEG 256 × 256 px, cùng góc nhìn chính diện, vị trí khuôn mặt
và nền giấy ấm, để hiển thị trong khung tròn 40–44 px. Mã vùng cắt/pattern riêng
giúp không dùng nhầm ảnh giữa các thẻ hoặc biểu đồ.

## Bộ trước

`avatar-*-v2.jpg` là bộ sáu ảnh thử nghiệm ngày 07/09/2026. Bộ theo 17 đời thay
thế bộ này trong thẻ cây; giữ các file cũ để tham chiếu, không dùng làm ảnh thật.
