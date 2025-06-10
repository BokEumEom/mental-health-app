import type { Mission, MissionCategory, MissionDifficulty } from "@/types/mission"

// 미션 데이터베이스
export const missions: Mission[] = [
  {
    id: "mission-1",
    title: "5분 호흡 명상",
    description: "5분 동안 호흡에 집중하며 명상을 해보세요. 들숨과 날숨에 집중하며 마음을 안정시킵니다.",
    category: "마음챙김",
    difficulty: "쉬움",
    points: 10,
    estimatedMinutes: 5,
    tips: "조용한 장소에서 편안한 자세로 앉아 진행하세요. 타이머를 설정하고 시작하면 더 효과적입니다.",
  },
  {
    id: "mission-2",
    title: "감정 일기 쓰기",
    description: "오늘 느낀 감정을 구체적으로 적어보세요. 어떤 상황에서 어떤 감정이 들었는지 솔직하게 표현해보세요.",
    category: "감정표현",
    difficulty: "보통",
    points: 15,
    estimatedMinutes: 10,
    tips: "감정에 이름을 붙이는 것만으로도 부정적 감정이 25% 감소한다는 연구 결과가 있습니다.",
  },
  {
    id: "mission-3",
    title: "5분 스트레칭",
    description: "간단한 스트레칭으로 굳어있는 몸을 풀어주세요. 특히 목, 어깨, 허리를 중점적으로 스트레칭해보세요.",
    category: "신체활동",
    difficulty: "쉬움",
    points: 10,
    estimatedMinutes: 5,
  },
  {
    id: "mission-4",
    title: "감사한 일 3가지 적기",
    description: "오늘 감사했던 일 3가지를 구체적으로 적어보세요. 작은 일상의 행복에 주목해보세요.",
    category: "감사",
    difficulty: "쉬움",
    points: 10,
    estimatedMinutes: 5,
    tips: "매일 감사일기를 쓰면 행복감이 증가하고 스트레스가 감소한다는 연구 결과가 있습니다.",
  },
  {
    id: "mission-5",
    title: "디지털 디톡스 30분",
    description: "30분 동안 모든 디지털 기기(스마트폰, 컴퓨터 등)를 멀리하고 자신만의 시간을 가져보세요.",
    category: "휴식",
    difficulty: "보통",
    points: 20,
    estimatedMinutes: 30,
    tips: "알림을 끄고 기기를 다른 방에 두면 유혹을 이기는 데 도움이 됩니다.",
  },
  {
    id: "mission-6",
    title: "동료에게 감사 메시지 보내기",
    description:
      "함께 일하는 동료에게 진심 어린 감사 메시지를 보내보세요. 구체적인 상황과 감정을 표현하면 더 좋습니다.",
    category: "관계",
    difficulty: "보통",
    points: 15,
    estimatedMinutes: 10,
  },
  {
    id: "mission-7",
    title: "10분 걷기",
    description: "10분 동안 걸으며 주변 환경에 집중해보세요. 가능하면 자연이 있는 곳으로 가보세요.",
    category: "신체활동",
    difficulty: "쉬움",
    points: 10,
    estimatedMinutes: 10,
    tips: "걸을 때 스마트폰은 두고 가세요. 주변의 소리, 냄새, 색깔 등에 집중해보세요.",
  },
  {
    id: "mission-8",
    title: "새로운 것 배우기",
    description: "관심 있는 주제에 대해 15분 동안 새로운 지식을 습득해보세요. 짧은 동영상이나 글을 읽어도 좋습니다.",
    category: "성장",
    difficulty: "보통",
    points: 15,
    estimatedMinutes: 15,
  },
  {
    id: "mission-9",
    title: "바디스캔 명상",
    description: "발끝부터 머리까지 천천히 신체 각 부위의 감각에 집중하는 바디스캔 명상을 해보세요.",
    category: "마음챙김",
    difficulty: "보통",
    points: 15,
    estimatedMinutes: 10,
    tips: "편안하게 누워서 진행하세요. 유튜브에서 '바디스캔 명상' 가이드를 찾아볼 수 있습니다.",
  },
  {
    id: "mission-10",
    title: "물 마시기",
    description: "지금 바로 물 한 잔(약 250ml)을 천천히 마셔보세요. 물이 몸에 흡수되는 느낌에 집중해보세요.",
    category: "신체활동",
    difficulty: "쉬움",
    points: 5,
    estimatedMinutes: 2,
  },
  {
    id: "mission-11",
    title: "하루 목표 설정하기",
    description: "오늘 달성하고 싶은 작은 목표 3가지를 구체적으로 적어보세요.",
    category: "목표설정",
    difficulty: "쉬움",
    points: 10,
    estimatedMinutes: 5,
    tips: "달성 가능한 현실적인 목표를 세우는 것이 중요합니다. 너무 큰 목표는 작게 나누어보세요.",
  },
  {
    id: "mission-12",
    title: "감정 명명하기",
    description:
      "현재 느끼는 감정에 정확한 이름을 붙여보세요. 기본적인 '화남', '슬픔' 외에도 더 구체적인 감정 단어를 찾아보세요.",
    category: "감정표현",
    difficulty: "보통",
    points: 15,
    estimatedMinutes: 5,
    tips: "감정 단어 예시: 불안, 초조, 짜증, 실망, 후회, 질투, 무력감, 허탈감, 공허함, 설렘, 뿌듯함, 안도감 등",
  },
  {
    id: "mission-13",
    title: "3분 심호흡",
    description: "3분 동안 깊은 호흡에 집중해보세요. 들숨 4초, 숨 참기 2초, 날숨 6초의 리듬으로 진행해보세요.",
    category: "마음챙김",
    difficulty: "쉬움",
    points: 5,
    estimatedMinutes: 3,
    tips: "심호흡은 부교감 신경계를 활성화시켜 스트레스 호르몬을 감소시키는 효과가 있습니다.",
  },
  {
    id: "mission-14",
    title: "업무 환경 정리하기",
    description: "5분 동안 업무 공간을 정리해보세요. 책상 위 물건을 정돈하고 필요 없는 것은 치워보세요.",
    category: "성장",
    difficulty: "쉬움",
    points: 10,
    estimatedMinutes: 5,
    tips: "정돈된 환경은 집중력을 높이고 스트레스를 줄여줍니다.",
  },
  {
    id: "mission-15",
    title: "부정적 생각 바꾸기",
    description: "최근 들었던 부정적인 생각을 적고, 그것을 긍정적이거나 균형 잡힌 관점으로 바꿔 적어보세요.",
    category: "마음챙김",
    difficulty: "도전",
    points: 25,
    estimatedMinutes: 15,
    tips: "예: '나는 항상 실패해' → '때로는 실패할 수 있지만, 이전에 성공한 경험도 많이 있다'",
  },
  {
    id: "mission-16",
    title: "SNS 사용 시간 체크하기",
    description: "오늘 SNS에 사용한 시간을 확인하고, 내일은 그보다 30분 줄이는 목표를 세워보세요.",
    category: "휴식",
    difficulty: "보통",
    points: 15,
    estimatedMinutes: 5,
  },
  {
    id: "mission-17",
    title: "좋아하는 음악 듣기",
    description: "10분 동안 좋아하는 음악을 듣고 온전히 음악에 집중해보세요. 다른 일은 하지 말고 음악만 들어보세요.",
    category: "휴식",
    difficulty: "쉬움",
    points: 10,
    estimatedMinutes: 10,
    tips: "기분을 좋게 만드는 음악은 스트레스 호르몬인 코르티솔 수치를 낮춰줍니다.",
  },
  {
    id: "mission-18",
    title: "칭찬 일기 쓰기",
    description: "자신에게 칭찬의 편지를 써보세요. 오늘 잘한 일, 자신의 강점, 성장한 부분 등을 적어보세요.",
    category: "감정표현",
    difficulty: "도전",
    points: 20,
    estimatedMinutes: 15,
    tips: "타인에게는 관대하면서 자신에게는 가혹한 경우가 많습니다. 자신에게도 친절해지는 연습을 해보세요.",
  },
  {
    id: "mission-19",
    title: "5분 명상 앱 사용하기",
    description: "명상 앱(예: 마보, 헤드스페이스, 캄 등)을 사용하여 5분 가이드 명상을 따라해보세요.",
    category: "마음챙김",
    difficulty: "쉬움",
    points: 10,
    estimatedMinutes: 5,
  },
  {
    id: "mission-20",
    title: "업무 우선순위 정하기",
    description: "오늘/내일 해야 할 일의 목록을 작성하고 중요도와 긴급성에 따라 우선순위를 매겨보세요.",
    category: "목표설정",
    difficulty: "보통",
    points: 15,
    estimatedMinutes: 10,
    tips: "아이젠하워 매트릭스(중요도/긴급성 매트릭스)를 활용해보세요.",
  },
]

// 오늘의 미션 추천
export function getRecommendedMissions(count = 3): Mission[] {
  // 실제 구현에서는 사용자 프로필, 이전 완료 미션, 선호도 등을 고려하여 추천
  // 지금은 간단히 랜덤으로 선택
  const shuffled = [...missions].sort(() => 0.5 - Math.random())
  return shuffled.slice(0, count)
}

// ID로 미션 찾기
export function getMissionById(id: string): Mission | undefined {
  return missions.find((mission) => mission.id === id)
}

// 카테고리별 미션 필터링
export function getMissionsByCategory(category: MissionCategory): Mission[] {
  return missions.filter((mission) => mission.category === category)
}

// 난이도별 미션 필터링
export function getMissionsByDifficulty(difficulty: MissionDifficulty): Mission[] {
  return missions.filter((mission) => mission.difficulty === difficulty)
}
