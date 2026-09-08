import {getGeneration, getPortraitAge} from './util.js'

const ROOT = 'images/heritage/generations-v3'

export const generationPortrait = (generation, gender) => {
  if (!['female', 'male'].includes(gender)) return ''
  if (!Number.isInteger(generation) || generation < 1 || generation > 17)
    return ''
  const suffix = gender === 'female' ? 'nu' : 'nam'
  return `${ROOT}/doi-${String(generation).padStart(2, '0')}-${suffix}.jpg`
}

// Bộ theo đời là minh họa ước lệ, không phải kết luận năm sinh của từng đời.
// Khi có tuổi từ hồ sơ, dùng nhóm tuổi phù hợp; ảnh thật được ưu tiên ở lớp vẽ.
export const getPersonPortrait = (
  person,
  profile = person?.profile,
  referenceYear = new Date().getFullYear()
) => {
  const gender =
    person?.gender === 0
      ? 'female'
      : person?.gender === 1
      ? 'male'
      : person?.gender !== undefined && person?.gender !== null
      ? 'unknown'
      : profile?.sex === 'F'
      ? 'female'
      : profile?.sex === 'M'
      ? 'male'
      : 'unknown'
  if (gender === 'unknown') return ''
  const generation = Number(getGeneration(person))
  const age = getPortraitAge(person, profile, referenceYear)
  if (age !== null) {
    if (age < 12) return generationPortrait(17, gender)
    if (age < 18)
      return `${ROOT}/thieu-nien-${gender === 'female' ? 'nu' : 'nam'}.jpg`
    if (age < 35) return generationPortrait(16, gender)
    if (age < 46) return generationPortrait(15, gender)
    if (age < 62) return generationPortrait(14, gender)
    // Giữ sắc thái các đời trước cho người cao tuổi thuộc lớp lịch sử.
    if (generation >= 1 && generation <= 12)
      return (
        generationPortrait(generation, gender) || generationPortrait(13, gender)
      )
    return generationPortrait(13, gender)
  }
  return (
    generationPortrait(generation, gender) || generationPortrait(15, gender)
  )
}
