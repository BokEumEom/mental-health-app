import { v4 as uuidv4 } from "uuid"
import type { Activity, ActivityType } from "@/types/activity"

// 로컬 스토리지 키
const ACTIVITIES_KEY = "workplace_emotion_app_activities"

// 활동 기록 저장
export const saveActivity = (
  userId: string,
  type: ActivityType,
  title: string,
  options?: {
    targetId?: string
    targetType?: string
    description?: string
  },
): Activity => {
  const activities = getAllActivities()

  const newActivity: Activity = {
    id: uuidv4(),
    userId,
    type,
    title,
    targetId: options?.targetId,
    targetType: options?.targetType,
    description: options?.description,
    createdAt: Date.now(),
  }

  activities.unshift(newActivity)

  // 최대 100개까지만 저장
  const limitedActivities = activities.slice(0, 100)
  localStorage.setItem(ACTIVITIES_KEY, JSON.stringify(limitedActivities))

  return newActivity
}

// 모든 활동 기록 가져오기
export const getAllActivities = (): Activity[] => {
  if (typeof window === "undefined") return []

  const activitiesJson = localStorage.getItem(ACTIVITIES_KEY)
  return activitiesJson ? JSON.parse(activitiesJson) : []
}

// 사용자별 활동 기록 가져오기
export const getActivitiesByUserId = (userId: string): Activity[] => {
  const activities = getAllActivities()
  return activities.filter((activity) => activity.userId === userId)
}

// 활동 타입별 기록 가져오기
export const getActivitiesByType = (type: ActivityType): Activity[] => {
  const activities = getAllActivities()
  return activities.filter((activity) => activity.type === type)
}

// 활동 기록 삭제
export const deleteActivity = (id: string): boolean => {
  const activities = getAllActivities()
  const filteredActivities = activities.filter((activity) => activity.id !== id)

  if (filteredActivities.length === activities.length) return false

  localStorage.setItem(ACTIVITIES_KEY, JSON.stringify(filteredActivities))
  return true
}

// 샘플 활동 기록 생성
export const initializeActivities = (userId: string): void => {
  if (typeof window === "undefined") return

  // 이미 데이터가 있는지 확인
  const existingActivities = localStorage.getItem(ACTIVITIES_KEY)

  if (!existingActivities) {
    const now = Date.now()
    const day = 24 * 60 * 60 * 1000

    const sampleActivities: Activity[] = [
      {
        id: uuidv4(),
        userId,
        type: "emotion_record",
        title: "감정 기록 추가",
        description: "스트레스, 불안함 감정을 기록했습니다.",
        createdAt: now - 1 * day,
      },
      {
        id: uuidv4(),
        userId,
        type: "mission_complete",
        title: "회복 미션 완료",
        targetId: "mission_1",
        targetType: "mission",
        description: "5분 명상하기 미션을 완료했습니다.",
        createdAt: now - 2 * day,
      },
      {
        id: uuidv4(),
        userId,
        type: "post_create",
        title: "커뮤니티 글 작성",
        targetId: "post_1",
        targetType: "post",
        description: "번아웃을 극복한 경험이 있으신 분 조언 부탁드려요",
        createdAt: now - 3 * day,
      },
      {
        id: uuidv4(),
        userId,
        type: "badge_earn",
        title: "배지 획득",
        targetId: "badge_1",
        targetType: "badge",
        description: "첫 감정 기록 배지를 획득했습니다.",
        createdAt: now - 5 * day,
      },
      {
        id: uuidv4(),
        userId,
        type: "level_up",
        title: "레벨 업",
        description: "감정 회복력 레벨 2에 도달했습니다.",
        createdAt: now - 7 * day,
      },
    ]

    localStorage.setItem(ACTIVITIES_KEY, JSON.stringify(sampleActivities))
  }
}
