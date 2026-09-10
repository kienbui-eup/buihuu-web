# Logo và favicon Bùi Hữu

## Đồng bộ giao diện ngày 11/09/2026

Trang đăng nhập có logo ngang ở đầu, toàn cảnh nhà thờ và lời chào bên trái; khung mã dòng họ bên phải. Trên điện thoại, ảnh lên trước rồi tới ô nhập mã. Đăng nhập người biên soạn dùng mục mở rộng; tự mở nếu không có lối vào bằng mã hoặc hệ thống yêu cầu SSO. Giữ đăng nhập, đăng ký, quên mật khẩu và các nhà cung cấp SSO.

Bảng màu chung nằm trong `global.css` và `src/theme.js`: giấy ngà, son đỏ, chữ nâu và viền vàng trầm; có biến tương ứng cho chế độ tối. `HeritageStyles.js` dùng khung viền đơn, bóng nhẹ, bỏ nền kẻ ô và viền lồng nhiều lớp. Header, hero, chân trang, danh sách và Kho sử dùng chung các biến này. Biểu tượng cây mới thay ấn son trong các thành phần nhận diện; phả đồ giữ màu phân biệt các loại thẻ của nó.

## Header và hero ngày 10/09/2026

- Logo ngang mới: `logo-bui-huu-ngang.png` (nguồn PNG trong suốt), bản web `../images/logo-bui-huu-ngang-v2.png` 720 × 240 px. Header hiển thị 180 × 60 px trên máy tính và 138 × 46 px trên điện thoại; trang đăng nhập dùng 240 × 80 px.
- `logo-bui-huu-v2.png` là mẫu bố cục đứng cùng nhận diện cây và rễ. Các vị trí nhận diện trong trang dùng `../images/logo-bui-huu-v2.png` 256 px; favicon chưa đổi.
- Header nền ngà, điều hướng màu son; logo liên kết về trang chủ, tên cây tùy chỉnh vẫn được giữ.
- Hero đưa toàn cảnh nhà thờ lên trước phần chữ, rộng tối đa 1120 px; ảnh giữ tỷ lệ gốc, không cắt hoặc phủ chữ. Chú thích nằm ngoài ảnh. Phần giới thiệu và lời tựa chia hai cột trên máy tính, xếp dọc trên điện thoại; giữ nút mở phả đồ và hồ sơ thủy tổ.
- Không chạy `export-icons.ps1` để xuất logo ngang: script đó vẫn dành cho bộ ấn son vuông bên dưới.

## Bộ ấn son ngày 04/09/2026

Thiết kế lại ngày 04/09/2026 từ ảnh dấu chữ BÙI / HỮU do người dùng cung cấp.
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

Chạy `pwsh -File branding/export-icons.ps1` trên Windows để xuất lại kích thước;
script dùng Python và Pillow để bỏ nhiễu màu thừa trong ảnh ImageGen trước khi
đóng gói favicon.
Ảnh gốc giữ trong `branding/`, không được chép vào bản build web. Chỉ các bản
thu nhỏ trong `images/` được dùng trên trang. Không gắn `purpose: maskable` vì
con dấu vuông có chi tiết gần viền.

## Ảnh nhà thờ tổ và bố cục ngày 03/09/2026

`nha-tho-to-chi-bo.png` là bản phục dựng nhà thờ họ Bùi Hữu, thôn Chỉ Bồ
bằng ImageGen tích hợp, được người dùng chọn thay vào website. Bản này đã
chỉnh mái ngói, bàn thờ, mặt sân và bậc thềm, thêm cổng vòm hồi trái với
bậc xuống khu chuẩn bị lễ, cất giữ và rửa đồ có mái che riêng ở bên hông,
đồng bộ tường khu phụ; giữ nguyên cặp cột trụ lớn theo ảnh chuẩn người dùng cung
cấp. Hai tường hông chạy thẳng từ cột đá về phía sau; tam cấp cửa vòm nằm trong
hành lang sau cột trái, không nối vòng vào bậc mặt tiền. Cổng phải rộng 4,5 m,
cao 4 m nằm trong tuyến tường song song với lưng nhà thờ và cách nhà khoảng
1,2 m, thông với sân qua lối bên hông. Khu chuẩn bị lễ không đặt trên
hiên nhà thờ. Hai khu bên dựng theo mô tả; chữ Hán
trên mái là bản đọc tạm từ ảnh bị che, chưa phải bản chép văn tự đã xác minh.

