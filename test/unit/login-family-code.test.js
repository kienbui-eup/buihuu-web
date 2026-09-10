import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest'
import * as api from '../../src/api.js'
import '../../src/components/GrampsjsLogin.js'

// Chỉ kiểm tra form mã; widget chờ tài khoản dùng Lit cũ trong happy-dom.
vi.mock('@material/mwc-circular-progress', () => ({}))

let view
let submit

beforeEach(async () => {
  window.grampsjsConfig = {familyCodeLogin: true, hideRegisterLink: true}
  vi.spyOn(api, 'apiGetOIDCConfig').mockResolvedValue({enabled: false})
  submit = vi.spyOn(api, 'apiGetFamilyCodeTokens')
  view = document.createElement('grampsjs-login')
  view.appState = {i18n: {strings: {}}, permissions: {}, settings: {}}
  document.body.append(view)
  await view.updateComplete
})

afterEach(() => {
  document.body.replaceChildren()
  delete window.grampsjsConfig
  vi.restoreAllMocks()
})

describe('mở gia phả bằng mã dòng họ', () => {
  it('không gửi mã chỉ có khoảng trắng', async () => {
    view.shadowRoot.querySelector('#family-code').value = '   '
    await view._submitFamilyCode()
    expect(submit).not.toHaveBeenCalled()
    expect(view._familyError).toContain('Vui lòng nhập')
  })

  it('chặn gửi lặp trong lúc chờ và cho thử lại sau lỗi', async () => {
    let finish
    submit.mockReturnValue(
      new Promise(resolve => {
        finish = resolve
      })
    )
    view.shadowRoot.querySelector('#family-code').value = ' TEST-CODE '
    const pending = view._submitFamilyCode()
    await view.updateComplete
    const button = view.shadowRoot.querySelector(
      '#family-code-form md-filled-button'
    )
    expect(button.disabled).toBe(true)
    await view._submitFamilyCode()
    expect(submit).toHaveBeenCalledExactlyOnceWith('TEST-CODE')
    finish({error: 'Wrong family code'})
    await pending
    await view.updateComplete
    expect(button.disabled).toBe(false)
    expect(
      view.shadowRoot.querySelector('[role="alert"]').textContent
    ).toContain('Mã chưa đúng')
  })

  it.each([
    ['Wrong family code', 'Mã chưa đúng'],
    ['Too many attempts', 'đợi một lúc'],
    ['Failed to fetch', 'Kiểm tra mạng'],
  ])('giải thích đúng lỗi %s ngay trong form', async (error, message) => {
    submit.mockResolvedValue({error})
    const field = view.shadowRoot.querySelector('#family-code')
    field.value = 'TEST-CODE'
    await view._submitFamilyCode()
    await view.updateComplete
    expect(
      view.shadowRoot.querySelector('[role="alert"]').textContent
    ).toContain(message)
    field.dispatchEvent(new Event('input'))
    await view.updateComplete
    expect(
      view.shadowRoot.querySelector('[role="alert"]').textContent.trim()
    ).toBe('')
  })

  it('mở lại nút nếu yêu cầu gặp lỗi ngoài dự kiến', async () => {
    submit.mockRejectedValue(new Error('network'))
    view.shadowRoot.querySelector('#family-code').value = 'TEST-CODE'
    await view._submitFamilyCode()
    expect(view._familyBusy).toBe(false)
    expect(view._familyError).toContain('Kiểm tra mạng')
  })
})
