// 피드백 타입 정의
export type FeedbackRating = "positive" | "neutral" | "negative"

export type FeedbackCategory =
  | "empathy" // 공감 능력
  | "relevance" // 관련성
  | "helpfulness" // 유용성
  | "clarity" // 명확성
  | "tone" // 어조
  | "length" // 길이
  | "other" // 기타

export interface FeedbackItem {
  id: string
  userId: string
  conversationId: string
  messageId: string
  rating: FeedbackRating
  categories?: FeedbackCategory[]
  comment?: string
  timestamp: number
  userQuery: string
  aiResponse: string
}

export interface FeedbackStats {
  totalFeedback: number
  positiveRate: number
  neutralRate: number
  negativeRate: number
  categoryStats: Record<FeedbackCategory, number>
  recentTrend: {
    date: string
    positive: number
    neutral: number
    negative: number
  }[]
}

export interface ResponseMetrics {
  averageResponseTime: number
  averageResponseLength: number
  topIssueCategories: FeedbackCategory[]
  improvementAreas: FeedbackCategory[]
}
