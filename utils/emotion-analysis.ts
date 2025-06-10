import type { EmotionRecord, EmotionCategory } from "@/types/emotion"
import { getEmotionRecords } from "@/utils/emotion-storage"

// 긍정적 감정 카테고리
export const positiveEmotions: EmotionCategory[] = ["기쁨", "만족", "평온", "희망", "감사"]

// 부정적 감정 카테고리
export const negativeEmotions: EmotionCategory[] = [
  "불안",
  "분노",
  "슬픔",
  "무력감",
  "스트레스",
  "소진",
  "위화감",
  "불만",
  "혼란",
]

// 날짜 범위 타입
export type DateRange = "week" | "month" | "3months" | "6months" | "year" | "all"

// 감정 분석 데이터 타입
export type EmotionAnalysisData = {
  // 시간에 따른 감정 강도 변화
  emotionTrends: {
    labels: string[] // 날짜 라벨
    datasets: {
      label: EmotionCategory
      data: number[] // 평균 강도
      count: number[] // 해당 날짜의 감정 기록 수
    }[]
  }

  // 감정 카테고리 분포
  emotionDistribution: {
    labels: EmotionCategory[]
    data: number[] // 각 감정 카테고리의 빈도
    colors: string[] // 각 감정 카테고리의 색상
  }

  // 에너지 레벨 변화
  energyLevelTrend: {
    labels: string[] // 날짜 라벨
    data: number[] // 평균 에너지 레벨
  }

  // 요일별 감정 패턴
  weekdayPattern: {
    labels: string[] // 요일 라벨 (월~일)
    datasets: {
      label: "긍정" | "부정" | "에너지"
      data: number[] // 각 요일별 평균값
    }[]
  }

  // 시간대별 감정 패턴
  timeOfDayPattern: {
    labels: string[] // 시간대 라벨 (아침, 오후, 저녁, 밤)
    datasets: {
      label: "긍정" | "부정" | "에너지"
      data: number[] // 각 시간대별 평균값
    }[]
  }

  // 감정 복잡도 (여러 감정이 동시에 나타나는 정도)
  emotionComplexity: {
    labels: string[] // 날짜 라벨
    data: number[] // 평균 감정 복잡도 (기록된 감정 카테고리 수)
  }

  // 상위 감정 조합
  topEmotionCombinations: {
    combination: string // 감정 조합 (예: "불안 + 스트레스")
    count: number // 발생 빈도
    percentage: number // 전체 중 비율
  }[]

  // 감정 변동성 (감정 변화의 정도)
  emotionVolatility: {
    labels: string[] // 날짜 라벨
    data: number[] // 감정 변동성 점수
  }

  // 요약 통계
  summary: {
    totalRecords: number
    averageEnergy: number
    dominantEmotion: EmotionCategory
    mostFrequentSituation: string
    volatilityScore: number
    positiveRatio: number // 긍정적 감정 비율
  }
}

// 긍정적 감정 카테고리
// const positiveEmotions: EmotionCategory[] = ["기쁨", "만족", "평온", "희망", "감사"]

// 부정적 감정 카테고리
// const negativeEmotions: EmotionCategory[] = [
//   "불안",
//   "분노",
//   "슬픔",
//   "무력감",
//   "스트레스",
//   "소진",
//   "위화감",
//   "불만",
//   "혼란",
// ]

// 감정 카테고리별 색상
const emotionCategoryColors: Record<EmotionCategory, string> = {
  불안: "#3b82f6", // blue-500
  분노: "#ef4444", // red-500
  슬픔: "#6366f1", // indigo-500
  무력감: "#f59e0b", // amber-500
  스트레스: "#f97316", // orange-500
  소진: "#64748b", // slate-500
  위화감: "#a855f7", // purple-500
  불만: "#f43f5e", // rose-500
  혼란: "#8b5cf6", // violet-500
  기쁨: "#10b981", // emerald-500
  만족: "#22c55e", // green-500
  평온: "#06b6d4", // cyan-500
  희망: "#0ea5e9", // sky-500
  감사: "#14b8a6", // teal-500
}

