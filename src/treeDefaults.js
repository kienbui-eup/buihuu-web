export const TREE_VIEWS = [
  'ancestor',
  'descendant',
  'hourglass',
  'relationship',
  'fan',
]

// The home person is the founding ancestor, who by definition has no
// ancestors: opening on the ancestor tree shows a single empty box. A
// lineage is read downwards, so the descendant tree is the useful landing
// view. Users can still pick their own default in settings.
export const DEFAULT_TREE_VIEW = 'descendant'

export function getTreeViewTabIndex(view) {
  const index = TREE_VIEWS.indexOf(view)
  if (index !== -1) {
    return index
  }
  return TREE_VIEWS.indexOf(DEFAULT_TREE_VIEW)
}
