import { useState, useRef, useEffect } from 'react'
import {
  chatbotService,
  ChatRequest,
  StreamCallbacks,
  ConversationMessage,
} from '@/services/chatbotService'
import { useChatbotContext } from '@/context/ChatbotContext'

export interface Turn {
  id: string | number
  user: string | null
  tools: string[]
  thinking: string | null
  assistant: string
  error: string | null
}

export function useChatbot() {
  const {
    courseId,
    lessonId,
    customContext,
    isOpen,
    openChatbot,
    closeChatbot: contextCloseChatbot,
    toggleChatbot: contextToggleChatbot,
  } = useChatbotContext()
  // const [isOpen, setIsOpen] = useState(false) // Managed by context now
  const [isMinimized, setIsMinimized] = useState(false)
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [conversationHistory, setConversationHistory] = useState<
    ConversationMessage[]
  >([])
  const [hasFetchedHistory, setHasFetchedHistory] = useState(false)

  const [turns, setTurns] = useState<Turn[]>([
    {
      id: 'init',
      user: null,
      tools: [],
      thinking: null,
      assistant:
        'Xin chào! Tôi là trợ lý AI của VinaAcademy. Tôi có thể giúp gì cho bạn hôm nay?',
      error: null,
    },
  ])

  const chatBoxRef = useRef<HTMLDivElement>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight
    }
  }, [turns, isOpen, isMinimized])

  useEffect(() => {
    if (isOpen && !hasFetchedHistory) {
      const loadHistory = async () => {
        try {
          const history = await chatbotService.getChatHistory()
          if (history && history.length > 0) {
            setConversationHistory(history)

            // Convert history to turns
            const historyTurns: Turn[] = []
            let currentTurn: Turn | null = null

            history.forEach((msg, index) => {
              if (msg.role === 'user') {
                if (currentTurn) {
                  historyTurns.push(currentTurn)
                }
                currentTurn = {
                  id: `history-${index}`,
                  user: msg.content,
                  tools: [],
                  thinking: null,
                  assistant: '',
                  error: null,
                }
              } else if (msg.role === 'assistant') {
                if (currentTurn) {
                  currentTurn.assistant = msg.content
                  historyTurns.push(currentTurn)
                  currentTurn = null
                } else {
                  // Standalone assistant message
                  historyTurns.push({
                    id: `history-${index}`,
                    user: null,
                    tools: [],
                    thinking: null,
                    assistant: msg.content,
                    error: null,
                  })
                }
              }
            })

            if (currentTurn) {
              historyTurns.push(currentTurn)
            }

            setTurns((prev) => {
              const initTurn = prev[0]
              const otherTurns = prev.slice(1)
              return [initTurn, ...historyTurns, ...otherTurns]
            })
          }
        } catch (error) {
          console.error('Error loading chat history', error)
        } finally {
          setHasFetchedHistory(true)
        }
      }
      loadHistory()
    }
  }, [isOpen, hasFetchedHistory])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value)
  }

  const sendMessage = async () => {
    if (!input.trim()) return

    const message = input.trim()
    setInput('')
    setIsLoading(true)

    // Add new turn
    const newTurnId = Date.now()
    setTurns((prev) => [
      ...prev,
      {
        id: newTurnId,
        user: message,
        tools: [],
        thinking: null,
        assistant: '',
        error: null,
      },
    ])

    const payload: ChatRequest = {
      message: message,
      course_id: courseId || undefined,
      lesson_id: lessonId || undefined,
      custom_context: customContext || undefined,
    }

    let fullResponseText = ''

    const callbacks: StreamCallbacks = {
      onText: (text: string) => {
        fullResponseText += text
        // Replace images with placeholder during streaming
        const displayText = fullResponseText.replace(
          /!\[([^\]]*)\]\(([^)]+)\)/g,
          '',
        )

        setTurns((prev) =>
          prev.map((turn) => {
            if (turn.id === newTurnId) {
              return {
                ...turn,
                assistant: displayText,
                thinking: null,
              }
            }
            return turn
          }),
        )
      },
      onToolCall: (text: string) => {
        setTurns((prev) =>
          prev.map((turn) => {
            if (turn.id === newTurnId) {
              return { ...turn, tools: [...turn.tools, text], thinking: null }
            }
            return turn
          }),
        )
      },
      onToolCallChunk: (text: string) => {
        setTurns((prev) =>
          prev.map((turn) => {
            if (turn.id === newTurnId) {
              return { ...turn, thinking: text }
            }
            return turn
          }),
        )
      },
      onError: (error: string) => {
        setTurns((prev) =>
          prev.map((turn) => {
            if (turn.id === newTurnId) {
              return { ...turn, error: error }
            }
            return turn
          }),
        )
      },
      onComplete: () => {
        setIsLoading(false)

        // Restore original text with actual images
        setTurns((prev) =>
          prev.map((turn) => {
            if (turn.id === newTurnId) {
              return {
                ...turn,
                assistant: fullResponseText,
                thinking: null,
              }
            }
            return turn
          }),
        )

        setConversationHistory((prev) =>
          [
            ...prev,
            { role: 'user' as const, content: message },
            { role: 'assistant' as const, content: fullResponseText },
          ].slice(-20),
        )
        abortControllerRef.current = null
      },
    }

    abortControllerRef.current = await chatbotService.streamChatResponse(
      payload,
      callbacks,
    )
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isLoading) {
      sendMessage().then((r) => r)
    }
  }

  const toggleChatbot = () => {
    contextToggleChatbot()
    setIsMinimized(false)
  }

  const minimizeChatbot = () => {
    setIsMinimized(!isMinimized)
  }

  const closeChatbot = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    contextCloseChatbot()
    setIsMinimized(false)
  }

  const clearHistory = async () => {
    if (!confirm('Bạn có chắc chắn muốn xóa toàn bộ lịch sử chat không?'))
      return

    try {
      await chatbotService.clearChatHistory()
      setConversationHistory([])
      setTurns([
        {
          id: 'init',
          user: null,
          tools: [],
          thinking: null,
          assistant:
            'Xin chào! Tôi là trợ lý AI của VinaAcademy. Tôi có thể giúp gì cho bạn hôm nay?',
          error: null,
        },
      ])
    } catch (error) {
      console.error('Failed to clear history:', error)
    }
  }

  return {
    isOpen,
    isMinimized,
    input,
    isLoading,
    turns,
    chatBoxRef,
    handleInputChange,
    handleKeyPress,
    sendMessage,
    toggleChatbot,
    minimizeChatbot,
    closeChatbot,
    clearHistory,
  }
}