// 날짜 범위에 따른 시작 날짜 계산
function getStartDateByRange(range: DateRange): Date {
  const now = new Date()
  const startDate = new Date(now)

  switch (range) {
    case "week":
      startDate.setDate(now.getDate() - 7)
      break
    case "month":
      startDate.setMonth(now.getMonth() - 1)
      break
    case "3months":
      startDate.setMonth(now.getMonth() - 3)
      break
    case "6months":
      startDate.setMonth(now.getMonth() - 6)
      break
    case "year":
      startDate.setFullYear(now.getFullYear() - 1)
      break
    case "all":
      // 모든 데이터 (시작 날짜를 매우 과거로 설정)
      startDate.setFullYear(2000)
      break
  }

  return startDate
}

// 날짜를 YYYY-MM-DD 형식으로 변환
function formatDateToYYYYMMDD(date: Date): string {
  return date.toISOString().split("T")[0]
}

// 날짜를 MM-DD 형식으로 변환 (연도 제외)
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

// 시간대 이름 가져오기
function getTimeOfDayName(hours: number): string {
  if (hours >= 5 && hours < 12) return "아침"
  if (hours >= 12 && hours < 17) return "오후"
  if (hours >= 17 && hours < 21) return "저녁"
  return "밤"
}

// 날짜 범위에 따른 라벨 생성
function generateDateLabels(startDate: Date, endDate: Date, range: DateRange): string[] {
  const labels: string[] = []
  const currentDate = new Date(startDate)

  // 범위에 따라 날짜 간격 조정
  let dateIncrement = 1 // 기본값: 1일
  let formatFn = formatDateToMMDD

  if (range === "3months" || range === "6months") {
    dateIncrement = 7 // 1주일 간격
  } else if (range === "year") {
    dateIncrement = 15 // 15일 간격
  } else if (range === "all" && endDate.getTime() - startDate.getTime() > 365 * 24 * 60 * 60 * 1000) {
    dateIncrement = 30 // 1개월 간격
    formatFn = (date: Date) => `${date.getFullYear()}-${date.getMonth() + 1}`
  }

  while (currentDate <= endDate) {
    labels.push(formatFn(currentDate))
    currentDate.setDate(currentDate.getDate() + dateIncrement)
  }

  return labels
}

// 감정 기록을 날짜별로 그룹화
function groupRecordsByDate(records: EmotionRecord[]): Record<string, EmotionRecord[]> {
  const groupedRecords: Record<string, EmotionRecord[]> = {}

  records.forEach((record) => {
    const date = formatDateToYYYYMMDD(new Date(record.timestamp))
    if (!groupedRecords[date]) {
      groupedRecords[date] = []
    }
    groupedRecords[date].push(record)
  })

  return groupedRecords
}

// 감정 기록을 요일별로 그룹화
function groupRecordsByDayOfWeek(records: EmotionRecord[]): Record<number, EmotionRecord[]> {
  const groupedRecords: Record<number, EmotionRecord[]> = {
    0: [],
    1: [],
    2: [],
    3: [],
    4: [],
    5: [],
    6: [],
  }

  records.forEach((record) => {
    const dayOfWeek = new Date(record.timestamp).getDay()
    groupedRecords[dayOfWeek].push(record)
  })

  return groupedRecords
}

// 감정 기록을 시간대별로 그룹화
function groupRecordsByTimeOfDay(records: EmotionRecord[]): Record<string, EmotionRecord[]> {
  const groupedRecords: Record<string, EmotionRecord[]> = {
    아침: [],
    오후: [],
    저녁: [],
    밤: [],
  }

  records.forEach((record) => {
    const hours = new Date(record.timestamp).getHours()
    const timeOfDay = getTimeOfDayName(hours)
    groupedRecords[timeOfDay].push(record)
  })

  return groupedRecords
}

