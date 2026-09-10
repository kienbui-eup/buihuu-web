import {css} from 'lit'

// Nhận diện chung cho nhánh chính và sơ đồ quan hệ: son, ngà và nét vàng
// của logo cây Bùi Hữu. Nền son chỉ người đã mất; người mốc có viền vàng đậm.
export const treeHeritageStyles = css`
  svg a {
    text-decoration: none !important;
  }
  svg .person-deceased,
  svg .person-living {
    --person-card-text: var(--heritage-ink);
    --person-card-muted-text: var(--heritage-muted);
  }
  svg .person-card,
  svg .personBox,
  svg .nameplate-body {
    fill: var(--md-sys-color-surface);
    stroke: var(--heritage-rule);
    stroke-width: 1px;
    rx: 12px;
    ry: 12px;
    vector-effect: non-scaling-stroke;
    filter: drop-shadow(0 3px 5px var(--grampsjs-body-font-color-10));
    transition: fill 140ms, stroke 140ms;
  }
  svg .person-deceased {
    --person-card-text: #fff8ec;
    --person-card-muted-text: #f1debd;
  }
  svg .person-deceased .person-card,
  svg .person-deceased .personBox {
    fill: #873e32;
    stroke: var(--heritage-gold);
  }
  svg .life-status {
    fill: var(--person-card-muted-text);
  }
  svg .person-living .person-card,
  svg .person-living .personBox {
    fill: transparent;
    stroke: transparent;
    filter: none;
  }
  svg .tree-link,
  svg .edges path {
    stroke: var(--heritage-accent);
    stroke-opacity: 0.4;
    stroke-width: 1.4px;
    stroke-linecap: round;
    vector-effect: non-scaling-stroke;
  }
  svg .memorial-inset,
  svg .memorial-base {
    display: none;
  }
  svg .memorial-crest {
    fill: none;
    stroke: var(--heritage-gold);
    stroke-width: 1px;
    stroke-linecap: round;
    stroke-linejoin: round;
    vector-effect: non-scaling-stroke;
  }
  svg .living-avatar-halo,
  svg .memorial-portrait-bg {
    fill: color-mix(
      in srgb,
      var(--heritage-gold) 15%,
      var(--md-sys-color-surface)
    );
    stroke: var(--heritage-gold);
    stroke-width: 1px;
    vector-effect: non-scaling-stroke;
  }
  svg .living-avatar-icon,
  svg .memorial-portrait-icon {
    fill: var(--heritage-accent);
  }
  svg .memorial-portrait-ring {
    fill: none;
    stroke: var(--heritage-gold);
    stroke-width: 1px;
    vector-effect: non-scaling-stroke;
    pointer-events: none;
  }
  svg .living-avatar-photo,
  svg .memorial-photo {
    stroke: var(--heritage-gold);
    stroke-width: 1.5px;
    vector-effect: non-scaling-stroke;
  }
  svg
    :is(.tree-root, .tree-selected, .person.selected)
    :is(.person-card, .personBox, .nameplate-body) {
    stroke: var(--heritage-gold);
    stroke-width: 3px;
    filter: drop-shadow(0 0 4px var(--heritage-gold));
  }
  svg
    :is(.tree-root, .tree-selected, .person.selected).person-living
    :is(.person-card, .personBox) {
    fill: transparent;
    stroke: transparent;
  }
  svg
    :is(a, .person):is(:hover, :focus-visible)
    :is(.person-card, .personBox, .nameplate-body) {
    stroke: var(--heritage-accent);
    stroke-width: 2.5px;
  }
  svg .person-living:is(:hover, :focus-visible) :is(.person-card, .personBox) {
    stroke: transparent;
  }
  svg :is(a, .person):focus-visible {
    outline: none;
  }
  mwc-menu {
    --mdc-typography-subtitle1-font-size: 13px;
    --mdc-menu-item-height: 44px;
  }
  @media (prefers-reduced-motion: reduce) {
    svg .person-card,
    svg .personBox,
    svg .nameplate-body {
      transition: none;
    }
  }
`
