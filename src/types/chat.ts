export type MessageRole = 'user' | 'assistant'

export interface Message {
  id: number
  role: MessageRole
  content: string
}

