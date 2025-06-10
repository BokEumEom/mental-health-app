"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { BarChart } from "@/components/charts/bar-chart"
import { PieChart } from "@/components/charts/pie-chart"
import {
  generateEmotionPredictions,
  generateCopingStrategies,
  type PredictionPeriod,
  type EmotionPrediction,
} from "@/utils/emotion-prediction"
import { emotionColors } from "@/types/emotion"
import {
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Info,
  ChevronRight,
  ChevronLeft,
  Brain,
  Zap,
  Shield,
  RefreshCw,
} from "lucide-react"

export function EmotionPrediction() {
  const [predictionPeriod, setPredictionPeriod] = useState<PredictionPeriod>("week")
  const [predictions, setPredictions] = useState<EmotionPrediction[]>([])
  const [selectedDate, setSelectedDate] = useState<string>("")
  const [selectedPrediction, setSelectedPrediction] = useState<EmotionPrediction | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(0)
  const itemsPerPage = 7

  // 예측 데이터 로드
  useEffect(() => {
    loadPredictions()
  }, [predictionPeriod])

  // 선택된 날짜가 변경될 때 해당 예측 데이터 설정
  useEffect(() => {
    if (selectedDate && predictions.length > 0) {
      const prediction = predictions.find((p) => p.date === selectedDate) || null
      setSelectedPrediction(prediction)
    } else if (predictions.length > 0) {
      setSelectedDate(predictions[0].date)
      setSelectedPrediction(predictions[0])
    }
  }, [selectedDate, predictions])

  const loadPredictions = () => {
    setIsLoading(true)
    try {
      const data = generateEmotionPredictions(predictionPeriod)
      setPredictions(data)

      // 첫 번째 예측 선택
      if (data.length > 0) {
        setSelectedDate(data[0].date)
        setSelectedPrediction(data[0])
      }
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

  // 페이지네이션 처리
  const paginatedPredictions = predictions.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage)

  const totalPages = Math.ceil(predictions.length / itemsPerPage)

  // 다음 페이지로 이동
  const nextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1)
    }
  }

  // 이전 페이지로 이동
  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1)
    }
  }

  // 대응 전략 생성
  const copingStrategies = selectedPrediction ? generateCopingStrategies(selectedPrediction) : []

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6 flex justify-center items-center h-60">
          <p>감정 예측 데이터를 불러오는 중...</p>
        </CardContent>
      </Card>
    )
  }

  if (predictions.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 flex flex-col justify-center items-center h-60">
          <AlertTriangle size={40} className="text-amber-500 mb-4" />
          <h3 className="text-lg font-medium mb-2">예측 데이터를 생성할 수 없습니다</h3>
          <p className="text-center text-slate-500 mb-4">
            감정 예측을 위한 충분한 감정 기록이 없습니다. 더 많은 감정을 기록하면 예측 기능을 사용할 수 있습니다.
          </p>
          <Button variant="outline" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
            감정 기록하기
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle>감정 예측 리포트</CardTitle>
            <div className="flex items-center gap-2">
              <Select
                value={predictionPeriod}
                onValueChange={(value) => setPredictionPeriod(value as PredictionPeriod)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="예측 기간 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">1주일</SelectItem>
                  <SelectItem value="month">1개월</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon" onClick={loadPredictions}>
                <RefreshCw size={16} />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Tabs defaultValue="calendar">
            <div className="px-6">
              <TabsList className="grid grid-cols-2 mb-4">
                <TabsTrigger value="calendar">캘린더 뷰</TabsTrigger>
                <TabsTrigger value="list">리스트 뷰</TabsTrigger>
              </TabsList>
            </div>

            {/* 캘린더 뷰 */}
            <TabsContent value="calendar" className="p-0">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <Button variant="outline" size="sm" onClick={prevPage} disabled={currentPage === 0}>
                    <ChevronLeft size={16} className="mr-1" /> 이전
                  </Button>
                  <span className="text-sm">
                    {currentPage + 1} / {totalPages} 페이지
                  </span>
                  <Button variant="outline" size="sm" onClick={nextPage} disabled={currentPage >= totalPages - 1}>
                    다음 <ChevronRight size={16} className="ml-1" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-7 gap-2">
                  {paginatedPredictions.map((prediction) => (
                    <Card
                      key={prediction.date}
                      className={`cursor-pointer transition-all ${
                        selectedDate === prediction.date ? "ring-2 ring-teal-500 shadow-md" : "hover:shadow-md"
                      }`}
                      onClick={() => setSelectedDate(prediction.date)}
                    >
                      <CardContent className="p-3">
                        <div className="text-xs text-slate-500 mb-1">{formatDate(prediction.date)}</div>
                        <div className="flex items-center mb-2">
                          <div
                            className={`w-3 h-3 rounded-full mr-1 ${
                              emotionColors[prediction.dominantEmotion]?.bg || "bg-slate-100"
                            }`}
                          ></div>
                          <div className="text-sm font-medium truncate">{prediction.dominantEmotion}</div>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <div>에너지: {prediction.energyLevel}%</div>
                          <Badge variant="outline" className={`text-xs ${getConfidenceColor(prediction.confidence)}`}>
                            {getConfidenceText(prediction.confidence)}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* 리스트 뷰 */}
            <TabsContent value="list" className="p-0">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <Button variant="outline" size="sm" onClick={prevPage} disabled={currentPage === 0}>
                    <ChevronLeft size={16} className="mr-1" /> 이전
                  </Button>
                  <span className="text-sm">
                    {currentPage + 1} / {totalPages} 페이지
                  </span>
                  <Button variant="outline" size="sm" onClick={nextPage} disabled={currentPage >= totalPages - 1}>
                    다음 <ChevronRight size={16} className="ml-1" />
                  </Button>
                </div>

                <div className="space-y-2">
                  {paginatedPredictions.map((prediction) => (
                    <Card
                      key={prediction.date}
                      className={`cursor-pointer transition-all ${
                        selectedDate === prediction.date ? "ring-2 ring-teal-500 shadow-md" : "hover:shadow-md"
                      }`}
                      onClick={() => setSelectedDate(prediction.date)}
                    >
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="text-sm font-medium mb-1">{formatDate(prediction.date)}</div>
                            <div className="flex items-center mb-1">
                              <div
                                className={`w-3 h-3 rounded-full mr-1 ${
                                  emotionColors[prediction.dominantEmotion]?.bg || "bg-slate-100"
                                }`}
                              ></div>
                              <div className="text-sm">
                                주요 감정: <span className="font-medium">{prediction.dominantEmotion}</span>
                              </div>
                            </div>
                            <div className="text-sm">
                              에너지 레벨: <span className="font-medium">{prediction.energyLevel}%</span>
                            </div>
                          </div>
                          <Badge variant="outline" className={getConfidenceColor(prediction.confidence)}>
                            신뢰도: {getConfidenceText(prediction.confidence)}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* 선택된 날짜의 예측 상세 정보 */}
      {selectedPrediction && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>{formatDate(selectedPrediction.date)} 예측 상세</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {/* 예측 요약 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center text-slate-500 mb-2">
                    <Brain size={16} className="mr-1" />
                    <span className="text-xs">주요 감정</span>
                  </div>
                  <div className="flex items-center">
                    <div
                      className={`w-4 h-4 rounded-full mr-2 ${
                        emotionColors[selectedPrediction.dominantEmotion]?.bg || "bg-slate-100"
                      }`}
                    ></div>
                    <div className="text-xl font-bold">{selectedPrediction.dominantEmotion}</div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center text-slate-500 mb-2">
                    <Zap size={16} className="mr-1" />
                    <span className="text-xs">에너지 레벨</span>
                  </div>
                  <div className="space-y-2">
                    <div className="text-xl font-bold">{selectedPrediction.energyLevel}%</div>
                    <Progress value={selectedPrediction.energyLevel} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center text-slate-500 mb-2">
                    <Shield size={16} className="mr-1" />
                    <span className="text-xs">예측 신뢰도</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <div className="text-xl font-bold mr-2">{selectedPrediction.confidenceScore}%</div>
                      <Badge variant="outline" className={getConfidenceColor(selectedPrediction.confidence)}>
                        {getConfidenceText(selectedPrediction.confidence)}
                      </Badge>
                    </div>
                    <Progress value={selectedPrediction.confidenceScore} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 예측 근거 */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center text-slate-700 mb-2">
                  <Info size={16} className="mr-1" />
                  <span className="font-medium">예측 근거</span>
                </div>
                <p className="text-sm text-slate-600">{selectedPrediction.basis}</p>
              </CardContent>
            </Card>

            {/* 감정 분포 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">예측된 감정 분포</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[250px]">
                    <PieChart
                      labels={selectedPrediction.emotionDistribution.map((e) => e.category)}
                      data={selectedPrediction.emotionDistribution.map((e) => e.probability)}
                      colors={selectedPrediction.emotionDistribution.map(
                        (e) => emotionColors[e.category]?.text.replace("text-", "rgb(") + ")",
                      )}
                      doughnut={true}
                      height={250}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">감정 확률 분포</CardTitle>
                </CardHeader>
                <CardContent>
                  <BarChart
                    labels={selectedPrediction.emotionDistribution.map((e) => e.category)}
                    datasets={[
                      {
                        label: "확률",
                        data: selectedPrediction.emotionDistribution.map((e) => e.probability),
                      },
                    ]}
                    height={250}
                    horizontal={true}
                  />
                </CardContent>
              </Card>
            </div>

            {/* 대응 전략 */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">맞춤 대응 전략</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {copingStrategies.map((strategy, index) => (
                    <div key={index} className="p-4 bg-slate-50 rounded-lg">
                      <h3 className="font-medium mb-2 flex items-center">
                        <TrendingUp size={18} className="text-teal-600 mr-2" />
                        {strategy.title}
                      </h3>
                      <p className="text-sm text-slate-600 mb-3">{strategy.description}</p>
                      <ul className="space-y-2">
                        {strategy.actionItems.map((item, itemIndex) => (
                          <li key={itemIndex} className="flex items-start">
                            <CheckCircle size={16} className="text-teal-500 mr-2 mt-0.5" />
                            <span className="text-sm">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
