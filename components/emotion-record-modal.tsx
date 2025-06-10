"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import { type EmotionCategory, type EmotionIntensity, emotionColors, type EmotionRecord } from "@/types/emotion"
import { saveEmotionRecord } from "@/utils/emotion-storage"
import { useToast } from "@/hooks/use-toast"
import { X } from "lucide-react"

type EmotionRecordModalProps = {
  isOpen: boolean
  onClose: () => void
  onSaved?: () => void // 옵셔널로 변경
}

export function EmotionRecordModal({ isOpen, onClose, onSaved }: EmotionRecordModalProps) {
  const { toast } = useToast()
  const [selectedEmotions, setSelectedEmotions] = useState<
    { category: EmotionCategory; intensity: EmotionIntensity }[]
  >([])
  const [situation, setSituation] = useState("")
  const [note, setNote] = useState("")
  const [energyLevel, setEnergyLevel] = useState(50)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // 감정 카테고리 목록
  const negativeEmotions: EmotionCategory[] = [
    "불안",
    "분노",
    "슬픔",
    "무력감",
    "스트레스",
    "소진",
    "위화감",
    "불만",
    "혼란",
  ]

  const positiveEmotions: EmotionCategory[] = ["기쁨", "만족", "평온", "희망", "감사"]

  // 감정 선택 토글
  const toggleEmotion = (category: EmotionCategory) => {
    setSelectedEmotions((prev) => {
      const existing = prev.find((e) => e.category === category)
      if (existing) {
        // 이미 선택된 감정이면 강도 증가 또는 제거
        if (existing.intensity < 5) {
          return prev.map((e) =>
            e.category === category ? { ...e, intensity: (e.intensity + 1) as EmotionIntensity } : e,
          )
        } else {
          return prev.filter((e) => e.category !== category)
        }
      } else {
        // 새로운 감정 추가
        return [...prev, { category, intensity: 1 }]
      }
    })
  }

  // 감정 강도 표시
  const getIntensityDisplay = (intensity: EmotionIntensity) => {
    return "●".repeat(intensity) + "○".repeat(5 - intensity)
  }

  // 감정 기록 저장
  const handleSave = () => {
    if (selectedEmotions.length === 0) {
      toast({
        title: "감정을 선택해주세요",
        description: "최소 하나 이상의 감정을 선택해야 합니다.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // 새 감정 기록 생성
      const newRecord: EmotionRecord = {
        id: `emotion_${Date.now()}`,
        timestamp: Date.now(),
        emotions: selectedEmotions,
        situation,
        note,
        energyLevel,
      }

      // 저장
      saveEmotionRecord(newRecord)

      toast({
        title: "감정 기록 완료",
        description: "소중한 감정이 안전하게 기록되었습니다.",
      })

      // 초기화 및 닫기
      resetForm()
      if (onSaved)
        onSaved() // 옵셔널 체크 추가
      else onClose() // onSaved가 없으면 onClose 호출
    } catch (error) {
      console.error("감정 기록 저장 중 오류:", error)
      toast({
        title: "저장 실패",
        description: "감정 기록 중 문제가 발생했습니다. 다시 시도해주세요.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // 폼 초기화
  const resetForm = () => {
    setSelectedEmotions([])
    setSituation("")
    setNote("")
    setEnergyLevel(50)
  }

  // 모달 닫기
  const handleClose = () => {
    resetForm()
    onClose()
  }

  // 디버깅용 로그 추가
  console.log("EmotionRecordModal 렌더링:", { isOpen, selectedEmotions })

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>오늘의 감정 기록하기</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <h3 className="text-sm font-medium mb-2">지금 느끼는 감정은 무엇인가요?</h3>
            <div className="mb-2">
              <p className="text-xs text-slate-500 mb-1">부정적 감정</p>
              <div className="flex flex-wrap gap-2">
                {negativeEmotions.map((emotion) => {
                  const isSelected = selectedEmotions.some((e) => e.category === emotion)
                  const selectedEmotion = selectedEmotions.find((e) => e.category === emotion)
                  const colors = emotionColors[emotion]

                  return (
                    <Button
                      key={emotion}
                      variant="outline"
                      size="sm"
                      className={`rounded-full ${colors.bg} ${colors.border} ${colors.text} ${
                        colors.hover
                      } transition-all ${isSelected ? "ring-2 ring-offset-1 ring-teal-500" : ""}`}
                      onClick={() => toggleEmotion(emotion)}
                      type="button" // 명시적으로 button 타입 지정
                    >
                      {emotion}
                      {isSelected && (
                        <span className="ml-1 text-xs">
                          {getIntensityDisplay(selectedEmotion?.intensity as EmotionIntensity)}
                        </span>
                      )}
                    </Button>
                  )
                })}
              </div>
            </div>

            <div>
              <p className="text-xs text-slate-500 mb-1">긍정적 감정</p>
              <div className="flex flex-wrap gap-2">
                {positiveEmotions.map((emotion) => {
                  const isSelected = selectedEmotions.some((e) => e.category === emotion)
                  const selectedEmotion = selectedEmotions.find((e) => e.category === emotion)
                  const colors = emotionColors[emotion]

                  return (
                    <Button
                      key={emotion}
                      variant="outline"
                      size="sm"
                      className={`rounded-full ${colors.bg} ${colors.border} ${colors.text} ${
                        colors.hover
                      } transition-all ${isSelected ? "ring-2 ring-offset-1 ring-teal-500" : ""}`}
                      onClick={() => toggleEmotion(emotion)}
                      type="button" // 명시적으로 button 타입 지정
                    >
                      {emotion}
                      {isSelected && (
                        <span className="ml-1 text-xs">
                          {getIntensityDisplay(selectedEmotion?.intensity as EmotionIntensity)}
                        </span>
                      )}
                    </Button>
                  )
                })}
              </div>
            </div>

            {selectedEmotions.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                <p className="text-xs text-slate-500 mr-2">선택된 감정:</p>
                {selectedEmotions.map((emotion) => (
                  <div key={emotion.category} className="flex items-center bg-slate-100 rounded-full px-2 py-1 text-xs">
                    <span>
                      {emotion.category} ({emotion.intensity})
                    </span>
                    <button
                      className="ml-1 text-slate-500 hover:text-slate-700"
                      onClick={() => setSelectedEmotions((prev) => prev.filter((e) => e.category !== emotion.category))}
                      type="button" // 명시적으로 button 타입 지정
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <h3 className="text-sm font-medium mb-2">어떤 상황이었나요?</h3>
            <Textarea
              placeholder="예: 회의 중 상사가 내 의견을 무시했다"
              value={situation}
              onChange={(e) => setSituation(e.target.value)}
              className="resize-none"
              rows={2}
            />
          </div>

          <div>
            <h3 className="text-sm font-medium mb-2">더 자세히 기록하고 싶은 내용이 있나요?</h3>
            <Textarea
              placeholder="감정과 관련된 생각이나 느낌을 자유롭게 적어보세요"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="resize-none"
              rows={3}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium">현재 에너지 레벨</h3>
              <span className="text-sm font-medium text-teal-600">{energyLevel}%</span>
            </div>
            <Slider
              value={[energyLevel]}
              min={0}
              max={100}
              step={1}
              onValueChange={(value) => setEnergyLevel(value[0])}
              className="py-4"
            />
            <div className="flex justify-between text-xs text-slate-500">
              <span>매우 낮음</span>
              <span>보통</span>
              <span>매우 높음</span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isSubmitting} type="button">
            취소
          </Button>
          <Button onClick={handleSave} disabled={isSubmitting || selectedEmotions.length === 0} type="button">
            {isSubmitting ? "저장 중..." : "기록 저장하기"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
