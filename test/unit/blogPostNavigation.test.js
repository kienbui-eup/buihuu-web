import {describe, it, expect, vi} from 'vitest'
import {GrampsjsViewBlogPost} from '../../src/views/GrampsjsViewBlogPost.js'

const deferred = () => {
  let resolve
  const promise = new Promise(_resolve => {
    resolve = _resolve
  })
  return {promise, resolve}
}
const source = id => ({
  gramps_id: id,
  extended: {notes: [{gramps_id: `note-${id}`}]},
})

describe('chuyển nhanh bài viết', () => {
  it('bỏ qua nguồn cũ trả về sau khi đã chọn bài mới', async () => {
    const old = deferred()
    const view = new GrampsjsViewBlogPost()
    view.appState = {
      i18n: {lang: 'vi'},
      apiGet: vi.fn(url => {
        if (url.includes('gramps_id=old')) return old.promise
        if (url.startsWith('/api/sources/'))
          return Promise.resolve({data: [source('new')]})
        return Promise.resolve({data: [{gramps_id: 'note-new'}]})
      }),
    }
    view.grampsId = 'old'
    const pending = view._fetchData()
    view.grampsId = 'new'
    await view._fetchData()
    old.resolve({data: [source('old')]})
    await pending
    expect(view._dataSources[0].gramps_id).toBe('new')
    expect(view._dataNotes[0].gramps_id).toBe('note-new')
  })

  it('bỏ qua nội dung cũ trả về muộn và không giữ nội dung khi bài mới thiếu ghi chú', async () => {
    const oldNote = deferred()
    const noteRequested = deferred()
    const view = new GrampsjsViewBlogPost()
    view.appState = {
      i18n: {lang: 'vi'},
      apiGet: vi.fn(url => {
        if (url.startsWith('/api/notes/')) {
          noteRequested.resolve()
          return oldNote.promise
        }
        return Promise.resolve({
          data: url.includes('gramps_id=old')
            ? [source('old')]
            : [{gramps_id: 'new', extended: {}}],
        })
      }),
    }
    view.grampsId = 'old'
    const pending = view._fetchData()
    await noteRequested.promise
    view.grampsId = 'new'
    await view._fetchData()
    oldNote.resolve({data: [{gramps_id: 'note-old'}]})
    await pending
    expect(view._dataSources[0].gramps_id).toBe('new')
    expect(view._dataNotes).toEqual([])
    expect(view.loading).toBe(false)
  })
})
