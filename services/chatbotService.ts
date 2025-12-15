import apiClient, { getAccessToken } from '@/lib/apiClient'
import { API_ENDPOINTS } from '@/config/api.endpoint'

interface QuizQuestionDTO {
  question: string
  options: string[]
  answer: string
  explanation: string
}

interface QuizDTO {
  questions: QuizQuestionDTO[]
}

// ==================== SSE STREAMING TYPES ====================
export interface SSEEvent {
  type: 'text' | 'tool_call' | 'tool_call_chunk' | 'error'
  text: string
}

export interface ChatRequest {
  message: string
  conversation_history: Array<ConversationMessage>
}

export interface ConversationMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface StreamCallbacks {
  onText: (text: string) => void
  onToolCall: (toolName: string) => void
  onToolCallChunk: (thinking: string) => void
  onError: (error: string) => void
  onComplete: () => void
}

export const chatbotService = {
  /**
   * Send a message to the chatbot and get a quiz response
   */
  async getQuizFromPrompt(prompt: string): Promise<QuizDTO> {
    const response = await apiClient.post<QuizDTO>('/chatbot/generate-quiz', {
      prompt,
    })
    return response.data
  },

  /**
   * Get chat history
   */
  async getChatHistory(): Promise<ConversationMessage[]> {
    try {
      const response = await apiClient.get(API_ENDPOINTS.CHATBOT.HISTORY)
      return response.data.data
    } catch (error) {
      console.error('getChatHistory error:', error)
      return []
    }
  },

  /**
   * Clear chat history
   */
  async clearChatHistory(): Promise<void> {
    try {
      await apiClient.delete(API_ENDPOINTS.CHATBOT.HISTORY)
    } catch (error) {
      console.error('clearChatHistory error:', error)
      throw error
    }
  },

  /**
   * Stream chat response from chatbot using SSE
   * Returns AbortController to allow cancellation
   */
  async streamChatResponse(
    request: ChatRequest,
    callbacks: StreamCallbacks,
  ): Promise<AbortController> {
    const abortController = new AbortController()

    try {
      const token = getAccessToken()
      const headers: HeadersInit = { 'Content-Type': 'application/json' }
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}${API_ENDPOINTS.CHATBOT.CHAT_STREAM}`,
        {
          method: 'POST',
          headers: headers,
          body: JSON.stringify(request),
          signal: abortController.signal,
        },
      )

      if (!response.ok) {
        const errorText = await response.text()
        let errorMessage = `HTTP error! status: ${response.status}`
        try {
          const errorJson = JSON.parse(errorText)
          errorMessage = errorJson.message || errorJson.error || errorMessage
        } catch (e) {
          errorMessage = errorText || errorMessage
        }
        callbacks.onError(errorMessage)
        callbacks.onComplete()
        return abortController
      }

      if (!response.body) {
        callbacks.onError('Response body is null')
        callbacks.onComplete()
        return abortController
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) {
          if (buffer.trim()) {
            this.processBufferedData(buffer, callbacks)
          }
          callbacks.onComplete()
          break
        }

        buffer += decoder.decode(value, { stream: true })

        // Split by double newline for SSE events, fallback to single newline
        let lines: string[]
        if (buffer.includes('\n\n')) {
          lines = buffer.split('\n\n')
        } else {
          lines = buffer.split('\n')
        }

        buffer = lines.pop() || ''

        for (const line of lines) {
          if (line.trim()) {
            this.processBufferedData(line, callbacks)
          }
        }
      }
    } catch (error: unknown) {
      if (error instanceof Error && error.name !== 'AbortError') {
        console.error('Chatbot stream error:', error)
        callbacks.onError(error.message || 'Lỗi kết nối')
      }
      callbacks.onComplete()
    }

    return abortController
  },

  /**
   * Process buffered SSE data and trigger appropriate callbacks
   */
  processBufferedData(data: string, callbacks: StreamCallbacks): void {
    const lines = data.split('\n')
    for (const line of lines) {
      const trimmedLine = line.trim()
      if (!trimmedLine) continue

      let jsonStr: string
      if (trimmedLine.startsWith('data: ')) {
        jsonStr = trimmedLine.substring(6)
      } else if (trimmedLine.startsWith('{')) {
        jsonStr = trimmedLine
      } else {
        continue
      }

      const event = this.parseSSEEvent(jsonStr)
      if (event) {
        switch (event.type) {
          case 'text':
            callbacks.onText(event.text)
            break
          case 'tool_call':
            callbacks.onToolCall(event.text)
            break
          case 'tool_call_chunk':
            callbacks.onToolCallChunk(event.text)
            break
          case 'error':
            callbacks.onError(event.text)
            break
          default:
            console.warn('Unknown SSE event type:', event)
        }
      }
    }
  },

  /**
   * Parse SSE event data from JSON string
   */
  parseSSEEvent(data: string): SSEEvent | null {
    try {
      return JSON.parse(data) as SSEEvent
    } catch (error) {
      console.error('Error parsing SSE event:', error, data)
      return null
    }
  },
}
