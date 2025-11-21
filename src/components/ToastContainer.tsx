'use client'

import { useToastStore } from '@/data/toastStore'
import clsx from 'clsx'

export default function ToastContainer() {
  const { toasts, removeToast } = useToastStore()

  if (toasts.length === 0) return null

  return (
    <div className="toast toast-top toast-end z-[9999]">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={clsx(
            'alert cursor-pointer',
            toast.type === 'success' && 'alert-success',
            toast.type === 'error' && 'alert-error',
            toast.type === 'warning' && 'alert-warning',
            toast.type === 'info' && 'alert-info',
          )}
          onClick={() => removeToast(toast.id)}
        >
          <span>{toast.message}</span>
        </div>
      ))}
    </div>
  )
}

