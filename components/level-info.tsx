"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { getUserLevelInfo } from "@/utils/achievement-storage"
import { Award, ChevronUp, Sparkles } from "lucide-react"
import type { Level } from "@/types/achievement"

export function LevelInfo() {
  const [levelInfo, setLevelInfo] = useState<{
    points: number
    currentLevel: Level
    nextLevelInfo: { level: Level; pointsNeeded: number; progress: number } | null
  } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isExpanded, setIsExpanded] = useState(false)

  // 레벨 정보 로드
  useEffect(() => {
    loadLevelInfo()
  }, [])

  const loadLevelInfo = () => {
    setIsLoading(true)
    try {
      const info = getUserLevelInfo()
      setLevelInfo(info)
    } catch (error) {
      console.error("레벨 정보 로드 중 오류:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading || !levelInfo) {
    return (
      <Card>
        <CardContent className="p-6 flex justify-center items-center h-40">
          <p>레벨 정보를 불러오는 중...</p>
        </CardContent>
      </Card>
    )
  }

  const { currentLevel, nextLevelInfo, points } = levelInfo

  return (
    <Card className="bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-100">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Award size={24} className="text-amber-500 mr-2" />
            <h2 className="text-lg font-medium text-amber-800">회복 레벨</h2>
          </div>
          <div className="flex items-center">
            <span className="text-amber-700 font-bold text-xl">Lv.{currentLevel.level}</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-amber-100 mb-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="font-medium text-amber-700">{currentLevel.name}</h3>
              <p className="text-xs text-slate-500">현재 포인트: {points}P</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
              <span className="text-amber-800 font-bold">{currentLevel.level}</span>
            </div>
          </div>

          {nextLevelInfo && (
            <div className="mt-3">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-600">다음 레벨: {nextLevelInfo.level.name}</span>
                <span className="text-amber-600">
                  {nextLevelInfo.pointsNeeded}P 필요 ({Math.round(nextLevelInfo.progress)}%)
                </span>
              </div>
              <Progress value={nextLevelInfo.progress} className="h-2 bg-amber-100" />
            </div>
          )}

          {isExpanded && (
            <div className="mt-4 pt-3 border-t border-amber-100">
              <h4 className="text-sm font-medium mb-2 flex items-center">
                <Sparkles size={14} className="text-amber-500 mr-1" />
                현재 레벨 혜택
              </h4>
              <ul className="text-xs text-slate-600 space-y-1 pl-5 list-disc">
                {currentLevel.benefits.map((benefit, index) => (
                  <li key={index}>{benefit}</li>
                ))}
              </ul>

              {nextLevelInfo && (
                <div className="mt-3">
                  <h4 className="text-sm font-medium mb-2 flex items-center">
                    <Sparkles size={14} className="text-amber-500 mr-1" />
                    다음 레벨 혜택
                  </h4>
                  <ul className="text-xs text-slate-600 space-y-1 pl-5 list-disc">
                    {nextLevelInfo.level.benefits.map((benefit, index) => (
                      <li key={index}>{benefit}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        <button
          className="w-full flex items-center justify-center text-xs text-amber-700"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? (
            <>
              접기 <ChevronUp size={14} className="ml-1" />
            </>
          ) : (
            <>
              레벨 혜택 보기 <ChevronUp size={14} className="ml-1 transform rotate-180" />
            </>
          )}
        </button>
      </CardContent>
    </Card>
  )
}
