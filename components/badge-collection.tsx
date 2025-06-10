"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BadgeItem } from "@/components/badge-item"
import { getUserBadges } from "@/utils/achievement-storage"
import { badges, getBadgesByType } from "@/data/badges"
import type { BadgeType, UserBadge } from "@/types/achievement"

export function BadgeCollection() {
  const [userBadges, setUserBadges] = useState<UserBadge[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<BadgeType>("mission")

  // 배지 데이터 로드
  useEffect(() => {
    loadBadges()
  }, [])

  const loadBadges = () => {
    setIsLoading(true)
    try {
      const badges = getUserBadges()
      setUserBadges(badges)
    } catch (error) {
      console.error("배지 로드 중 오류:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // 배지 타입별 필터링
  const filteredBadges = getBadgesByType(activeTab)

  // 획득한 배지 수
  const unlockedCount = userBadges.filter(
    (userBadge) => userBadge.unlockedAt > 0 && badges.some((b) => b.id === userBadge.badgeId && b.type === activeTab),
  ).length

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6 flex justify-center items-center h-40">
          <p>배지를 불러오는 중...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>나의 배지 컬렉션</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <Tabs defaultValue="mission" onValueChange={(value) => setActiveTab(value as BadgeType)}>
          <TabsList className="grid grid-cols-5 mb-4">
            <TabsTrigger value="mission">미션</TabsTrigger>
            <TabsTrigger value="emotion">감정</TabsTrigger>
            <TabsTrigger value="streak">연속</TabsTrigger>
            <TabsTrigger value="community">커뮤니티</TabsTrigger>
            <TabsTrigger value="special">특별</TabsTrigger>
          </TabsList>

          <div className="text-xs text-slate-500 mb-4">
            {unlockedCount}/{filteredBadges.length} 획득 ({Math.round((unlockedCount / filteredBadges.length) * 100)}%)
          </div>

          <div className="grid grid-cols-3 gap-4">
            {filteredBadges.map((badge) => {
              const userBadge = userBadges.find((ub) => ub.badgeId === badge.id)
              const isUnlocked = userBadge?.unlockedAt ? userBadge.unlockedAt > 0 : false
              const progress = userBadge?.progress || 0

              return (
                <BadgeItem
                  key={badge.id}
                  badgeId={badge.id}
                  isUnlocked={isUnlocked}
                  unlockedAt={userBadge?.unlockedAt}
                  progress={progress}
                />
              )
            })}
          </div>
        </Tabs>
      </CardContent>
    </Card>
  )
}
