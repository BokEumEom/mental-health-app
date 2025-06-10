import type { EmotionRecord, EmotionCategory } from "@/types/emotion"
import { getEmotionRecords } from "@/utils/emotion-storage"
import { positiveEmotions, negativeEmotions } from "@/utils/emotion-analysis"

// 예측 기간 타입
export type PredictionPeriod = "week" | "month"

// 예측 신뢰도 레벨
export type ConfidenceLevel = "low" | "medium" | "high"

// 감정 예측 결과 타입
export type EmotionPrediction = {
  // 예측 날짜 (YYYY-MM-DD 형식)
  date: string

  // 예측된 주요 감정
  dominantEmotion: EmotionCategory

  // 예측된 감정 분포
  emotionDistribution: {
    category: EmotionCategory
    probability: number // 0-100
  }[]

  // 예측된 에너지 레벨
  energyLevel: number // 0-100

  // 예측 신뢰도
  confidence: ConfidenceLevel

  // 신뢰도 점수
  confidenceScore: number // 0-100

  // 예측 근거
  basis: string
}

// 요일별 감정 패턴 타입
type WeekdayPattern = {
  [key: number]: {
    // 0-6 (일-토)
    emotions: Record<EmotionCategory, number> // 감정별 빈도
    energyLevel: number[] // 에너지 레벨 배열
  }
}

// 날짜를 YYYY-MM-DD 형식으로 변환
function formatDateToYYYYMMDD(date: Date): string {
  return date.toISOString().split("T")[0]
}

// 날짜를 MM-DD 형식으로 변환
function formatDateToMMDD(date: Date): string {
  const month = date.getMonth() + 1
  const day = date.getDate()
  return `${month}/${day}`
}

// 요일 이름 가져오기
function getDayOfWeekName(date: Date): string {
  const days = ["일", "월", "화", "수", "목", "금", "토"]
  return days[date.getDay()]
}

// 신뢰도 레벨 계산
function calculateConfidenceLevel(score: number): ConfidenceLevel {
  if (score < 40) return "low"
  if (score < 70) return "medium"
  return "high"
}

// 요일별 감정 패턴 분석
function analyzeWeekdayPatterns(records: EmotionRecord[]): WeekdayPattern {
  const weekdayPatterns: WeekdayPattern = {
    0: { emotions: {} as Record<EmotionCategory, number>, energyLevel: [] },
    1: { emotions: {} as Record<EmotionCategory, number>, energyLevel: [] },
    2: { emotions: {} as Record<EmotionCategory, number>, energyLevel: [] },
    3: { emotions: {} as Record<EmotionCategory, number>, energyLevel: [] },
    4: { emotions: {} as Record<EmotionCategory, number>, energyLevel: [] },
    5: { emotions: {} as Record<EmotionCategory, number>, energyLevel: [] },
    6: { emotions: {} as Record<EmotionCategory, number>, energyLevel: [] },
  }

  // 모든 감정 카테고리 초기화
  const allEmotions: EmotionCategory[] = [...positiveEmotions, ...negativeEmotions]
  for (let i = 0; i < 7; i++) {
    allEmotions.forEach((emotion) => {
      weekdayPatterns[i].emotions[emotion] = 0
    })
  }

  // 요일별 감정 및 에너지 레벨 집계
  records.forEach((record) => {
    const date = new Date(record.timestamp)
    const dayOfWeek = date.getDay() // 0-6 (일-토)

    // 감정 빈도 집계
    record.emotions.forEach((emotion) => {
      weekdayPatterns[dayOfWeek].emotions[emotion.category] =
        (weekdayPatterns[dayOfWeek].emotions[emotion.category] || 0) + 1
    })

    // 에너지 레벨 추가
    weekdayPatterns[dayOfWeek].energyLevel.push(record.energyLevel)
  })

  return weekdayPatterns
}

// 상황별 감정 패턴 분석
function analyzeSituationPatterns(records: EmotionRecord[]): Record<
  string,
  {
    emotions: Record<EmotionCategory, number>
    count: number
  }
