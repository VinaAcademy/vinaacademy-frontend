'use client'

import React from 'react'
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
  Trash2,
} from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useChatbot } from '@/hooks/chatbot/useChatbot'
import { ChatMessage } from './ChatMessage'
import './Chatbot.css'
import { useChatbotContext } from '@/context/ChatbotContext'

export function Chatbot() {
  const { courseName, lessonName, customContextName } = useChatbotContext()
  const {
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
  } = useChatbot()

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
                    clearHistory()
                  }}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-white/80 transition-colors hover:bg-white/20 hover:text-white"
                  aria-label="Clear history"
                  title="Xóa lịch sử chat"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
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
                      <ChatMessage key={turn.id} turn={turn} />
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

                {/* Context Info */}
                {(courseName || lessonName || customContextName) && (
                  <div className="bg-blue-50 px-4 py-2 text-xs text-blue-700 border-t border-blue-100 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800 flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse"></div>
                    <span>
                      Đang hỏi về:{' '}
                      <span className="font-semibold">
                        {customContextName || lessonName || courseName || ''}
                      </span>
                    </span>
                  </div>
                )}

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
