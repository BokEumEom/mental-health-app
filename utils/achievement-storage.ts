import type { UserBadge } from "@/types/achievement"
import { badges } from "@/data/badges"
import { getMissionCompletions } from "@/utils/mission-storage"
import { getEmotionRecords } from "@/utils/emotion-storage"
import { getRecoveryPoints } from "@/utils/mission-storage"
import { getLevelByPoints } from "@/data/levels"
import { levels } from "@/data/levels" // Import levels

// 로컬 스토리지 키
const USER_BADGES_KEY = "user_badges"

// 사용자 배지 저장
export function saveUserBadge(userBadge: UserBadge): void {
  if (typeof window === "undefined") return

  try {
    // 기존 배지 불러오기
    const existingBadges = getUserBadges()

    // 이미 있는 배지인지 확인
    if (existingBadges.some((badge) => badge.badgeId === userBadge.badgeId)) {
      return
    }

    // 새 배지 추가
    const updatedBadges = [...existingBadges, userBadge]

    // 로컬 스토리지에 저장
    localStorage.setItem(USER_BADGES_KEY, JSON.stringify(updatedBadges))
  } catch (error) {
    console.error("사용자 배지 저장 중 오류 발생:", error)
  }
}

// 사용자 배지 불러오기
export function getUserBadges(): UserBadge[] {
  if (typeof window === "undefined") return []

  try {
    const badgesJson = localStorage.getItem(USER_BADGES_KEY)
    if (!badgesJson) return []

    return JSON.parse(badgesJson) as UserBadge[]
  } catch (error) {
    console.error("사용자 배지 불러오기 중 오류 발생:", error)
    return []
  }
}

// 배지 획득 여부 확인
export function hasBadge(badgeId: string): boolean {
  const userBadges = getUserBadges()
  return userBadges.some((badge) => badge.badgeId === badgeId)
}

// 배지 진행 상황 업데이트
export function updateBadgeProgress(badgeId: string, progress: number): void {
  if (typeof window === "undefined") return

  try {
    const userBadges = getUserBadges()
    const badgeIndex = userBadges.findIndex((badge) => badge.badgeId === badgeId)

    if (badgeIndex !== -1) {
      userBadges[badgeIndex].progress = progress
      localStorage.setItem(USER_BADGES_KEY, JSON.stringify(userBadges))
    }
  } catch (error) {
    console.error("배지 진행 상황 업데이트 중 오류 발생:", error)
  }
}

// 배지 달성 조건 확인 및 새 배지 부여
export function checkAndAwardBadges(): string[] {
  const newlyAwardedBadges: string[] = []

  try {
    // 이미 획득한 배지 목록
    const userBadges = getUserBadges()
    const earnedBadgeIds = new Set(userBadges.map((badge) => badge.badgeId))

    // 미션 완료 데이터
    const missionCompletions = getMissionCompletions()
    const missionCount = missionCompletions.length

    // 감정 기록 데이터
    const emotionRecords = getEmotionRecords()
    const emotionCount = emotionRecords.length

    // 미션 카테고리별 완료 횟수
    const missionCategoryCounts: Record<string, number> = {}
    missionCompletions.forEach((completion) => {
      const missionId = completion.missionId
      // 실제 구현에서는 미션 정보를 가져와서 카테고리 확인
      // 여기서는 간단히 처리
      const missionCategory = "마음챙김" // 예시
      missionCategoryCounts[missionCategory] = (missionCategoryCounts[missionCategory] || 0) + 1
    })

    // 연속 달성 일수 계산
    let streak = 0
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    for (let i = 0; i < 30; i++) {
      // 최대 30일까지만 확인
      const checkDate = new Date(today)
      checkDate.setDate(today.getDate() - i)
      checkDate.setHours(0, 0, 0, 0)

      const hasCompletion = missionCompletions.some((c) => {
        const completionDate = new Date(c.timestamp)
        completionDate.setHours(0, 0, 0, 0)
        return completionDate.getTime() === checkDate.getTime()
      })

      if (hasCompletion) {
        streak++
      } else if (i > 0) {
        // 오늘은 아직 완료하지 않았을 수 있으므로 i > 0 조건 추가
        break
      }
    }

    // 모든 배지 확인
    badges.forEach((badge) => {
      // 이미 획득한 배지는 건너뛰기
      if (earnedBadgeIds.has(badge.id)) return

      let isEarned = false
      let progress = 0

      // 배지 타입별 조건 확인
      switch (badge.unlockCriteria.type) {
        case "mission_complete_count":
          progress = Math.min(100, (missionCount / badge.unlockCriteria.value) * 100)
          isEarned = missionCount >= badge.unlockCriteria.value
          break

        case "mission_category_count":
          if (badge.unlockCriteria.category) {
            const categoryCount = missionCategoryCounts[badge.unlockCriteria.category] || 0
            progress = Math.min(100, (categoryCount / badge.unlockCriteria.value) * 100)
            isEarned = categoryCount >= badge.unlockCriteria.value
          }
          break

        case "mission_streak":
          progress = Math.min(100, (streak / badge.unlockCriteria.value) * 100)
          isEarned = streak >= badge.unlockCriteria.value
          break

        case "emotion_record_count":
          progress = Math.min(100, (emotionCount / badge.unlockCriteria.value) * 100)
          isEarned = emotionCount >= badge.unlockCriteria.value
          break

        // 다른 조건들...
        default:
          break
      }

      // 배지 획득 조건 충족
      if (isEarned) {
        saveUserBadge({
          badgeId: badge.id,
          unlockedAt: Date.now(),
          progress: 100,
        })
        newlyAwardedBadges.push(badge.id)
      }
      // 진행 중인 배지 업데이트
      else if (progress > 0) {
        const existingBadge = userBadges.find((b) => b.badgeId === badge.id)
        if (existingBadge) {
          updateBadgeProgress(badge.id, progress)
        } else {
          // 새로운 진행 중 배지 추가
          saveUserBadge({
            badgeId: badge.id,
            unlockedAt: 0, // 아직 획득하지 않음
            progress,
          })
        }
      }
    })

    return newlyAwardedBadges
  } catch (error) {
    console.error("배지 확인 중 오류 발생:", error)
    return []
  }
}

// 사용자 레벨 정보 가져오기
export function getUserLevelInfo() {
  const points = getRecoveryPoints()
  const currentLevel = getLevelByPoints(points)

  // 다음 레벨 정보
  let nextLevelInfo = null
  if (currentLevel.level < 10) {
    const nextLevel = levels.find((level) => level.level === currentLevel.level + 1)
    if (nextLevel) {
      const pointsNeeded = nextLevel.requiredPoints - points
      const progress =
        ((points - currentLevel.requiredPoints) / (nextLevel.requiredPoints - currentLevel.requiredPoints)) * 100
      nextLevelInfo = {
        level: nextLevel,
        pointsNeeded,
        progress,
      }
    }
  }

  return {
    points,
    currentLevel,
    nextLevelInfo,
  }
}