> {
  const situationPatterns: Record<
    string,
    {
      emotions: Record<EmotionCategory, number>
      count: number
    }
  > = {}

  // 상황별 감정 빈도 집계
  records.forEach((record) => {
    if (!record.situation) return

    // 상황 키워드 추출 (간단한 구현: 공백으로 분리)
    const keywords = record.situation.split(/\s+/).filter((k) => k.length >= 2)

    keywords.forEach((keyword) => {
      if (!situationPatterns[keyword]) {
        situationPatterns[keyword] = {
          emotions: {} as Record<EmotionCategory, number>,
          count: 0,
        }

        // 모든 감정 카테고리 초기화
        const allEmotions: EmotionCategory[] = [...positiveEmotions, ...negativeEmotions]
        allEmotions.forEach((emotion) => {
          situationPatterns[keyword].emotions[emotion] = 0
        })
      }

      // 감정 빈도 집계
      record.emotions.forEach((emotion) => {
        situationPatterns[keyword].emotions[emotion.category] =
          (situationPatterns[keyword].emotions[emotion.category] || 0) + 1
      })

      situationPatterns[keyword].count++
    })
  })

  return situationPatterns
}

// 최근 감정 추세 분석
function analyzeRecentTrends(
  records: EmotionRecord[],
  days = 7,
): {
  emotions: Record<EmotionCategory, number[]>
  energyLevel: number[]
} {
  const now = new Date()
  const startDate = new Date(now)
  startDate.setDate(now.getDate() - days)

  // 날짜별 데이터 초기화
  const dateLabels: string[] = []
  const dateData: Record<
    string,
    {
      emotions: Record<EmotionCategory, number>
      energyLevel: number[]
      count: number
    }
  > = {}

  // 날짜 라벨 생성
  for (let i = 0; i < days; i++) {
    const date = new Date(startDate)
    date.setDate(startDate.getDate() + i)
    const dateStr = formatDateToYYYYMMDD(date)
    dateLabels.push(dateStr)

    dateData[dateStr] = {
      emotions: {} as Record<EmotionCategory, number>,
      energyLevel: [],
      count: 0,
    }

    // 모든 감정 카테고리 초기화
    const allEmotions: EmotionCategory[] = [...positiveEmotions, ...negativeEmotions]
    allEmotions.forEach((emotion) => {
      dateData[dateStr].emotions[emotion] = 0
    })
  }

  // 최근 기록만 필터링
  const recentRecords = records.filter((record) => {
    const recordDate = new Date(record.timestamp)
    return recordDate >= startDate && recordDate <= now
  })

  // 날짜별 감정 및 에너지 레벨 집계
  recentRecords.forEach((record) => {
    const date = new Date(record.timestamp)
    const dateStr = formatDateToYYYYMMDD(date)

    if (dateData[dateStr]) {
      // 감정 빈도 집계
      record.emotions.forEach((emotion) => {
        dateData[dateStr].emotions[emotion.category] = (dateData[dateStr].emotions[emotion.category] || 0) + 1
      })

      // 에너지 레벨 추가
      dateData[dateStr].energyLevel.push(record.energyLevel)
      dateData[dateStr].count++
    }
  })

  // 결과 포맷팅
  const result: {
    emotions: Record<EmotionCategory, number[]>
    energyLevel: number[]
  } = {
    emotions: {} as Record<EmotionCategory, number[]>,
    energyLevel: [],
  }

  // 모든 감정 카테고리 초기화
  const allEmotions: EmotionCategory[] = [...positiveEmotions, ...negativeEmotions]
  allEmotions.forEach((emotion) => {
    result.emotions[emotion] = []
  })

  // 날짜별 데이터 집계
  dateLabels.forEach((dateStr) => {
    const data = dateData[dateStr]

    // 감정 빈도 추가
    allEmotions.forEach((emotion) => {
      result.emotions[emotion].push(data.count > 0 ? data.emotions[emotion] / data.count : 0)
    })

    // 평균 에너지 레벨 추가
    const avgEnergy =
      data.energyLevel.length > 0 ? data.energyLevel.reduce((sum, val) => sum + val, 0) / data.energyLevel.length : 0
    result.energyLevel.push(avgEnergy)
  })

  return result
}

