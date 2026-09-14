function pathFrom(values, width, height, pad) {
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1
  const innerW = width - pad.left - pad.right
  const innerH = height - pad.top - pad.bottom
  const coords = values.map((value, index) => {
    const x = pad.left + (index / Math.max(values.length - 1, 1)) * innerW
    const y = pad.top + innerH - ((value - min) / range) * innerH
    return [x, y]
  })
  const line = coords.map(([x, y], index) => `${index === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`).join(' ')
  const area = `${line} L${coords[coords.length - 1][0].toFixed(1)} ${(height - pad.bottom).toFixed(1)} L${coords[0][0].toFixed(1)} ${(height - pad.bottom).toFixed(1)} Z`
  return { line, area, coords, min, max }
}

export function TrendChart({
  title,
  values,
  labels,
  color = '#2f80ed',
  formatTick = (value) => Math.round(value).toLocaleString('en-US'),
}) {
  const width = 320
  const height = 168
  const pad = { top: 12, right: 12, bottom: 28, left: 44 }
  const { line, area, coords, min, max } = pathFrom(values, width, height, pad)
  const yTicks = [max, (max + min) / 2, min]
  const last = coords[coords.length - 1]

  return (
    <figure className="sc-chart">
      <figcaption>{title}</figcaption>
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={title}>
        {yTicks.map((tick) => {
          const y = pad.top + ((max - tick) / (max - min || 1)) * (height - pad.top - pad.bottom)
          return (
            <g key={tick}>
              <line x1={pad.left} x2={width - pad.right} y1={y} y2={y} stroke="#eef2f6" />
              <text x={pad.left - 6} y={y + 3} textAnchor="end" className="sc-chart__tick">
                {formatTick(tick)}
              </text>
            </g>
          )
        })}
        <path d={area} fill={color} opacity="0.12" />
        <path d={line} fill="none" stroke={color} strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round" />
        <circle cx={last[0]} cy={last[1]} r="3.2" fill={color} />
        {labels.map((label, index) => (
          <text
            key={label}
            x={coords[index][0]}
            y={height - 8}
            textAnchor="middle"
            className="sc-chart__tick"
          >
            {index % 2 === 0 || index === labels.length - 1 ? label : ''}
          </text>
        ))}
      </svg>
    </figure>
  )
}
