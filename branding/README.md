# Logo và favicon Bùi Hữu

Thiết kế ngày 03/09/2026 từ ảnh dấu chữ BÙI / HỮU do người dùng cung cấp.
Dùng công cụ ImageGen tích hợp, không dùng CLI/API dự phòng.

- `logo-bui-huu-master.png`: ấn son hai hàng chữ đầy đủ, dấu tiếng Việt đã kiểm tra.
- `favicon-bui-huu-master.png`: chữ BH giản lược, dùng ở 16–48 px.
- `../images/logo-bui-huu.png`: bản web 256 px cho đăng nhập, menu và lời tựa.
- `../images/favicon-bui-huu.ico`: ba kích thước 16, 32, 48 px.
- `../images/icon-bui-huu-192.png`, `icon-bui-huu-512.png`: biểu tượng ứng dụng.
- `../images/apple-touch-bui-huu.png`: biểu tượng iOS 180 px.

Nhận diện dùng chung tại đăng nhập, menu, lời tựa và thanh đầu trang của mọi
màn hình, gồm cả cây gia phả. Thanh đầu trang thu tên thành “Bùi Hữu” ở màn
hình nhỏ; tên cây tùy chỉnh vẫn được giữ. Open Graph/Twitter dùng ảnh nhà thờ
tổ bên dưới, không đưa hình ảnh hoặc thông tin người trong gia phả vào
metadata công khai. Các file `favicon.ico`, `icon192.png`, `icon512.png` cũ
cũng được xuất lại bằng logo mới để đồng bộ các đường dẫn còn lưu.

Chạy `pwsh -File branding/export-icons.ps1` trên Windows để xuất lại kích thước.
Ảnh gốc giữ trong `branding/`, không được chép vào bản build web. Chỉ các bản
thu nhỏ trong `images/` được dùng trên trang. Không gắn `purpose: maskable` vì
con dấu vuông có chi tiết gần viền.

## Ảnh nhà thờ tổ và bố cục ngày 03/09/2026

`nha-tho-to-chi-bo.png` là ảnh nhà thờ họ Bùi Hữu, thôn Chỉ Bồ do người dùng
cung cấp để thiết kế lại website. Giữ nguyên hình ảnh kiến trúc, chỉ thu nhỏ
và nén bằng `pwsh -File branding/export-temple.ps1` thành JPEG 800/1600 px
trong `images/`. Trình duyệt chọn kích thước theo màn hình bằng `srcset`.
Ảnh gốc không đưa vào bản build.

Trang chủ và đăng nhập dùng ảnh làm phần mở đầu. Bảng màu lấy từ gỗ sẫm,
mái ngói đỏ, cột đá và hoành phi vàng; header, thẻ nội dung, popup, cây gia
phả và footer dùng chung các biến `--heritage-*` trong `global.css`.
Ảnh chia sẻ liên kết là bản JPEG 1600 × 900; favicon và icon ứng dụng vẫn
dùng ấn son để dễ nhận ra ở kích thước nhỏ.

## Prompt thiết kế

Logo: Redesign the supplied two-line Vietnamese family seal as one dignified,
memorable production logo. Exact text BÙI / HỮU, correct Vietnamese diacritics.
Robust carved editorial serif letters, deep lacquer brick red #873E32 and
warm ivory #FFFCF6, square upright seal, inner engraved border with restrained
stepped corners, balanced spacing, subtle hand-cut edges. No extra text,
Chinese characters, trees, flowers, dragons, crowns, shadows or mockups.

Hiệu chỉnh logo: Preserve the lettering, border and proportions. The middle
character in HỮU must be U+1EEE, uppercase U with horn and tilde: a clearly
visible horizontal S-shaped wave with two opposite bends, never a cup/breve.
Keep the grave accent in BÙI. Replace the checkerboard entirely with a uniform
warm ivory background. One finished square logo with about 6% outer padding.

Favicon: Create one companion square icon from the approved seal, readable at
16x16 and 32x32. Exact text BH on one line, robust carved serif letters, broad
strokes and large open counters, no overlap. Brick red #873E32 background
edge-to-edge, ivory #FFFCF6 letters about 78% width, optically centered. Omit
thin borders and ornaments. No extra text, grid, paper, shadows or mockups.
