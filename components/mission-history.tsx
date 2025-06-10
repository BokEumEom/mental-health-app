"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, Award, CheckCircle2, XCircle } from "lucide-react"
import { getRecentMissionCompletions } from "@/utils/mission-storage"
import { getMissionById } from "@/data/missions"
import type { MissionCompletion } from "@/types/mission"

export function MissionHistory() {
  const [completions, setCompletions] = useState<
    (MissionCompletion & { missionTitle?: string; missionCategory?: string })[]
  >([])
  const [isLoading, setIsLoading] = useState(true)

  // 미션 완료 기록 로드
  useEffect(() => {
    loadCompletions()
  }, [])

  const loadCompletions = () => {
    setIsLoading(true)
    try {
      const recentCompletions = getRecentMissionCompletions(10)

      // 미션 정보 추가
      const enrichedCompletions = recentCompletions.map((completion) => {
        const mission = getMissionById(completion.missionId)
        return {
          ...completion,
          missionTitle: mission?.title,
          missionCategory: mission?.category,
        }
      })

      setCompletions(enrichedCompletions)
    } catch (error) {
      console.error("미션 완료 기록 로드 중 오류:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // 날짜 포맷팅
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  // 시간 포맷팅
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // 상태에 따른 아이콘 및 색상
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "완료":
        return <CheckCircle2 size={16} className="text-teal-500" />
      case "진행중":
        return <CheckCircle2 size={16} className="text-amber-500" />
      case "실패":
        return <XCircle size={16} className="text-red-500" />
      default:
        return null
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6 flex justify-center items-center h-40">
          <p>미션 기록을 불러오는 중...</p>
        </CardContent>
      </Card>
    )
  }

  if (completions.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 flex flex-col justify-center items-center h-40">
          <p className="text-slate-500 mb-2">아직 완료한 미션이 없습니다.</p>
          <Button variant="outline" size="sm" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
            첫 미션 도전하기
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>미션 히스토리</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y">
          {completions.map((completion) => (
            <div key={completion.id} className="p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="flex items-center text-sm text-slate-500 mb-1">
                    <Calendar size={14} className="mr-1" />
                    <span>{formatDate(completion.timestamp)}</span>
                    <Clock size={14} className="ml-2 mr-1" />
                    <span>{formatTime(completion.timestamp)}</span>
                  </div>
                  <div className="flex items-center">
                    <div className="mr-2">{getStatusIcon(completion.status)}</div>
                    <h3 className="font-medium">{completion.missionTitle || "알 수 없는 미션"}</h3>
                  </div>
                </div>
                <div className="flex items-center text-sm text-teal-600">
                  <Award size={16} className="mr-1" />
                  <span>{completion.pointsEarned} 포인트</span>
                </div>
              </div>

              {completion.reflection && (
                <div className="mt-2 text-sm text-slate-600 bg-slate-50 p-2 rounded-md">
                  <p>{completion.reflection}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
