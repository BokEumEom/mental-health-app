"use client"

import { useState } from "react"
import { badgeRankColors, badgeTypeColors } from "@/types/achievement"
import { getBadgeById } from "@/data/badges"
import { Award, Star, Brain, Activity, Coffee, Flame, Heart, Users, MessageSquare, Trophy } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

type BadgeItemProps = {
  badgeId: string
  isUnlocked: boolean
  unlockedAt?: number
  progress?: number
  size?: "sm" | "md" | "lg"
}

export function BadgeItem({ badgeId, isUnlocked, unlockedAt, progress = 0, size = "md" }: BadgeItemProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const badge = getBadgeById(badgeId)

  if (!badge) return null

  const rankColors = badgeRankColors[badge.rank]
  const typeColors = badgeTypeColors[badge.type]

  // 배지 아이콘 선택
  const renderIcon = () => {
    const iconSize = size === "sm" ? 16 : size === "md" ? 24 : 32
    const iconProps = { size: iconSize, className: isUnlocked ? "text-slate-800" : "text-slate-400" }

    switch (badge.icon) {
      case "Award":
        return <Award {...iconProps} />
      case "Star":
        return <Star {...iconProps} />
      case "Brain":
        return <Brain {...iconProps} />
      case "Activity":
        return <Activity {...iconProps} />
      case "Coffee":
        return <Coffee {...iconProps} />
      case "Flame":
        return <Flame {...iconProps} />
      case "Heart":
        return <Heart {...iconProps} />
      case "Users":
        return <Users {...iconProps} />
      case "MessageSquare":
        return <MessageSquare {...iconProps} />
      case "Trophy":
        return <Trophy {...iconProps} />
      default:
        return <Award {...iconProps} />
    }
  }

  // 배지 크기 클래스
  const sizeClasses = {
    sm: "w-12 h-12",
    md: "w-16 h-16",
    lg: "w-20 h-20",
  }

  // 획득 날짜 포맷팅
  const formatDate = (timestamp: number) => {
    if (!timestamp) return ""
    const date = new Date(timestamp)
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <>
      <div
        className="flex flex-col items-center cursor-pointer"
        onClick={() => setIsDialogOpen(true)}
        title={badge.name}
      >
        <div
          className={`${sizeClasses[size]} rounded-full flex items-center justify-center ${
            isUnlocked ? rankColors.bg : "bg-slate-100"
          } ${isUnlocked ? rankColors.border : "border-slate-200"} border-2 ${
            isUnlocked ? rankColors.shadow : ""
          } shadow-md relative`}
        >
          {renderIcon()}

          {!isUnlocked && progress > 0 && (
            <div className="absolute bottom-0 left-0 w-full">
              <div className="h-1 bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-teal-500" style={{ width: `${progress}%` }}></div>
              </div>
            </div>
          )}
        </div>
        <span
          className={`mt-1 text-xs font-medium ${
            isUnlocked ? "text-slate-800" : "text-slate-400"
          } text-center line-clamp-1`}
        >
          {badge.name}
        </span>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>배지 정보</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col items-center p-4">
            <div
              className={`w-24 h-24 rounded-full flex items-center justify-center ${rankColors.bg} ${rankColors.border} border-2 ${rankColors.shadow} shadow-lg mb-4`}
            >
              {renderIcon()}
            </div>

            <h3 className="text-xl font-bold mb-1">{badge.name}</h3>
            <div
              className={`text-xs px-2 py-1 rounded-full ${typeColors.bg} ${typeColors.text} ${typeColors.border} border mb-3`}
            >
              {badge.type === "mission"
                ? "미션"
                : badge.type === "emotion"
                  ? "감정"
                  : badge.type === "streak"
                    ? "연속 달성"
                    : badge.type === "community"
                      ? "커뮤니티"
                      : "특별"}
              {" · "}
              {badge.rank === "bronze"
                ? "브론즈"
                : badge.rank === "silver"
                  ? "실버"
                  : badge.rank === "gold"
                    ? "골드"
                    : "플래티넘"}
            </div>

            <p className="text-center text-slate-600 mb-4">{badge.description}</p>

            <div className="w-full">
              <div className="text-sm font-medium mb-1">획득 조건</div>
              <p className="text-sm text-slate-600 mb-3">{badge.unlockCondition}</p>

              {isUnlocked ? (
                <div className="text-center text-teal-600 font-medium">
                  {formatDate(unlockedAt || 0)}에 획득했습니다!
                </div>
              ) : (
                <div className="w-full">
                  <div className="flex justify-between text-xs mb-1">
                    <span>진행률</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-teal-500" style={{ width: `${progress}%` }}></div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
