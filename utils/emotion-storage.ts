import type { EmotionRecord } from "@/types/emotion"

// 로컬 스토리지 키
const EMOTION_RECORDS_KEY = "emotion_records"

// 감정 기록 저장
export function saveEmotionRecord(record: EmotionRecord): void {
  if (typeof window === "undefined") return

  try {
    // 디버깅 로그 추가
    console.log("감정 기록 저장 시작:", record)

    // 기존 기록 불러오기
    const existingRecords = getEmotionRecords()
    console.log("기존 기록 수:", existingRecords.length)

    // 새 기록 추가
    const updatedRecords = [record, ...existingRecords]

    // 로컬 스토리지에 저장
    localStorage.setItem(EMOTION_RECORDS_KEY, JSON.stringify(updatedRecords))
    console.log("감정 기록 저장 완료")
  } catch (error) {
    console.error("감정 기록 저장 중 오류 발생:", error)
    throw new Error("감정 기록 저장에 실패했습니다.")
  }
}

// 모든 감정 기록 불러오기
export function getEmotionRecords(): EmotionRecord[] {
  if (typeof window === "undefined") return []

  try {
    const recordsJson = localStorage.getItem(EMOTION_RECORDS_KEY)
    if (!recordsJson) {
      console.log("저장된 감정 기록 없음")
      return []
    }

    const records = JSON.parse(recordsJson) as EmotionRecord[]
    console.log("감정 기록 불러오기 완료:", records.length)
    return records
  } catch (error) {
    console.error("감정 기록 불러오기 중 오류 발생:", error)
    // 오류 발생 시 빈 배열 반환하는 대신 오류 표시
    alert("감정 기록을 불러오는 중 오류가 발생했습니다. 개발자 도구를 확인해주세요.")
    return []
  }
}

// 특정 감정 기록 불러오기
export function getEmotionRecordById(id: string): EmotionRecord | null {
  const records = getEmotionRecords()
  return records.find((record) => record.id === id) || null
}

// 감정 기록 삭제
export function deleteEmotionRecord(id: string): void {
  if (typeof window === "undefined") return

  try {
    const records = getEmotionRecords()
    const updatedRecords = records.filter((record) => record.id !== id)
    localStorage.setItem(EMOTION_RECORDS_KEY, JSON.stringify(updatedRecords))
  } catch (error) {
    console.error("감정 기록 삭제 중 오류 발생:", error)
  }
}

// 최근 감정 기록 불러오기
export function getRecentEmotionRecords(count = 5): EmotionRecord[] {
  const records = getEmotionRecords()
  // 날짜 기준 내림차순 정렬 후 지정된 개수만큼 반환
  return records.sort((a, b) => b.timestamp - a.timestamp).slice(0, count)
}

// 오늘의 감정 기록 불러오기
export function getTodayEmotionRecords(): EmotionRecord[] {
  const records = getEmotionRecords()
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayTimestamp = today.getTime()

  return records.filter((record) => {
    const recordDate = new Date(record.timestamp)
    recordDate.setHours(0, 0, 0, 0)
    return recordDate.getTime() === todayTimestamp
  })
}

// 감정 통계 계산
export function calculateEmotionStats() {
  const records = getEmotionRecords()

  if (records.length === 0) {
    return {
      energyLevel: 50,
      burnoutRisk: 0,
      dominantEmotions: [],
    }
  }

  // 최근 7일 기록만 사용
  const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
  const recentRecords = records.filter((r) => r.timestamp >= oneWeekAgo)

  // 평균 에너지 레벨 계산
  const avgEnergyLevel =
    recentRecords.length > 0 ? recentRecords.reduce((sum, r) => sum + r.energyLevel, 0) / recentRecords.length : 50

  // 부정적 감정 비율로 번아웃 위험 계산
  const allEmotions = recentRecords.flatMap((r) => r.emotions)
  const negativeEmotions = allEmotions.filter((e) =>
    ["불안", "분노", "슬픔", "무력감", "스트레스", "소진", "위화감", "불만", "혼란"].includes(e.category),
  )

  const burnoutRisk = allEmotions.length > 0 ? (negativeEmotions.length / allEmotions.length) * 100 : 0

  // 주요 감정 계산
  const emotionCounts: Record<string, number> = {}
  allEmotions.forEach((e) => {
    emotionCounts[e.category] = (emotionCounts[e.category] || 0) + 1
  })

  const dominantEmotions = Object.entries(emotionCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([category, count]) => ({
      category,
      percentage: Math.round((count / allEmotions.length) * 100),
    }))

  return {
    energyLevel: Math.round(avgEnergyLevel),
    burnoutRisk: Math.round(burnoutRisk),
    dominantEmotions,
  }
}

// 로컬 스토리지 초기화 함수 (테스트용)
export function clearEmotionRecords(): void {
  if (typeof window === "undefined") return
  localStorage.removeItem(EMOTION_RECORDS_KEY)
  console.log("감정 기록이 모두 초기화되었습니다.")
}
