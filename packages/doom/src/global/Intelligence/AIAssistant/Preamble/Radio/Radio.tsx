import { useCallback, use, type ChangeEvent } from 'react'

import { RadioGroupContext } from './context.ts'

export interface RadioProps {
  label: string
  value: string | number
  onChange?: (ev: ChangeEvent<HTMLInputElement>) => void
}

export const Radio = ({ label, value, onChange }: RadioProps) => {
  const {
    name,
    value: groupValue,
    onChange: onGroupChange,
  } = use(RadioGroupContext)

  const handleChange = useCallback(
    (ev: ChangeEvent<HTMLInputElement>) => {
      onChange?.(ev)
      onGroupChange?.(ev)
    },
    [onChange, onGroupChange],
  )

  return (
    <label className="radio">
      <input
        name={name}
        type="radio"
        value={value}
        onChange={handleChange}
        checked={value === groupValue}
      />
      <span className="radio__label">{label}</span>
    </label>
  )
}
