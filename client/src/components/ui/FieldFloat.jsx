import { useState } from 'react'
import { motion } from 'framer-motion'

// FieldFloat supports input, textarea, and select with floating label micro-interactions
export default function FieldFloat({
  id,
  type = 'text',
  as = 'input', // 'input' | 'textarea' | 'select'
  label,
  value,
  onChange,
  onBlur,
  invalid,
  errorId,
  errorText,
  required = false,
  className = '',
  options = [], // for select: [{ value, label }]
  rows = 5,
}) {
  const [focused, setFocused] = useState(false)
  const hasText = value !== undefined && value !== null && String(value).length > 0
  const shouldFloat = focused || hasText || as === 'select'

  const commonProps = {
    id,
    className: `peer w-full border-2 rounded-lg px-3 ${as === 'textarea' ? 'py-3' : 'py-3'} transition placeholder-transparent focus:outline-none focus:ring-0 ${invalid ? 'border-red-500' : 'border-gray-300 focus:border-brand-600'}`,
    value,
    onChange: (e) => onChange(as === 'select' ? e.target.value : e.target.value),
    onFocus: () => setFocused(true),
    onBlur: (e) => { setFocused(false); onBlur?.(e) },
    required,
    'aria-invalid': invalid,
    'aria-describedby': errorId,
  }

  return (
    <div className={className}>
      <motion.div
        initial={false}
        animate={{ scale: focused ? 1.01 : 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className="relative"
      >
        {as === 'textarea' ? (
          <textarea {...commonProps} placeholder={label} rows={rows} />
        ) : as === 'select' ? (
          <select {...commonProps} placeholder={label}>
            <option value="" disabled>{label}</option>
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        ) : (
          <input {...commonProps} type={type} placeholder={label} />
        )}

        <label
          htmlFor={id}
          className={`pointer-events-none absolute left-3 top-3 text-gray-500 transition-all duration-150 ${shouldFloat ? '-translate-y-3 text-xs text-brand-700' : ''}`}
        >
          {label}
        </label>
      </motion.div>
      {errorText ? <p id={errorId} className="text-xs text-red-600 mt-1">{errorText}</p> : null}
    </div>
  )
}


