// 감정 강도 타입
export type EmotionIntensity = 1 | 2 | 3 | 4 | 5

// 감정 카테고리 타입
export type EmotionCategory =
  | "불안"
  | "분노"
  | "슬픔"
  | "무력감"
  | "스트레스"
  | "소진"
  | "위화감"
  | "불만"
  | "혼란"
  | "기쁨"
  | "만족"
  | "평온"
  | "희망"
  | "감사"

// 감정 색상 매핑
export const emotionColors: Record<EmotionCategory, { bg: string; border: string; text: string; hover: string }> = {
  불안: { bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-700", hover: "hover:bg-blue-100" },
  분노: { bg: "bg-red-50", border: "border-red-200", text: "text-red-700", hover: "hover:bg-red-100" },
  슬픔: { bg: "bg-indigo-50", border: "border-indigo-200", text: "text-indigo-700", hover: "hover:bg-indigo-100" },
  무력감: { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-700", hover: "hover:bg-amber-100" },
  스트레스: { bg: "bg-orange-50", border: "border-orange-200", text: "text-orange-700", hover: "hover:bg-orange-100" },
  소진: { bg: "bg-slate-50", border: "border-slate-200", text: "text-slate-700", hover: "hover:bg-slate-100" },
  위화감: { bg: "bg-purple-50", border: "border-purple-200", text: "text-purple-700", hover: "hover:bg-purple-100" },
  불만: { bg: "bg-rose-50", border: "border-rose-200", text: "text-rose-700", hover: "hover:bg-rose-100" },
  혼란: { bg: "bg-violet-50", border: "border-violet-200", text: "text-violet-700", hover: "hover:bg-violet-100" },
  기쁨: { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700", hover: "hover:bg-emerald-100" },
  만족: { bg: "bg-green-50", border: "border-green-200", text: "text-green-700", hover: "hover:bg-green-100" },
  평온: { bg: "bg-cyan-50", border: "border-cyan-200", text: "text-cyan-700", hover: "hover:bg-cyan-100" },
  희망: { bg: "bg-sky-50", border: "border-sky-200", text: "text-sky-700", hover: "hover:bg-sky-100" },
  감사: { bg: "bg-teal-50", border: "border-teal-200", text: "text-teal-700", hover: "hover:bg-teal-100" },
}

// 감정 기록 타입
export type EmotionRecord = {
  id: string
  timestamp: number
  emotions: {
    category: EmotionCategory
    intensity: EmotionIntensity
  }[]
  note: string
  situation: string
  energyLevel: number // 0-100
}
