import { useState } from 'react'
import { motion } from 'framer-motion'

export default function FieldFloat({ id, type = 'text', label, value, onChange, onBlur, invalid, errorId, errorText, required = false, className = '' }) {
  const [focused, setFocused] = useState(false)
  const hasText = value && String(value).length > 0
  return (
    <div className={className}>
      <motion.div
        initial={false}
        animate={{ scale: focused ? 1.01 : 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className="relative"
      >
        <input
          id={id}
          type={type}
          className={`peer w-full border rounded-lg px-3 py-3 transition placeholder-transparent focus:outline-none focus:ring-0 ${invalid ? 'border-red-500' : 'border-gray-300 focus:border-brand-600'}`}
          placeholder={label}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={(e) => { setFocused(false); onBlur?.(e) }}
          required={required}
          aria-invalid={invalid}
          aria-describedby={errorId}
        />
        <label
          htmlFor={id}
          className={`pointer-events-none absolute left-3 top-3 text-gray-500 transition-all duration-150 ${focused || hasText ? '-translate-y-3 text-xs text-brand-700' : ''}`}
        >
          {label}
        </label>
      </motion.div>
      {errorText ? <p id={errorId} className="text-xs text-red-600 mt-1">{errorText}</p> : null}
    </div>
  )
}