// 감정 카테고리 빈도 계산
function calculateEmotionFrequency(records: EmotionRecord[]): Record<EmotionCategory, number> {
  const frequency: Record<EmotionCategory, number> = {} as Record<EmotionCategory, number>

  // 모든 감정 카테고리 초기화
  const allEmotions: EmotionCategory[] = [...positiveEmotions, ...negativeEmotions]
  allEmotions.forEach((emotion) => {
    frequency[emotion] = 0
  })

  // 감정 빈도 계산
  records.forEach((record) => {
    record.emotions.forEach((emotion) => {
      frequency[emotion.category] = (frequency[emotion.category] || 0) + 1
    })
  })

  return frequency
}

// 감정 조합 빈도 계산
function calculateEmotionCombinations(records: EmotionRecord[]): Record<string, number> {
  const combinations: Record<string, number> = {}

  records.forEach((record) => {
    if (record.emotions.length >= 2) {
      // 감정 카테고리만 추출하여 정렬
      const categories = record.emotions.map((e) => e.category).sort()

      // 가능한 모든 2개 조합 생성
      for (let i = 0; i < categories.length - 1; i++) {
        for (let j = i + 1; j < categories.length; j++) {
          const combination = `${categories[i]} + ${categories[j]}`
          combinations[combination] = (combinations[combination] || 0) + 1
        }
      }
    }
  })

  return combinations
}

// 감정 변동성 계산 (연속된 기록 간의 감정 변화 정도)
function calculateEmotionVolatility(groupedRecords: Record<string, EmotionRecord[]>): Record<string, number> {
  const volatility: Record<string, number> = {}
  const dates = Object.keys(groupedRecords).sort()

  dates.forEach((date) => {
    const records = groupedRecords[date]
    if (records.length <= 1) {
      volatility[date] = 0
      return
    }

    // 같은 날의 연속된 기록 간 감정 변화 계산
    let totalChange = 0
    for (let i = 1; i < records.length; i++) {
      const prevEmotions = new Set(records[i - 1].emotions.map((e) => e.category))
      const currEmotions = new Set(records[i].emotions.map((e) => e.category))

      // 추가된 감정과 제거된 감정 수 계산
      let changes = 0
      currEmotions.forEach((emotion) => {
        if (!prevEmotions.has(emotion)) changes++
      })
      prevEmotions.forEach((emotion) => {
        if (!currEmotions.has(emotion)) changes++
      })

      totalChange += changes
    }

    // 평균 변화량 계산
    volatility[date] = totalChange / (records.length - 1)
  })

  return volatility
}