// 감정 예측 생성
export function generateEmotionPredictions(period: PredictionPeriod = "week"): EmotionPrediction[] {
  // 모든 감정 기록 가져오기
  const allRecords = getEmotionRecords()

  // 기록이 없는 경우 빈 배열 반환
  if (allRecords.length === 0) {
    return []
  }

  // 요일별 패턴 분석
  const weekdayPatterns = analyzeWeekdayPatterns(allRecords)

  // 상황별 패턴 분석
  const situationPatterns = analyzeSituationPatterns(allRecords)

  // 최근 추세 분석
  const recentTrends = analyzeRecentTrends(allRecords)

  // 예측 기간 설정
  const predictionDays = period === "week" ? 7 : 30

  // 예측 결과 배열
  const predictions: EmotionPrediction[] = []

  // 현재 날짜
  const now = new Date()

  // 각 예측 날짜에 대해
  for (let i = 1; i <= predictionDays; i++) {
    const predictionDate = new Date(now)
    predictionDate.setDate(now.getDate() + i)
    const dateStr = formatDateToYYYYMMDD(predictionDate)
    const dayOfWeek = predictionDate.getDay() // 0-6 (일-토)

    // 요일 기반 감정 분포 예측
    const weekdayEmotions = weekdayPatterns[dayOfWeek].emotions
    const weekdayEnergyLevels = weekdayPatterns[dayOfWeek].energyLevel

    // 감정 분포 계산
    const emotionDistribution: {
      category: EmotionCategory
      probability: number
    }[] = []

    // 총 감정 빈도
    const totalEmotionFrequency = Object.values(weekdayEmotions).reduce((sum, val) => sum + val, 0)

    // 각 감정 카테고리의 확률 계산
    Object.entries(weekdayEmotions).forEach(([category, frequency]) => {
      // 최근 추세 반영 (가중치: 0.3)
      const recentTrendWeight = 0.3
      const recentTrendValue = recentTrends.emotions[category as EmotionCategory]
      const recentTrendFactor =
        recentTrendValue.length > 0 ? recentTrendValue.slice(-3).reduce((sum, val) => sum + val, 0) / 3 : 0

      // 기본 확률 (요일 패턴 기반, 가중치: 0.7)
      const baseProb = totalEmotionFrequency > 0 ? (frequency / totalEmotionFrequency) * 100 : 0

      // 최종 확률 계산
      const probability = baseProb * (1 - recentTrendWeight) + recentTrendFactor * recentTrendWeight * 100

      emotionDistribution.push({
        category: category as EmotionCategory,
        probability: Math.round(probability * 10) / 10,
      })
    })

    // 확률 내림차순 정렬
    emotionDistribution.sort((a, b) => b.probability - a.probability)

    // 주요 감정 결정
    const dominantEmotion = emotionDistribution[0]?.category || ("없음" as EmotionCategory)

    // 에너지 레벨 예측
    let predictedEnergyLevel = 50 // 기본값

    if (weekdayEnergyLevels.length > 0) {
      // 요일 기반 평균 에너지 레벨 (가중치: 0.6)
      const avgWeekdayEnergy = weekdayEnergyLevels.reduce((sum, val) => sum + val, 0) / weekdayEnergyLevels.length

      // 최근 추세 반영 (가중치: 0.4)
      const recentEnergyTrend = recentTrends.energyLevel
      const recentEnergyFactor =
        recentEnergyTrend.length > 0 ? recentEnergyTrend.slice(-3).reduce((sum, val) => sum + val, 0) / 3 : 50

      // 최종 에너지 레벨 계산
      predictedEnergyLevel = avgWeekdayEnergy * 0.6 + recentEnergyFactor * 0.4
    }

    // 신뢰도 계산
    let confidenceScore = 0

    // 1. 데이터 양에 따른 신뢰도 (40%)
    const dataAmountFactor = Math.min(allRecords.length / 20, 1) // 최대 20개 기록까지 고려
    confidenceScore += dataAmountFactor * 40

    // 2. 요일 패턴 일관성에 따른 신뢰도 (30%)
    const weekdayConsistencyFactor = weekdayEnergyLevels.length > 0 ? Math.min(weekdayEnergyLevels.length / 5, 1) : 0
    confidenceScore += weekdayConsistencyFactor * 30

    // 3. 최근 추세 안정성에 따른 신뢰도 (30%)
    const recentTrendStability = calculateTrendStability(recentTrends)
    confidenceScore += recentTrendStability * 30

    // 신뢰도 레벨 결정
    const confidence = calculateConfidenceLevel(confidenceScore)

    // 예측 근거 생성
    const basis = generatePredictionBasis(dayOfWeek, dominantEmotion, predictedEnergyLevel, confidence)

    // 예측 결과 추가
    predictions.push({
      date: dateStr,
      dominantEmotion,
      emotionDistribution: emotionDistribution.slice(0, 5), // 상위 5개만 포함
      energyLevel: Math.round(predictedEnergyLevel),
      confidence,
      confidenceScore: Math.round(confidenceScore),
      basis,
    })
  }

  return predictions
}

