export const TREE_VIEWS = ['main', 'descendants', 'branch', 'all']

export const TREE_VIEW_LABELS = {
  main: 'Nhánh chính (rút gọn)',
  descendants: 'Hậu duệ',
  branch: 'Toàn nhánh',
  all: 'Toàn gia phả',
}

// Các tab cũ chuyển về cây dòng trưởng, kể cả thiết lập đã lưu trước đây.
export const DEFAULT_TREE_VIEW = 'main'

export function normalizeTreeView(view) {
  if (TREE_VIEWS.includes(view)) return view
  if (view === 'relationship' || view === 'descendant') return 'descendants'
  return DEFAULT_TREE_VIEW
}

export function getTreeViewTabIndex(view) {
  const index = TREE_VIEWS.indexOf(normalizeTreeView(view))
  if (index !== -1) {
    return index
  }
  return TREE_VIEWS.indexOf(DEFAULT_TREE_VIEW)
}
