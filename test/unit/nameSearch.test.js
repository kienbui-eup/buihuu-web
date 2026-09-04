import {describe, it, expect} from 'vitest'
import {
  nameSearchRules,
  wordPattern,
  NAME_SEARCH_SLOT,
} from '../../src/nameSearch.js'

describe('wordPattern', () => {
  it('khớp đầu từ và mở rộng chữ không dấu thành lớp ký tự', () => {
    const pattern = wordPattern('nhan')
    expect(pattern.startsWith('(^|\\s)')).toBe(true)
    expect(pattern).toContain('nh[a')
    expect(pattern).toContain('ầ')
    expect(pattern.endsWith('n')).toBe(true)
  })

  it('giữ nguyên chữ đã có dấu', () => {
    expect(wordPattern('Nhân')).toBe('(^|\\s)nhân')
  })

  it('mở rộng d thành d hoặc đ', () => {
    expect(wordPattern('duc')).toContain('[dđ]')
  })

  it('thoát ký tự đặc biệt của regex', () => {
    expect(wordPattern('a.b')).toContain('\\.')
    expect(wordPattern('(x)')).toContain('\\(')
  })

  it('khớp thử bằng regex JavaScript trên tên thật kiểu', () => {
    const re = new RegExp(wordPattern('anh'), 'iu')
    expect(re.test('Hữu Anh')).toBe(true)
    expect(re.test('Ánh')).toBe(true)
    expect(re.test('Thanh')).toBe(false)
  })
})

describe('nameSearchRules', () => {
  it('câu trống thì không có quy tắc', () => {
    expect(nameSearchRules('')).toEqual([])
    expect(nameSearchRules('   ')).toEqual([])
    expect(nameSearchRules(null)).toEqual([])
  })

  it('mỗi từ một quy tắc RegExpName có cờ regex và khoá quick:name', () => {
    const rules = nameSearchRules('  Bùi  anh ')
    expect(rules).toHaveLength(2)
    expect(rules[0].name).toBe('RegExpName')
    expect(rules[0].regex).toBe(true)
    expect(rules[0]._slot).toBe(NAME_SEARCH_SLOT)
    // "ù" đã có dấu thì giữ, "i" không dấu thì mở rộng thành lớp ký tự.
    expect(rules[0].values[0].startsWith('(^|\\s)bù[i')).toBe(true)
    expect(rules[1].values[0].startsWith('(^|\\s)')).toBe(true)
  })
})
