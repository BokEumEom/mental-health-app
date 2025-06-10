"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { BadgeItem } from "@/components/badge-item"
import { getBadgeById } from "@/data/badges"
import { Confetti } from "@/components/confetti"

type BadgeNotificationProps = {
  badgeId: string
  onClose: () => void
}

export function BadgeNotification({ badgeId, onClose }: BadgeNotificationProps) {
  const [isOpen, setIsOpen] = useState(true)
  const [showConfetti, setShowConfetti] = useState(true)
  const badge = getBadgeById(badgeId)

  useEffect(() => {
    // 5초 후에 꽃가루 효과 중지
    const timer = setTimeout(() => {
      setShowConfetti(false)
    }, 5000)

    return () => clearTimeout(timer)
  }, [])

  if (!badge) return null

  const handleClose = () => {
    setIsOpen(false)
    onClose()
  }

  return (
    <>
      {showConfetti && <Confetti />}
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <div className="flex flex-col items-center p-6">
            <h2 className="text-2xl font-bold text-center mb-6">새로운 배지 획득!</h2>

            <div className="mb-6">
              <BadgeItem badgeId={badgeId} isUnlocked={true} unlockedAt={Date.now()} size="lg" />
            </div>

            <p className="text-center mb-6">{badge.description}</p>

            <Button onClick={handleClose} className="w-full">
              확인
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
