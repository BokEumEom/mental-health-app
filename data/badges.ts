import type { Badge, BadgeRank, BadgeType } from "@/types/achievement"

// 배지 데이터베이스
export const badges: Badge[] = [
  // 미션 완료 관련 배지
  {
    id: "mission-starter",
    name: "첫 걸음",
    description: "첫 번째 회복 미션을 완료했습니다.",
    type: "mission",
    rank: "bronze",
    icon: "Award",
    unlockCondition: "첫 번째 미션 완료하기",
    unlockCriteria: {
      type: "mission_complete_count",
      value: 1,
    },
  },
  {
    id: "mission-explorer",
    name: "탐험가",
    description: "10개의 회복 미션을 완료했습니다.",
    type: "mission",
    rank: "silver",
    icon: "Award",
    unlockCondition: "10개 미션 완료하기",
    unlockCriteria: {
      type: "mission_complete_count",
      value: 10,
    },
  },
  {
    id: "mission-master",
    name: "미션 마스터",
    description: "50개의 회복 미션을 완료했습니다.",
    type: "mission",
    rank: "gold",
    icon: "Award",
    unlockCondition: "50개 미션 완료하기",
    unlockCriteria: {
      type: "mission_complete_count",
      value: 50,
    },
  },
  {
    id: "mission-champion",
    name: "챔피언",
    description: "100개의 회복 미션을 완료했습니다.",
    type: "mission",
    rank: "platinum",
    icon: "Trophy",
    unlockCondition: "100개 미션 완료하기",
    unlockCriteria: {
      type: "mission_complete_count",
      value: 100,
    },
  },

  // 미션 카테고리별 배지
  {
    id: "mindfulness-beginner",
    name: "마음챙김 입문자",
    description: "5개의 마음챙김 미션을 완료했습니다.",
    type: "mission",
    rank: "bronze",
    icon: "Brain",
    unlockCondition: "5개의 마음챙김 미션 완료하기",
    unlockCriteria: {
      type: "mission_category_count",
      value: 5,
      category: "마음챙김",
    },
  },
  {
    id: "physical-beginner",
    name: "신체활동 입문자",
    description: "5개의 신체활동 미션을 완료했습니다.",
    type: "mission",
    rank: "bronze",
    icon: "Activity",
    unlockCondition: "5개의 신체활동 미션 완료하기",
    unlockCriteria: {
      type: "mission_category_count",
      value: 5,
      category: "신체활동",
    },
  },
  {
    id: "rest-beginner",
    name: "휴식 입문자",
    description: "5개의 휴식 미션을 완료했습니다.",
    type: "mission",
    rank: "bronze",
    icon: "Coffee",
    unlockCondition: "5개의 휴식 미션 완료하기",
    unlockCriteria: {
      type: "mission_category_count",
      value: 5,
      category: "휴식",
    },
  },

  // 연속 달성 배지
  {
    id: "streak-3",
    name: "꾸준함의 시작",
    description: "3일 연속으로 미션을 완료했습니다.",
    type: "streak",
    rank: "bronze",
    icon: "Flame",
    unlockCondition: "3일 연속 미션 완료하기",
    unlockCriteria: {
      type: "mission_streak",
      value: 3,
    },
  },
  {
    id: "streak-7",
    name: "일주일 챌린지",
    description: "7일 연속으로 미션을 완료했습니다.",
    type: "streak",
    rank: "silver",
    icon: "Flame",
    unlockCondition: "7일 연속 미션 완료하기",
    unlockCriteria: {
      type: "mission_streak",
      value: 7,
    },
  },
  {
    id: "streak-30",
    name: "한 달의 여정",
    description: "30일 연속으로 미션을 완료했습니다.",
    type: "streak",
    rank: "gold",
    icon: "Flame",
    unlockCondition: "30일 연속 미션 완료하기",
    unlockCriteria: {
      type: "mission_streak",
      value: 30,
    },
  },

  // 감정 기록 관련 배지
  {
    id: "emotion-starter",
    name: "감정 인식",
    description: "첫 번째 감정을 기록했습니다.",
    type: "emotion",
    rank: "bronze",
    icon: "Heart",
    unlockCondition: "첫 번째 감정 기록하기",
    unlockCriteria: {
      type: "emotion_record_count",
      value: 1,
    },
  },
  {
    id: "emotion-explorer",
    name: "감정 탐험가",
    description: "10개의 감정을 기록했습니다.",
    type: "emotion",
    rank: "silver",
    icon: "Heart",
    unlockCondition: "10개 감정 기록하기",
    unlockCriteria: {
      type: "emotion_record_count",
      value: 10,
    },
  },
  {
    id: "emotion-master",
    name: "감정 마스터",
    description: "50개의 감정을 기록했습니다.",
    type: "emotion",
    rank: "gold",
    icon: "Heart",
    unlockCondition: "50개 감정 기록하기",
    unlockCriteria: {
      type: "emotion_record_count",
      value: 50,
    },
  },

  // 커뮤니티 관련 배지
  {
    id: "community-starter",
    name: "커뮤니티 첫 발걸음",
    description: "첫 번째 게시글을 작성했습니다.",
    type: "community",
    rank: "bronze",
    icon: "Users",
    unlockCondition: "첫 번째 게시글 작성하기",
    unlockCriteria: {
      type: "community_post_count",
      value: 1,
    },
  },
  {
    id: "community-commenter",
    name: "공감 전달자",
    description: "10개의 댓글을 작성했습니다.",
    type: "community",
    rank: "silver",
    icon: "MessageSquare",
    unlockCondition: "10개 댓글 작성하기",
    unlockCriteria: {
      type: "community_comment_count",
      value: 10,
    },
  },

  // 특별 배지
  {
    id: "early-adopter",
    name: "얼리어답터",
    description: "마음퇴근 앱의 초기 사용자입니다.",
    type: "special",
    rank: "gold",
    icon: "Star",
    unlockCondition: "앱 출시 첫 달에 가입하기",
    unlockCriteria: {
      type: "special",
      value: 1,
    },
  },
]

// ID로 배지 찾기
export function getBadgeById(id: string): Badge | undefined {
  return badges.find((badge) => badge.id === id)
}

// 타입별 배지 필터링
export function getBadgesByType(type: BadgeType): Badge[] {
  return badges.filter((badge) => badge.type === type)
}

// 등급별 배지 필터링
export function getBadgesByRank(rank: BadgeRank): Badge[] {
  return badges.filter((badge) => badge.rank === rank)
}
