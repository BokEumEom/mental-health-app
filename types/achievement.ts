import type { MissionCategory } from "@/types/mission"
import type { EmotionCategory } from "@/types/emotion"

// 배지 타입
export type BadgeType = "mission" | "emotion" | "streak" | "community" | "special"

// 배지 등급
export type BadgeRank = "bronze" | "silver" | "gold" | "platinum"

// 배지 정보
export type Badge = {
  id: string
  name: string
  description: string
  type: BadgeType
  rank: BadgeRank
  icon: string // Lucide 아이콘 이름
  unlockCondition: string
  unlockCriteria: {
    type: string
    value: number
    category?: MissionCategory | EmotionCategory
  }
}

// 사용자 배지 상태
export type UserBadge = {
  badgeId: string
  unlockedAt: number
  progress?: number // 진행 상황 (0-100)
}

// 레벨 정보
export type Level = {
  level: number
  name: string
  requiredPoints: number
  benefits: string[]
}

// 배지 등급별 색상
export const badgeRankColors: Record<BadgeRank, { bg: string; text: string; border: string; shadow: string }> = {
  bronze: {
    bg: "bg-amber-100",
    text: "text-amber-800",
    border: "border-amber-200",
    shadow: "shadow-amber-100",
  },
  silver: {
    bg: "bg-slate-100",
    text: "text-slate-700",
    border: "border-slate-200",
    shadow: "shadow-slate-100",
  },
  gold: {
    bg: "bg-yellow-100",
    text: "text-yellow-800",
    border: "border-yellow-200",
    shadow: "shadow-yellow-100",
  },
  platinum: {
    bg: "bg-indigo-100",
    text: "text-indigo-800",
    border: "border-indigo-200",
    shadow: "shadow-indigo-100",
  },
}

// 배지 타입별 색상
export const badgeTypeColors: Record<BadgeType, { bg: string; text: string; border: string }> = {
  mission: {
    bg: "bg-purple-50",
    text: "text-purple-700",
    border: "border-purple-200",
  },
  emotion: {
    bg: "bg-teal-50",
    text: "text-teal-700",
    border: "border-teal-200",
  },
  streak: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
  },
  community: {
    bg: "bg-rose-50",
    text: "text-rose-700",
    border: "border-rose-200",
  },
  special: {
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
  },
}
