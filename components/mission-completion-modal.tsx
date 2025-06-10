"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { CheckCircle2, Clock, Award } from "lucide-react"
import type { Mission, MissionCompletion, MissionStatus } from "@/types/mission"
import { saveMissionCompletion } from "@/utils/mission-storage"
import { checkAndAwardBadges } from "@/utils/achievement-storage"
import { useToast } from "@/hooks/use-toast"
import { BadgeNotification } from "@/components/badge-notification"

type MissionCompletionModalProps = {
  isOpen: boolean
  onClose: () => void
  mission: Mission | null
  onCompleted: () => void
}

export function MissionCompletionModal({ isOpen, onClose, mission, onCompleted }: MissionCompletionModalProps) {
  const { toast } = useToast()
  const [reflection, setReflection] = useState("")
  const [status, setStatus] = useState<MissionStatus>("완료")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [newBadgeId, setNewBadgeId] = useState<string | null>(null)

  if (!mission) return null

  // 미션 완료 저장
  const handleSave = () => {
    if (!mission) return

    setIsSubmitting(true)

    try {
      // 새 미션 완료 기록 생성
      const completion: MissionCompletion = {
        id: `completion_${Date.now()}`,
        missionId: mission.id,
        timestamp: Date.now(),
        status,
        reflection,
        pointsEarned: status === "완료" ? mission.points : Math.floor(mission.points / 2),
      }

      // 저장
      saveMissionCompletion(completion)

      // 배지 확인
      const newBadges = checkAndAwardBadges()

      // 새 배지가 있으면 알림 표시
      if (newBadges.length > 0) {
        setNewBadgeId(newBadges[0]) // 첫 번째 배지만 표시
      } else {
        // 토스트 메시지
        toast({
          title: status === "완료" ? "미션 완료!" : "부분 완료",
          description: `${completion.pointsEarned} 포인트가 적립되었습니다.`,
        })

        // 초기화 및 닫기
        handleCloseModal()
      }
    } catch (error) {
      console.error("미션 완료 저장 중 오류:", error)
      toast({
        title: "저장 실패",
        description: "미션 완료 기록 중 문제가 발생했습니다. 다시 시도해주세요.",
        variant: "destructive",
      })
      setIsSubmitting(false)
    }
  }

  // 모달 닫기
  const handleCloseModal = () => {
    setReflection("")
    setStatus("완료")
    setIsSubmitting(false)
    onClose()
    onCompleted()
  }

  // 배지 알림 닫기
  const handleBadgeNotificationClose = () => {
    setNewBadgeId(null)
    toast({
      title: status === "완료" ? "미션 완료!" : "부분 완료",
      description: `${status === "완료" ? mission.points : Math.floor(mission.points / 2)} 포인트가 적립되었습니다.`,
    })
    handleCloseModal()
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleCloseModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>미션 완료하기</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <h3 className="font-medium">{mission.title}</h3>
              <p className="text-sm text-slate-600">{mission.description}</p>

              <div className="flex items-center text-sm text-slate-500 mt-2">
                <Clock size={16} className="mr-1" />
                <span>예상 소요 시간: {mission.estimatedMinutes}분</span>
              </div>

              <div className="flex items-center text-sm text-teal-600 mt-1">
                <Award size={16} className="mr-1" />
                <span>획득 포인트: {mission.points}</span>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-medium">미션을 어떻게 수행하셨나요?</h4>
              <div className="flex space-x-2">
                <Button
                  variant={status === "완료" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatus("완료")}
                  className={status === "완료" ? "bg-teal-600 hover:bg-teal-700" : ""}
                >
                  <CheckCircle2 size={16} className="mr-1" /> 완전히 완료했어요
                </Button>
                <Button
                  variant={status === "진행중" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatus("진행중")}
                  className={status === "진행중" ? "bg-amber-600 hover:bg-amber-700" : ""}
                >
                  일부만 했어요
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-medium">미션을 통해 느낀 점이 있다면 기록해보세요 (선택)</h4>
              <Textarea
                placeholder="예: 5분 명상을 통해 마음이 한결 가벼워졌어요."
                value={reflection}
                onChange={(e) => setReflection(e.target.value)}
                className="resize-none"
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseModal} disabled={isSubmitting}>
              취소
            </Button>
            <Button onClick={handleSave} disabled={isSubmitting}>
              {isSubmitting ? "저장 중..." : "완료 기록하기"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {newBadgeId && <BadgeNotification badgeId={newBadgeId} onClose={handleBadgeNotificationClose} />}
    </>
  )
}
