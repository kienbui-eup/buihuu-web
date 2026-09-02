// Share the lightweight snapshot between the overview and relationship views.
const snapshots = new WeakMap()

export function loadTreePeople(appState, force = false) {
  const api = appState.apiGet
  const key = `${appState.dbInfo?.tree?.id || ''}:${
    appState.i18n?.lang || 'en'
  }`
  if (!snapshots.has(api)) snapshots.set(api, new Map())
  const cache = snapshots.get(api)
  if (!force && cache.has(key)) return cache.get(key)
  const fields =
    'handle,gramps_id,gender,primary_name,alternate_names,attribute_list,tag_list,media_list,profile,extended'
  const promise = (async () =>
    api(
      `/api/people/?locale=${encodeURIComponent(
        appState.i18n?.lang || 'en'
      )}&profile=self&extend=primary_parent_family,family_list,tag_list&keys=${fields}`
    ))()
    .then(result => {
      if (!result?.data && cache.get(key) === promise) cache.delete(key)
      return result
    })
    .catch(error => {
      if (cache.get(key) === promise) cache.delete(key)
      throw error
    })
  cache.set(key, promise)
  return promise
}