// 추세 안정성 계산 (0-1 사이 값)
function calculateTrendStability(trends: {
  emotions: Record<EmotionCategory, number[]>
  energyLevel: number[]
}): number {
  // 에너지 레벨 변동성 계산
  const energyVariability = calculateVariability(trends.energyLevel)

  // 감정 분포 변동성 계산
  let emotionVariabilitySum = 0
  let emotionCount = 0

  Object.values(trends.emotions).forEach((values) => {
    if (values.length > 0) {
      emotionVariabilitySum += calculateVariability(values)
      emotionCount++
    }
  })

  const avgEmotionVariability = emotionCount > 0 ? emotionVariabilitySum / emotionCount : 1

  // 전체 안정성 점수 계산 (변동성이 낮을수록 안정성이 높음)
  const stabilityScore = 1 - (energyVariability * 0.5 + avgEmotionVariability * 0.5)

  return Math.max(0, Math.min(1, stabilityScore))
}

// 변동성 계산 (0-1 사이 값)
function calculateVariability(values: number[]): number {
  if (values.length <= 1) return 0

  // 연속된 값 간의 차이 계산
  let totalChange = 0
  for (let i = 1; i < values.length; i++) {
    const change = Math.abs(values[i] - values[i - 1])
    totalChange += change
  }

  // 평균 변화량 계산
  const avgChange = totalChange / (values.length - 1)

  // 변동성 점수 계산 (0-1 사이로 정규화)
  // 여기서는 간단히 평균 변화량을 100으로 나누어 정규화 (에너지 레벨 기준)
  return Math.min(avgChange / 100, 1)
}

// 예측 근거 생성
function generatePredictionBasis(
  dayOfWeek: number,
  dominantEmotion: EmotionCategory,
  energyLevel: number,
  confidence: ConfidenceLevel,
): string {
  const dayNames = ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"]
  const dayName = dayNames[dayOfWeek]

  let basis = `${dayName}에는 주로 '${dominantEmotion}' 감정이 우세하게 나타납니다.`

  // 에너지 레벨에 따른 설명 추가
  if (energyLevel < 40) {
    basis += ` 이 날의 에너지 레벨은 낮은 편(${Math.round(energyLevel)}%)으로 예상됩니다.`
  } else if (energyLevel < 70) {
    basis += ` 이 날의 에너지 레벨은 보통(${Math.round(energyLevel)}%)으로 예상됩니다.`
  } else {
    basis += ` 이 날의 에너지 레벨은 높은 편(${Math.round(energyLevel)}%)으로 예상됩니다.`
  }

  // 신뢰도에 따른 설명 추가
  if (confidence === "low") {
    basis += " 다만, 이 예측은 충분한 데이터가 없어 신뢰도가 낮습니다."
  } else if (confidence === "medium") {
    basis += " 이 예측은 과거 패턴을 기반으로 한 중간 수준의 신뢰도를 가집니다."
  } else {
    basis += " 이 예측은 일관된 과거 패턴을 기반으로 한 높은 신뢰도를 가집니다."
  }

  return basis
}

