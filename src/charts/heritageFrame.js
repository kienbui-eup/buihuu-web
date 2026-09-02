// Trang trí SVG dùng cùng nét chỉ và dấu góc với khung HTML.
// Các nét trang trí không nhận sự kiện, để ô người vẫn bấm/kéo bình thường.
export function appendHeritageFrame(nodes, width, height, x = 0, y = 0) {
  nodes
    .append('rect')
    .attr('class', 'person-card-inset')
    .attr('x', x + 4)
    .attr('y', y + 4)
    .attr('width', width - 8)
    .attr('height', height - 8)
    .attr('fill', 'none')
    .attr('stroke', 'var(--md-sys-color-outline-variant)')
    .attr('stroke-width', 0.7)
    .attr('pointer-events', 'none')
  nodes
    .append('path')
    .attr('class', 'person-card-corners')
    .attr(
      'd',
      `M${x},${y + 12}V${y}H${x + 12} M${x + width - 12},${y + height}H${
        x + width
      }V${y + height - 12}`
    )
    .attr('fill', 'none')
    .attr('stroke', 'var(--md-sys-color-primary)')
    .attr('stroke-width', 1.5)
    .attr('pointer-events', 'none')
}
