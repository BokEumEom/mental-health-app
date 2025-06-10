"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { calculateEmotionStats } from "@/utils/emotion-storage"
import { emotionColors, type EmotionCategory } from "@/types/emotion"

export function EmotionStats() {
  const [stats, setStats] = useState({
    energyLevel: 50,
    burnoutRisk: 0,
    dominantEmotions: [] as { category: string; percentage: number }[],
  })

  // 통계 로드
  useEffect(() => {
    const emotionStats = calculateEmotionStats()
    setStats(emotionStats)
  }, [])

  // 번아웃 위험 레벨 텍스트
  const getBurnoutRiskText = (risk: number) => {
    if (risk < 30) return "낮음"
    if (risk < 60) return "주의"
    return "높음"
  }

  // 번아웃 위험 색상
  const getBurnoutRiskColor = (risk: number) => {
    if (risk < 30) return "text-green-600"
    if (risk < 60) return "text-amber-600"
    return "text-red-600"
  }

  return (
    <Card className="bg-gradient-to-r from-teal-50 to-cyan-50 border-teal-100">
      <CardContent className="p-6">
        <h2 className="text-lg font-medium text-teal-800">오늘의 감정 상태</h2>
        <div className="mt-4 flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-slate-600">에너지</span>
              <span className="text-sm font-medium text-teal-700">{stats.energyLevel}%</span>
            </div>
            <Progress value={stats.energyLevel} className="h-2 bg-teal-100" />
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-slate-600">번아웃 위험</span>
              <span className={`text-sm font-medium ${getBurnoutRiskColor(stats.burnoutRisk)}`}>
                {getBurnoutRiskText(stats.burnoutRisk)}
              </span>
            </div>
            <Progress value={stats.burnoutRisk} className="h-2 bg-amber-100" />
          </div>
        </div>

        {stats.dominantEmotions.length > 0 && (
          <div className="mt-4">
            <h3 className="text-sm font-medium text-slate-700 mb-2">주요 감정</h3>
            <div className="flex flex-wrap gap-2">
              {stats.dominantEmotions.map((emotion) => {
                const category = emotion.category as EmotionCategory
                const colors = emotionColors[category] || {
                  bg: "bg-slate-50",
                  text: "text-slate-700",
                  border: "border-slate-200",
                  hover: "hover:bg-slate-100",
                }
                return (
                  <div key={emotion.category} className={`px-2 py-1 rounded-full text-xs ${colors.bg} ${colors.text}`}>
                    {emotion.category} {emotion.percentage}%
                  </div>
                )
              })}
            </div>
          </div>
        )}

        <Button variant="outline" className="w-full mt-4 border-teal-200 text-teal-700 hover:bg-teal-50">
          주간 리포트 보기
        </Button>
      </CardContent>
    </Card>
  )
}
