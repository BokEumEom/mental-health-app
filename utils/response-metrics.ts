import type { ResponseMetrics, FeedbackCategory } from "@/types/feedback"
import { getFeedbackItems } from "./feedback-storage"

// 응답 시간 저장을 위한 로컬 스토리지 키
const RESPONSE_TIMES_KEY = "maeum_response_times"

// 응답 시간 기록
export function recordResponseTime(conversationId: string, responseTimeMs: number): void {
  try {
    const storedTimes = getResponseTimes()
    storedTimes.push({
      conversationId,
      responseTimeMs,
      timestamp: Date.now(),
    })

    // 최대 100개만 저장
    const limitedTimes = storedTimes.slice(-100)
    localStorage.setItem(RESPONSE_TIMES_KEY, JSON.stringify(limitedTimes))
  } catch (error) {
    console.error("응답 시간 기록 중 오류 발생:", error)
  }
}

// 저장된 응답 시간 가져오기
export function getResponseTimes(): Array<{
  conversationId: string
  responseTimeMs: number
  timestamp: number
}> {
  try {
    const data = localStorage.getItem(RESPONSE_TIMES_KEY)
    return data ? JSON.parse(data) : []
  } catch (error) {
    console.error("응답 시간 데이터 로드 중 오류 발생:", error)
    return []
  }
}

// 응답 메트릭 계산
export function calculateResponseMetrics(days = 30): ResponseMetrics {
  const allFeedback = getFeedbackItems()
  const responseTimes = getResponseTimes()

  // 지정된 일수 내의 데이터만 필터링
  const cutoffTime = Date.now() - days * 24 * 60 * 60 * 1000
  const recentFeedback = allFeedback.filter((item) => item.timestamp >= cutoffTime)
  const recentResponseTimes = responseTimes.filter((item) => item.timestamp >= cutoffTime)

  // 평균 응답 시간 계산
  const averageResponseTime =
    recentResponseTimes.length > 0
      ? recentResponseTimes.reduce((sum, item) => sum + item.responseTimeMs, 0) / recentResponseTimes.length
      : 0

  // 평균 응답 길이 계산
  const averageResponseLength =
    recentFeedback.length > 0
      ? recentFeedback.reduce((sum, item) => sum + item.aiResponse.length, 0) / recentFeedback.length
      : 0

  // 부정적 피드백에서 가장 많이 언급된 카테고리 찾기
  const negativeFeedback = recentFeedback.filter((item) => item.rating === "negative")
  const categoryIssues: Record<FeedbackCategory, number> = {
    empathy: 0,
    relevance: 0,
    helpfulness: 0,
    clarity: 0,
    tone: 0,
    length: 0,
    other: 0,
  }

  negativeFeedback.forEach((item) => {
    if (item.categories) {
      item.categories.forEach((category) => {
        categoryIssues[category]++
      })
    }
  })

  // 가장 많이 언급된 문제 카테고리 (상위 3개)
  const topIssueCategories = Object.entries(categoryIssues)
    .sort((a, b) => b[1] - a[1])
    .filter(([_, count]) => count > 0)
    .slice(0, 3)
    .map(([category]) => category as FeedbackCategory)

  // 개선이 필요한 영역 (부정적 피드백 비율이 높은 카테고리)
  const totalCategoryCounts: Record<FeedbackCategory, number> = {
    empathy: 0,
    relevance: 0,
    helpfulness: 0,
    clarity: 0,
    tone: 0,
    length: 0,
    other: 0,
  }

  recentFeedback.forEach((item) => {
    if (item.categories) {
      item.categories.forEach((category) => {
        totalCategoryCounts[category]++
      })
    }
  })

  const improvementAreas = Object.entries(categoryIssues)
    .map(([category, negativeCount]) => {
      const totalCount = totalCategoryCounts[category as FeedbackCategory]
      return {
        category: category as FeedbackCategory,
        negativeRate: totalCount > 0 ? negativeCount / totalCount : 0,
      }
    })
    .filter((item) => item.negativeRate > 0.3) // 30% 이상 부정적 피드백이 있는 카테고리
    .sort((a, b) => b.negativeRate - a.negativeRate)
    .map((item) => item.category)

  return {
    averageResponseTime,
    averageResponseLength,
    topIssueCategories,
    improvementAreas,
  }
}

// 응답 품질 점수 계산 (0-100)
export function calculateQualityScore(): number {
  const allFeedback = getFeedbackItems()

  if (allFeedback.length === 0) {
    return 0
  }

  // 최근 100개 피드백만 사용
  const recentFeedback = allFeedback.slice(-100)

  // 긍정/중립/부정 피드백 가중치 적용
  const weightedScores = recentFeedback.map((item) => {
    if (item.rating === "positive") return 100
    if (item.rating === "neutral") return 50
    return 0
  })

  // 평균 점수 계산
  const averageScore = weightedScores.reduce((sum, score) => sum + score, 0) / weightedScores.length

  return Math.round(averageScore)
}

// 응답 개선 제안 생성
export function generateImprovementSuggestions(): string[] {
  const metrics = calculateResponseMetrics()
  const suggestions: string[] = []

  // 응답 시간 관련 제안
  if (metrics.averageResponseTime > 5000) {
    suggestions.push("응답 시간이 평균 5초를 초과합니다. 응답 생성 속도를 개선하는 것이 좋습니다.")
  }

  // 응답 길이 관련 제안
  if (metrics.averageResponseLength < 50) {
    suggestions.push("응답이 너무 짧습니다. 더 자세한 정보를 제공하는 것이 좋습니다.")
  } else if (metrics.averageResponseLength > 300) {
    suggestions.push("응답이 너무 깁니다. 더 간결하게 핵심 정보를 전달하는 것이 좋습니다.")
  }

  // 카테고리별 개선 제안
  metrics.improvementAreas.forEach((category) => {
    switch (category) {
      case "empathy":
        suggestions.push("사용자의 감정에 더 공감하는 응답이 필요합니다.")
        break
      case "relevance":
        suggestions.push("사용자 질문과 더 관련성 높은 응답이 필요합니다.")
        break
      case "helpfulness":
        suggestions.push("더 실용적이고 도움이 되는 정보를 제공해야 합니다.")
        break
      case "clarity":
        suggestions.push("응답의 명확성을 개선해야 합니다. 더 이해하기 쉬운 언어를 사용하세요.")
        break
      case "tone":
        suggestions.push("응답의 어조를 개선해야 합니다. 더 친근하고 지지적인 톤을 사용하세요.")
        break
      case "length":
        suggestions.push("응답 길이를 조정해야 합니다. 너무 길거나 짧지 않게 적절한 길이로 작성하세요.")
        break
    }
  })

  // 기본 제안
  if (suggestions.length === 0) {
    suggestions.push("현재 응답 품질이 양호합니다. 지속적으로 모니터링하세요.")
  }

  return suggestions
}
