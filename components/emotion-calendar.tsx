"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { getEmotionRecords } from "@/utils/emotion-storage"
import { type EmotionRecord, type EmotionCategory, emotionColors } from "@/types/emotion"

export function EmotionCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [emotionRecords, setEmotionRecords] = useState<EmotionRecord[]>([])
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedDayRecords, setSelectedDayRecords] = useState<EmotionRecord[]>([])

  // 감정 기록 로드
  useEffect(() => {
    loadEmotionRecords()
  }, [])

  const loadEmotionRecords = () => {
    const records = getEmotionRecords()
    setEmotionRecords(records)
  }

  // 이전 달로 이동
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  // 다음 달로 이동
  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  // 오늘로 이동
  const goToToday = () => {
    setCurrentDate(new Date())
  }

  // 현재 월의 일수 계산
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate()
  }

  // 현재 월의 첫 날의 요일 계산 (0: 일요일, 1: 월요일, ...)
  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay()
  }

  // 날짜별 감정 기록 그룹화
  const getRecordsByDate = () => {
    const recordsByDate: Record<string, EmotionRecord[]> = {}

    emotionRecords.forEach((record) => {
      const date = new Date(record.timestamp)
      const dateKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`

      if (!recordsByDate[dateKey]) {
        recordsByDate[dateKey] = []
      }

      recordsByDate[dateKey].push(record)
    })

    return recordsByDate
  }

  // 날짜별 주요 감정 계산
  const getDominantEmotion = (records: EmotionRecord[]): EmotionCategory | null => {
    if (records.length === 0) return null

    // 모든 감정 빈도 계산
    const emotionFrequency: Record<EmotionCategory, number> = {}

    records.forEach((record) => {
      record.emotions.forEach((emotion) => {
        emotionFrequency[emotion.category] = (emotionFrequency[emotion.category] || 0) + emotion.intensity
      })
    })

    // 가장 빈도가 높은 감정 반환
    return Object.entries(emotionFrequency).sort((a, b) => b[1] - a[1])[0][0] as EmotionCategory
  }

  // 날짜 선택 처리
  const handleDateClick = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const day = date.getDate()

    // 해당 날짜의 감정 기록 필터링
    const dayRecords = emotionRecords.filter((record) => {
      const recordDate = new Date(record.timestamp)
      return recordDate.getFullYear() === year && recordDate.getMonth() === month && recordDate.getDate() === day
    })

    setSelectedDate(date)
    setSelectedDayRecords(dayRecords)
  }

  // 캘린더 렌더링
  const renderCalendar = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const daysInMonth = getDaysInMonth(year, month)
    const firstDayOfMonth = getFirstDayOfMonth(year, month)

    const recordsByDate = getRecordsByDate()
    const days = []

    // 이전 달의 날짜 채우기
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(
        <div key={`prev-${i}`} className="h-12 p-1 text-center text-slate-300 border border-slate-100">
          {getDaysInMonth(year, month - 1) - firstDayOfMonth + i + 1}
        </div>,
      )
    }

    // 현재 달의 날짜 채우기
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day)
      const dateKey = `${year}-${month}-${day}`
      const dayRecords = recordsByDate[dateKey] || []
      const dominantEmotion = getDominantEmotion(dayRecords)
      const isToday =
        date.getDate() === new Date().getDate() &&
        date.getMonth() === new Date().getMonth() &&
        date.getFullYear() === new Date().getFullYear()

      days.push(
        <div
          key={day}
          className={`h-12 p-1 border border-slate-100 cursor-pointer hover:bg-slate-50 relative ${
            isToday ? "bg-teal-50" : ""
          }`}
          onClick={() => handleDateClick(date)}
        >
          <div className={`text-xs ${isToday ? "font-bold text-teal-600" : ""}`}>{day}</div>
          {dominantEmotion && (
            <div
              className={`w-6 h-6 mx-auto mt-1 rounded-full flex items-center justify-center ${
                emotionColors[dominantEmotion]?.bg || "bg-slate-100"
              } ${emotionColors[dominantEmotion]?.text || "text-slate-600"}`}
            >
              <span className="text-xs">{dayRecords.length}</span>
            </div>
          )}
        </div>,
      )
    }

    // 다음 달의 날짜 채우기 (7의 배수로 맞추기)
    const totalCells = days.length
    const remainingCells = 42 - totalCells // 6주 x 7일 = 42

    for (let i = 1; i <= remainingCells; i++) {
      days.push(
        <div key={`next-${i}`} className="h-12 p-1 text-center text-slate-300 border border-slate-100">
          {i}
        </div>,
      )
    }

    return days
  }

  // 월 이름 포맷팅
  const formatMonth = (date: Date) => {
    return date.toLocaleDateString("ko-KR", { year: "numeric", month: "long" })
  }

  // 날짜 포맷팅
  const formatDate = (date: Date) => {
    return date.toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric", weekday: "long" })
  }

  // 시간 포맷팅
  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle>감정 캘린더</CardTitle>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={goToPreviousMonth}>
                <ChevronLeft size={16} />
              </Button>
              <Button variant="outline" size="sm" onClick={goToToday}>
                오늘
              </Button>
              <Button variant="outline" size="sm" onClick={goToNextMonth}>
                <ChevronRight size={16} />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4 text-center text-lg font-medium">{formatMonth(currentDate)}</div>

          {/* 요일 헤더 */}
          <div className="grid grid-cols-7 text-center font-medium text-sm mb-2">
            <div className="text-red-500">일</div>
            <div>월</div>
            <div>화</div>
            <div>수</div>
            <div>목</div>
            <div>금</div>
            <div className="text-blue-500">토</div>
          </div>

          {/* 캘린더 그리드 */}
          <div className="grid grid-cols-7">{renderCalendar()}</div>

          {/* 감정 색상 범례 */}
          <div className="mt-4 flex flex-wrap gap-2">
            {Object.entries(emotionColors).map(([category, colors]) => (
              <div key={category} className="flex items-center">
                <div className={`w-3 h-3 rounded-full ${colors.bg}`}></div>
                <span className="text-xs ml-1">{category}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 선택한 날짜의 감정 기록 모달 */}
      <Dialog open={selectedDate !== null} onOpenChange={() => setSelectedDate(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedDate && formatDate(selectedDate)}의 감정 기록</DialogTitle>
          </DialogHeader>

          {selectedDayRecords.length === 0 ? (
            <div className="py-4 text-center text-slate-500">이 날의 감정 기록이 없습니다.</div>
          ) : (
            <div className="space-y-4 max-h-[60vh] overflow-y-auto py-4">
              {selectedDayRecords.map((record) => (
                <Card key={record.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="text-sm text-slate-500">{formatTime(record.timestamp)}</div>
                      <div className="text-sm">에너지: {record.energyLevel}%</div>
                    </div>

                    <div className="flex flex-wrap gap-1 mb-2">
                      {record.emotions.map((emotion) => {
                        const colors = emotionColors[emotion.category]
                        return (
                          <Badge
                            key={`${record.id}-${emotion.category}`}
                            variant="outline"
                            className={`${colors.bg} ${colors.text}`}
                          >
                            {emotion.category} {Array(emotion.intensity).fill("●").join("")}
                          </Badge>
                        )
                      })}
                    </div>

                    {record.situation && (
                      <div className="mb-2">
                        <div className="text-xs font-medium text-slate-500">상황</div>
                        <div className="text-sm">{record.situation}</div>
                      </div>
                    )}

                    {record.note && (
                      <div>
                        <div className="text-xs font-medium text-slate-500">메모</div>
                        <div className="text-sm">{record.note}</div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
