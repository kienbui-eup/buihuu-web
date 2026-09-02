// Đọc đề mục từ HTML đã được GrampsjsNoteContent làm sạch và hiển thị.
// StyledText cũ dùng một đoạn in đậm riêng thay cho thẻ h2/h3.
function fieldLabel(element) {
  if (element?.tagName !== 'P') return ''
  const first = [...element.childNodes].find(node => node.textContent.trim())
  if (first?.nodeType !== 3) return ''
  return (
    first.textContent
      .trimStart()
      .match(/^([\p{L}\p{N}][^:：\n]{0,59})[:：](?:\s|$)/u)?.[1] || ''
  )
}

export function getArticleSections(container) {
  if (!container) return []
  return [...container.querySelectorAll('h1, h2, h3, h4, h5, h6, p')]
    .filter(element => {
      const text = element.textContent.trim()
      if (!text) return false
      if (/^H[1-6]$/.test(element.tagName)) return true
      const bold = [...element.querySelectorAll('strong, b')]
        .filter(node => !node.parentElement.closest('strong, b'))
        .map(node => node.textContent.trim())
        .join(' ')
      if (
        bold !== text ||
        text.length > 160 ||
        element.querySelector('a, br')
      ) {
        return false
      }
      // Các bảng được chuyển thành tên dòng in đậm + các trường "Nhãn: giá trị".
      // Chúng là dữ liệu của bảng, không phải đề mục của bài.
      const next = element.nextElementSibling
      const label = fieldLabel(next)
      const tableRow =
        label &&
        (fieldLabel(next.nextElementSibling) ||
          fieldLabel(next.nextElementSibling?.nextElementSibling) === label ||
          fieldLabel(element.previousElementSibling) === label)
      return !tableRow && !/^[\d\s.,%–—-]+$/.test(text)
    })
    .map((element, index) => ({
      label: element.textContent.trim(),
      key: index,
      element,
    }))
}
