/*
Nạp maplibre-gl khi cần, không nạp sẵn lúc khởi động.

maplibre-gl cùng plugin ngày tháng lịch sử và Diplomat nặng gần 800 KB chưa nén,
mà chỉ trang Bản đồ và trang địa điểm có toạ độ mới dùng. Import tĩnh ở
GrampsjsMap.js kéo cả khối đó vào gói khởi động của mọi trang, kể cả trang chủ
trên điện thoại. Import động ở đây tách nó thành một chunk riêng, tải lần đầu
khi có bản đồ hiện ra.

Thư viện tự gắn `window.maplibregl` khi được nạp, các thành phần bản đồ vẫn
dùng tên toàn cục đó như trước. Diplomat được gắn vào `window.grampsjsDiplomat`
để GrampsjsMap dịch nhãn bản đồ lịch sử mà không phải import tĩnh.

Nơi dựng `<grampsjs-map>` phải chờ loadMaplibre() xong rồi mới render, vì các
thành phần con (marker, lớp phủ) lấy đối tượng bản đồ từ cha ngay trong
firstUpdated của chúng.
*/

let pending = null

export function maplibreReady() {
  return Boolean(window.maplibregl && window.grampsjsDiplomat)
}

export function loadMaplibre() {
  if (maplibreReady()) return Promise.resolve(window.maplibregl)
  if (!pending) {
    pending = import('maplibre-gl')
      .then(mod => {
        if (!window.maplibregl) window.maplibregl = mod.default ?? mod
        return import('@openhistoricalmap/maplibre-gl-dates')
      })
      .then(() => import('@americana/diplomat'))
      .then(Diplomat => {
        window.grampsjsDiplomat = Diplomat
        return window.maplibregl
      })
      .catch(error => {
        pending = null
        throw error
      })
  }
  return pending
}
