import {mdiAccountOutline} from '@mdi/js'

export const CARD_AVATAR_X = 28
const LIVING_AVATAR_Y = 8
export const MEMORIAL_AVATAR_Y = 18

const ELDER_PORTRAITS = {
  female: 'images/heritage/avatar-cu-ba.png',
  male: 'images/heritage/avatar-cu-ong.png',
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

const elderPortrait = gender => ELDER_PORTRAITS[gender]

// Hai kiểu ô người: bài vị gỗ cho người đã mất và bảng tên sáng cho người
// sống/chưa rõ ngày mất. Chân dung mặc định là cụ ông/cụ bà Việt Nam, được đặt
// ở góc trên trái để không che phần tên và thông tin trong bảng.
export function appendPersonCardDecoration(
  nodes,
  width,
  height,
  {
    x = 0,
    y = 0,
    deceased = () => false,
    gender = () => 'unknown',
    hasImage = () => false,
  } = {}
) {
  nodes
    .classed('person-deceased', deceased)
    .classed('person-living', d => !deceased(d))
    .classed('person-female', d => gender(d) === 'female')
    .classed('person-male', d => gender(d) === 'male')

  const living = nodes.filter(d => !deceased(d))
  const nameplate = living
    .append('g')
    .attr('class', 'nameplate-decoration')
    .attr('pointer-events', 'none')
  nameplate
    .append('rect')
    .attr('class', 'nameplate-body')
    .attr('x', x + 8)
    .attr('y', y + 25)
    .attr('width', width - 16)
    .attr('height', height - 29)
    .attr('rx', (height - 29) / 2)
  nameplate
    .append('path')
    .attr('class', 'living-avatar-halo')
    .attr('d', scallopedCirclePath(x + CARD_AVATAR_X, y + LIVING_AVATAR_Y, 25))

  const livingPortrait = nameplate
    .filter(d => !hasImage(d))
    .append('g')
    .attr('class', 'living-avatar')
    .attr('transform', `translate(${x + CARD_AVATAR_X},${y + LIVING_AVATAR_Y})`)
  livingPortrait
    .filter(d => Boolean(elderPortrait(gender(d))))
    .append('image')
    .attr('class', 'living-avatar-image')
    .attr('href', d => elderPortrait(gender(d)))
    .attr('x', -25)
    .attr('y', -25)
    .attr('width', 50)
    .attr('height', 50)
    .attr('preserveAspectRatio', 'xMidYMid meet')
  livingPortrait
    .filter(d => !elderPortrait(gender(d)))
    .append('path')
    .attr('class', 'living-avatar-icon')
    .attr('d', mdiAccountOutline)
    .attr('transform', 'translate(-15.6,-15.6) scale(1.3)')

  const memorial = nodes.filter(deceased)
  memorial
    .append('rect')
    .attr('class', 'memorial-inset')
    .attr('x', x + 5)
    .attr('y', y + 5)
    .attr('width', width - 10)
    .attr('height', height - 12)
    .attr('rx', 2)
    .attr('pointer-events', 'none')
  memorial
    .append('path')
    .attr('class', 'memorial-base')
    .attr(
      'd',
      `M${x + 10},${y + height - 7}H${x + width - 10} M${x + 20},${
        y + height - 7
      }V${y + height - 2} M${x + width - 20},${y + height - 7}V${
        y + height - 2
      }`
    )
    .attr('pointer-events', 'none')
  memorial
    .append('path')
    .attr('class', 'memorial-crest')
    .attr(
      'd',
      `M${x + width / 2 - 16},${y + 9}H${x + width / 2 - 5}L${x + width / 2},${
        y + 13
      }L${x + width / 2 + 5},${y + 9}H${x + width / 2 + 16}`
    )
    .attr('pointer-events', 'none')

  const portrait = memorial
    .filter(d => !hasImage(d))
    .append('g')
    .attr('class', 'memorial-portrait')
    .attr(
      'transform',
      `translate(${x + CARD_AVATAR_X},${y + MEMORIAL_AVATAR_Y})`
    )
    .attr('pointer-events', 'none')
  portrait.append('circle').attr('class', 'memorial-portrait-bg').attr('r', 20)
  portrait
    .filter(d => Boolean(elderPortrait(gender(d))))
    .append('image')
    .attr('class', 'memorial-portrait-image')
    .attr('href', d => elderPortrait(gender(d)))
    .attr('x', -21)
    .attr('y', -21)
    .attr('width', 42)
    .attr('height', 42)
    .attr('preserveAspectRatio', 'xMidYMid meet')
  portrait
    .filter(d => !elderPortrait(gender(d)))
    .append('path')
    .attr('class', 'memorial-portrait-icon')
    .attr('d', mdiAccountOutline)
    .attr('transform', 'translate(-13.2,-13.2) scale(1.1)')
}