Giữ nguyên bản được chọn, chỉ thu nhỏ và nén bằng
`pwsh -File branding/export-temple.ps1` thành JPEG 800/1600 px trong `images/`
(khoảng 86/315 KiB). Trình duyệt chọn kích thước bằng `srcset`. Đường dẫn ảnh
trong `GrampsjsTempleHero.js` và metadata chia sẻ dùng tên tệp có hậu tố
`4737852c` (tám ký tự đầu SHA-256 ảnh nguồn) để trình duyệt và máy chủ tải lại
ảnh mới. Khi thay ảnh, cập nhật cùng phiên bản tại các vị trí này. Ảnh nguồn
không đưa vào bản build.
Prompt hiệu chỉnh khu phụ lưu tại [nha-tho-to-prompt.md](nha-tho-to-prompt.md).

Trang chủ và đăng nhập dùng ảnh làm phần mở đầu. Bảng màu lấy từ gỗ sẫm,
mái ngói đỏ, cột đá và hoành phi vàng; header, thẻ nội dung, popup, cây gia
phả và footer dùng chung các biến `--heritage-*` trong `global.css`.
Khung ảnh giữ tỷ lệ nguồn trên điện thoại và máy tính để không cắt mất
hai cột đá, khu chuẩn bị lễ hoặc cổng bên phải.
Ảnh chia sẻ liên kết là bản JPEG 1600 × 900; favicon và icon ứng dụng vẫn
dùng ấn son để dễ nhận ra ở kích thước nhỏ.

## Prompt thiết kế

Logo: Use case: logo-brand. Refine the supplied two-line Vietnamese family seal
into a memorable ancestral-house mark. Exact text “BÙI” on the first line and
“HỮU” on the second line, preserving every diacritic. Crisp vector-friendly
carved seal, robust editorial serif lettering, a subtle shallow tiled-roof
silhouette and small stepped stone-pillar corner cuts. Deep lacquer red
#873E32, warm ivory #FFFCF6 and one restrained muted-gold #C7A35B inner accent.
Square, symmetrical, about 7% safe padding, thick strokes readable at 32 px.
No shadows, gradients, mockup, texture, people, trees, animals, dragons,
Chinese characters, extra letters or watermark.

Favicon: Use case: logo-brand. Redesign the existing BH favicon as a companion
to the approved full seal. Exact uppercase text “BH” on one line, extremely
large and optically centered, with broad ivory editorial serif strokes and open
counters. Deep lacquer-red square field, a very shallow ancestral-house roof
silhouette and one robust muted-gold inner keyline visible at 32 px. About 6%
safe padding, flat vector-friendly shapes. No other text, accents, shadows,
gradients, texture, mockup, people, trees, dragons, Chinese characters or
watermark.

## Dễ đọc cho người lớn tuổi

Chữ nội dung chung 18 px; ô nhập 18 px, nhãn và hướng dẫn đăng nhập 17 px. Nhãn điều hướng điện thoại 14 px được xuống dòng; nút và bộ chọn tháng có vùng bấm ít nhất 48 px ở các vị trí đã chỉnh. Tên trong lịch giỗ 18 px, đời/chi 16 px. Tăng khoảng chừa dưới nội dung lên 112 px cho thanh điều hướng lớn hơn. Giữ các thay đổi bố cục điện thoại đang có.

## Biểu tượng điều hướng điện thoại

Bộ SVG riêng trong `GrampsjsBottomNav.js`: mái nhà thờ, sơ đồ các đời, nhóm người thân, lịch giỗ và kính lúp. Khung 24 × 24, hiển thị 28 px, nét bo tròn 1.8 (2.1 ở mục hiện tại). Màu theo trạng thái điều hướng, giữ nhãn chữ 14 px. SVG trang trí được ẩn với trình đọc màn hình; tên liên kết và luồng tìm kiếm giữ nguyên.

## Lịch giỗ trên máy tính

