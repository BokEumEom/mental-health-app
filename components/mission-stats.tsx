"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Award, CheckCircle2, Flame } from "lucide-react"
import { calculateMissionStats, getRecoveryPoints } from "@/utils/mission-storage"

export function MissionStats() {
  const [stats, setStats] = useState({
    totalCompleted: 0,
    totalPoints: 0,
    completionRate: 0,
    streak: 0,
  })
  const [points, setPoints] = useState(0)

  // 통계 로드
  useEffect(() => {
    const missionStats = calculateMissionStats()
    setStats(missionStats)

    const recoveryPoints = getRecoveryPoints()
    setPoints(recoveryPoints)
  }, [])

  return (
    <Card className="bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-100">
      <CardContent className="p-6">
        <h2 className="text-lg font-medium text-purple-800 mb-4">회복 미션 현황</h2>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-white p-3 rounded-lg border border-purple-100">
            <div className="flex items-center text-purple-700 mb-1">
              <Award size={18} className="mr-2" />
              <span className="font-medium">회복 포인트</span>
            </div>
            <div className="text-2xl font-bold text-purple-800">{points}</div>
          </div>

          <div className="bg-white p-3 rounded-lg border border-purple-100">
            <div className="flex items-center text-purple-700 mb-1">
              <CheckCircle2 size={18} className="mr-2" />
              <span className="font-medium">완료 미션</span>
            </div>
            <div className="text-2xl font-bold text-purple-800">{stats.totalCompleted}</div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-slate-600">주간 미션 완료율</span>
              <span className="text-sm font-medium text-purple-700">{stats.completionRate}%</span>
            </div>
            <Progress value={stats.completionRate} className="h-2 bg-purple-100" />
          </div>

          <div className="bg-white p-3 rounded-lg border border-purple-100">
            <div className="flex items-center">
              <Flame size={20} className="text-amber-500 mr-2" />
              <div>
                <div className="font-medium">연속 달성</div>
                <div className="text-sm text-slate-600">{stats.streak}일 연속으로 미션을 완료했어요!</div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
