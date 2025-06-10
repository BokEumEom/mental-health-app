"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle2, RefreshCw } from "lucide-react"
import { getRandomMission, completeMission, getMissionById } from "@/utils/mission-storage"
import { MissionCompletionModal } from "@/components/mission-completion-modal"
import type { Mission } from "@/types/mission"

export function RecoveryMission() {
  const [currentMission, setCurrentMission] = useState<Mission | null>(null)
  const [isCompletionModalOpen, setIsCompletionModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // 현재 미션 로드
  useEffect(() => {
    loadCurrentMission()
  }, [])

  const loadCurrentMission = () => {
    setIsLoading(true)
    try {
      // 로컬 스토리지에서 현재 미션 ID 가져오기
      const currentMissionId = localStorage.getItem("current_mission_id")

      if (currentMissionId) {
        // 기존 미션이 있으면 로드
        const mission = getMissionById(currentMissionId)
        if (mission) {
          setCurrentMission(mission)
          setIsLoading(false)
          return
        }
      }

      // 기존 미션이 없거나 찾을 수 없으면 새 미션 생성
      generateNewMission()
    } catch (error) {
      console.error("미션 로드 중 오류:", error)
      setIsLoading(false)
    }
  }

  const generateNewMission = () => {
    setIsLoading(true)
    try {
      const newMission = getRandomMission()
      setCurrentMission(newMission)
      localStorage.setItem("current_mission_id", newMission.id)
    } catch (error) {
      console.error("새 미션 생성 중 오류:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCompleteMission = () => {
    if (currentMission) {
      completeMission(currentMission.id)
      setIsCompletionModalOpen(true)
    }
  }

  const handleCloseCompletionModal = () => {
    setIsCompletionModalOpen(false)
    generateNewMission()
  }

  return (
    <>
      <Card id="recovery-mission" className="recovery-mission">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium">오늘의 회복 미션</h2>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-slate-500"
              onClick={generateNewMission}
              disabled={isLoading}
            >
              <RefreshCw size={16} />
            </Button>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center h-24">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
          ) : currentMission ? (
            <div className="mt-4">
              <div className="bg-slate-50 p-4 rounded-lg">
                <h3 className="font-medium text-base">{currentMission.title}</h3>
                <p className="text-sm text-slate-600 mt-2">{currentMission.description}</p>
              </div>

              <Button onClick={handleCompleteMission} className="w-full mt-4" variant="default">
                <CheckCircle2 size={16} className="mr-2" />
                미션 완료하기
              </Button>
            </div>
          ) : (
            <div className="text-center py-4 text-slate-500">
              <p>미션을 불러올 수 없습니다.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {currentMission && (
        <MissionCompletionModal
          isOpen={isCompletionModalOpen}
          onClose={handleCloseCompletionModal}
          mission={currentMission}
        />
      )}
    </>
  )
}
