import {html} from 'lit'
import {afterEach, describe, expect, it} from 'vitest'
import {GrampsjsViewTree} from '../../src/views/GrampsjsViewTree.js'

// Dùng vòng cập nhật thật, bỏ phần vẽ để không cần gọi API phả hệ.
class NavigationTestView extends GrampsjsViewTree {
  renderContent() {
    return html`<button ?disabled=${this._history.length < 2}>Quay lại</button>`
  }
}
customElements.define('navigation-test-view', NavigationTestView)

afterEach(() => document.body.replaceChildren())

async function createView(preferred = 'main') {
  const view = document.createElement('navigation-test-view')
  view.active = true
  view.settings = {homePerson: 'TEST-ROOT', treeDefaultView: preferred}
  view.grampsId = 'TEST-ROOT'
  document.body.append(view)
  await view.updateComplete
  return view
}

describe('điều hướng phả đồ', () => {
  it('khởi tạo một mốc hợp lệ, quay lại khi chưa có lịch sử không làm mất người', async () => {
    const view = await createView('all')
    expect(view._history).toEqual([{grampsId: 'TEST-ROOT', view: 'all'}])
    view._prevPerson()
    await view.updateComplete
    expect(view.grampsId).toBe('TEST-ROOT')
    expect(view.renderRoot.querySelector('button').disabled).toBe(true)
  })

  it('đổi phạm vi cùng người vẫn bật quay lại và về nhánh chính', async () => {
    const view = await createView()
    view._handleScope({detail: {view: 'all'}})
    await view.updateComplete
    expect(view._isHome()).toBe(false)
    expect(view.renderRoot.querySelector('button').disabled).toBe(false)
    view._prevPerson()
    await view.updateComplete
    expect(view.view).toBe('main')
    expect(view._history).toHaveLength(1)
    expect(view._isHome()).toBe(true)
    expect(view.renderRoot.querySelector('button').disabled).toBe(true)
  })

  it('quay lại khôi phục cả người và phạm vi, không thêm lại mốc vừa bỏ', async () => {
    const view = await createView()
    view._handleScope({detail: {view: 'descendants', grampsId: 'TEST-BRANCH'}})
    await view.updateComplete
    view._handleScope({detail: {view: 'all'}})
    await view.updateComplete
    view._prevPerson()
    await view.updateComplete
    expect(view.view).toBe('descendants')
    expect(view.grampsId).toBe('TEST-BRANCH')
    expect(view._history).toHaveLength(2)
    view._prevPerson()
    await view.updateComplete
    expect(view.view).toBe('main')
    expect(view.grampsId).toBe('TEST-ROOT')
    expect(view._history).toHaveLength(1)
  })

  it('về nhánh chính từ một chi và có thể quay lại chi đó', async () => {
    const view = await createView()
    view._openBranch({detail: {grampsId: 'TEST-BRANCH'}})
    await view.updateComplete
    view._backToHomePerson()
    await view.updateComplete
    expect(view.view).toBe('main')
    expect(view.grampsId).toBe('TEST-ROOT')
    view._prevPerson()
    await view.updateComplete
    expect(view.view).toBe('descendants')
    expect(view.grampsId).toBe('TEST-BRANCH')
    view._handleScope({detail: {view: 'descendants', grampsId: 'TEST-BRANCH'}})
    await view.updateComplete
    expect(view._history).toHaveLength(2)
  })
})