// 감정 분석 데이터 생성
export function generateEmotionAnalysisData(range: DateRange = "month"): EmotionAnalysisData {
  // 감정 기록 가져오기
  const allRecords = getEmotionRecords()

  // 날짜 범위에 따른 시작 날짜 계산
  const startDate = getStartDateByRange(range)
  const endDate = new Date()

  // 날짜 범위 내의 기록만 필터링
  const filteredRecords = allRecords.filter(
    (record) => new Date(record.timestamp) >= startDate && new Date(record.timestamp) <= endDate,
  )

  // 기록이 없는 경우 기본 데이터 반환
  if (filteredRecords.length === 0) {
    return getEmptyAnalysisData()
  }

  // 날짜별로 기록 그룹화
  const groupedByDate = groupRecordsByDate(filteredRecords)

  // 요일별로 기록 그룹화
  const groupedByDayOfWeek = groupRecordsByDayOfWeek(filteredRecords)

  // 시간대별로 기록 그룹화
  const groupedByTimeOfDay = groupRecordsByTimeOfDay(filteredRecords)

  // 날짜 라벨 생성
  const dateLabels = generateDateLabels(startDate, endDate, range)

  // 감정 카테고리 빈도 계산
  const emotionFrequency = calculateEmotionFrequency(filteredRecords)

  // 감정 조합 빈도 계산
  const emotionCombinations = calculateEmotionCombinations(filteredRecords)

  // 감정 변동성 계산
  const emotionVolatility = calculateEmotionVolatility(groupedByDate)

  // 시간에 따른 감정 강도 변화 데이터 생성
  const emotionTrends = {
    labels: dateLabels,
    datasets: [] as {
      label: EmotionCategory
      data: number[]
      count: number[]
    }[],
  }

  // 주요 감정 카테고리 (빈도 기준 상위 5개)
  const topEmotions = Object.entries(emotionFrequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([category]) => category as EmotionCategory)

  // 각 주요 감정 카테고리에 대한 데이터셋 생성
  topEmotions.forEach((category) => {
    const data: number[] = []
    const count: number[] = []

    dateLabels.forEach((label) => {
      // 해당 날짜의 기록 찾기
      const matchingDates = Object.keys(groupedByDate).filter(
        (date) => formatDateToMMDD(new Date(date)) === label || date === label,
      )

      let totalIntensity = 0
      let totalCount = 0
      let emotionCount = 0

      matchingDates.forEach((date) => {
        const records = groupedByDate[date]
        records.forEach((record) => {
          const matchingEmotion = record.emotions.find((e) => e.category === category)
          if (matchingEmotion) {
            totalIntensity += matchingEmotion.intensity
            emotionCount++
          }
          totalCount++
        })
      })

      // 평균 강도 계산 (해당 감정이 없으면 null)
      data.push(emotionCount > 0 ? totalIntensity / emotionCount : 0)
      count.push(totalCount)
    })

    emotionTrends.datasets.push({
      label: category,
      data,
      count,
    })
  })

  // 에너지 레벨 변화 데이터 생성
  const energyLevelTrend = {
    labels: dateLabels,
    data: dateLabels.map((label) => {
      // 해당 날짜의 기록 찾기
      const matchingDates = Object.keys(groupedByDate).filter(
        (date) => formatDateToMMDD(new Date(date)) === label || date === label,
      )

      let totalEnergy = 0
      let count = 0

      matchingDates.forEach((date) => {
        const records = groupedByDate[date]
        records.forEach((record) => {
          totalEnergy += record.energyLevel
          count++
        })
      })

      // 평균 에너지 레벨 계산
      return count > 0 ? totalEnergy / count : 0
    }),
  }

  // 요일별 감정 패턴 데이터 생성
  const weekdayLabels = ["월", "화", "수", "목", "금", "토", "일"]
  const weekdayPattern = {
    labels: weekdayLabels,
    datasets: [
      {
        label: "긍정" as const,
        data: weekdayLabels.map((_, index) => {
          const dayIndex = (index + 1) % 7 // 월요일(1)부터 시작하도록 변환
          const records = groupedByDayOfWeek[dayIndex]

          if (records.length === 0) return 0

          // 긍정적 감정 비율 계산
          let positiveCount = 0
          let totalEmotions = 0

          records.forEach((record) => {
            record.emotions.forEach((emotion) => {
              totalEmotions++
              if (positiveEmotions.includes(emotion.category)) {
                positiveCount++
              }
            })
          })

          return totalEmotions > 0 ? (positiveCount / totalEmotions) * 100 : 0
        }),
      },
      {
        label: "부정" as const,
        data: weekdayLabels.map((_, index) => {
          const dayIndex = (index + 1) % 7
          const records = groupedByDayOfWeek[dayIndex]

          if (records.length === 0) return 0

          // 부정적 감정 비율 계산
          let negativeCount = 0
          let totalEmotions = 0

          records.forEach((record) => {
            record.emotions.forEach((emotion) => {
              totalEmotions++
              if (negativeEmotions.includes(emotion.category)) {
                negativeCount++
              }
            })
          })

          return totalEmotions > 0 ? (negativeCount / totalEmotions) * 100 : 0
        }),
      },
      {
        label: "에너지" as const,
        data: weekdayLabels.map((_, index) => {
          const dayIndex = (index + 1) % 7
          const records = groupedByDayOfWeek[dayIndex]

          if (records.length === 0) return 0

          // 평균 에너지 레벨 계산
          const totalEnergy = records.reduce((sum, record) => sum + record.energyLevel, 0)
          return records.length > 0 ? totalEnergy / records.length : 0
        }),
      },
    ],
  }

  // 시간대별 감정 패턴 데이터 생성
  const timeOfDayLabels = ["아침", "오후", "저녁", "밤"]
  const timeOfDayPattern = {
    labels: timeOfDayLabels,
    datasets: [
      {
        label: "긍정" as const,
        data: timeOfDayLabels.map((timeOfDay) => {
          const records = groupedByTimeOfDay[timeOfDay]

          if (records.length === 0) return 0

          // 긍정적 감정 비율 계산
          let positiveCount = 0
          let totalEmotions = 0

          records.forEach((record) => {
            record.emotions.forEach((emotion) => {
              totalEmotions++
              if (positiveEmotions.includes(emotion.category)) {
                positiveCount++
              }
            })
          })

          return totalEmotions > 0 ? (positiveCount / totalEmotions) * 100 : 0
        }),
      },
      {
        label: "부정" as const,
        data: timeOfDayLabels.map((timeOfDay) => {
          const records = groupedByTimeOfDay[timeOfDay]

          if (records.length === 0) return 0

          // 부정적 감정 비율 계산
          let negativeCount = 0
          let totalEmotions = 0

          records.forEach((record) => {
            record.emotions.forEach((emotion) => {
              totalEmotions++
              if (negativeEmotions.includes(emotion.category)) {
                negativeCount++
              }
            })
          })

          return totalEmotions > 0 ? (negativeCount / totalEmotions) * 100 : 0
        }),
      },
      {
        label: "에너지" as const,
        data: timeOfDayLabels.map((timeOfDay) => {
          const records = groupedByTimeOfDay[timeOfDay]

          if (records.length === 0) return 0

          // 평균 에너지 레벨 계산
          const totalEnergy = records.reduce((sum, record) => sum + record.energyLevel, 0)
          return records.length > 0 ? totalEnergy / records.length : 0
        }),
      },
    ],
  }

  // 감정 복잡도 데이터 생성 (기록당 평균 감정 수)
  const emotionComplexity = {
    labels: dateLabels,
    data: dateLabels.map((label) => {
      // 해당 날짜의 기록 찾기
      const matchingDates = Object.keys(groupedByDate).filter(
        (date) => formatDateToMMDD(new Date(date)) === label || date === label,
      )

      let totalEmotionCount = 0
      let recordCount = 0

      matchingDates.forEach((date) => {
        const records = groupedByDate[date]
        records.forEach((record) => {
          totalEmotionCount += record.emotions.length
          recordCount++
        })
      })

      // 평균 감정 수 계산
      return recordCount > 0 ? totalEmotionCount / recordCount : 0
    }),
  }

  // 상위 감정 조합 데이터 생성
  const topEmotionCombinations = Object.entries(emotionCombinations)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([combination, count]) => ({
      combination,
      count,
      percentage: (count / filteredRecords.length) * 100,
    }))

  // 감정 변동성 데이터 생성
  const volatilityData = {
    labels: dateLabels,
    data: dateLabels.map((label) => {
      // 해당 날짜의 변동성 찾기
      const matchingDates = Object.keys(emotionVolatility).filter(
        (date) => formatDateToMMDD(new Date(date)) === label || date === label,
      )

      let totalVolatility = 0
      let count = 0

      matchingDates.forEach((date) => {
        totalVolatility += emotionVolatility[date]
        count++
      })

      // 평균 변동성 계산
      return count > 0 ? totalVolatility / count : 0
    }),
  }

  // 감정 분포 데이터 생성
  const emotionDistribution = {
    labels: Object.keys(emotionFrequency).filter(
      (category) => emotionFrequency[category as EmotionCategory] > 0,
    ) as EmotionCategory[],
    data: Object.values(emotionFrequency).filter((count) => count > 0),
    colors: Object.keys(emotionFrequency)
      .filter((category) => emotionFrequency[category as EmotionCategory] > 0)
      .map((category) => emotionCategoryColors[category as EmotionCategory]),
  }

  // 요약 통계 계산
  const totalRecords = filteredRecords.length
  const averageEnergy = filteredRecords.reduce((sum, record) => sum + record.energyLevel, 0) / totalRecords

  // 가장 많이 나타난 감정
  const dominantEmotion = Object.entries(emotionFrequency).sort((a, b) => b[1] - a[1])[0][0] as EmotionCategory

  // 가장 많이 나타난 상황
  const situationFrequency: Record<string, number> = {}
  filteredRecords.forEach((record) => {
    if (record.situation) {
      situationFrequency[record.situation] = (situationFrequency[record.situation] || 0) + 1
    }
  })

  const mostFrequentSituation =
    Object.entries(situationFrequency)
      .sort((a, b) => b[1] - a[1])
      .map(([situation]) => situation)[0] || "없음"

  // 평균 변동성 점수
  const volatilityScore =
    Object.values(emotionVolatility).reduce((sum, value) => sum + value, 0) /
    (Object.values(emotionVolatility).length || 1)

  // 긍정적 감정 비율
  let positiveCount = 0
  let totalEmotions = 0

  filteredRecords.forEach((record) => {
    record.emotions.forEach((emotion) => {
      totalEmotions++
      if (positiveEmotions.includes(emotion.category)) {
        positiveCount++
      }
    })
  })

  const positiveRatio = totalEmotions > 0 ? (positiveCount / totalEmotions) * 100 : 0

  // 최종 분석 데이터 반환
  return {
    emotionTrends,
    emotionDistribution,
    energyLevelTrend,
    weekdayPattern,
    timeOfDayPattern,
    emotionComplexity,
    topEmotionCombinations,
    emotionVolatility: volatilityData,
    summary: {
      totalRecords,
      averageEnergy,
      dominantEmotion,
      mostFrequentSituation,
      volatilityScore,
      positiveRatio,
    },
  }
}

