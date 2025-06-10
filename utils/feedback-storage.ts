import type { FeedbackItem, FeedbackCategory, FeedbackStats } from "@/types/feedback"

// 로컬 스토리지 키
const FEEDBACK_STORAGE_KEY = "maeum_feedback_data"
const CONVERSATION_FEEDBACK_KEY = "maeum_conversation_feedback"

// 피드백 데이터 저장
export function saveFeedback(feedback: FeedbackItem): void {
  try {
    // 기존 피드백 데이터 가져오기
    const existingFeedback = getFeedbackItems()

    // 새 피드백 추가
    const updatedFeedback = [...existingFeedback, feedback]

    // 로컬 스토리지에 저장
    localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(updatedFeedback))

    // 대화별 피드백 상태 업데이트
    const conversationFeedback = getConversationFeedbackStatus()
    conversationFeedback[feedback.conversationId] = true
    localStorage.setItem(CONVERSATION_FEEDBACK_KEY, JSON.stringify(conversationFeedback))
  } catch (error) {
    console.error("피드백 저장 중 오류 발생:", error)
  }
}

// 모든 피드백 데이터 가져오기
export function getFeedbackItems(): FeedbackItem[] {
  try {
    const data = localStorage.getItem(FEEDBACK_STORAGE_KEY)
    return data ? JSON.parse(data) : []
  } catch (error) {
    console.error("피드백 데이터 로드 중 오류 발생:", error)
    return []
  }
}

// 특정 대화에 대한 피드백 가져오기
export function getFeedbackByConversationId(conversationId: string): FeedbackItem[] {
  const allFeedback = getFeedbackItems()
  return allFeedback.filter((item) => item.conversationId === conversationId)
}

// 대화별 피드백 제출 상태 가져오기
export function getConversationFeedbackStatus(): Record<string, boolean> {
  try {
    const data = localStorage.getItem(CONVERSATION_FEEDBACK_KEY)
    return data ? JSON.parse(data) : {}
  } catch (error) {
    console.error("대화 피드백 상태 로드 중 오류 발생:", error)
    return {}
  }
}

// 특정 대화에 대한 피드백 제출 여부 확인
export function hasFeedbackForConversation(conversationId: string): boolean {
  const status = getConversationFeedbackStatus()
  return !!status[conversationId]
}

// 피드백 통계 계산
export function calculateFeedbackStats(days = 30): FeedbackStats {
  const allFeedback = getFeedbackItems()

  // 지정된 일수 내의 피드백만 필터링
  const cutoffTime = Date.now() - days * 24 * 60 * 60 * 1000
  const recentFeedback = allFeedback.filter((item) => item.timestamp >= cutoffTime)

  if (recentFeedback.length === 0) {
    return getEmptyStats()
  }

  // 긍정/중립/부정 피드백 수 계산
  const positiveCount = recentFeedback.filter((item) => item.rating === "positive").length
  const neutralCount = recentFeedback.filter((item) => item.rating === "neutral").length
  const negativeCount = recentFeedback.filter((item) => item.rating === "negative").length

  // 카테고리별 통계
  const categoryStats: Record<FeedbackCategory, number> = {
    empathy: 0,
    relevance: 0,
    helpfulness: 0,
    clarity: 0,
    tone: 0,
    length: 0,
    other: 0,
  }

  // 카테고리 통계 계산
  recentFeedback.forEach((item) => {
    if (item.categories) {
      item.categories.forEach((category) => {
        categoryStats[category]++
      })
    }
  })

  // 일별 추세 데이터 생성
  const trendMap: Record<string, { positive: number; neutral: number; negative: number }> = {}

  // 최근 7일 날짜 초기화
  const today = new Date()
  for (let i = 0; i < 7; i++) {
    const date = new Date(today)
    date.setDate(today.getDate() - i)
    const dateStr = date.toISOString().split("T")[0]
    trendMap[dateStr] = { positive: 0, neutral: 0, negative: 0 }
  }

  // 피드백 데이터로 추세 채우기
  recentFeedback.forEach((item) => {
    const date = new Date(item.timestamp).toISOString().split("T")[0]
    if (trendMap[date]) {
      if (item.rating === "positive") trendMap[date].positive++
      else if (item.rating === "neutral") trendMap[date].neutral++
      else if (item.rating === "negative") trendMap[date].negative++
    }
  })

  // 추세 데이터 배열로 변환
  const recentTrend = Object.entries(trendMap)
    .map(([date, counts]) => ({
      date,
      ...counts,
    }))
    .sort((a, b) => a.date.localeCompare(b.date))

  return {
    totalFeedback: recentFeedback.length,
    positiveRate: (positiveCount / recentFeedback.length) * 100,
    neutralRate: (neutralCount / recentFeedback.length) * 100,
    negativeRate: (negativeCount / recentFeedback.length) * 100,
    categoryStats,
    recentTrend,
  }
}

// 빈 통계 객체 반환
function getEmptyStats(): FeedbackStats {
  // 최근 7일 날짜 초기화
  const today = new Date()
  const recentTrend = []

  for (let i = 0; i < 7; i++) {
    const date = new Date(today)
    date.setDate(today.getDate() - i)
    const dateStr = date.toISOString().split("T")[0]
    recentTrend.push({
      date: dateStr,
      positive: 0,
      neutral: 0,
      negative: 0,
    })
  }

  return {
    totalFeedback: 0,
    positiveRate: 0,
    neutralRate: 0,
    negativeRate: 0,
    categoryStats: {
      empathy: 0,
      relevance: 0,
      helpfulness: 0,
      clarity: 0,
      tone: 0,
      length: 0,
      other: 0,
    },
    recentTrend: recentTrend.sort((a, b) => a.date.localeCompare(b.date)),
  }
}

// 피드백 삭제
export function deleteFeedback(feedbackId: string): boolean {
  try {
    const allFeedback = getFeedbackItems()
    const updatedFeedback = allFeedback.filter((item) => item.id !== feedbackId)

    if (updatedFeedback.length === allFeedback.length) {
      return false // 삭제할 항목이 없음
    }

    localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(updatedFeedback))
    return true
  } catch (error) {
    console.error("피드백 삭제 중 오류 발생:", error)
    return false
  }
}

// 모든 피드백 데이터 내보내기
export function exportFeedbackData(): string {
  const allFeedback = getFeedbackItems()
  return JSON.stringify(allFeedback, null, 2)
}

// 피드백 데이터 가져오기
export function importFeedbackData(jsonData: string): boolean {
  try {
    const data = JSON.parse(jsonData) as FeedbackItem[]
    localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(data))
    return true
  } catch (error) {
    console.error("피드백 데이터 가져오기 중 오류 발생:", error)
    return false
  }
}
