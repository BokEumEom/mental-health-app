"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Clock, Award, ChevronDown, ChevronUp } from "lucide-react"
import { type Mission, missionCategoryColors, missionDifficultyColors } from "@/types/mission"
import { MissionCompletionModal } from "@/components/mission-completion-modal"

type MissionCardProps = {
  mission: Mission
  onCompleted: () => void
}

export function MissionCard({ mission, onCompleted }: MissionCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const categoryColors = missionCategoryColors[mission.category]
  const difficultyColors = missionDifficultyColors[mission.difficulty]

  return (
    <>
      <Card className={`border ${categoryColors.border}`}>
        <CardContent className="p-4">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-xs px-2 py-0.5 rounded-full ${categoryColors.bg} ${categoryColors.text}`}>
                  {mission.category}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${difficultyColors.bg} ${difficultyColors.text}`}>
                  {mission.difficulty}
                </span>
              </div>
              <h3 className="font-medium">{mission.title}</h3>
              <p className="text-sm text-slate-600 mt-1 line-clamp-2">{mission.description}</p>

              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center text-sm text-slate-500">
                  <Clock size={16} className="mr-1" />
                  <span>{mission.estimatedMinutes}분</span>
                </div>
                <div className="flex items-center text-sm text-teal-600">
                  <Award size={16} className="mr-1" />
                  <span>{mission.points} 포인트</span>
                </div>
              </div>

              {isExpanded && mission.tips && (
                <div className="mt-3 p-2 bg-slate-50 rounded-md">
                  <p className="text-xs text-slate-600">{mission.tips}</p>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-between items-center mt-3">
            <Button
              variant="ghost"
              size="sm"
              className="text-slate-500 p-0 h-8"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? (
                <>
                  접기 <ChevronUp size={16} className="ml-1" />
                </>
              ) : (
                <>
                  더보기 <ChevronDown size={16} className="ml-1" />
                </>
              )}
            </Button>

            <Button size="sm" className="bg-teal-600 hover:bg-teal-700" onClick={() => setIsModalOpen(true)}>
              <CheckCircle2 size={16} className="mr-1" /> 완료하기
            </Button>
          </div>
        </CardContent>
      </Card>

      <MissionCompletionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        mission={mission}
        onCompleted={() => {
          setIsModalOpen(false)
          onCompleted()
        }}
      />
    </>
  )
}
