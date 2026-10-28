import { MAX_SIZE, MIN_SIZE } from '../model/types'

interface Props {
  label: string
  value: number
  onChange: (n: number) => void
}

export function Stepper({ label, value, onChange }: Props) {
  const set = (n: number) => onChange(Math.min(MAX_SIZE, Math.max(MIN_SIZE, n)))
  return (
    <div className="stepper">
      <span className="stepper-label">{label}</span>
      <div className="stepper-ctl">
        <button type="button" aria-label={`Fewer ${label.toLowerCase()}`} disabled={value <= MIN_SIZE} onClick={() => set(value - 1)}>−</button>
        <input
          type="number"
          aria-label={label}
          min={MIN_SIZE}
          max={MAX_SIZE}
          value={value}
          onChange={(e) => set(Number(e.target.value) || MIN_SIZE)}
        />
        <button type="button" aria-label={`More ${label.toLowerCase()}`} disabled={value >= MAX_SIZE} onClick={() => set(value + 1)}>+</button>
      </div>
    </div>
  )
}
