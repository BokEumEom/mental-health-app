"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, ArrowRight } from "lucide-react"
import { getEmotionRecords } from "@/utils/emotion-storage"
import { type EmotionCategory, emotionColors } from "@/types/emotion"
import { useRouter } from "next/navigation"

export function EmotionCalendarSummary() {
  const [currentDate] = useState(new Date())
  const [weekDays, setWeekDays] = useState<Date[]>([])
  const [emotionsByDay, setEmotionsByDay] = useState<Record<string, EmotionCategory | null>>({})
  const router = useRouter()

  // 주간 날짜 계산 및 감정 기록 로드
  useEffect(() => {
    // 이번 주 날짜 계산 (오늘 포함 7일)
    const days = []
    const today = new Date()

    for (let i = 0; i < 7; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() - 3 + i) // 3일 전부터 3일 후까지
      days.push(date)
    }

    setWeekDays(days)

    // 감정 기록 로드
    const records = getEmotionRecords()
    const emotions: Record<string, EmotionCategory | null> = {}

    days.forEach((day) => {
      const dateKey = `${day.getFullYear()}-${day.getMonth()}-${day.getDate()}`

      // 해당 날짜의 감정 기록 필터링
      const dayRecords = records.filter((record) => {
        const recordDate = new Date(record.timestamp)
        return (
          recordDate.getFullYear() === day.getFullYear() &&
          recordDate.getMonth() === day.getMonth() &&
          recordDate.getDate() === day.getDate()
        )
      })

      // 주요 감정 계산
      emotions[dateKey] = getDominantEmotion(dayRecords)
    })

    setEmotionsByDay(emotions)
  }, [])

  // 주요 감정 계산
  const getDominantEmotion = (records: any[]): EmotionCategory | null => {
    if (records.length === 0) return null

    // 모든 감정 빈도 계산
    const emotionFrequency: Record<EmotionCategory, number> = {}

    records.forEach((record) => {
      record.emotions.forEach((emotion: any) => {
        emotionFrequency[emotion.category] = (emotionFrequency[emotion.category] || 0) + emotion.intensity
      })
    })

    // 가장 빈도가 높은 감정 반환
    return Object.entries(emotionFrequency).length > 0
      ? (Object.entries(emotionFrequency).sort((a, b) => b[1] - a[1])[0][0] as EmotionCategory)
      : null
  }

  // 날짜 포맷팅
  const formatDay = (date: Date) => {
    const today = new Date()

    if (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    ) {
      return "오늘"
    }

    const yesterday = new Date(today)
    yesterday.setDate(today.getDate() - 1)

    if (
      date.getDate() === yesterday.getDate() &&
      date.getMonth() === yesterday.getMonth() &&
      date.getFullYear() === yesterday.getFullYear()
    ) {
      return "어제"
    }

    const tomorrow = new Date(today)
    tomorrow.setDate(today.getDate() + 1)

    if (
      date.getDate() === tomorrow.getDate() &&
      date.getMonth() === tomorrow.getMonth() &&
      date.getFullYear() === tomorrow.getFullYear()
    ) {
      return "내일"
    }

    return date.getDate().toString()
  }

  // 요일 포맷팅
  const formatWeekday = (date: Date) => {
    const weekdays = ["일", "월", "화", "수", "목", "금", "토"]
    return weekdays[date.getDay()]
  }

  // 월 포맷팅
  const formatMonth = (date: Date) => {
    return date.toLocaleDateString("ko-KR", { month: "long" })
  }

  return (
    <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-100">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Calendar size={20} className="text-blue-600 mr-2" />
            <h2 className="text-lg font-medium text-blue-800">{formatMonth(currentDate)} 감정 캘린더</h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-blue-600 p-0 h-auto"
            onClick={() => router.push("/profile")}
          >
            더보기 <ArrowRight size={16} className="ml-1" />
          </Button>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {weekDays.map((day) => {
            const dateKey = `${day.getFullYear()}-${day.getMonth()}-${day.getDate()}`
            const emotion = emotionsByDay[dateKey]
            const isToday =
              day.getDate() === new Date().getDate() &&
              day.getMonth() === new Date().getMonth() &&
              day.getFullYear() === new Date().getFullYear()

            return (
              <div key={dateKey} className="flex flex-col items-center">
                <div className={`text-xs mb-1 ${isToday ? "font-bold text-blue-600" : "text-slate-500"}`}>
                  {formatWeekday(day)}
                </div>
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm ${
                    isToday
                      ? "bg-blue-100 border-2 border-blue-300"
                      : emotion
                        ? `${emotionColors[emotion]?.bg || "bg-slate-100"}`
                        : "bg-white border border-slate-200"
                  }`}
                >
                  {formatDay(day)}
                </div>
                {emotion && <div className="text-xs mt-1 text-center">{emotion}</div>}
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
