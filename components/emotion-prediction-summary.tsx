"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, ArrowRight, Calendar } from "lucide-react"
import { generateEmotionPredictions } from "@/utils/emotion-prediction"
import { emotionColors } from "@/types/emotion"
import { useRouter } from "next/navigation"

export function EmotionPredictionSummary() {
  const [predictions, setPredictions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // 예측 데이터 로드
  useEffect(() => {
    loadPredictions()
  }, [])

  const loadPredictions = () => {
    setIsLoading(true)
    try {
      const data = generateEmotionPredictions("week")
      setPredictions(data)
    } catch (error) {
      console.error("감정 예측 데이터 로드 중 오류:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // 날짜 포맷팅 (YYYY-MM-DD -> MM월 DD일 (요일))
  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr)
    const month = date.getMonth() + 1
    const day = date.getDate()
    const weekdays = ["일", "월", "화", "수", "목", "금", "토"]
    const weekday = weekdays[date.getDay()]
    return `${month}월 ${day}일 (${weekday})`
  }

  // 신뢰도 레벨에 따른 색상 및 텍스트
  const getConfidenceColor = (level: string): string => {
    switch (level) {
      case "high":
        return "bg-green-100 text-green-800 border-green-200"
      case "medium":
        return "bg-amber-100 text-amber-800 border-amber-200"
      case "low":
        return "bg-slate-100 text-slate-800 border-slate-200"
      default:
        return "bg-slate-100 text-slate-800 border-slate-200"
    }
  }

  const getConfidenceText = (level: string): string => {
    switch (level) {
      case "high":
        return "높음"
      case "medium":
        return "중간"
      case "low":
        return "낮음"
      default:
        return "알 수 없음"
    }
  }

  if (isLoading) {
    return (
      <Card className="bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-100">
        <CardContent className="p-6">
          <div className="flex items-center mb-4">
            <TrendingUp size={20} className="text-purple-600 mr-2" />
            <h2 className="text-lg font-medium text-purple-800">감정 예측 인사이트</h2>
          </div>
          <p className="text-center py-4 text-slate-500">예측 데이터를 불러오는 중...</p>
        </CardContent>
      </Card>
    )
  }

  // 데이터가 없는 경우
  if (predictions.length === 0) {
    return (
      <Card className="bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-100">
        <CardContent className="p-6">
          <div className="flex items-center mb-4">
            <TrendingUp size={20} className="text-purple-600 mr-2" />
            <h2 className="text-lg font-medium text-purple-800">감정 예측 인사이트</h2>
          </div>
          <p className="text-center py-4 text-slate-500">
            아직 충분한 감정 기록이 없습니다. 감정을 기록하면 예측 인사이트를 확인할 수 있어요.
          </p>
        </CardContent>
      </Card>
    )
  }

  // 내일과 모레 예측 가져오기
  const tomorrow = predictions[0]
  const dayAfterTomorrow = predictions[1]

  return (
    <Card className="bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-100">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <TrendingUp size={20} className="text-purple-600 mr-2" />
            <h2 className="text-lg font-medium text-purple-800">감정 예측 인사이트</h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-purple-600 p-0 h-auto"
            onClick={() => router.push("/profile")}
          >
            더보기 <ArrowRight size={16} className="ml-1" />
          </Button>
        </div>

        <div className="space-y-4">
          {/* 내일 예측 */}
          <div className="p-3 bg-white rounded-lg border border-purple-100">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center text-purple-700">
                <Calendar size={16} className="mr-1" />
                <span className="text-sm font-medium">{formatDate(tomorrow.date)}</span>
              </div>
              <Badge variant="outline" className={`text-xs ${getConfidenceColor(tomorrow.confidence)}`}>
                신뢰도: {getConfidenceText(tomorrow.confidence)}
              </Badge>
            </div>
            <div className="flex items-center mb-2">
              <div
                className={`w-3 h-3 rounded-full mr-1 ${emotionColors[tomorrow.dominantEmotion]?.bg || "bg-slate-100"}`}
              ></div>
              <div className="text-sm">
                주요 감정: <span className="font-medium">{tomorrow.dominantEmotion}</span>
              </div>
            </div>
            <p className="text-sm text-slate-600">{tomorrow.basis.split(".")[0]}.</p>
          </div>

          {/* 모레 예측 */}
          {dayAfterTomorrow && (
            <div className="p-3 bg-white rounded-lg border border-purple-100">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center text-purple-700">
                  <Calendar size={16} className="mr-1" />
                  <span className="text-sm font-medium">{formatDate(dayAfterTomorrow.date)}</span>
                </div>
                <Badge variant="outline" className={`text-xs ${getConfidenceColor(dayAfterTomorrow.confidence)}`}>
                  신뢰도: {getConfidenceText(dayAfterTomorrow.confidence)}
                </Badge>
              </div>
              <div className="flex items-center mb-2">
                <div
                  className={`w-3 h-3 rounded-full mr-1 ${
                    emotionColors[dayAfterTomorrow.dominantEmotion]?.bg || "bg-slate-100"
                  }`}
                ></div>
                <div className="text-sm">
                  주요 감정: <span className="font-medium">{dayAfterTomorrow.dominantEmotion}</span>
                </div>
              </div>
              <p className="text-sm text-slate-600">{dayAfterTomorrow.basis.split(".")[0]}.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
