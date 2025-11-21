'use client'

import { useState, useEffect, useRef } from 'react'
import clsx from 'clsx'
import { CloseIcon, ChatIcon } from '@/components/SidebarToggleIcons'

export default function HomeLayout({
  sidebar,
  children,
}: {
  sidebar: React.ReactNode
  children: React.ReactNode
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [sidebarWidth, setSidebarWidth] = useState(360) // 기본값: 360px (w-90)
  const [isResizing, setIsResizing] = useState(false)
  const sidebarRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return

      const newWidth = window.innerWidth - e.clientX
      const minWidth = 200
      const maxWidth = window.innerWidth * 0.8

      if (newWidth >= minWidth && newWidth <= maxWidth) {
        setSidebarWidth(newWidth)
      }
    }

    const handleMouseUp = () => {
      setIsResizing(false)
    }

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = 'col-resize'
      document.body.style.userSelect = 'none'
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
  }, [isResizing])

  const sidebarWidthPx = `${sidebarWidth}px`

  return (
    <div>
      <div
        className={clsx(
          'pt-16 transition-all duration-300',
          isSidebarOpen ? '' : 'pr-0',
        )}
        style={
          isSidebarOpen
            ? { paddingRight: sidebarWidthPx, transition: 'padding-right 0.3s' }
            : undefined
        }
      >
        {children}
      </div>
      <div
        ref={sidebarRef}
        className={clsx(
          'bg-base-100 border-base-300 fixed top-16 right-0 bottom-0',
          'flex flex-col border-l transition-transform duration-300',
          isSidebarOpen ? 'translate-x-0' : 'translate-x-full',
        )}
        style={{ width: sidebarWidthPx }}
      >
        {isSidebarOpen && (
          <div
            onMouseDown={e => {
              e.preventDefault()
              setIsResizing(true)
            }}
            className={clsx(
              'absolute top-0 left-0 z-10 h-full w-1 cursor-col-resize',
              'hover:bg-primary/30 bg-transparent transition-colors',
              'group',
            )}
            aria-label="사이드바 크기 조절"
          >
            <div
              className={clsx(
                'absolute top-0 left-1/2 h-full w-0.5',
                'bg-primary/0 group-hover:bg-primary/50 -translate-x-1/2',
                'transition-colors',
              )}
            />
          </div>
        )}
        {sidebar}
      </div>
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className={clsx(
          'bg-accent border-accent fixed top-20 z-40 cursor-pointer',
          'flex h-10 w-10 items-center justify-center rounded-l-lg',
          'border-t border-b border-l shadow-lg',
          'hover:bg-accent-focus hover:scale-110 hover:shadow-xl',
          'active:scale-95 active:shadow-md',
          'text-accent-content',
        )}
        style={{
          right: isSidebarOpen ? sidebarWidthPx : '0',
          transition: isResizing ? 'none' : 'right 0.3s',
        }}
        aria-label={isSidebarOpen ? '사이드바 닫기' : '사이드바 열기'}
      >
        {isSidebarOpen ? <CloseIcon /> : <ChatIcon />}
      </button>
    </div>
  )
}
