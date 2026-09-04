import {normalizeTreeView} from './treeDefaults.js'

const location = (grampsId, view) => ({
  grampsId: grampsId || '',
  view: normalizeTreeView(view),
})

const sameLocation = (left, right) =>
  left?.grampsId === right?.grampsId && left?.view === right?.view

// Lịch sử của phả đồ phải lưu cả người lẫn phạm vi. Nếu chỉ lưu mã người,
// nút quay lại có thể đưa đúng người vào sai nhánh sau khi đổi cách xem.
export class TreeNavigationHistory {
  constructor(limit = 100) {
    this.limit = limit
    this.current = null
    this.entries = []
  }

  observe(grampsId, view) {
    const next = location(grampsId, view)
    if (sameLocation(this.current, next)) return
    if (this.current) {
      this.entries = [...this.entries, this.current].slice(-this.limit)
    }
    this.current = next
  }

  back() {
    if (!this.entries.length) return null
    const previous = this.entries[this.entries.length - 1]
    this.entries = this.entries.slice(0, -1)
    this.current = previous
    return previous
  }

  get canBack() {
    return this.entries.length > 0
  }
}