// 빈 분석 데이터 생성 (데이터가 없을 때 사용)
function getEmptyAnalysisData(): EmotionAnalysisData {
  const emptyLabels = ["1", "2", "3", "4", "5", "6", "7"]
  const weekdayLabels = ["월", "화", "수", "목", "금", "토", "일"]
  const timeOfDayLabels = ["아침", "오후", "저녁", "밤"]

  return {
    emotionTrends: {
      labels: emptyLabels,
      datasets: [],
    },
    emotionDistribution: {
      labels: [],
      data: [],
      colors: [],
    },
    energyLevelTrend: {
      labels: emptyLabels,
      data: emptyLabels.map(() => 0),
    },
    weekdayPattern: {
      labels: weekdayLabels,
      datasets: [
        { label: "긍정", data: weekdayLabels.map(() => 0) },
        { label: "부정", data: weekdayLabels.map(() => 0) },
        { label: "에너지", data: weekdayLabels.map(() => 0) },
      ],
    },
    timeOfDayPattern: {
      labels: timeOfDayLabels,
      datasets: [
        { label: "긍정", data: timeOfDayLabels.map(() => 0) },
        { label: "부정", data: timeOfDayLabels.map(() => 0) },
        { label: "에너지", data: timeOfDayLabels.map(() => 0) },
      ],
    },
    emotionComplexity: {
      labels: emptyLabels,
      data: emptyLabels.map(() => 0),
    },
    topEmotionCombinations: [],
    emotionVolatility: {
      labels: emptyLabels,
      data: emptyLabels.map(() => 0),
    },
    summary: {
      totalRecords: 0,
      averageEnergy: 0,
      dominantEmotion: "없음" as EmotionCategory,
      mostFrequentSituation: "없음",
      volatilityScore: 0,
      positiveRatio: 0,
    },
  }
}
