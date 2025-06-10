"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import { EmotionRecordModal } from "@/components/emotion-record-modal"
import { getRecentEmotionRecords, getTodayEmotionRecords } from "@/utils/emotion-storage"
import { type EmotionCategory, emotionColors } from "@/types/emotion"
import { useToast } from "@/hooks/use-toast"

export function EmotionRecorder() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [recentEmotions, setRecentEmotions] = useState<EmotionCategory[]>([])
  const [hasTodayRecord, setHasTodayRecord] = useState(false)
  const { toast } = useToast()

  // 최근 감정 및 오늘 기록 여부 로드
  useEffect(() => {
    loadRecentEmotions()
  }, [])

  // 최근 감정 로드
  const loadRecentEmotions = () => {
    try {
      // 디버깅 로그 추가
      console.log("loadRecentEmotions 호출됨")

      // 최근 기록에서 감정 추출
      const recentRecords = getRecentEmotionRecords(3)
      console.log("최근 기록:", recentRecords)

      const emotions = new Set<EmotionCategory>()

      recentRecords.forEach((record) => {
        record.emotions.forEach((emotion) => {
          emotions.add(emotion.category)
        })
      })

      setRecentEmotions(Array.from(emotions).slice(0, 5))

      // 오늘 기록 여부 확인
      const todayRecords = getTodayEmotionRecords()
      console.log("오늘 기록:", todayRecords)
      setHasTodayRecord(todayRecords.length > 0)
    } catch (error) {
      console.error("감정 기록 로드 중 오류:", error)
      toast({
        title: "감정 기록 로드 실패",
        description: "감정 기록을 불러오는 중 문제가 발생했습니다.",
        variant: "destructive",
      })
    }
  }

  // 모달 열기
  const openModal = () => {
    console.log("모달 열기")
    setIsModalOpen(true)
  }

  // 모달 닫기
  const closeModal = () => {
    console.log("모달 닫기")
    setIsModalOpen(false)
  }

  // 감정 기록 저장 후 처리
  const handleSaved = () => {
    console.log("감정 기록 저장됨")
    setIsModalOpen(false)
    loadRecentEmotions()

    // 오늘 첫 기록인 경우 특별 메시지
    if (!hasTodayRecord) {
      toast({
        title: "오늘의 첫 감정 기록 완료!",
        description: "감정을 기록하는 습관이 마음 건강에 도움이 됩니다.",
      })
      setHasTodayRecord(true)
    }
  }

  // 디버깅용 로그 추가
  console.log("EmotionRecorder 렌더링:", { isModalOpen, recentEmotions, hasTodayRecord })

  return (
    <>
      <Card id="emotion-recorder" className="border-dashed border-slate-300 bg-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium">오늘의 감정 기록</h2>
            {hasTodayRecord && (
              <span className="text-xs bg-teal-100 text-teal-800 px-2 py-1 rounded-full">오늘 기록됨</span>
            )}
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            {recentEmotions.length > 0 ? (
              recentEmotions.map((emotion) => {
                const colors = emotionColors[emotion]
                return (
                  <Button
                    key={emotion}
                    variant="outline"
                    size="sm"
                    className={`rounded-full ${colors.bg} ${colors.border} ${colors.text} ${colors.hover}`}
                  >
                    {emotion}
                  </Button>
                )
              })
            ) : (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100"
                >
                  답답함
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100"
                >
                  무력감
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
                >
                  불안
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100"
                >
                  위화감
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                >
                  + 더보기
                </Button>
              </>
            )}
          </div>

          <Button className="w-full bg-teal-600 hover:bg-teal-700" onClick={openModal}>
            <PlusCircle size={16} className="mr-2" />
            오늘 있었던 일 기록하기
          </Button>
        </CardContent>
      </Card>

      <EmotionRecordModal isOpen={isModalOpen} onClose={closeModal} onSaved={handleSaved} />
    </>
  )
}
