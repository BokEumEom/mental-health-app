"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { LineChart } from "@/components/charts/line-chart"
import { BarChart } from "@/components/charts/bar-chart"
import { PieChart } from "@/components/charts/pie-chart"
import { RadarChart } from "@/components/charts/radar-chart"
import { generateEmotionAnalysisData, type DateRange, type EmotionAnalysisData } from "@/utils/emotion-analysis"
import { Activity, Calendar, Clock, Zap, Lightbulb, TrendingUp, Download, Share2, RefreshCw } from "lucide-react"

export function EmotionAnalysis() {
  const [dateRange, setDateRange] = useState<DateRange>("month")
  const [analysisData, setAnalysisData] = useState<EmotionAnalysisData | null>(null)
  const [activeTab, setActiveTab] = useState("overview")
  const [isLoading, setIsLoading] = useState(true)

  // 분석 데이터 로드
  useEffect(() => {
    loadAnalysisData()
  }, [dateRange])

  const loadAnalysisData = () => {
    setIsLoading(true)
    try {
      const data = generateEmotionAnalysisData(dateRange)
      setAnalysisData(data)
    } catch (error) {
      console.error("감정 분석 데이터 로드 중 오류:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // 날짜 범위 텍스트
  const dateRangeText = {
    week: "최근 7일",
    month: "최근 30일",
    "3months": "최근 3개월",
    "6months": "최근 6개월",
    year: "최근 1년",
    all: "전체 기간",
  }

  if (isLoading || !analysisData) {
    return (
      <Card>
        <CardContent className="p-6 flex justify-center items-center h-60">
          <p>감정 분석 데이터를 불러오는 중...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle>감정 분석 리포트</CardTitle>
            <div className="flex items-center gap-2">
              <Select value={dateRange} onValueChange={(value) => setDateRange(value as DateRange)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="기간 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">최근 7일</SelectItem>
                  <SelectItem value="month">최근 30일</SelectItem>
                  <SelectItem value="3months">최근 3개월</SelectItem>
                  <SelectItem value="6months">최근 6개월</SelectItem>
                  <SelectItem value="year">최근 1년</SelectItem>
                  <SelectItem value="all">전체 기간</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon" onClick={loadAnalysisData}>
                <RefreshCw size={16} />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
            <div className="px-6">
              <TabsList className="grid grid-cols-4 mb-4">
                <TabsTrigger value="overview">개요</TabsTrigger>
                <TabsTrigger value="trends">추세</TabsTrigger>
                <TabsTrigger value="patterns">패턴</TabsTrigger>
                <TabsTrigger value="insights">인사이트</TabsTrigger>
              </TabsList>
            </div>

            {/* 개요 탭 */}
            <TabsContent value="overview" className="p-0">
              <div className="p-6 space-y-6">
                {/* 요약 통계 */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <div className="flex items-center text-slate-500 mb-1">
                      <Calendar size={16} className="mr-1" />
                      <span className="text-xs">기록 수</span>
                    </div>
                    <div className="text-2xl font-bold">{analysisData.summary.totalRecords}</div>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <div className="flex items-center text-slate-500 mb-1">
                      <Zap size={16} className="mr-1" />
                      <span className="text-xs">평균 에너지</span>
                    </div>
                    <div className="text-2xl font-bold">{Math.round(analysisData.summary.averageEnergy)}%</div>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <div className="flex items-center text-slate-500 mb-1">
                      <Activity size={16} className="mr-1" />
                      <span className="text-xs">변동성</span>
                    </div>
                    <div className="text-2xl font-bold">
                      {Math.round(analysisData.summary.volatilityScore * 10) / 10}
                    </div>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <div className="flex items-center text-slate-500 mb-1">
                      <Lightbulb size={16} className="mr-1" />
                      <span className="text-xs">긍정 비율</span>
                    </div>
                    <div className="text-2xl font-bold">{Math.round(analysisData.summary.positiveRatio)}%</div>
                  </div>
                </div>

                {/* 주요 감정 분포 */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">감정 분포</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <PieChart
                        labels={analysisData.emotionDistribution.labels}
                        data={analysisData.emotionDistribution.data}
                        colors={analysisData.emotionDistribution.colors}
                        doughnut={true}
                        height={300}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* 에너지 레벨 추세 */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">에너지 레벨 추세</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <LineChart
                      labels={analysisData.energyLevelTrend.labels}
                      datasets={[
                        {
                          label: "에너지 레벨",
                          data: analysisData.energyLevelTrend.data,
                          borderColor: "#10b981", // emerald-500
                          backgroundColor: "#10b98133", // emerald-500 with 20% opacity
                        },
                      ]}
                      height={250}
                    />
                  </CardContent>
                </Card>

                {/* 주요 감정 추세 */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">주요 감정 추세</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <LineChart
                      labels={analysisData.emotionTrends.labels}
                      datasets={analysisData.emotionTrends.datasets.map((dataset, index) => ({
                        label: dataset.label,
                        data: dataset.data,
                      }))}
                      height={250}
                    />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* 추세 탭 */}
            <TabsContent value="trends" className="p-0">
              <div className="p-6 space-y-6">
                {/* 감정 강도 추세 */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">감정 강도 추세</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <LineChart
                      labels={analysisData.emotionTrends.labels}
                      datasets={analysisData.emotionTrends.datasets.map((dataset) => ({
                        label: dataset.label,
                        data: dataset.data,
                      }))}
                      height={300}
                    />
                  </CardContent>
                </Card>

                {/* 에너지 레벨 추세 */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">에너지 레벨 추세</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <LineChart
                      labels={analysisData.energyLevelTrend.labels}
                      datasets={[
                        {
                          label: "에너지 레벨",
                          data: analysisData.energyLevelTrend.data,
                          borderColor: "#10b981", // emerald-500
                          backgroundColor: "#10b98133", // emerald-500 with 20% opacity
                        },
                      ]}
                      height={250}
                    />
                  </CardContent>
                </Card>

                {/* 감정 복잡도 추세 */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">감정 복잡도 추세</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <LineChart
                      labels={analysisData.emotionComplexity.labels}
                      datasets={[
                        {
                          label: "감정 복잡도",
                          data: analysisData.emotionComplexity.data,
                          borderColor: "#8b5cf6", // violet-500
                          backgroundColor: "#8b5cf633", // violet-500 with 20% opacity
                        },
                      ]}
                      height={250}
                    />
                  </CardContent>
                </Card>

                {/* 감정 변동성 추세 */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">감정 변동성 추세</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <LineChart
                      labels={analysisData.emotionVolatility.labels}
                      datasets={[
                        {
                          label: "감정 변동성",
                          data: analysisData.emotionVolatility.data,
                          borderColor: "#f97316", // orange-500
                          backgroundColor: "#f9731633", // orange-500 with 20% opacity
                        },
                      ]}
                      height={250}
                    />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* 패턴 탭 */}
            <TabsContent value="patterns" className="p-0">
              <div className="p-6 space-y-6">
                {/* 요일별 감정 패턴 */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">요일별 감정 패턴</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <BarChart
                      labels={analysisData.weekdayPattern.labels}
                      datasets={analysisData.weekdayPattern.datasets.map((dataset) => ({
                        label: dataset.label,
                        data: dataset.data,
                        backgroundColor:
                          dataset.label === "긍정" ? "#10b981" : dataset.label === "부정" ? "#ef4444" : "#3b82f6",
                      }))}
                      height={300}
                    />
                  </CardContent>
                </Card>

                {/* 시간대별 감정 패턴 */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">시간대별 감정 패턴</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <BarChart
                      labels={analysisData.timeOfDayPattern.labels}
                      datasets={analysisData.timeOfDayPattern.datasets.map((dataset) => ({
                        label: dataset.label,
                        data: dataset.data,
                        backgroundColor:
                          dataset.label === "긍정" ? "#10b981" : dataset.label === "부정" ? "#ef4444" : "#3b82f6",
                      }))}
                      height={300}
                    />
                  </CardContent>
                </Card>

                {/* 감정 레이더 차트 */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">감정 프로필</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <RadarChart
                      labels={analysisData.emotionDistribution.labels.slice(0, 8)}
                      datasets={[
                        {
                          label: "감정 강도",
                          data: analysisData.emotionDistribution.data.slice(0, 8),
                          backgroundColor: "rgba(59, 130, 246, 0.2)",
                          borderColor: "#3b82f6",
                        },
                      ]}
                      height={300}
                    />
                  </CardContent>
                </Card>

                {/* 상위 감정 조합 */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">상위 감정 조합</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {analysisData.topEmotionCombinations.length > 0 ? (
                      <BarChart
                        labels={analysisData.topEmotionCombinations.map((c) => c.combination)}
                        datasets={[
                          {
                            label: "빈도",
                            data: analysisData.topEmotionCombinations.map((c) => c.count),
                          },
                        ]}
                        horizontal={true}
                        height={300}
                      />
                    ) : (
                      <div className="flex justify-center items-center h-[300px] text-slate-500">
                        <p>감정 조합 데이터가 충분하지 않습니다.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* 인사이트 탭 */}
            <TabsContent value="insights" className="p-0">
              <div className="p-6 space-y-6">
                {/* 주요 인사이트 */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">주요 인사이트</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-4 bg-slate-50 rounded-lg">
                        <h3 className="font-medium mb-2 flex items-center">
                          <TrendingUp size={18} className="text-teal-600 mr-2" />
                          주요 감정
                        </h3>
                        <p className="text-sm text-slate-600">
                          {dateRangeText[dateRange]} 동안 가장 자주 느낀 감정은{" "}
                          <span className="font-medium text-teal-600">{analysisData.summary.dominantEmotion}</span>
                          입니다. 이 감정은 전체 기록의 약{" "}
                          {Math.round(
                            (analysisData.emotionDistribution.data[0] / analysisData.summary.totalRecords) * 100,
                          )}
                          %를 차지합니다.
                        </p>
                      </div>

                      <div className="p-4 bg-slate-50 rounded-lg">
                        <h3 className="font-medium mb-2 flex items-center">
                          <Activity size={18} className="text-purple-600 mr-2" />
                          감정 변동성
                        </h3>
                        <p className="text-sm text-slate-600">
                          {analysisData.summary.volatilityScore < 1
                            ? "감정 변동성이 낮은 편으로, 비교적 안정적인 감정 상태를 유지하고 있습니다."
                            : analysisData.summary.volatilityScore < 2
                              ? "감정 변동성이 보통 수준으로, 일상적인 감정 변화를 경험하고 있습니다."
                              : "감정 변동성이 높은 편으로, 감정의 기복이 다소 큰 상태입니다."}
                        </p>
                      </div>

                      <div className="p-4 bg-slate-50 rounded-lg">
                        <h3 className="font-medium mb-2 flex items-center">
                          <Zap size={18} className="text-amber-600 mr-2" />
                          에너지 패턴
                        </h3>
                        <p className="text-sm text-slate-600">
                          평균 에너지 레벨은 {Math.round(analysisData.summary.averageEnergy)}%입니다.
                          {analysisData.summary.averageEnergy < 40
                            ? " 에너지 레벨이 낮은 편으로, 충분한 휴식과 회복이 필요할 수 있습니다."
                            : analysisData.summary.averageEnergy < 70
                              ? " 에너지 레벨이 보통 수준으로 유지되고 있습니다."
                              : " 에너지 레벨이 높은 편으로, 활력이 넘치는 상태입니다."}
                        </p>
                      </div>

                      <div className="p-4 bg-slate-50 rounded-lg">
                        <h3 className="font-medium mb-2 flex items-center">
                          <Clock size={18} className="text-blue-600 mr-2" />
                          시간대별 패턴
                        </h3>
                        <p className="text-sm text-slate-600">
                          {(() => {
                            const timeData = analysisData.timeOfDayPattern.datasets[0].data
                            const maxIndex = timeData.indexOf(Math.max(...timeData))
                            const minIndex = timeData.indexOf(Math.min(...timeData))
                            return `긍정적인 감정은 주로 ${analysisData.timeOfDayPattern.labels[maxIndex]}에 높게 나타나고, ${analysisData.timeOfDayPattern.labels[minIndex]}에 낮게 나타납니다.`
                          })()}
                        </p>
                      </div>

                      <div className="p-4 bg-slate-50 rounded-lg">
                        <h3 className="font-medium mb-2 flex items-center">
                          <Calendar size={18} className="text-rose-600 mr-2" />
                          요일별 패턴
                        </h3>
                        <p className="text-sm text-slate-600">
                          {(() => {
                            const weekdayData = analysisData.weekdayPattern.datasets[0].data
                            const maxIndex = weekdayData.indexOf(Math.max(...weekdayData))
                            const minIndex = weekdayData.indexOf(Math.min(...weekdayData))
                            return `긍정적인 감정은 주로 ${analysisData.weekdayPattern.labels[maxIndex]}요일에 높게 나타나고, ${analysisData.weekdayPattern.labels[minIndex]}요일에 낮게 나타납니다.`
                          })()}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* 추천 사항 */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">맞춤 추천</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-4 bg-teal-50 rounded-lg border border-teal-100">
                        <h3 className="font-medium mb-2 text-teal-700">감정 관리 추천</h3>
                        <p className="text-sm text-teal-600">
                          {analysisData.summary.volatilityScore > 1.5
                            ? "감정 변동성이 높은 편입니다. 명상이나 심호흡과 같은 마음챙김 활동을 통해 감정을 안정시켜 보세요."
                            : analysisData.summary.positiveRatio < 40
                              ? "부정적인 감정의 비율이 높습니다. 감사 일기를 쓰거나 긍정적인 활동에 참여하여 긍정적인 감정을 늘려보세요."
                              : "감정 상태가 비교적 안정적입니다. 현재의 감정 관리 방식을 유지하면서 새로운 회복 활동을 시도해 보세요."}
                        </p>
                      </div>

                      <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
                        <h3 className="font-medium mb-2 text-purple-700">에너지 관리 추천</h3>
                        <p className="text-sm text-purple-600">
                          {analysisData.summary.averageEnergy < 40
                            ? "에너지 레벨이 낮은 편입니다. 충분한 수면과 가벼운 운동을 통해 에너지를 회복해 보세요."
                            : analysisData.summary.averageEnergy > 70
                              ? "에너지 레벨이 높은 편입니다. 이 에너지를 창의적인 활동이나 목표 달성에 활용해 보세요."
                              : "에너지 레벨이 적절히 유지되고 있습니다. 규칙적인 생활 패턴을 유지하면서 에너지를 효율적으로 사용해 보세요."}
                        </p>
                      </div>

                      <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                        <h3 className="font-medium mb-2 text-blue-700">시간대별 추천</h3>
                        <p className="text-sm text-blue-600">
                          {(() => {
                            const timeData = analysisData.timeOfDayPattern.datasets[0].data
                            const maxIndex = timeData.indexOf(Math.max(...timeData))
                            const minIndex = timeData.indexOf(Math.min(...timeData))
                            return `${analysisData.timeOfDayPattern.labels[maxIndex]}에 긍정적인 감정이 높게 나타납니다. 이 시간대에 중요한 활동이나 결정을 계획해 보세요. ${analysisData.timeOfDayPattern.labels[minIndex]}에는 가벼운 활동이나 휴식을 취하는 것이 좋습니다.`
                          })()}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* 액션 버튼 */}
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" className="flex-1">
                    <Download size={16} className="mr-2" /> 리포트 저장
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Share2 size={16} className="mr-2" /> 공유하기
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