Từ 1200 px, tiêu đề và công cụ nằm cạnh nhau. Danh sách Sắp tới có trên sáu ngày được chia hai cột như danh sách tháng; giữ từng ngày trọn vẹn trong một cột. Cả năm và kết quả tìm kiếm xếp các tháng thành hai cột, tránh chia lồng bảng thành bốn cột. Trong các bảng hẹp, đời/chi nằm ngay dưới tên. Khi in trở về một cột. Điện thoại giữ bố cục một cột.

## Nền quê hương Chỉ Bồ

`chi-bo-landscape-master.png` do ImageGen tạo; bản web `../images/chi-bo-landscape-v1.jpg` 1600 × 533 px. Minh họa màu nước gợi biển vô cực và đền Chòi, không phải ảnh tư liệu hoặc bản phục dựng chính xác. Tham chiếu kiến trúc cổng chồng diêm ba tầng: https://banquanlyditichhy.vn/den-choi-thai-binh-ban-hung-ca-khai-hoang-ben-song-nuoc-thuy-truong-c2704.html . Không dùng ảnh báo chí làm tài nguyên website.

Nền dùng ở lớp trang chung và trang đăng nhập. Chân trang dùng nền đặc, viền mảnh và khoảng đệm 32 px để không lặp lại tranh phía trên. Phủ lớp màu ngà hoặc nâu tối để giảm tương phản của hình, giữ nguyên nền đặc của ô nhập và bảng dữ liệu. Nhà thờ họ vẫn là ảnh chính.

## Nền thống nhất toàn trang

Phong cảnh được vẽ đúng một lần trên `body`, cố định theo khung nhìn, không lặp. Khung ứng dụng, vùng ngoài hero, đầu Kho sử, trang đăng nhập và phả đồ trong suốt để dùng chung nền đó. Bỏ các lớp cành cây và nền phả đồ riêng. Thẻ nội dung, ảnh nhà thờ, ô nhập, thanh điều hướng và footer vẫn có nền đặc. Độ phủ sáng/tối lấy từ `--heritage-page-background`.


## Tranh riêng cho phả đồ: nhà thờ họ và đồng quê

`../images/chi-bo-tree-landscape-v2.png` tạo bằng công cụ imagegen tích hợp, dùng ảnh `nha-tho-to-1600-4737852c.jpg` làm tham chiếu kiến trúc. Đây là tranh gợi quê hương, không phải cảnh quan thực địa Chỉ Bồ. Phả đồ dùng tranh riêng; nền chung các trang khác giữ nguyên. Trên điện thoại tranh nằm ở phần dưới, ưu tiên giữ nhà thờ trong khung nhìn.

Prompt: Create a panoramic 1536x1024 painted background for a Vietnamese genealogy website. Faithfully preserve the reference ancestral temple's single broad red tiled roof, grey pillars and steps in the lower right. Northern Vietnamese flat rural delta, golden rice, village path, bamboo, areca and reflective water at warm dawn. Detailed watercolor on ivory paper, vermilion, gold and olive. Landscape on lower 45 percent and outer edges, luminous quiet upper center for the chart. Artistic evocation, not documentary. No invented monumental gates, pagodas, mountains, people, text or UI; plain dark wood signboard.

Header và footer cũng dùng tranh v2 theo yêu cầu tiếp theo. Header lấy lát cắt mái ngói/đồng quê, phủ màu nền 70–78%; footer phủ 76–86%, định vị về phía nhà thờ. Màu phủ theo theme; không chặn tương tác và không tăng chiều cao header.


## Header và footer son–ngà (bản chỉnh tiếp 11/09/2026)

Header phủ son đậm lên phong cảnh, chữ ngà, logo nằm trên nền ngà viền vàng; mục điều hướng hiện tại có nền và khung riêng. Giữ chiều cao 56/64 px để không giảm không gian phả đồ. Footer đầy đủ có dải tranh rõ nét với câu “Nơi con cháu hướng về”, rồi ba nhóm thông tin trên nền son và hàng ghi công tối hơn. Điện thoại xếp một cột, liên kết hai cột; footer gọn của phả đồ giữ chiều cao cũ. Đã kiểm tra ảnh thực ở 320/390/1440 px, header khi cuộn, điều hướng vào phả đồ và theme tối; lint/build đạt.
