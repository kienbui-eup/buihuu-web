/*
Danh sách trang dùng chung cho điều hướng trên trang.

Năm mục đầu của nhóm Tra cứu nằm cạnh tên trang trên màn hình rộng
(GrampsjsHeaderNav); toàn bộ ba nhóm nằm trong bảng mở từ nút tài khoản
(GrampsjsSettingsMenu), cùng với các mục theo quyền của người đăng nhập. Gom
một chỗ để hai nơi không lệch nhau khi thêm bớt trang.
*/

import {
  mdiHome,
  mdiFamilyTree,
  mdiAccountGroup,
  mdiCandle,
  mdiRss,
  mdiMap,
  mdiMagnify,
  mdiTimelineOutline,
  mdiImage,
  mdiDna,
  mdiCreation,
  mdiFileDocumentOutline,
  mdiBookOpenPageVariant,
  mdiHelpCircleOutline,
  mdiMessageTextOutline,
} from '@mdi/js'
import {
  ARTICLE_GIOI_THIEU,
  ARTICLE_HUONG_DAN,
  ARTICLE_GOP_Y,
} from './components/GrampsjsSiteFooter.js'

// Các route thuộc mục "Người trong họ": mở một người, một gia đình, một sự
// kiện... vẫn tính là đang ở mục này.
const PEOPLE_PAGES = [
  'people',
  'person',
  'families',
  'family',
  'events',
  'event',
  'places',
  'place',
  'sources',
  'source',
  'citations',
  'citation',
  'repositories',
  'repository',
  'notes',
  'note',
]

// host là phần tử có mixin GrampsjsAppStateMixin (cần this._ và this.appState).
export function mainLinks(host) {
  return [
    {key: 'home', href: '/', label: 'Trang chủ', icon: mdiHome},
    {key: 'tree', href: '/tree', label: 'Cây gia phả', icon: mdiFamilyTree},
    {
      key: 'people',
      href: '/people',
      label: 'Dòng họ',
      icon: mdiAccountGroup,
    },
    {key: 'lich-gio', href: '/lich-gio', label: 'Lịch giỗ', icon: mdiCandle},
    {key: 'blog', href: '/blog', label: 'Bài viết', icon: mdiRss},
    {key: 'map', href: '/map', label: host._('Map'), icon: mdiMap},
    {key: 'search', href: '/search', label: host._('Search'), icon: mdiMagnify},
  ]
}

export function researchLinks(host) {
  return [
    {
      key: 'timeline',
      href: '/timeline',
      label: host._('Timeline'),
      icon: mdiTimelineOutline,
    },
    {
      key: 'medialist',
      href: '/medialist',
      label: host._('Media'),
      icon: mdiImage,
    },
    ...(!host.appState.frontendConfig?.hideDNALink
      ? [
          {
            key: 'dna-matches',
            href: '/dna-matches',
            label: host._('DNA'),
            icon: mdiDna,
          },
        ]
      : []),
    ...(host.canUseChat
      ? [
          {
            key: 'chat',
            href: '/chat',
            label: host._('Assistant'),
            icon: mdiCreation,
          },
        ]
      : []),
    {
      key: 'reports',
      href: '/reports',
      label: host._('_Reports'),
      icon: mdiFileDocumentOutline,
    },
  ]
}

export function aboutLinks() {
  return [
    {
      key: 'gioi-thieu',
      href: ARTICLE_GIOI_THIEU,
      label: 'Giới thiệu dòng họ',
      icon: mdiBookOpenPageVariant,
    },
    {
      key: 'huong-dan',
      href: ARTICLE_HUONG_DAN,
      label: 'Hướng dẫn tra cứu',
      icon: mdiHelpCircleOutline,
    },
    {
      key: 'gop-y',
      href: ARTICLE_GOP_Y,
      label: 'Góp ý, sửa sai',
      icon: mdiMessageTextOutline,
    },
  ]
}

// Mục có key là trang tra cứu (một key có thể gom nhiều route); mục không có
// key (các mục tài khoản) so đúng đường dẫn.
export function isCurrentLink(path, {key, href}) {
  const {page, pageId} = path ?? {}
  const current = pageId ? `/${page}/${pageId}` : `/${page}`
  if (href.startsWith('/blog/')) return current === href
  if (key === 'people') return PEOPLE_PAGES.includes(page)
  if (key === 'dna-matches')
    return ['dna-matches', 'dna-chromosome', 'ydna'].includes(page)
  if (key === 'reports') return ['reports', 'report'].includes(page)
  if (key) return key === page
  return current === href
}
