import {mdiAccountOutline} from '@mdi/js'

export const CARD_AVATAR_X = 30
export const CARD_AVATAR_Y = 22

const PORTRAITS = {
  elder: {
    female: 'images/heritage/avatar-cu-ba.png',
    male: 'images/heritage/avatar-cu-ong.png',
  },
  adult: {
    female: 'images/heritage/avatar-nu-trung-nien.png',
    male: 'images/heritage/avatar-nam-trung-nien.png',
  },
  child: {
    female: 'images/heritage/avatar-be-gai.png',
    male: 'images/heritage/avatar-be-trai.png',
  },
}

const scallopedCirclePath = (cx, cy, radius, lobes = 12) => {
  const points = Array.from({length: lobes * 8}, (_, index) => {
    const angle = (index * Math.PI * 2) / (lobes * 8) - Math.PI / 2
    const waveRadius = radius + Math.cos(lobes * angle) * 2
    return `${cx + Math.cos(angle) * waveRadius},${
      cy + Math.sin(angle) * waveRadius
    }`
  })
  return `M${points.join('L')}Z`
}

const portraitAsset = (gender, ageGroup) =>
  PORTRAITS[ageGroup]?.[gender] || PORTRAITS.adult[gender]

const clipId = (kind, nodeId, d, index) => {
  const value = String(nodeId(d, index) || index).replace(/[^a-z0-9_-]/giu, '-')
  return `person-avatar-${kind}-${value}-${index}`
}

// Hai kiểu ô người: bài vị gỗ cho người đã mất và bảng tên sáng cho người
// sống/chưa rõ ngày mất. Chân dung mặc định chọn theo giới tính và nhóm tuổi,
// được đặt ở góc trên trái để không che phần tên và thông tin trong bảng.
export function appendPersonCardDecoration(
  nodes,
  width,
  height,
  {
    x = 0,
    y = 0,
    deceased = () => false,
    gender = () => 'unknown',
    ageGroup = () => 'adult',
    hasImage = () => false,
    nodeId = (_d, index) => index,
  } = {}
) {
  nodes
    .classed('person-deceased', deceased)
    .classed('person-living', d => !deceased(d))
    .classed('person-female', d => gender(d) === 'female')
    .classed('person-male', d => gender(d) === 'male')
    .classed('person-child', d => ageGroup(d) === 'child')
    .classed('person-adult', d => ageGroup(d) === 'adult')
    .classed('person-elder', d => ageGroup(d) === 'elder')

  const living = nodes.filter(d => !deceased(d))
  const nameplate = living
    .append('g')
    .attr('class', 'nameplate-decoration')
    .attr('pointer-events', 'none')
  nameplate
    .append('rect')
    .attr('class', 'nameplate-body')
    .attr('x', x + 12)
    .attr('y', y + 28)
    .attr('width', width - 20)
    .attr('height', height - 34)
    .attr('rx', (height - 34) / 2)
  nameplate
    .append('path')
    .attr('class', 'living-avatar-halo')
    .attr('d', scallopedCirclePath(x + CARD_AVATAR_X, y + CARD_AVATAR_Y, 24))

  const livingPortrait = nameplate
    .filter(d => !hasImage(d))
    .append('g')
    .attr('class', 'living-avatar')
    .attr('transform', `translate(${x + CARD_AVATAR_X},${y + CARD_AVATAR_Y})`)
  livingPortrait
    .append('clipPath')
    .attr('id', (d, index) => clipId('living', nodeId, d, index))
    .append('circle')
    .attr('r', 21)
  livingPortrait
    .filter(d => Boolean(portraitAsset(gender(d), ageGroup(d))))
    .append('image')
    .attr('class', 'living-avatar-image')
    .attr('href', d => portraitAsset(gender(d), ageGroup(d)))
    .attr('x', -22)
    .attr('y', -22)
    .attr('width', 44)
    .attr('height', 44)
    .attr(
      'clip-path',
      (d, index) => `url(#${clipId('living', nodeId, d, index)})`
    )
    .attr('preserveAspectRatio', 'xMidYMid meet')
  livingPortrait
    .filter(d => !portraitAsset(gender(d), ageGroup(d)))
    .append('path')
    .attr('class', 'living-avatar-icon')
    .attr('d', mdiAccountOutline)
    .attr('transform', 'translate(-15.6,-15.6) scale(1.3)')

  const memorial = nodes.filter(deceased)
  memorial
    .append('rect')
    .attr('class', 'memorial-inset')
    .attr('x', x + 6)
    .attr('y', y + 6)
    .attr('width', width - 12)
    .attr('height', height - 12)
    .attr('rx', 6)
    .attr('pointer-events', 'none')
  memorial
    .append('path')
    .attr('class', 'memorial-base')
    .attr('d', `M${x + 18},${y + height - 9}H${x + width - 18}`)
    .attr('pointer-events', 'none')
  memorial
    .append('path')
    .attr('class', 'memorial-crest')
    .attr(
      'd',
      `M${x + width / 2 - 13},${y + 10}H${x + width / 2 - 4}L${x + width / 2},${
        y + 13
      }L${x + width / 2 + 4},${y + 10}H${x + width / 2 + 13}`
    )
    .attr('pointer-events', 'none')

  const portrait = memorial
    .filter(d => !hasImage(d))
    .append('g')
    .attr('class', 'memorial-portrait')
    .attr('transform', `translate(${x + CARD_AVATAR_X},${y + CARD_AVATAR_Y})`)
    .attr('pointer-events', 'none')
  portrait.append('circle').attr('class', 'memorial-portrait-bg').attr('r', 22)
  portrait
    .append('clipPath')
    .attr('id', (d, index) => clipId('memorial', nodeId, d, index))
    .append('circle')
    .attr('r', 19.5)
  portrait
    .filter(d => Boolean(portraitAsset(gender(d), ageGroup(d))))
    .append('image')
    .attr('class', 'memorial-portrait-image')
    .attr('href', d => portraitAsset(gender(d), ageGroup(d)))
    .attr('x', -20)
    .attr('y', -20)
    .attr('width', 40)
    .attr('height', 40)
    .attr(
      'clip-path',
      (d, index) => `url(#${clipId('memorial', nodeId, d, index)})`
    )
    .attr('preserveAspectRatio', 'xMidYMid meet')
  portrait
    .filter(d => Boolean(portraitAsset(gender(d), ageGroup(d))))
    .append('circle')
    .attr('class', 'memorial-portrait-ring')
    .attr('r', 20)
  portrait
    .filter(d => !portraitAsset(gender(d), ageGroup(d)))
    .append('path')
    .attr('class', 'memorial-portrait-icon')
    .attr('d', mdiAccountOutline)
    .attr('transform', 'translate(-13.2,-13.2) scale(1.1)')
}
