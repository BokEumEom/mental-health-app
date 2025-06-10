// 직무별 대화 주제
export type JobRole = "개발" | "디자인" | "마케팅" | "영업" | "인사" | "기획" | "관리" | "기타"

// 감정 상태별 대화 주제
export type EmotionState = "불안" | "분노" | "슬픔" | "무력감" | "스트레스" | "소진" | "위화감" | "불만" | "혼란"

// 상황별 대화 주제
export type Situation = "책임전가" | "모호한지시" | "업무과부하" | "인간관계" | "평가" | "성장" | "이직" | "조직문화"

// 대화 주제 타입
export type ConversationTopic = {
  id: string
  text: string
  jobRoles: JobRole[]
  emotions: EmotionState[]
  situations: Situation[]
  priority: number // 우선순위 (높을수록 먼저 추천)
}

// 대화 주제 데이터베이스
export const conversationTopics: ConversationTopic[] = [
  {
    id: "topic-1",
    text: "모호한 업무 지시를 받았을 때 어떻게 명확히 할 수 있을까요?",
    jobRoles: ["개발", "디자인", "마케팅", "기획", "기타"],
    emotions: ["혼란", "불안", "스트레스"],
    situations: ["모호한지시", "업무과부하"],
    priority: 9,
  },
  {
    id: "topic-2",
    text: "팀장이 자꾸 책임을 떠넘길 때 어떻게 대응해야 할까요?",
    jobRoles: ["개발", "디자인", "마케팅", "영업", "인사", "기획", "관리", "기타"],
    emotions: ["분노", "불만", "위화감"],
    situations: ["책임전가", "인간관계"],
    priority: 9,
  },
  {
    id: "topic-3",
    text: "번아웃을 느끼는데 어떻게 회복할 수 있을까요?",
    jobRoles: ["개발", "디자인", "마케팅", "영업", "인사", "기획", "관리", "기타"],
    emotions: ["소진", "무력감", "슬픔"],
    situations: ["업무과부하", "성장"],
    priority: 8,
  },
  {
    id: "topic-4",
    text: "동료와의 갈등 상황을 어떻게 해결할 수 있을까요?",
    jobRoles: ["개발", "디자인", "마케팅", "영업", "인사", "기획", "관리", "기타"],
    emotions: ["분노", "불만", "위화감"],
    situations: ["인간관계", "조직문화"],
    priority: 7,
  },
  {
    id: "topic-5",
    text: "업무 성과가 인정받지 못할 때 어떻게 해야 할까요?",
    jobRoles: ["개발", "디자인", "마케팅", "영업", "기획"],
    emotions: ["슬픔", "분노", "무력감"],
    situations: ["평가", "인간관계"],
    priority: 7,
  },
  {
    id: "topic-6",
    text: "이직을 고민 중인데 어떤 점을 고려해야 할까요?",
    jobRoles: ["개발", "디자인", "마케팅", "영업", "인사", "기획", "관리", "기타"],
    emotions: ["불안", "혼란", "무력감"],
    situations: ["이직", "성장", "조직문화"],
    priority: 8,
  },
  {
    id: "topic-7",
    text: "업무 시간 관리를 더 효율적으로 할 수 있는 방법이 있을까요?",
    jobRoles: ["개발", "디자인", "마케팅", "영업", "인사", "기획", "관리", "기타"],
    emotions: ["스트레스", "불안", "소진"],
    situations: ["업무과부하", "성장"],
    priority: 6,
  },
  {
    id: "topic-8",
    text: "상사의 부당한 요구에 어떻게 대처해야 할까요?",
    jobRoles: ["개발", "디자인", "마케팅", "영업", "인사", "기획", "관리", "기타"],
    emotions: ["분노", "불만", "위화감"],
    situations: ["인간관계", "조직문화"],
    priority: 8,
  },
  {
    id: "topic-9",
    text: "회의에서 내 의견이 무시될 때 어떻게 해야 할까요?",
    jobRoles: ["개발", "디자인", "마케팅", "영업", "인사", "기획"],
    emotions: ["분노", "슬픔", "위화감"],
    situations: ["인간관계", "조직문화"],
    priority: 7,
  },
  {
    id: "topic-10",
    text: "업무 피드백을 건설적으로 받아들이는 방법이 있을까요?",
    jobRoles: ["개발", "디자인", "마케팅", "영업", "인사", "기획", "관리", "기타"],
    emotions: ["불안", "슬픔", "스트레스"],
    situations: ["평가", "성장"],
    priority: 6,
  },
  {
    id: "topic-11",
    text: "팀 내 소통 문제를 개선하는 방법이 있을까요?",
    jobRoles: ["개발", "디자인", "마케팅", "영업", "인사", "기획", "관리"],
    emotions: ["혼란", "위화감", "불만"],
    situations: ["인간관계", "조직문화"],
    priority: 6,
  },
  {
    id: "topic-12",
    text: "원격 근무 중 고립감을 줄이는 방법이 있을까요?",
    jobRoles: ["개발", "디자인", "마케팅", "기획"],
    emotions: ["슬픔", "소진", "무력감"],
    situations: ["인간관계", "조직문화"],
    priority: 5,
  },
  {
    id: "topic-13",
    text: "업무 스트레스를 줄이는 효과적인 방법이 있을까요?",
    jobRoles: ["개발", "디자인", "마케팅", "영업", "인사", "기획", "관리", "기타"],
    emotions: ["스트레스", "불안", "소진"],
    situations: ["업무과부하", "성장"],
    priority: 7,
  },
  {
    id: "topic-14",
    text: "직장 내 인정받는 방법에 대해 조언해주세요.",
    jobRoles: ["개발", "디자인", "마케팅", "영업", "인사", "기획", "관리", "기타"],
    emotions: ["불안", "무력감", "혼란"],
    situations: ["평가", "성장", "인간관계"],
    priority: 5,
  },
  {
    id: "topic-15",
    text: "워라밸을 유지하는 방법에 대해 조언해주세요.",
    jobRoles: ["개발", "디자인", "마케팅", "영업", "인사", "기획", "관리", "기타"],
    emotions: ["소진", "스트레스", "불만"],
    situations: ["업무과부하", "조직문화", "성장"],
    priority: 7,
  },
  {
    id: "topic-16",
    text: "직장 내 갑질에 대처하는 방법이 있을까요?",
    jobRoles: ["개발", "디자인", "마케팅", "영업", "인사", "기획", "관리", "기타"],
    emotions: ["분노", "불만", "위화감"],
    situations: ["인간관계", "조직문화"],
    priority: 8,
  },
  {
    id: "topic-17",
    text: "업무 능력을 향상시키는 효과적인 방법이 있을까요?",
    jobRoles: ["개발", "디자인", "마케팅", "영업", "인사", "기획", "관리", "기타"],
    emotions: ["불안", "혼란", "무력감"],
    situations: ["성장", "평가"],
    priority: 5,
  },
  {
    id: "topic-18",
    text: "직장 내 인간관계를 개선하는 방법이 있을까요?",
    jobRoles: ["개발", "디자인", "마케팅", "영업", "인사", "기획", "관리", "기타"],
    emotions: ["위화감", "불만", "슬픔"],
    situations: ["인간관계", "조직문화"],
    priority: 6,
  },
]
