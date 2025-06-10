import {
  conversationTopics,
  type JobRole,
  type EmotionState,
  type Situation,
  type ConversationTopic,
} from "@/data/conversation-topics"

// 사용자 프로필 타입
export type UserProfile = {
  jobRole?: JobRole
  recentEmotions?: EmotionState[]
  recentSituations?: Situation[]
}

// 키워드 매핑 (감정 키워드를 감지하기 위한 맵)
const emotionKeywords: Record<EmotionState, string[]> = {
  불안: ["불안", "걱정", "두려움", "긴장", "조마조마"],
  분노: ["화", "분노", "짜증", "열받", "화나", "빡치", "짜증"],
  슬픔: ["슬픔", "우울", "속상", "서운", "마음이 아프", "마음 아프"],
  무력감: ["무력감", "자신감", "자존감", "할 수 없", "못하겠"],
  스트레스: ["스트레스", "부담", "압박", "힘들", "버겁"],
  소진: ["소진", "지침", "피곤", "에너지", "번아웃", "지쳤"],
  위화감: ["위화감", "어색", "불편", "껄끄럽"],
  불만: ["불만", "불평", "싫", "짜증", "못마땅"],
  혼란: ["혼란", "헷갈", "모르겠", "이해가 안", "복잡"],
}

const situationKeywords: Record<Situation, string[]> = {
  책임전가: ["책임", "떠넘기", "전가", "핑계", "탓"],
  모호한지시: ["모호", "불분명", "애매", "불확실", "명확하지 않"],
  업무과부하: ["과부하", "업무량", "일이 많", "과중", "야근", "밀려"],
  인간관계: ["인간관계", "동료", "상사", "팀장", "팀원", "관계", "소통"],
  평가: ["평가", "성과", "인정", "피드백", "리뷰", "승진"],
  성장: ["성장", "발전", "배움", "역량", "스킬", "능력"],
  이직: ["이직", "퇴사", "퇴직", "이동", "옮기", "새 직장", "구직"],
  조직문화: ["조직문화", "회사 분위기", "문화", "관행", "분위기"],
}

// 메시지에서 감정과 상황 키워드 추출
export function extractKeywordsFromMessage(message: string): { emotions: EmotionState[]; situations: Situation[] } {
  const emotions: EmotionState[] = []
  const situations: Situation[] = []

  // 감정 키워드 추출
  Object.entries(emotionKeywords).forEach(([emotion, keywords]) => {
    if (keywords.some((keyword) => message.includes(keyword))) {
      emotions.push(emotion as EmotionState)
    }
  })

  // 상황 키워드 추출
  Object.entries(situationKeywords).forEach(([situation, keywords]) => {
    if (keywords.some((keyword) => message.includes(keyword))) {
      situations.push(situation as Situation)
    }
  })

  return { emotions, situations }
}

// 사용자 프로필과 메시지 기반으로 대화 주제 추천
export function recommendTopics(
  userProfile: UserProfile,
  recentMessages: string[] = [],
  count = 3,
): ConversationTopic[] {
  // 최근 메시지에서 키워드 추출
  const extractedKeywords = recentMessages.reduce(
    (acc, message) => {
      const { emotions, situations } = extractKeywordsFromMessage(message)
      return {
        emotions: [...acc.emotions, ...emotions],
        situations: [...acc.situations, ...situations],
      }
    },
    { emotions: [] as EmotionState[], situations: [] as Situation[] },
  )

  // 사용자 프로필과 추출된 키워드 결합
  const targetEmotions = [...(userProfile.recentEmotions || []), ...extractedKeywords.emotions]
  const targetSituations = [...(userProfile.recentSituations || []), ...extractedKeywords.situations]

  // 중복 제거
  const uniqueEmotions = Array.from(new Set(targetEmotions))
  const uniqueSituations = Array.from(new Set(targetSituations))

  // 주제 점수 계산 및 정렬
  const scoredTopics = conversationTopics.map((topic) => {
    let score = topic.priority // 기본 점수는 우선순위

    // 직무 관련성 점수
    if (userProfile.jobRole && topic.jobRoles.includes(userProfile.jobRole)) {
      score += 2
    }

    // 감정 관련성 점수
    uniqueEmotions.forEach((emotion) => {
      if (topic.emotions.includes(emotion)) {
        score += 3
      }
    })

    // 상황 관련성 점수
    uniqueSituations.forEach((situation) => {
      if (topic.situations.includes(situation)) {
        score += 4
      }
    })

    return { ...topic, score }
  })

  // 점수 기준 내림차순 정렬 후 상위 count개 반환
  return scoredTopics.sort((a, b) => b.score - a.score).slice(0, count)
}
