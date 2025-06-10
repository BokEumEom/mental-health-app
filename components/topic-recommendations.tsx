"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Sparkles } from "lucide-react"
import { useUserProfile } from "@/contexts/user-profile-context"
import { recommendTopics } from "@/utils/topic-recommender"
import type { ConversationTopic } from "@/data/conversation-topics"

type TopicRecommendationsProps = {
  recentMessages: string[]
  onSelectTopic: (topic: string) => void
  className?: string
}

export function TopicRecommendations({ recentMessages, onSelectTopic, className = "" }: TopicRecommendationsProps) {
  const { userProfile } = useUserProfile()
  const [recommendedTopics, setRecommendedTopics] = useState<ConversationTopic[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // 메시지 변경 시 주제 추천 업데이트
  useEffect(() => {
    // 메시지가 없으면 기본 추천
    if (recentMessages.length === 0) {
      const defaultTopics = recommendTopics(userProfile, [], 3)
      setRecommendedTopics(defaultTopics)
      setIsLoading(false)
      return
    }

    // 최근 메시지 기반 추천
    const topics = recommendTopics(userProfile, recentMessages, 3)
    setRecommendedTopics(topics)
    setIsLoading(false)
  }, [recentMessages, userProfile])

  if (isLoading) {
    return <div className={`flex justify-center py-2 ${className}`}>추천 주제 로딩 중...</div>
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center text-xs text-slate-500 mb-1">
        <Sparkles size={12} className="mr-1 text-teal-500" />
        <span>맞춤 대화 주제</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {recommendedTopics.map((topic) => (
          <Button
            key={topic.id}
            variant="outline"
            size="sm"
            className="text-xs bg-slate-50 border-slate-200 hover:bg-teal-50 hover:border-teal-200 hover:text-teal-700 transition-colors"
            onClick={() => onSelectTopic(topic.text)}
          >
            {topic.text}
          </Button>
        ))}
      </div>
    </div>
  )
}
