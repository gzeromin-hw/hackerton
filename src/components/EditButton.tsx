'use client'

import clsx from 'clsx'

export interface EditButtonProps {
  /** 클릭 핸들러 */
  onClick: (e?: React.MouseEvent) => void
  /** 버튼 크기 */
  size?: 'xs' | 'sm' | 'md' | 'lg'
  /** 버튼 스타일 variant */
  variant?: 'neutral' | 'accent' | 'ghost'
  /** 추가 클래스명 */
  className?: string
  /** 비활성화 여부 */
  disabled?: boolean
  /** 접근성을 위한 title */
  title?: string
}

/**
 * 수정하기 버튼 컴포넌트 (연필 아이콘)
 */
export const EditButton = ({
  onClick,
  size = 'sm',
  variant = 'neutral',
  className,
  disabled = false,
  title = '수정하기',
}: EditButtonProps) => {
  const sizeClasses = {
    xs: 'h-4 w-4',
    sm: 'h-5 w-5',
    md: 'h-6 w-6',
    lg: 'h-7 w-7',
  }

  const buttonSizeClasses = {
    xs: 'btn-xs',
    sm: 'btn-sm',
    md: 'btn-md',
    lg: 'btn-lg',
  }

  const variantClasses = {
    neutral: 'btn-neutral',
    accent: 'btn-accent',
    ghost: 'btn-ghost',
  }

  return (
    <button
      onClick={e => onClick(e)}
      disabled={disabled}
      className={clsx(
        'btn',
        buttonSizeClasses[size],
        variantClasses[variant],
        className,
      )}
      title={title}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className={sizeClasses[size]}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
        />
      </svg>
    </button>
  )
}

