import type { Level } from "@/types/achievement"

// 레벨 데이터베이스
export const levels: Level[] = [
  {
    level: 1,
    name: "새싹",
    requiredPoints: 0,
    benefits: ["기본 미션 접근 가능"],
  },
  {
    level: 2,
    name: "새싹 성장",
    requiredPoints: 100,
    benefits: ["일일 미션 1개 추가", "감정 분석 기본 리포트 접근 가능"],
  },
  {
    level: 3,
    name: "꽃봉오리",
    requiredPoints: 300,
    benefits: ["일일 미션 2개 추가", "감정 분석 상세 리포트 접근 가능"],
  },
  {
    level: 4,
    name: "활짝 핀 꽃",
    requiredPoints: 600,
    benefits: ["일일 미션 3개 추가", "커뮤니티 특별 배지 표시"],
  },
  {
    level: 5,
    name: "단단한 나무",
    requiredPoints: 1000,
    benefits: ["모든 미션 접근 가능", "감정 분석 프리미엄 리포트 접근 가능"],
  },
  {
    level: 6,
    name: "울창한 숲",
    requiredPoints: 1500,
    benefits: ["커뮤니티 글 상단 노출", "특별 미션 접근 가능"],
  },
  {
    level: 7,
    name: "평온한 호수",
    requiredPoints: 2200,
    benefits: ["맞춤형 미션 추천", "프리미엄 테마 접근 가능"],
  },
  {
    level: 8,
    name: "넓은 바다",
    requiredPoints: 3000,
    benefits: ["모든 기능 접근 가능", "VIP 배지 획득"],
  },
  {
    level: 9,
    name: "높은 산",
    requiredPoints: 4000,
    benefits: ["멘토 자격 획득", "특별 이벤트 초대"],
  },
  {
    level: 10,
    name: "빛나는 별",
    requiredPoints: 5000,
    benefits: ["마음퇴근 명예의 전당 등록", "모든 콘텐츠 평생 이용 가능"],
  },
]

// 포인트로 레벨 계산
export function getLevelByPoints(points: number): Level {
  // 포인트에 해당하는 가장 높은 레벨 찾기
  for (let i = levels.length - 1; i >= 0; i--) {
    if (points >= levels[i].requiredPoints) {
      return levels[i]
    }
  }
  return levels[0] // 기본 레벨
}

// 다음 레벨까지 필요한 포인트 계산
export function getPointsToNextLevel(points: number): { nextLevel: Level; pointsNeeded: number } | null {
  const currentLevel = getLevelByPoints(points)
  const currentLevelIndex = levels.findIndex((level) => level.level === currentLevel.level)

  // 이미 최고 레벨인 경우
  if (currentLevelIndex === levels.length - 1) {
    return null
  }

  const nextLevel = levels[currentLevelIndex + 1]
  const pointsNeeded = nextLevel.requiredPoints - points

  return { nextLevel, pointsNeeded }
}
