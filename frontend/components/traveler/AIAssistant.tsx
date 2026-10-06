'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, Loader2 } from 'lucide-react'
import { AssistantMessage } from '@/types/traveler'

interface AIAssistantProps {
  tripId: string
  initialMessages?: AssistantMessage[]
}

export default function AIAssistant({ tripId, initialMessages = [] }: AIAssistantProps) {
  const [messages, setMessages] = useState<AssistantMessage[]>(initialMessages)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async () => {
    if (!input.trim() || loading) return

    const userMessage: AssistantMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date().toISOString(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      // TODO: Replace with actual API call
      // const response = await sendAssistantMessage(tripId, input)

      // Simulate API response
      await new Promise((resolve) => setTimeout(resolve, 1500))

      const assistantMessage: AssistantMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: getSimulatedResponse(input),
        timestamp: new Date().toISOString(),
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      console.error('Failed to send message:', error)
      const errorMessage: AssistantMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="flex flex-col h-[600px] bg-white rounded-lg shadow">
      {/* Header */}
      <div className="flex items-center px-6 py-4 border-b border-gray-200 bg-indigo-50">
        <Bot className="w-6 h-6 text-indigo-600 mr-3" />
        <div>
          <h3 className="font-semibold text-gray-900">TourFlow AI Assistant</h3>
          <p className="text-xs text-gray-600">Ask me anything about your trip</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-12">
            <Bot className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">Hi! I'm your TourFlow AI assistant.</p>
            <p className="text-sm text-gray-500">Ask me questions about your trip:</p>
            <div className="mt-4 space-y-2 text-sm text-gray-600">
              <p>• "What activities are planned for Day 2?"</p>
              <p>• "How much budget do I have left?"</p>
              <p>• "Can you make Day 3 more relaxed?"</p>
              <p>• "Why is my dinner at risk?"</p>
            </div>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`flex max-w-[80%] ${
                message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
              }`}
            >
              <div
                className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  message.role === 'user' ? 'bg-indigo-600 ml-2' : 'bg-gray-200 mr-2'
                }`}
              >
                {message.role === 'user' ? (
                  <User className="w-5 h-5 text-white" />
                ) : (
                  <Bot className="w-5 h-5 text-gray-600" />
                )}
              </div>
              <div
                className={`rounded-lg px-4 py-2 ${
                  message.role === 'user'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                <p
                  className={`text-xs mt-1 ${
                    message.role === 'user' ? 'text-indigo-200' : 'text-gray-500'
                  }`}
                >
                  {new Date(message.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="flex items-center bg-gray-100 rounded-lg px-4 py-2">
              <Loader2 className="w-4 h-4 text-gray-600 animate-spin mr-2" />
              <p className="text-sm text-gray-600">Thinking...</p>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="px-6 py-4 border-t border-gray-200">
        <div className="flex items-end space-x-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask a question about your trip..."
            rows={1}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
            disabled={loading}
          />
          <button
            onClick={handleSendMessage}
            disabled={!input.trim() || loading}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2">Press Enter to send, Shift+Enter for new line</p>
      </div>
    </div>
  )
}

// Simulated responses for demo purposes
function getSimulatedResponse(question: string): string {
  const lowerQuestion = question.toLowerCase()

  if (lowerQuestion.includes('budget') || lowerQuestion.includes('cost')) {
    return 'Based on your current bookings, you have ₹22,200 remaining from your ₹150,000 budget. Your confirmed spending is ₹127,800, which is within your planned budget. Would you like to see a detailed breakdown by category?'
  }

  if (lowerQuestion.includes('day 2') || lowerQuestion.includes('tomorrow')) {
    return 'For Day 2, you have:\n\n• 08:00 - Breakfast at Hotel\n• 09:30 - Louvre Museum Tour (confirmed)\n• 13:00 - Lunch at Café near Louvre\n• 15:00 - Notre-Dame & Sainte-Chapelle\n• 19:00 - Dinner in Latin Quarter\n\nThe Louvre tour is confirmed with priority access. Would you like to add or modify any activities?'
  }

  if (lowerQuestion.includes('relax') || lowerQuestion.includes('slow down')) {
    return 'I can help make your itinerary more relaxed! I suggest:\n\n1. Adding 30-60 minute breaks between activities\n2. Reducing the number of scheduled activities\n3. Scheduling some free exploration time\n\nWhich day would you like me to adjust?'
  }

  if (lowerQuestion.includes('risk') || lowerQuestion.includes('disruption')) {
    return 'Some items are marked "at risk" because they depend on earlier activities in your schedule. For example, if your flight is delayed, your hotel check-in and first-day activities might be affected. I can show you alternative plans if any disruption occurs.'
  }

  return 'I understand your question about the trip. While I\'m currently operating in demo mode, the full version will provide detailed, context-aware answers about your itinerary, budget, bookings, and preferences. Is there anything specific about your trip you\'d like to know?'
}
