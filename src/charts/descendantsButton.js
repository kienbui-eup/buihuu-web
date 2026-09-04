import {mdiFamilyTree} from '@mdi/js'

/*
Nút gài nhỏ nhô lên trên mép phải biển tên của người có con cháu, như cái thẻ
gài bên cạnh bài vị. Bấm vào nút làm đúng việc chạm vào thẻ (mở hậu duệ của
người đó), nhưng nhìn vào là biết thẻ này mở tiếp được, thay vì phải đoán. Đặt
ngoài mép trên để không tranh chỗ với dòng tên. Chỉ vẽ khi không ở chế độ sửa,
vì lúc đó góc này dành cho nút thêm người.
*/
export function appendDescendantsButton(nodes, x, y, onClick) {
  const button = nodes
    .append('g')
    .attr('class', 'card-action')
    .attr('transform', `translate(${x},${y})`)
    .attr('role', 'button')
    .attr('aria-label', 'Xem hậu duệ')
    .style('cursor', 'pointer')
    .on('click', (event, d) => {
      event.preventDefault()
      event.stopPropagation()
      onClick(event, d)
    })
  button.append('title').text('Xem hậu duệ')
  button.append('circle').attr('class', 'card-action-bg').attr('r', 12)
  button
    .append('path')
    .attr('class', 'card-action-icon')
    .attr('d', mdiFamilyTree)
    .attr('transform', 'translate(-7.92,-7.92) scale(0.66)')
  return button
}