// 특정 날짜의 예측 가져오기
export function getPredictionForDate(date: Date, predictions: EmotionPrediction[]): EmotionPrediction | null {
  const dateStr = formatDateToYYYYMMDD(date)
  return predictions.find((p) => p.date === dateStr) || null
}

// 예측 기반 대응 전략 생성
export function generateCopingStrategies(prediction: EmotionPrediction): {
  title: string
  description: string
  actionItems: string[]
}[] {
  const strategies: {
    title: string
    description: string
    actionItems: string[]
  }[] = []

  // 주요 감정에 따른 전략
  if (negativeEmotions.includes(prediction.dominantEmotion)) {
    // 부정적 감정에 대한 전략
    switch (prediction.dominantEmotion) {
      case "불안":
        strategies.push({
          title: "불안 관리 전략",
          description: "예상되는 불안감에 대비하여 마음의 안정을 찾는 방법입니다.",
          actionItems: [
            "5분 호흡 명상으로 하루 시작하기",
            "걱정되는 일을 메모하고 해결 가능한 것과 그렇지 않은 것 구분하기",
            "가벼운 스트레칭이나 요가로 신체 긴장 풀기",
            "불안을 유발할 수 있는 카페인 섭취 줄이기",
          ],
        })
        break

      case "분노":
        strategies.push({
          title: "분노 조절 전략",
          description: "예상되는 분노 감정에 대비하여 감정을 건강하게 표현하는 방법입니다.",
          actionItems: [
            "감정이 고조되면 잠시 자리를 떠나 심호흡하기",
            "분노의 원인을 일기에 적어보기",
            "격한 운동으로 에너지 발산하기",
            "'나' 메시지를 사용해 감정 표현하기 (예: '나는 ~할 때 화가 난다')",
          ],
        })
        break

      case "슬픔":
        strategies.push({
          title: "슬픔 대처 전략",
          description: "예상되는 슬픔에 대비하여 감정을 인정하고 돌보는 방법입니다.",
          actionItems: [
            "슬픈 감정을 억누르지 않고 충분히 느끼기",
            "신뢰할 수 있는 사람에게 감정 표현하기",
            "자기 연민의 편지 쓰기",
            "좋아하는 음악 듣거나 영화 보기",
          ],
        })
        break

      case "무력감":
        strategies.push({
          title: "무력감 극복 전략",
          description: "예상되는 무력감에 대비하여 작은 성취감을 쌓는 방법입니다.",
          actionItems: [
            "아주 작은 목표 하나 설정하고 달성하기",
            "과거의 성공 경험 떠올리고 기록하기",
            "도움을 요청하는 연습하기",
            "자신의 강점 목록 만들기",
          ],
        })
        break

      case "스트레스":
        strategies.push({
          title: "스트레스 관리 전략",
          description: "예상되는 스트레스에 대비하여 압박감을 줄이는 방법입니다.",
          actionItems: [
            "업무 우선순위 명확히 정하기",
            "짧은 휴식 시간 계획적으로 가지기",
            "스트레스 해소에 도움되는 취미 활동하기",
            "과도한 업무량은 동료나 상사와 상의하기",
          ],
        })
        break

      case "소진":
        strategies.push({
          title: "소진 예방 전략",
          description: "예상되는 소진에 대비하여 에너지를 보존하는 방법입니다.",
          actionItems: [
            "충분한 수면 시간 확보하기",
            "업무 외 시간에 완전히 일과 분리하기",
            "에너지를 소모하는 활동과 회복하는 활동 균형 맞추기",
            "'아니오'라고 말하는 연습하기",
          ],
        })
        break

      default:
        strategies.push({
          title: "부정적 감정 관리 전략",
          description: "예상되는 부정적 감정에 대비하여 마음을 돌보는 방법입니다.",
          actionItems: [
            "감정 일기 쓰기",
            "마음챙김 명상 실천하기",
            "가벼운 운동으로 기분 전환하기",
            "충분한 휴식 취하기",
          ],
        })
    }
  } else if (positiveEmotions.includes(prediction.dominantEmotion)) {
    // 긍정적 감정에 대한 전략
    strategies.push({
      title: "긍정적 감정 유지 전략",
      description: "예상되는 긍정적 감정을 더욱 강화하고 유지하는 방법입니다.",
      actionItems: [
        "감사한 일 3가지 기록하기",
        "긍정적인 경험을 주변인과 나누기",
        "창의적인 활동에 시간 투자하기",
        "긍정적 감정을 활용해 도전적인 일에 도전하기",
      ],
    })
  }

  // 에너지 레벨에 따른 전략
  if (prediction.energyLevel < 40) {
    strategies.push({
      title: "낮은 에너지 관리 전략",
      description: "예상되는 낮은 에너지 수준에 대비하여 효율적으로 에너지를 사용하는 방법입니다.",
      actionItems: [
        "중요한 업무는 에너지가 상대적으로 높은 시간대에 배치하기",
        "작은 단위로 업무 나누어 진행하기",
        "가벼운 스트레칭으로 혈액순환 촉진하기",
        "충분한 수분 섭취와 영양가 있는 간식 준비하기",
      ],
    })
  } else if (prediction.energyLevel > 70) {
    strategies.push({
      title: "높은 에너지 활용 전략",
      description: "예상되는 높은 에너지를 효과적으로 활용하는 방법입니다.",
      actionItems: [
        "도전적인 업무나 프로젝트 진행하기",
        "창의적인 문제 해결이 필요한 일에 집중하기",
        "팀 활동이나 협업에 적극 참여하기",
        "새로운 아이디어 구상하고 기록하기",
      ],
    })
  } else {
    strategies.push({
      title: "에너지 균형 유지 전략",
      description: "예상되는 보통 수준의 에너지를 균형있게 유지하는 방법입니다.",
      actionItems: [
        "업무와 휴식의 균형 맞추기",
        "정기적인 짧은 휴식 시간 가지기",
        "우선순위에 따라 업무 배분하기",
        "적절한 신체 활동으로 에너지 수준 유지하기",
      ],
    })
  }

  return strategies
}

