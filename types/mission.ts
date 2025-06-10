// 미션 카테고리 타입
export type MissionCategory = "마음챙김" | "신체활동" | "휴식" | "관계" | "성장" | "감정표현" | "감사" | "목표설정"

// 미션 난이도 타입
export type MissionDifficulty = "쉬움" | "보통" | "도전"

// 미션 타입
export type Mission = {
  id: string
  title: string
  description: string
  category: MissionCategory
  difficulty: MissionDifficulty
  points: number
  estimatedMinutes: number
  tips?: string
}

// 미션 완료 상태 타입
export type MissionStatus = "대기중" | "진행중" | "완료" | "실패"

// 미션 완료 기록 타입
export type MissionCompletion = {
  id: string
  missionId: string
  timestamp: number
  status: MissionStatus
  reflection?: string
  pointsEarned: number
}

// 미션 카테고리별 색상
export const missionCategoryColors: Record<MissionCategory, { bg: string; text: string; border: string }> = {
  마음챙김: { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200" },
  신체활동: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
  휴식: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
  관계: { bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-200" },
  성장: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
  감정표현: { bg: "bg-cyan-50", text: "text-cyan-700", border: "border-cyan-200" },
  감사: { bg: "bg-teal-50", text: "text-teal-700", border: "border-teal-200" },
  목표설정: { bg: "bg-indigo-50", text: "text-indigo-700", border: "border-indigo-200" },
}

// 미션 난이도별 색상
export const missionDifficultyColors: Record<MissionDifficulty, { bg: string; text: string }> = {
  쉬움: { bg: "bg-green-100", text: "text-green-800" },
  보통: { bg: "bg-amber-100", text: "text-amber-800" },
  도전: { bg: "bg-red-100", text: "text-red-800" },
}
