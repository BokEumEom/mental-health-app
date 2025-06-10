"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { LineChart } from "@/components/charts/line-chart"
import { BarChart } from "@/components/charts/bar-chart"
import { PieChart } from "@/components/charts/pie-chart"
import { calculateFeedbackStats, exportFeedbackData } from "@/utils/feedback-storage"
import {
  calculateResponseMetrics,
  calculateQualityScore,
  generateImprovementSuggestions,
} from "@/utils/response-metrics"
import type { FeedbackStats, ResponseMetrics, FeedbackCategory } from "@/types/feedback"
import { Download, BarChart2, PieChartIcon, LineChartIcon, AlertTriangle } from "lucide-react"

export function QualityDashboard() {
  const [timeRange, setTimeRange] = useState<"7" | "30" | "90" | "all">("30")
  const [feedbackStats, setFeedbackStats] = useState<FeedbackStats | null>(null)
  const [responseMetrics, setResponseMetrics] = useState<ResponseMetrics | null>(null)
  const [qualityScore, setQualityScore] = useState(0)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // 데이터 로드
  useEffect(() => {
    loadData()
  }, [timeRange])

  const loadData = () => {
    setIsLoading(true)
    try {
      const days = timeRange === "all" ? 365 : Number.parseInt(timeRange)
      const stats = calculateFeedbackStats(days)
      const metrics = calculateResponseMetrics(days)
      const score = calculateQualityScore()
      const improvementSuggestions = generateImprovementSuggestions()

      setFeedbackStats(stats)
      setResponseMetrics(metrics)
      setQualityScore(score)
      setSuggestions(improvementSuggestions)
    } catch (error) {
      console.error("데이터 로드 중 오류:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // 데이터 내보내기
  const handleExportData = () => {
    try {
      const data = exportFeedbackData()
      const blob = new Blob([data], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `feedback_data_${new Date().toISOString().split("T")[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error("데이터 내보내기 중 오류:", error)
    }
  }

  // 카테고리 이름 변환
  const getCategoryName = (category: FeedbackCategory): string => {
    const categoryNames: Record<FeedbackCategory, string> = {
      empathy: "공감 능력",
      relevance: "관련성",
      helpfulness: "유용성",
      clarity: "명확성",
      tone: "어조",
      length: "길이",
      other: "기타",
    }
    return categoryNames[category] || category
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6 flex justify-center items-center h-60">
          <p>데이터를 불러오는 중...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle>AI 응답 품질 대시보드</CardTitle>
            <div className="flex items-center gap-2">
              <Select value={timeRange} onValueChange={(value) => setTimeRange(value as "7" | "30" | "90" | "all")}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="기간 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">최근 7일</SelectItem>
                  <SelectItem value="30">최근 30일</SelectItem>
                  <SelectItem value="90">최근 90일</SelectItem>
                  <SelectItem value="all">전체 기간</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" onClick={loadData}>
                새로고침
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Tabs defaultValue="overview">
            <div className="px-6">
              <TabsList className="grid grid-cols-3 mb-4">
                <TabsTrigger value="overview">개요</TabsTrigger>
                <TabsTrigger value="feedback">피드백 분석</TabsTrigger>
                <TabsTrigger value="improvement">개선 제안</TabsTrigger>
              </TabsList>
            </div>

            {/* 개요 탭 */}
            <TabsContent value="overview" className="p-0">
              <div className="p-6 space-y-6">
                {/* 품질 점수 */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">AI 응답 품질 점수</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-center">
                      <div className="relative w-40 h-40">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-4xl font-bold">{qualityScore}</div>
                        </div>
                        <PieChart
                          labels={["품질 점수"]}
                          data={[qualityScore, 100 - qualityScore]}
                          colors={["#10b981", "#e5e7eb"]}
                          doughnut={true}
                          height={160}
                          hideLabels={true}
                        />
                      </div>
                    </div>
                    <div className="mt-4 text-center text-sm text-slate-500">
                      {qualityScore >= 80
                        ? "AI 응답 품질이 매우 좋습니다."
                        : qualityScore >= 60
                          ? "AI 응답 품질이 양호합니다."
                          : "AI 응답 품질 개선이 필요합니다."}
                    </div>
                  </CardContent>
                </Card>

                {/* 요약 통계 */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <div className="flex items-center text-slate-500 mb-1">
                      <BarChart2 size={16} className="mr-1" />
                      <span className="text-xs">총 피드백</span>
                    </div>
                    <div className="text-2xl font-bold">{feedbackStats?.totalFeedback || 0}</div>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <div className="flex items-center text-slate-500 mb-1">
                      <LineChartIcon size={16} className="mr-1" />
                      <span className="text-xs">평균 응답 시간</span>
                    </div>
                    <div className="text-2xl font-bold">
                      {responseMetrics ? Math.round(responseMetrics.averageResponseTime / 100) / 10 : 0}초
                    </div>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <div className="flex items-center text-slate-500 mb-1">
                      <PieChartIcon size={16} className="mr-1" />
                      <span className="text-xs">긍정적 피드백</span>
                    </div>
                    <div className="text-2xl font-bold">{Math.round(feedbackStats?.positiveRate || 0)}%</div>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <div className="flex items-center text-slate-500 mb-1">
                      <AlertTriangle size={16} className="mr-1" />
                      <span className="text-xs">부정적 피드백</span>
                    </div>
                    <div className="text-2xl font-bold">{Math.round(feedbackStats?.negativeRate || 0)}%</div>
                  </div>
                </div>

                {/* 피드백 추세 */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">피드백 추세</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <LineChart
                      labels={feedbackStats?.recentTrend.map((item) => item.date) || []}
                      datasets={[
                        {
                          label: "긍정적",
                          data: feedbackStats?.recentTrend.map((item) => item.positive) || [],
                          borderColor: "#10b981",
                          backgroundColor: "rgba(16, 185, 129, 0.2)",
                        },
                        {
                          label: "중립적",
                          data: feedbackStats?.recentTrend.map((item) => item.neutral) || [],
                          borderColor: "#f59e0b",
                          backgroundColor: "rgba(245, 158, 11, 0.2)",
                        },
                        {
                          label: "부정적",
                          data: feedbackStats?.recentTrend.map((item) => item.negative) || [],
                          borderColor: "#ef4444",
                          backgroundColor: "rgba(239, 68, 68, 0.2)",
                        },
                      ]}
                      height={250}
                    />
                  </CardContent>
                </Card>

                {/* 카테고리별 피드백 */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">카테고리별 피드백</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <BarChart
                      labels={Object.keys(feedbackStats?.categoryStats || {}).map(getCategoryName)}
                      datasets={[
                        {
                          label: "피드백 수",
                          data: Object.values(feedbackStats?.categoryStats || {}),
                        },
                      ]}
                      horizontal={true}
                      height={300}
                    />
                  </CardContent>
                </Card>

                {/* 내보내기 버튼 */}
                <div className="flex justify-end">
                  <Button variant="outline" onClick={handleExportData}>
                    <Download size={16} className="mr-2" />
                    데이터 내보내기
                  </Button>
                </div>
              </div>
            </TabsContent>

            {/* 피드백 분석 탭 */}
            <TabsContent value="feedback" className="p-0">
              <div className="p-6 space-y-6">
                {/* 피드백 분포 */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">피드백 분포</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <PieChart
                        labels={["긍정적", "중립적", "부정적"]}
                        data={[
                          feedbackStats?.positiveRate || 0,
                          feedbackStats?.neutralRate || 0,
                          feedbackStats?.negativeRate || 0,
                        ]}
                        colors={["#10b981", "#f59e0b", "#ef4444"]}
                        doughnut={true}
                        height={300}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* 카테고리별 분석 */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">카테고리별 상세 분석</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {Object.entries(feedbackStats?.categoryStats || {}).map(([category, count]) => (
                        <div key={category} className="flex items-center">
                          <div className="w-32 text-sm">{getCategoryName(category as FeedbackCategory)}</div>
                          <div className="flex-1 h-4 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-teal-600"
                              style={{
                                width: `${
                                  feedbackStats?.totalFeedback ? (count / feedbackStats.totalFeedback) * 100 : 0
                                }%`,
                              }}
                            ></div>
                          </div>
                          <div className="ml-2 text-sm">{count}</div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* 개선 제안 탭 */}
            <TabsContent value="improvement" className="p-0">
              <div className="p-6 space-y-6">
                {/* 개선 제안 목록 */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">AI 응답 품질 개선 제안</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-disc pl-5">
                      {suggestions.map((suggestion, index) => (
                        <li key={index} className="text-sm">
                          {suggestion}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