// 예측 정확도 평가 (실제 기록과 비교)
export function evaluatePredictionAccuracy(
  prediction: EmotionPrediction,
  actualRecord: EmotionRecord,
): {
  emotionAccuracy: number // 0-100
  energyAccuracy: number // 0-100
  overallAccuracy: number // 0-100
} {
  // 감정 정확도 계산
  let emotionAccuracy = 0

  // 예측된 주요 감정이 실제 감정에 포함되어 있는지 확인
  const actualEmotions = actualRecord.emotions.map((e) => e.category)
  if (actualEmotions.includes(prediction.dominantEmotion)) {
    // 주요 감정이 일치하면 기본 점수 70점
    emotionAccuracy = 70

    // 예측된 감정 분포와 실제 감정 비교
    const predictedEmotions = prediction.emotionDistribution.map((e) => e.category)
    const matchCount = actualEmotions.filter((e) => predictedEmotions.includes(e)).length

    // 추가 점수 계산 (최대 30점)
    const additionalScore = Math.min(30, (matchCount / actualEmotions.length) * 30)
    emotionAccuracy += additionalScore
  } else {
    // 주요 감정이 일치하지 않으면, 예측된 감정 분포와 실제 감정 비교
    const predictedEmotions = prediction.emotionDistribution.map((e) => e.category)
    const matchCount = actualEmotions.filter((e) => predictedEmotions.includes(e)).length

    // 점수 계산 (최대 50점)
    emotionAccuracy = Math.min(50, (matchCount / actualEmotions.length) * 100)
  }

  // 에너지 레벨 정확도 계산
  const energyDifference = Math.abs(prediction.energyLevel - actualRecord.energyLevel)
  const energyAccuracy = Math.max(0, 100 - energyDifference * 2) // 차이 1%당 2점 감소

  // 전체 정확도 계산 (감정 70%, 에너지 30% 가중치)
  const overallAccuracy = emotionAccuracy * 0.7 + energyAccuracy * 0.3

  return {
    emotionAccuracy: Math.round(emotionAccuracy),
    energyAccuracy: Math.round(energyAccuracy),
    overallAccuracy: Math.round(overallAccuracy),
  }
}
