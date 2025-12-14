import React, { memo } from 'react'
import { motion } from 'framer-motion'
import { Bot, Cpu, Loader2, User } from 'lucide-react'
import { marked } from 'marked'
import DOMPurify from 'isomorphic-dompurify'
import { Turn } from '@/hooks/chatbot/useChatbot'

interface ChatMessageProps {
  turn: Turn
}

export const ChatMessage = memo(({ turn }: ChatMessageProps) => {
  return (
    <motion.div
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
                __html: DOMPurify.sanitize(marked.parse(turn.user) as string),
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
              <span className="font-medium">Đang xử lý: {tool}</span>
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
  )
})

ChatMessage.displayName = 'ChatMessage'
