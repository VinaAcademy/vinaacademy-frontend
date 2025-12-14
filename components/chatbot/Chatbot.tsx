'use client'

import React, { useEffect, useRef, useState } from 'react'
import { marked } from 'marked'
import DOMPurify from 'isomorphic-dompurify'
import {
  Bot,
  Cpu,
  Loader2,
  Maximize2,
  MessageCircle,
  Minimize2,
  Send,
  User,
  X,
} from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import type { ChatRequest, StreamCallbacks } from '@/services/chatbotService'
import { chatbotService } from '@/services/chatbotService'
import { cn } from '@/lib/utils'
import './Chatbot.css'

interface Turn {
  id: string | number
  user: string | null
  tools: string[]
  thinking: string | null
  assistant: string
  error: string | null
}

interface ConversationMessage {
  role: 'user' | 'assistant'
  content: string
}

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [conversationHistory, setConversationHistory] = useState<
    ConversationMessage[]
  >([])

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value)
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isLoading) {
      sendMessage().then((r) => r)
    }
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
      conversation_history: conversationHistory,
    }

    let fullResponseText = ''

    const callbacks: StreamCallbacks = {
      onText: (text: string) => {
        fullResponseText += text
        setTurns((prev) =>
          prev.map((turn) => {
            if (turn.id === newTurnId) {
              return {
                ...turn,
                assistant: turn.assistant + text,
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

  const toggleChatbot = () => {
    setIsOpen(!isOpen)
    setIsMinimized(false)
  }

  const minimizeChatbot = () => {
    setIsMinimized(!isMinimized)
  }

  const closeChatbot = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    setIsOpen(false)
    setIsMinimized(false)
  }

  return (
    <>
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleChatbot}
            className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30 transition-all hover:shadow-blue-500/50"
            aria-label="Open chatbot"
          >
            <MessageCircle className="h-7 w-7" />
            <span className="absolute -right-1 -top-1 flex h-4 w-4">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex h-4 w-4 rounded-full bg-red-500"></span>
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
              height: isMinimized ? 'auto' : '600px',
              width: isMinimized ? '320px' : '400px',
            }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={cn(
              'fixed bottom-6 right-6 z-50 flex flex-col overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5 dark:bg-gray-900 dark:ring-white/10',
              isMinimized ? 'w-80' : 'w-[400px] sm:w-[450px]',
            )}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3 text-white cursor-pointer"
              onClick={isMinimized ? toggleChatbot : undefined}
            >
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                  <Bot className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold">Trợ lý AI</h3>
                  <div className="flex items-center gap-1.5">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-green-400"></span>
                    </span>
                    <span className="text-[10px] font-medium opacity-90">
                      Online
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    minimizeChatbot()
                  }}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-white/80 transition-colors hover:bg-white/20 hover:text-white"
                  aria-label={isMinimized ? 'Maximize' : 'Minimize'}
                >
                  {isMinimized ? (
                    <Maximize2 className="h-4 w-4" />
                  ) : (
                    <Minimize2 className="h-4 w-4" />
                  )}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    closeChatbot()
                  }}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-white/80 transition-colors hover:bg-white/20 hover:text-white"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Chat Box */}
            {!isMinimized && (
              <>
                <div
                  className="flex-1 overflow-y-auto bg-gray-50 p-4 dark:bg-gray-950/50"
                  ref={chatBoxRef}
                >
                  <div className="space-y-6">
                    {turns.map((turn) => (
                      <motion.div
                        key={turn.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-4"
                      >
                        {/* User Message */}
                        {turn.user && (
                          <div className="flex justify-end gap-3">
                            <div className="chatbot-markdown max-w-[85%] rounded-2xl rounded-tr-sm bg-blue-600 px-4 py-2.5 text-sm text-white shadow-sm">
                              <div
                                dangerouslySetInnerHTML={{
                                  __html: DOMPurify.sanitize(
                                    marked.parse(turn.user) as string,
                                  ),
                                }}
                              />
                            </div>
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700">
                              <User className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                            </div>
                          </div>
                        )}

                        {/* Tools & Thinking */}
                        {(turn.tools.length > 0 || turn.thinking) && (
                          <div className="ml-11 space-y-2">
                            {turn.tools.map((tool, idx) => (
                              <motion.div
                                key={idx}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="flex items-center gap-2 rounded-lg border border-blue-100 bg-blue-50/50 px-3 py-1.5 text-xs text-blue-700 dark:border-blue-900/30 dark:bg-blue-900/20 dark:text-blue-300"
                              >
                                <Cpu className="h-3.5 w-3.5 animate-pulse" />
                                <span className="font-medium">
                                  Đang xử lý: {tool}
                                </span>
                              </motion.div>
                            ))}

                            {turn.thinking && (
                              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                <span className="italic">{turn.thinking}</span>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Assistant Message */}
                        {turn.assistant && (
                          <div className="flex gap-3">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 shadow-sm">
                              <Bot className="h-5 w-5 text-white" />
                            </div>
                            <div className="max-w-[85%] space-y-2">
                              <div className="chatbot-markdown rounded-2xl rounded-tl-sm bg-white px-4 py-3 text-sm text-gray-800 shadow-sm ring-1 ring-gray-100 dark:bg-gray-800 dark:text-gray-100 dark:ring-gray-700">
                                <div
                                  dangerouslySetInnerHTML={{
                                    __html: DOMPurify.sanitize(
                                      marked.parse(turn.assistant) as string,
                                    ),
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Error Message */}
                        {turn.error && (
                          <div className="ml-11 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600 dark:border-red-900/30 dark:bg-red-900/20 dark:text-red-400">
                            ⚠️ {turn.error}
                          </div>
                        )}
                      </motion.div>
                    ))}

                    {isLoading &&
                      !turns[turns.length - 1].assistant &&
                      !turns[turns.length - 1].thinking && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="flex gap-3"
                        >
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600">
                            <Bot className="h-5 w-5 text-white" />
                          </div>
                          <div className="flex items-center gap-1 rounded-2xl rounded-tl-sm bg-white px-4 py-3 shadow-sm ring-1 ring-gray-100 dark:bg-gray-800 dark:ring-gray-700">
                            <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.3s]"></span>
                            <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.15s]"></span>
                            <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400"></span>
                          </div>
                        </motion.div>
                      )}
                  </div>
                </div>

                {/* Input Area */}
                <div className="border-t border-gray-100 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      placeholder="Nhập tin nhắn..."
                      value={input}
                      onChange={handleInputChange}
                      onKeyPress={handleKeyPress}
                      disabled={isLoading}
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-4 pr-12 text-sm outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:border-blue-500"
                    />
                    <button
                      onClick={sendMessage}
                      disabled={isLoading || !input.trim()}
                      className="absolute right-2 rounded-lg p-2 text-blue-600 transition-colors hover:bg-blue-50 disabled:cursor-not-allowed disabled:text-gray-400 dark:text-blue-400 dark:hover:bg-blue-900/20"
                      aria-label="Send message"
                    >
                      <Send className="h-5 w-5" />
                    </button>
                  </div>
                  <div className="mt-2 text-center">
                    <p className="text-[10px] text-gray-400">
                      AI có thể mắc lỗi. Hãy kiểm tra lại thông tin quan trọng.
                    </p>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
