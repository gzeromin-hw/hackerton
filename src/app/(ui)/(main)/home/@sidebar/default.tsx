'use client'

import clsx from 'clsx'
import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import useChatStore from '@/data/chatStore'
import { useAuthStore } from '@/data/authStore'
import useHomeStore from '@/data/homeStore'
import chatClient from '@/services/apis/chat.client'

interface Message {
  id: string
  sender: 'assistant' | 'user'
  message: string
  timestamp: Date
}

export default function SidebarPage() {
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const { cleverseAuth } = useAuthStore()
  const { isLoading, setIsLoading } = useHomeStore()
  const { question } = useChatStore()
  const processedQuestionRef = useRef<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const [isAutoScroll, setIsAutoScroll] = useState<boolean>(true)
  const prevMessagesLengthRef = useRef(messages.length)
  const prevScrollTopRef = useRef(0)
  const prevScrollHeightRef = useRef(0)
  const prevClientHeightRef = useRef(0)

  const handleSend = async () => {
    if (!inputMessage.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      message: inputMessage,
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsLoading(true)

    try {
      const userId = cleverseAuth?.user?.userId
      if (!userId) {
        throw new Error('사용자 정보를 찾을 수 없습니다.')
      }

      const response = await chatClient.getChats({
        user_id: userId,
        query: inputMessage,
      })

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        message: response.llm_answer,
        timestamp: new Date(),
      }

      setMessages(prev => [...prev, assistantMessage])

      // card_result를 homeStore에 저장
      const { setCardResult } = useHomeStore.getState()
      if (response.card_result) {
        setCardResult(
          response.card_result.team_cards,
          response.card_result.user_cards,
        )
      }
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        message: `오류가 발생했습니다: ${
          error instanceof Error ? error.message : '알 수 없는 오류'
        }`,
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
      router.push('/home')
    }
  }

  // 첫 질문시 채팅방에 들어와서 질의 시도
  useEffect(() => {
    if (!question) return
    // 이미 처리한 question이면 무시
    if (processedQuestionRef.current === question) return

    const { clearQuestion } = useChatStore.getState()

    // question 값을 저장하고 바로 클리어
    const questionValue = question
    processedQuestionRef.current = question
    clearQuestion()

    const sendQuestion = async () => {
      const userMessage: Message = {
        id: Date.now().toString(),
        sender: 'user',
        message: questionValue,
        timestamp: new Date(),
      }

      setMessages(prev => [...prev, userMessage])
      const { setIsLoading } = useHomeStore.getState()
      setIsLoading(true)

      try {
        const userId = cleverseAuth?.user?.userId
        if (!userId) {
          throw new Error('사용자 정보를 찾을 수 없습니다.')
        }

        const response = await chatClient.getChats({
          user_id: userId,
          query: questionValue,
        })

        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          sender: 'assistant',
          message: response.llm_answer,
          timestamp: new Date(),
        }

        setMessages(prev => [...prev, assistantMessage])

        // card_result를 homeStore에 저장
        const { setCardResult } = useHomeStore.getState()
        if (response.card_result) {
          setCardResult(
            response.card_result.team_cards,
            response.card_result.user_cards,
          )
        }
      } catch (error) {
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          sender: 'assistant',
          message: `오류가 발생했습니다: ${
            error instanceof Error ? error.message : '알 수 없는 오류'
          }`,
          timestamp: new Date(),
        }
        setMessages(prev => [...prev, errorMessage])
      } finally {
        const { setIsLoading } = useHomeStore.getState()
        setIsLoading(false)
      }
    }

    sendQuestion()
  }, [cleverseAuth, question])

  // 초기 스크롤 위치 저장
  useEffect(() => {
    if (!chatContainerRef.current) return
    const chatContainer = chatContainerRef.current
    prevScrollTopRef.current = chatContainer.scrollTop
    prevScrollHeightRef.current = chatContainer.scrollHeight
    prevClientHeightRef.current = chatContainer.clientHeight
  }, [chatContainerRef])

  // 자동 스크롤 기능
  useEffect(() => {
    if (!messagesEndRef.current || !chatContainerRef.current) return

    const chatContainer = chatContainerRef.current
    const messagesAdded = messages.length > prevMessagesLengthRef.current

    // 메시지가 추가되기 전의 스크롤 위치 확인
    const wasNearBottom = () => {
      if (prevScrollHeightRef.current === 0) return true // 첫 렌더링
      const prevDistanceToBottom =
        prevScrollHeightRef.current -
        (prevScrollTopRef.current + prevClientHeightRef.current)
      return prevDistanceToBottom <= prevClientHeightRef.current * 0.2
    }

    const scrollToBottom = () => {
      if (chatContainer) {
        chatContainer.scrollTo({
          top: chatContainer.scrollHeight,
          behavior: 'smooth',
        })
      }
    }

    // 메시지가 추가되었을 때 스크롤 위치 확인
    if (messagesAdded) {
      // 이전에 스크롤이 바닥에 가까웠다면 자동 스크롤 활성화
      if (wasNearBottom()) {
        setIsAutoScroll(true)
      }

      // 자동 스크롤이 활성화되어 있으면 스크롤 실행
      if (isAutoScroll || wasNearBottom()) {
        // DOM 업데이트가 완료된 후 스크롤 실행
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            scrollToBottom()

            // 스크롤 위치 업데이트
            if (chatContainer) {
              prevScrollTopRef.current = chatContainer.scrollTop
              prevScrollHeightRef.current = chatContainer.scrollHeight
              prevClientHeightRef.current = chatContainer.clientHeight
            }
          })
        })
      } else {
        // 자동 스크롤이 비활성화되어 있어도 스크롤 위치 업데이트
        requestAnimationFrame(() => {
          if (chatContainer) {
            prevScrollTopRef.current = chatContainer.scrollTop
            prevScrollHeightRef.current = chatContainer.scrollHeight
            prevClientHeightRef.current = chatContainer.clientHeight
          }
        })
      }
    } else if (isAutoScroll) {
      // 메시지가 추가되지 않았지만 자동 스크롤이 활성화되어 있으면 스크롤 실행
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          scrollToBottom()
          if (chatContainer) {
            prevScrollTopRef.current = chatContainer.scrollTop
            prevScrollHeightRef.current = chatContainer.scrollHeight
            prevClientHeightRef.current = chatContainer.clientHeight
          }
        })
      })
    }

    // 메시지 길이 업데이트
    prevMessagesLengthRef.current = messages.length
  }, [messages, isLoading, isAutoScroll, messagesEndRef, chatContainerRef])

  // 스크롤 감지
  useEffect(() => {
    const chatContainer = chatContainerRef.current
    if (!chatContainer) return
    let ticking = false

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(async () => {
          const { scrollTop, scrollHeight, clientHeight } = chatContainer
          const distanceToBottom = scrollHeight - (scrollTop + clientHeight)

          // 스크롤 위치 저장 (메시지 추가 전 위치 추적용)
          prevScrollTopRef.current = scrollTop
          prevScrollHeightRef.current = scrollHeight
          prevClientHeightRef.current = clientHeight

          // 기준: 스크롤이 끝에서 일정 거리 이상 떨어졌을 때 자동 스크롤 비활성화
          if (distanceToBottom > clientHeight * 0.2) {
            setIsAutoScroll(false)
          } else {
            setIsAutoScroll(true)
          }

          ticking = false
        })
        ticking = true
      }
    }

    chatContainer.addEventListener('scroll', handleScroll)
    return () => chatContainer.removeEventListener('scroll', handleScroll)
  }, [chatContainerRef, messages])

  return (
    <aside className="flex h-full w-full flex-col p-4">
      <div
        ref={chatContainerRef}
        className="flex-1 space-y-4 overflow-y-auto p-4"
      >
        {messages.map(msg => (
          <div
            key={msg.id}
            className={clsx(
              'flex flex-col',
              msg.sender === 'user' ? 'items-end' : 'items-start',
            )}
          >
            <div
              className={clsx(
                'text-base-content/60 mb-1 text-xs',
                msg.sender === 'user' ? 'text-right' : 'text-left',
              )}
            >
              {msg.sender}
            </div>
            <div
              className={clsx(
                'max-w-[80%] rounded-lg px-3 py-2',
                msg.sender === 'user'
                  ? 'bg-neutral text-neutral-content'
                  : 'bg-base-200 text-base-content',
              )}
            >
              {msg.message}
            </div>
          </div>
        ))}
        <div className="mt-4 h-1" ref={messagesEndRef} />
      </div>

      <div className="bg-base-100 p-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputMessage}
            onChange={e => setInputMessage(e.target.value)}
            onKeyPress={e => e.key === 'Enter' && handleSend()}
            placeholder="메시지 입력..."
            className="input input-bordered input-sm flex-1"
          />
          <button
            className="btn btn-primary btn-sm"
            onClick={handleSend}
            disabled={isLoading}
          >
            {isLoading ? '전송 중...' : '전송'}
          </button>
        </div>
      </div>
    </aside>
  )
}
