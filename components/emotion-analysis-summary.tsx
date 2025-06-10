"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BarChart2, TrendingUp, ArrowRight } from "lucide-react"
import { generateEmotionAnalysisData } from "@/utils/emotion-analysis"
import { useRouter } from "next/navigation"

export function EmotionAnalysisSummary() {
  const [analysisData, setAnalysisData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // 분석 데이터 로드
  useEffect(() => {
    loadAnalysisData()
  }, [])

  const loadAnalysisData = () => {
    setIsLoading(true)
    try {
      const data = generateEmotionAnalysisData("week")
      setAnalysisData(data)
    } catch (error) {
      console.error("감정 분석 데이터 로드 중 오류:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading || !analysisData) {
    return (
      <Card className="bg-gradient-to-r from-teal-50 to-cyan-50 border-teal-100">
        <CardContent className="p-6">
          <div className="flex items-center mb-4">
            <BarChart2 size={20} className="text-teal-600 mr-2" />
            <h2 className="text-lg font-medium text-teal-800">감정 분석 인사이트</h2>
          </div>
          <p className="text-center py-4 text-slate-500">분석 데이터를 불러오는 중...</p>
        </CardContent>
      </Card>
    )
  }

  // 데이터가 없는 경우
  if (analysisData.summary.totalRecords === 0) {
    return (
      <Card className="bg-gradient-to-r from-teal-50 to-cyan-50 border-teal-100">
        <CardContent className="p-6">
          <div className="flex items-center mb-4">
            <BarChart2 size={20} className="text-teal-600 mr-2" />
            <h2 className="text-lg font-medium text-teal-800">감정 분석 인사이트</h2>
          </div>
          <p className="text-center py-4 text-slate-500">
            아직 충분한 감정 기록이 없습니다. 감정을 기록하면 분석 인사이트를 확인할 수 있어요.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-gradient-to-r from-teal-50 to-cyan-50 border-teal-100">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <BarChart2 size={20} className="text-teal-600 mr-2" />
            <h2 className="text-lg font-medium text-teal-800">감정 분석 인사이트</h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-teal-600 p-0 h-auto"
            onClick={() => router.push("/profile")}
          >
            더보기 <ArrowRight size={16} className="ml-1" />
          </Button>
        </div>

        <div className="space-y-4">
          <div className="p-3 bg-white rounded-lg border border-teal-100">
            <div className="flex items-center text-teal-700 mb-1">
              <TrendingUp size={16} className="mr-1" />
              <span className="text-sm font-medium">주요 감정 패턴</span>
            </div>
            <p className="text-sm text-slate-600">
              최근 7일간 가장 많이 느낀 감정은{" "}
              <span className="font-medium text-teal-600">{analysisData.summary.dominantEmotion}</span>입니다.
              {analysisData.summary.positiveRatio > 60
                ? " 긍정적인 감정이 우세한 상태입니다."
                : analysisData.summary.positiveRatio < 40
                  ? " 부정적인 감정이 다소 많은 상태입니다."
                  : " 긍정적인 감정과 부정적인 감정이 균형을 이루고 있습니다."}
            </p>
          </div>

          <div className="p-3 bg-white rounded-lg border border-teal-100">
            <div className="flex items-center text-teal-700 mb-1">
              <TrendingUp size={16} className="mr-1" />
              <span className="text-sm font-medium">맞춤 추천</span>
            </div>
            <p className="text-sm text-slate-600">
              {analysisData.summary.volatilityScore > 1.5
                ? "감정 변동성이 높습니다. 마음챙김 미션을 통해 감정을 안정시켜 보세요."
                : analysisData.summary.positiveRatio < 40
                  ? "부정적인 감정이 많습니다. 감사 일기를 쓰거나 가벼운 운동을 해보세요."
                  : analysisData.summary.averageEnergy < 40
                    ? "에너지 레벨이 낮습니다. 충분한 휴식과 가벼운 스트레칭을 해보세요."
                    : "감정 상태가 비교적 안정적입니다. 현재의 감정 관리 방식을 유지해 보세요."}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
