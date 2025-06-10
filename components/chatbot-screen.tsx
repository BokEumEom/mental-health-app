"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Send, Bot, Loader2, RefreshCw, MessageSquare, ThumbsUp } from "lucide-react"
import { parseGeminiStream } from "@/utils/stream-parser"
import { TopicRecommendations } from "@/components/topic-recommendations"
import { useUserProfile } from "@/contexts/user-profile-context"
import { extractKeywordsFromMessage } from "@/utils/topic-recommender"
import { sendMessageToGemini } from "@/app/api/chat/action"
import { FeedbackDialog } from "@/components/feedback-dialog"
import { hasFeedbackForConversation } from "@/utils/feedback-storage"
import { recordResponseTime } from "@/utils/response-metrics"

// 메시지 타입 정의
type Message = {
  id: string
  role: "user" | "model"
  parts: string
  isStreaming?: boolean
  timestamp: number
}

export function ChatbotScreen() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: `msg_${Date.now()}`,
      role: "model",
      parts:
        "안녕하세요! 마음퇴근 AI 친구예요. 오늘 직장에서 어떤 일이 있었는지 편하게 이야기해주세요. 당신의 감정과 상황을 이해하고 도움을 드릴게요.",
      timestamp: Date.now(),
    },
  ])

  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [useStreamingMode, setUseStreamingMode] = useState(false)
  const [retryCount, setRetryCount] = useState(0)
  const [conversationId, setConversationId] = useState(`conv_${Date.now()}`)
  const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false)
  const [selectedMessage, setSelectedMessage] = useState<{ id: string; userQuery: string; aiResponse: string } | null>(
    null,
  )
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { addEmotion, addSituation } = useUserProfile()
  const requestStartTimeRef = useRef<number>(0)

  // 메시지가 추가될 때마다 스크롤 아래로 이동
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // 메시지에서 감정과 상황 키워드 추출하여 사용자 프로필 업데이트
  const updateUserProfileFromMessage = (message: string) => {
    const { emotions, situations } = extractKeywordsFromMessage(message)

    // 감정 키워드 추가
    emotions.forEach((emotion) => {
      addEmotion(emotion)
    })

    // 상황 키워드 추가
    situations.forEach((situation) => {
      addSituation(situation)
    })
  }

  // 일반 응답 방식으로 메시지 전송
  const handleSendNonStreaming = async (userMessage: Message) => {
    try {
      // 응답 시간 측정 시작
      requestStartTimeRef.current = Date.now()

      // 로딩 메시지 추가
      const loadingMessageId = `msg_${Date.now()}`
      setMessages((prev) => [
        ...prev,
        {
          id: loadingMessageId,
          role: "model",
          parts: "",
          isStreaming: true,
          timestamp: Date.now(),
        },
      ])

      // 서버 액션 호출
      const response = await sendMessageToGemini([...messages.filter((m) => !m.isStreaming), userMessage])

      // 응답 시간 기록
      const responseTime = Date.now() - requestStartTimeRef.current
      recordResponseTime(conversationId, responseTime)

      // 응답 메시지 업데이트
      setMessages((prev) => {
        const newMessages = [...prev]
        const lastMessage = newMessages[newMessages.length - 1]

        if (lastMessage && lastMessage.role === "model" && lastMessage.isStreaming) {
          lastMessage.parts = response.text
          lastMessage.isStreaming = false
        }

        return newMessages
      })
    } catch (error) {
      console.error("비스트리밍 응답 오류:", error)

      // 오류 메시지 추가
      setMessages((prev) => {
        const newMessages = [...prev]
        const lastMessage = newMessages[newMessages.length - 1]

        if (lastMessage && lastMessage.role === "model" && lastMessage.isStreaming) {
          lastMessage.parts = "죄송합니다, 응답을 생성하는 데 문제가 발생했습니다. 다시 시도해주세요."
          lastMessage.isStreaming = false
          return newMessages
        } else {
          return [
            ...prev,
            {
              id: `msg_${Date.now()}`,
              role: "model",
              parts: "죄송합니다, 응답을 생성하는 데 문제가 발생했습니다. 다시 시도해주세요.",
              timestamp: Date.now(),
            },
          ]
        }
      })
    } finally {
      setIsLoading(false)
    }
  }

  // 스트리밍 방식으로 메시지 전송
  const handleSendStreaming = async (userMessage: Message) => {
    try {
      // 응답 시간 측정 시작
      requestStartTimeRef.current = Date.now()

      // 스트리밍 응답을 위한 빈 메시지 추가
      const streamingMessageId = `msg_${Date.now()}`
      setMessages((prev) => [
        ...prev,
        {
          id: streamingMessageId,
          role: "model",
          parts: "",
          isStreaming: true,
          timestamp: Date.now(),
        },
      ])

      // API 호출
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [...messages.filter((m) => !m.isStreaming), userMessage],
        }),
      })

      if (!response.ok) {
        throw new Error(`API 요청 실패: ${response.status} ${response.statusText}`)
      }

      if (!response.body) {
        throw new Error("응답 스트림을 사용할 수 없습니다")
      }

      // 스트리밍 응답 처리
      await parseGeminiStream(
        response.body,
        // 청크 도착 시 메시지 업데이트
        (chunk) => {
          setMessages((prev) => {
            const newMessages = [...prev]
            const lastMessage = newMessages[newMessages.length - 1]

            if (lastMessage && lastMessage.role === "model" && lastMessage.isStreaming) {
              lastMessage.parts += chunk
            }

            return newMessages
          })
        },
        // 오류 발생 시
        (error) => {
          console.error("스트리밍 오류:", error)

          // 스트리밍 실패 시 일반 응답 방식으로 재시도
          if (retryCount === 0) {
            setRetryCount(1)
            setUseStreamingMode(false)
            handleSendNonStreaming(userMessage)
            return
          }

          setMessages((prev) => {
            const newMessages = [...prev]
            const lastMessage = newMessages[newMessages.length - 1]

            if (lastMessage && lastMessage.role === "model" && lastMessage.isStreaming) {
              lastMessage.parts = "죄송합니다, 응답 생성 중 오류가 발생했습니다."
              lastMessage.isStreaming = false
            }

            return newMessages
          })
          setIsLoading(false)
        },
        // 스트리밍 완료 시
        () => {
          // 응답 시간 기록
          const responseTime = Date.now() - requestStartTimeRef.current
          recordResponseTime(conversationId, responseTime)

          setMessages((prev) => {
            const newMessages = [...prev]
            const lastMessage = newMessages[newMessages.length - 1]

            if (lastMessage && lastMessage.role === "model" && lastMessage.isStreaming) {
              lastMessage.isStreaming = false
            }

            return newMessages
          })
          setIsLoading(false)
        },
      )
    } catch (error) {
      console.error("챗봇 오류:", error)

      // 스트리밍 실패 시 일반 응답 방식으로 재시도
      if (retryCount === 0) {
        setRetryCount(1)
        setUseStreamingMode(false)
        handleSendNonStreaming(userMessage)
        return
      }

      // 오류 메시지 추가
      setMessages((prev) => {
        const newMessages = [...prev]
        const lastMessage = newMessages[newMessages.length - 1]

        if (lastMessage && lastMessage.role === "model" && lastMessage.isStreaming) {
          lastMessage.parts = "죄송합니다, 일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요."
          lastMessage.isStreaming = false
          return newMessages
        } else {
          return [
            ...prev,
            {
              id: `msg_${Date.now()}`,
              role: "model",
              parts: "죄송합니다, 일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
              timestamp: Date.now(),
            },
          ]
        }
      })
      setIsLoading(false)
    }
  }

  // 메시지 전송 처리
  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMessageId = `msg_${Date.now()}`
    const userMessage: Message = {
      id: userMessageId,
      role: "user",
      parts: input,
      timestamp: Date.now(),
    }

    // 사용자 메시지 추가
    setMessages((prev) => [...prev, userMessage])

    // 사용자 메시지에서 키워드 추출하여 프로필 업데이트
    updateUserProfileFromMessage(input)

    setInput("")
    setIsLoading(true)
    setRetryCount(0)

    // 스트리밍 모드 또는 일반 응답 모드 선택
    if (useStreamingMode) {
      await handleSendStreaming(userMessage)
    } else {
      await handleSendNonStreaming(userMessage)
    }
  }

  // 응답 모드 전환
  const toggleResponseMode = () => {
    setUseStreamingMode(!useStreamingMode)
  }

  // 피드백 다이얼로그 열기
  const openFeedbackDialog = (messageId: string) => {
    // 해당 메시지와 이전 사용자 메시지 찾기
    const modelMessageIndex = messages.findIndex((msg) => msg.id === messageId && msg.role === "model")

    if (modelMessageIndex > 0) {
      const modelMessage = messages[modelMessageIndex]
      let userQuery = ""

      // 이전 사용자 메시지 찾기
      for (let i = modelMessageIndex - 1; i >= 0; i--) {
        if (messages[i].role === "user") {
          userQuery = messages[i].parts
          break
        }
      }

      setSelectedMessage({
        id: messageId,
        userQuery,
        aiResponse: modelMessage.parts,
      })
      setFeedbackDialogOpen(true)
    }
  }

  // 추천 주제 선택 시 입력창에 설정
  const handleSelectTopic = (topic: string) => {
    setInput(topic)
  }

  // 스트리밍 중인 메시지에 깜빡이는 커서 효과 추가
  const renderMessageContent = (message: Message) => {
    if (message.parts === "") {
      return (
        <div className="flex items-center">
          <Loader2 size={16} className="animate-spin mr-2" />
          <span>생각 중...</span>
        </div>
      )
    }

    if (message.isStreaming) {
      return (
        <>
          {message.parts}
          <span className="inline-block w-2 h-4 ml-1 bg-teal-600 animate-pulse"></span>
        </>
      )
    }

    return message.parts
  }

  // 피드백 버튼 렌더링
  const renderFeedbackButtons = (message: Message) => {
    // 모델 응답이고 스트리밍 중이 아닌 경우에만 피드백 버튼 표시
    if (message.role === "model" && !message.isStreaming && message.parts.trim() !== "") {
      // 이미 피드백을 제출했는지 확인
      const hasFeedback = hasFeedbackForConversation(message.id)

      if (hasFeedback) {
        return (
          <div className="flex items-center text-xs text-slate-400 mt-2">
            <ThumbsUp size={12} className="mr-1" />
            <span>피드백 제출됨</span>
          </div>
        )
      }

      return (
        <div className="flex items-center gap-2 mt-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-xs text-slate-500 hover:text-teal-600"
            onClick={() => openFeedbackDialog(message.id)}
          >
            <MessageSquare size={12} className="mr-1" />
            피드백 남기기
          </Button>
        </div>
      )
    }

    return null
  }

  // 최근 사용자 메시지 추출 (최대 3개)
  const recentUserMessages = messages
    .filter((msg) => msg.role === "user")
    .slice(-3)
    .map((msg) => msg.parts)

  return (
    <div className="flex flex-col h-full pb-20">
      <div className="p-4 border-b sticky top-0 bg-white z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Bot size={20} className="text-teal-600 mr-2" />
            <h2 className="text-lg font-medium">내 편 AI 챗봇</h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleResponseMode}
            className="text-xs flex items-center gap-1"
            title={useStreamingMode ? "스트리밍 모드 (실시간 응답)" : "일반 모드 (한 번에 응답)"}
          >
            <RefreshCw size={14} />
            {useStreamingMode ? "스트리밍" : "일반"}
          </Button>
        </div>
        <p className="text-xs text-slate-500 mt-1">당신의 감정을 이해하고 실질적인 도움을 드려요</p>
      </div>

      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[80%]`}>
              <div
                className={`${
                  message.role === "user"
                    ? "bg-teal-600 text-white rounded-t-lg rounded-bl-lg"
                    : "bg-slate-100 text-slate-800 rounded-t-lg rounded-br-lg"
                } p-3`}
              >
                {renderMessageContent(message)}
              </div>
              {renderFeedbackButtons(message)}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t sticky bottom-16 bg-white">
        <Card className="p-2 flex items-center">
          <Input
            placeholder="상황이나 감정을 자유롭게 입력하세요"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSend()}
            className="border-0 focus-visible:ring-0 flex-1"
            disabled={isLoading}
          />
          <Button
            size="icon"
            onClick={handleSend}
            className="bg-teal-600 hover:bg-teal-700"
            disabled={isLoading || !input.trim()}
          >
            {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
          </Button>
        </Card>

        {/* 맞춤 대화 주제 추천 */}
        <TopicRecommendations recentMessages={recentUserMessages} onSelectTopic={handleSelectTopic} className="mt-3" />
      </div>

      {/* 피드백 다이얼로그 */}
      {selectedMessage && (
        <FeedbackDialog
          open={feedbackDialogOpen}
          onOpenChange={setFeedbackDialogOpen}
          conversationId={conversationId}
          messageId={selectedMessage.id}
          userQuery={selectedMessage.userQuery}
          aiResponse={selectedMessage.aiResponse}
        />
      )}
    </div>
  )
}
