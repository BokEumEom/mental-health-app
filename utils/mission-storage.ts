import type { MissionCompletion, Mission } from "@/types/mission"
import { missions } from "@/data/missions"

// 로컬 스토리지 키
const MISSION_COMPLETIONS_KEY = "mission_completions"
const ACTIVE_MISSIONS_KEY = "active_missions"
const RECOVERY_POINTS_KEY = "recovery_points"
const DAILY_MISSIONS_KEY = "daily_missions"
const LAST_MISSIONS_UPDATE_KEY = "last_missions_update"

// 미션 완료 기록 저장
export function saveMissionCompletion(completion: MissionCompletion): void {
  if (typeof window === "undefined") return

  try {
    // 기존 기록 불러오기
    const existingCompletions = getMissionCompletions()

    // 새 기록 추가
    const updatedCompletions = [completion, ...existingCompletions]

    // 로컬 스토리지에 저장
    localStorage.setItem(MISSION_COMPLETIONS_KEY, JSON.stringify(updatedCompletions))

    // 포인트 적립
    addRecoveryPoints(completion.pointsEarned)

    // 활성 미션에서 제거
    removeActiveMission(completion.missionId)
  } catch (error) {
    console.error("미션 완료 기록 저장 중 오류 발생:", error)
  }
}

// 모든 미션 완료 기록 불러오기
export function getMissionCompletions(): MissionCompletion[] {
  if (typeof window === "undefined") return []

  try {
    const completionsJson = localStorage.getItem(MISSION_COMPLETIONS_KEY)
    if (!completionsJson) return []

    return JSON.parse(completionsJson) as MissionCompletion[]
  } catch (error) {
    console.error("미션 완료 기록 불러오기 중 오류 발생:", error)
    return []
  }
}

// 최근 미션 완료 기록 불러오기
export function getRecentMissionCompletions(count = 5): MissionCompletion[] {
  const completions = getMissionCompletions()
  // 날짜 기준 내림차순 정렬 후 지정된 개수만큼 반환
  return completions.sort((a, b) => b.timestamp - a.timestamp).slice(0, count)
}

// 오늘의 미션 완료 기록 불러오기
export function getTodayMissionCompletions(): MissionCompletion[] {
  const completions = getMissionCompletions()
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayTimestamp = today.getTime()

  return completions.filter((completion) => {
    const completionDate = new Date(completion.timestamp)
    completionDate.setHours(0, 0, 0, 0)
    return completionDate.getTime() === todayTimestamp
  })
}

// 활성 미션 ID 목록 불러오기
export function getActiveMissionIds(): string[] {
  if (typeof window === "undefined") return []

  try {
    const activeMissionsJson = localStorage.getItem(ACTIVE_MISSIONS_KEY)
    if (!activeMissionsJson) return []

    return JSON.parse(activeMissionsJson) as string[]
  } catch (error) {
    console.error("활성 미션 불러오기 중 오류 발생:", error)
    return []
  }
}

// 활성 미션 ID 추가
export function addActiveMission(missionId: string): void {
  if (typeof window === "undefined") return

  try {
    const activeMissions = getActiveMissionIds()
    if (activeMissions.includes(missionId)) return

    const updatedActiveMissions = [...activeMissions, missionId]
    localStorage.setItem(ACTIVE_MISSIONS_KEY, JSON.stringify(updatedActiveMissions))
  } catch (error) {
    console.error("활성 미션 추가 중 오류 발생:", error)
  }
}

// 활성 미션 ID 제거
export function removeActiveMission(missionId: string): void {
  if (typeof window === "undefined") return

  try {
    const activeMissions = getActiveMissionIds()
    const updatedActiveMissions = activeMissions.filter((id) => id !== missionId)
    localStorage.setItem(ACTIVE_MISSIONS_KEY, JSON.stringify(updatedActiveMissions))
  } catch (error) {
    console.error("활성 미션 제거 중 오류 발생:", error)
  }
}

