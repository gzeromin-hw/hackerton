import clsx from 'clsx'
import { useState, FormEvent, KeyboardEvent, CompositionEvent } from 'react'

interface ChatInputProps {
  onSubmit: (message: string) => void
}

export function ChatInput({ onSubmit }: ChatInputProps) {
  const [input, setInput] = useState('')
  const [isComposing, setIsComposing] = useState(false)

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    onSubmit(input.trim())
    setInput('')
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (isComposing) return

    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  const handleCompositionEnd = (e: CompositionEvent<HTMLTextAreaElement>) => {
    setIsComposing(false)
    setInput(e.currentTarget.value)
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={clsx(
        'w-full max-w-4xl rounded-lg border p-4 transition-colors',
        'flex items-end gap-3',
        'border-base-300 bg-base-100 focus-within:border-primary',
      )}
    >
      <textarea
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        onCompositionStart={() => setIsComposing(true)}
        onCompositionEnd={handleCompositionEnd}
        placeholder="메시지를 입력하세요..."
        rows={1}
        className={clsx(
          'textarea textarea-ghost flex-1 resize-none',
          'text-base-content placeholder-base-content/60',
          'border-none bg-transparent text-base',
          'focus:bg-transparent focus:outline-none',
        )}
      />
      <button
        type="submit"
        className="btn btn-primary btn-square"
        disabled={!input.trim()}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-5 w-5"
        >
          <path d="M22 2L11 13" />
          <path d="M22 2l-7 20-4-9-9-4 20-7z" />
        </svg>
      </button>
    </form>
  )
}
