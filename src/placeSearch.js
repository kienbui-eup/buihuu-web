import {normalizeSearchText} from './pageSearch.js'

// Ancestors are separate Gramps records, absent from a place's search document.
export function searchPlaces(places, query) {
  const words = normalizeSearchText(query)
    .split(/[\s,;]+/)
    .filter(Boolean)
  if (!words.length) return []
  const matches = places.filter(place => {
    const profile = place.profile || {}
    const text = normalizeSearchText(
      [
        place.gramps_id,
        place.name?.value,
        place.title,
        profile.name,
        ...(profile.alternate_names || []),
        ...(profile.parent_places || []).flatMap(parent => [
          parent.name,
          ...(parent.alternate_names || []),
        ]),
      ]
        .filter(Boolean)
        .join(' ')
    )
    return words.every(word => text.includes(word))
  })
  const rank = place => {
    const names = [
      place.profile?.name,
      place.name?.value,
      ...(place.profile?.alternate_names || []),
    ]
      .filter(Boolean)
      .map(normalizeSearchText)
    if (names.includes(normalizeSearchText(query))) return 0
    return names.some(name => words.every(word => name.includes(word))) ? 1 : 2
  }
  return matches.sort((a, b) => rank(a) - rank(b))
}

export function placeAddress(place) {
  return (place.profile?.parent_places || [])
    .map(parent => parent.name)
    .filter(Boolean)
    .join(', ')
}