// 회복 포인트 불러오기
export function getRecoveryPoints(): number {
  if (typeof window === "undefined") return 0

  try {
    const pointsJson = localStorage.getItem(RECOVERY_POINTS_KEY)
    if (!pointsJson) return 0

    return JSON.parse(pointsJson) as number
  } catch (error) {
    console.error("회복 포인트 불러오기 중 오류 발생:", error)
    return 0
  }
}

// 회복 포인트 추가
export function addRecoveryPoints(points: number): void {
  if (typeof window === "undefined") return

  try {
    const currentPoints = getRecoveryPoints()
    const updatedPoints = currentPoints + points
    localStorage.setItem(RECOVERY_POINTS_KEY, JSON.stringify(updatedPoints))
  } catch (error) {
    console.error("회복 포인트 추가 중 오류 발생:", error)
  }
}

// 오늘의 미션 불러오기 (없으면 새로 생성)
export function getDailyMissions(): string[] {
  if (typeof window === "undefined") return []

  try {
    // 마지막 업데이트 날짜 확인
    const lastUpdateJson = localStorage.getItem(LAST_MISSIONS_UPDATE_KEY)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayStr = today.toISOString().split("T")[0]

    // 오늘 이미 업데이트했는지 확인
    if (lastUpdateJson && JSON.parse(lastUpdateJson) === todayStr) {
      // 기존 미션 반환
      const missionsJson = localStorage.getItem(DAILY_MISSIONS_KEY)
      if (missionsJson) {
        return JSON.parse(missionsJson) as string[]
      }
    }

    // 새 미션 생성
    const recommendedMissions = getRecommendedMissions(3)
    const missionIds = recommendedMissions.map((mission) => mission.id)

    // 저장
    localStorage.setItem(DAILY_MISSIONS_KEY, JSON.stringify(missionIds))
    localStorage.setItem(LAST_MISSIONS_UPDATE_KEY, JSON.stringify(todayStr))

    // 활성 미션에 추가
    missionIds.forEach((id) => addActiveMission(id))

    return missionIds
  } catch (error) {
    console.error("오늘의 미션 불러오기 중 오류 발생:", error)
    return []
  }
}

// 미션 통계 계산
export function calculateMissionStats() {
  const completions = getMissionCompletions()

  if (completions.length === 0) {
    return {
      totalCompleted: 0,
      totalPoints: 0,
      completionRate: 0,
      streak: 0,
    }
  }

  // 총 완료 미션 수
  const totalCompleted = completions.length

  // 총 획득 포인트
  const totalPoints = completions.reduce((sum, completion) => sum + completion.pointsEarned, 0)

  // 완료율 계산 (최근 7일간)
  const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
  const recentCompletions = completions.filter((c) => c.timestamp >= oneWeekAgo)
  const recentDays = new Set(
    recentCompletions.map((c) => {
      const date = new Date(c.timestamp)
      return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
    }),
  )
  const completionRate = Math.round((recentDays.size / 7) * 100)

  // 연속 달성 일수 계산
  let streak = 0
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  for (let i = 0; i < 30; i++) {
    // 최대 30일까지만 확인
    const checkDate = new Date(today)
    checkDate.setDate(today.getDate() - i)
    checkDate.setHours(0, 0, 0, 0)

    const hasCompletion = completions.some((c) => {
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

  return {
    totalCompleted,
    totalPoints,
    completionRate,
    streak,
  }
}

// 랜덤 미션 선택
export function getRandomMission(): Mission {
  const randomIndex = Math.floor(Math.random() * missions.length)
  return missions[randomIndex]
}

// 미션 완료 처리
export function completeMission(missionId: string): void {
  // 실제 구현에서는 미션 완료 기록 저장 및 포인트 지급 등의 로직 필요
  console.log(`미션 완료: ${missionId}`)
}

// ID로 미션 찾기
export function getMissionById(id: string): Mission | undefined {
  return missions.find((mission) => mission.id === id)
}

// 오늘의 미션 추천
export function getRecommendedMissions(count = 3): Mission[] {
  // 실제 구현에서는 사용자 프로필, 이전 완료 미션, 선호도 등을 고려하여 추천
  // 지금은 간단히 랜덤으로 선택
  const shuffled = [...missions].sort(() => 0.5 - Math.random())
  return shuffled.slice(0, count)
}
