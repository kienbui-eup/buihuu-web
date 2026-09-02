export const TREE_VIEWS = ['ancestor', 'relationship']

// Các tab cũ chuyển về cây dòng trưởng, kể cả thiết lập đã lưu trước đây.
export const DEFAULT_TREE_VIEW = 'ancestor'

export function getTreeViewTabIndex(view) {
  const index = TREE_VIEWS.indexOf(view)
  if (index !== -1) {
    return index
  }
  return TREE_VIEWS.indexOf(DEFAULT_TREE_VIEW)
}
