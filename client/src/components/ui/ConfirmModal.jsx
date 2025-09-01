import { motion, AnimatePresence } from 'framer-motion'

export default function ConfirmModal({ open, title = 'Are you sure?', description = '', confirmText = 'Confirm', cancelText = 'Cancel', onConfirm, onCancel }) {
  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.div className="fixed inset-0 bg-black/40 z-50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onCancel} />
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }}>
            <div className="w-full max-w-md rounded-lg bg-white p-5 shadow-lg">
              <div className="text-lg font-semibold">{title}</div>
              {description && <div className="mt-2 text-sm text-gray-600">{description}</div>}
              <div className="mt-4 flex items-center justify-end gap-2">
                <button className="btn" onClick={onCancel}>{cancelText}</button>
                <button className="btn-primary" onClick={onConfirm}>{confirmText}</button>
              </div>
            </div>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  )
}


