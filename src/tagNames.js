/*
Tên thẻ theo handle, tải một lần cho cả phiên.

Hồ sơ người lồng trong hồ sơ khác (cha mẹ của một gia đình, con trong danh
sách) chỉ mang danh sách handle thẻ, không mang tên, trong khi ngành chi của
người nằm ở tên thẻ ("Ngành 2 - Chi 1"). Cây này có vài chục thẻ và gần như
không đổi, nên lấy một lần rồi dùng lại cho mọi chỗ cần.
*/

let tagNamesPromise = null

export function loadTagNames(appState) {
  if (!tagNamesPromise) {
    tagNamesPromise = appState
      .apiGet('/api/tags/?pagesize=500')
      .then(result => {
        if (!('data' in result)) {
          tagNamesPromise = null
          return new Map()
        }
        return new Map(result.data.map(tag => [tag.handle, tag.name]))
      })
      .catch(() => {
        tagNamesPromise = null
        return new Map()
      })
  }
  return tagNamesPromise
}

// Tên thẻ của một hồ sơ người, từ danh sách handle của nó.
export function tagNamesOf(person, tagNames) {
  return (person?.tag_list || [])
    .map(handle => tagNames?.get(handle))
    .filter(Boolean)
}

// Chỉ để kiểm thử: quên bộ nhớ đệm giữa hai lần chạy.
export function resetTagNames() {
  tagNamesPromise = null
}
