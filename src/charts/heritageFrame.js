import {mdiAccountOutline} from '@mdi/js'
import {generationPortrait} from './personPortrait.js'

export const CARD_AVATAR_X = 30
export const CARD_AVATAR_Y = 45

let nextAvatarId = 0
export const uniqueAvatarId = () => `person-avatar-${nextAvatarId++}`

// Hai kiểu ô người: bài vị gỗ cho người đã mất và bảng tên sáng cho người
// sống/chưa rõ ngày mất. Chân dung minh họa chọn theo đời, giới tính và tuổi,
// được đặt ở bên trái, căn giữa theo chiều cao thẻ để không che phần tên và thông tin trong bảng.
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
    portraitUrl = d =>
      generationPortrait(
        ageGroup(d) === 'child' ? 17 : ageGroup(d) === 'elder' ? 13 : 15,
        gender(d)
      ),
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
    .attr('x', x)
    .attr('y', y)
    .attr('width', width)
    .attr('height', height)
    .attr('rx', 10)
  nameplate
    .append('circle')
    .attr('class', 'living-avatar-halo')
    .attr('cx', x + CARD_AVATAR_X)
    .attr('cy', y + CARD_AVATAR_Y)
    .attr('r', 24)

  const livingPortrait = nameplate
    .filter(d => !hasImage(d))
    .append('g')
    .attr('class', 'living-avatar')
    .attr('transform', `translate(${x + CARD_AVATAR_X},${y + CARD_AVATAR_Y})`)
  livingPortrait
    .append('clipPath')
    .attr('id', uniqueAvatarId)
    .append('circle')
    .attr('r', 21)
  livingPortrait
    .filter(d => Boolean(portraitUrl(d)))
    .append('image')
    .attr('class', 'living-avatar-image')
    .attr('href', d => portraitUrl(d))
    .attr('x', -22)
    .attr('y', -22)
    .attr('width', 44)
    .attr('height', 44)
    .attr('clip-path', function portraitClip() {
      return `url(#${this.parentNode.querySelector('clipPath').id})`
    })
    .attr('preserveAspectRatio', 'xMidYMid meet')
    .append('title')
    .text('Chân dung minh họa, không phải ảnh thật')
  livingPortrait
    .filter(d => !portraitUrl(d))
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
    .attr('id', uniqueAvatarId)
    .append('circle')
    .attr('r', 19.5)
  portrait
    .filter(d => Boolean(portraitUrl(d)))
    .append('image')
    .attr('class', 'memorial-portrait-image')
    .attr('href', d => portraitUrl(d))
    .attr('x', -20)
    .attr('y', -20)
    .attr('width', 40)
    .attr('height', 40)
    .attr('clip-path', function portraitClip() {
      return `url(#${this.parentNode.querySelector('clipPath').id})`
    })
    .attr('preserveAspectRatio', 'xMidYMid meet')
    .append('title')
    .text('Chân dung minh họa, không phải ảnh thật')
  portrait
    .filter(d => Boolean(portraitUrl(d)))
    .append('circle')
    .attr('class', 'memorial-portrait-ring')
    .attr('r', 20)
  portrait
    .filter(d => !portraitUrl(d))
    .append('path')
    .attr('class', 'memorial-portrait-icon')
    .attr('d', mdiAccountOutline)
    .attr('transform', 'translate(-13.2,-13.2) scale(1.1)')
}
