'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MessageCircle,
  X,
  Plus,
  Smile,
  Paperclip,
  ChevronDown,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar-shadcn'

// 1. Định nghĩa các kiểu dữ liệu cho tin nhắn
type MessageType = 'text'

interface PollOption {
  id: number
  text: string
  votes: number
  selected?: boolean
}

interface Message {
  id: string
  type: MessageType
  isOutgoing: boolean // true = tin nhắn của mình (bên phải), false = người khác (bên trái)
  sender?: {
    name: string
    avatar: string
  }
  content?: string // Dùng cho text
  timestamp?: string
  pollOptions?: PollOption[]
  pollTotalVotes?: number
}

// Dữ liệu mẫu ban đầu (Mock Data)
const INITIAL_MESSAGES: Message[] = [
  {
    id: '1',
    type: 'text',
    isOutgoing: false,
    sender: { name: 'Alice', avatar: 'https://i.pravatar.cc/100?img=5' },
    content: "Hello I'm here to support you",
    timestamp: '23:40',
  },
]

export default function SupportChat() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES)
  const [inputValue, setInputValue] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const toggleChat = () => setIsOpen(!isOpen)

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isOpen])

  const handleSendMessage = () => {
    if (!inputValue.trim()) return

    const newMessage: Message = {
      id: Date.now().toString(),
      type: 'text',
      isOutgoing: true,
      content: inputValue,
      timestamp: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
    }

    setMessages([...messages, newMessage])
    setInputValue('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage()
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.2 }}
            className="w-[380px] bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 font-sans flex flex-col"
          >
            <div className="p-4 bg-white border-b border-gray-50 flex-shrink-0">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-3 w-full">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 -ml-2 text-gray-500"
                    onClick={() => setIsOpen(false)}
                  >
                    <span className="sr-only">Back</span>←
                  </Button>
                  <div className="flex flex-row justify-between w-full items-center">
                    <h3 className="font-bold text-gray-900 text-base">
                      Contact Supporter
                    </h3>
                    <span className="px-2 py-0.5 bg-green-50 text-xs text-green-600 font-medium rounded-full border border-green-100 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>{' '}
                      Online
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="h-[450px] overflow-y-auto bg-gray-50/30 p-4 space-y-6 scrollbar-hide">
              {messages.map((msg) => (
                <div key={msg.id}>
                  {msg.isOutgoing ? (
                    <div className="flex flex-col items-end gap-1">
                      {msg.type === 'text' && (
                        <div className="bg-indigo-500 text-white px-4 py-3 rounded-2xl rounded-tr-sm text-sm text-gray-800 font-medium max-w-[85%] break-words">
                          {msg.content}
                        </div>
                      )}

                      <div className="flex items-center gap-1">
                        {msg.timestamp && (
                          <span className="text-[10px] text-gray-400">
                            {msg.timestamp}
                          </span>
                        )}
                        <div className="w-3 h-3 bg-orange-200 rounded-full flex items-center justify-center">
                          <span className="text-[8px] text-orange-600">✓</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-3 items-end">
                      <Avatar className="h-8 w-8 mb-1">
                        <AvatarImage src={msg.sender?.avatar} />
                        <AvatarFallback>
                          {msg.sender?.name?.charAt(0) || 'A'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="bg-gray-100 p-4 rounded-2xl rounded-tl-sm text-sm text-gray-800 shadow-sm max-w-[85%] break-words">
                        {msg.content}
                      </div>
                    </div>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 bg-gray-50/50 border-t border-gray-100 mt-auto">
              <div className="bg-white rounded-[20px] p-2 shadow-sm border border-gray-100">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Message to Support..."
                  className="w-full text-sm px-3 py-2 outline-none text-gray-700 placeholder:text-gray-400 bg-transparent"
                />
                <div className="flex justify-between items-center mt-2 px-1">
                  <div className="flex gap-2 text-gray-400">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 hover:bg-gray-100 rounded-full"
                    >
                      <Plus className="w-5 h-5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 hover:bg-gray-100 rounded-full"
                    >
                      <Smile className="w-5 h-5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 hover:bg-gray-100 rounded-full"
                    >
                      <Paperclip className="w-5 h-5" />
                    </Button>
                  </div>
                  <Button
                    onClick={handleSendMessage}
                    className="bg-black hover:bg-gray-800 text-white rounded-xl h-9 px-4 text-xs font-medium flex items-center gap-2"
                  >
                    Send now
                    <div className="w-[1px] h-3 bg-gray-600 mx-1"></div>
                    <ChevronDown className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={toggleChat}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="h-14 w-14 rounded-full bg-blue-600 text-white shadow-lg flex items-center justify-center hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600"
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <MessageCircle className="h-7 w-7" />
        )}
      </motion.button>
    </div>
  )
}
