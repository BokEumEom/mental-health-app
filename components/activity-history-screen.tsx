"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChevronLeft, Calendar, FileText, Award, Star, MessageSquare, Heart, Bookmark, TrendingUp } from "lucide-react"
import { getActivitiesByUserId } from "@/utils/activity-storage"
import { getCurrentUser } from "@/utils/community-storage"
import type { Activity, ActivityType } from "@/types/activity"
import { useToast } from "@/hooks/use-toast"

export function ActivityHistoryScreen({ onBack }: { onBack: () => void }) {
  const [activities, setActivities] = useState<Activity[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"all" | ActivityType>("all")
  const { toast } = useToast()

  // 활동 기록 로드
  useEffect(() => {
    loadActivities()
  }, [])

  const loadActivities = () => {
    setIsLoading(true)
    try {
      const userId = getCurrentUser()
      const userActivities = getActivitiesByUserId(userId)
      setActivities(userActivities)
    } catch (error) {
      console.error("활동 기록 로드 중 오류:", error)
      toast({
        title: "활동 기록 로드 실패",
        description: "활동 기록을 불러오는 중 문제가 발생했습니다.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // 필터링된 활동 기록
  const filteredActivities = activities.filter((activity) => {
    if (activeTab === "all") return true
    return activity.type === activeTab
  })

  // 활동 타입별 아이콘 및 색상
  const getActivityIcon = (type: ActivityType) => {
    switch (type) {
      case "emotion_record":
        return <FileText size={16} className="text-teal-500" />
      case "mission_complete":
        return <Star size={16} className="text-amber-500" />
      case "post_create":
        return <MessageSquare size={16} className="text-blue-500" />
      case "post_like":
        return <Heart size={16} className="text-rose-500" />
      case "post_comment":
        return <MessageSquare size={16} className="text-purple-500" />
      case "post_bookmark":
        return <Bookmark size={16} className="text-indigo-500" />
      case "badge_earn":
        return <Award size={16} className="text-amber-500" />
      case "level_up":
        return <TrendingUp size={16} className="text-emerald-500" />
      default:
        return <Calendar size={16} className="text-slate-500" />
    }
  }

  // 활동 타입별 배지 텍스트
  const getActivityBadgeText = (type: ActivityType) => {
    switch (type) {
      case "emotion_record":
        return "감정 기록"
      case "mission_complete":
        return "미션 완료"
      case "post_create":
        return "글 작성"
      case "post_like":
        return "좋아요"
      case "post_comment":
        return "댓글 작성"
      case "post_bookmark":
        return "글 저장"
      case "badge_earn":
        return "배지 획득"
      case "level_up":
        return "레벨 업"
      default:
        return "활동"
    }
  }

  // 활동 타입별 배지 색상
  const getActivityBadgeColor = (type: ActivityType) => {
    switch (type) {
      case "emotion_record":
        return "bg-teal-100 text-teal-800"
      case "mission_complete":
        return "bg-amber-100 text-amber-800"
      case "post_create":
        return "bg-blue-100 text-blue-800"
      case "post_like":
        return "bg-rose-100 text-rose-800"
      case "post_comment":
        return "bg-purple-100 text-purple-800"
      case "post_bookmark":
        return "bg-indigo-100 text-indigo-800"
      case "badge_earn":
        return "bg-amber-100 text-amber-800"
      case "level_up":
        return "bg-emerald-100 text-emerald-800"
      default:
        return "bg-slate-100 text-slate-800"
    }
  }

  // 날짜 포맷팅
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // 날짜별 그룹화
  const groupActivitiesByDate = (activities: Activity[]) => {
    const groups: { [key: string]: Activity[] } = {}

    activities.forEach((activity) => {
      const date = new Date(activity.createdAt)
      const dateKey = date.toLocaleDateString("ko-KR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })

      if (!groups[dateKey]) {
        groups[dateKey] = []
      }

      groups[dateKey].push(activity)
    })

    return groups
  }

  const groupedActivities = groupActivitiesByDate(filteredActivities)

  return (
    <div className="flex flex-col pb-20">
      <div className="p-4 border-b">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ChevronLeft size={20} />
          </Button>
          <h2 className="text-lg font-medium ml-2">활동 기록</h2>
        </div>
      </div>

      <div className="p-4 space-y-4">
        <Tabs defaultValue="all" onValueChange={(value) => setActiveTab(value as "all" | ActivityType)}>
          <TabsList className="grid grid-cols-4">
            <TabsTrigger value="all">전체</TabsTrigger>
            <TabsTrigger value="emotion_record">감정</TabsTrigger>
            <TabsTrigger value="mission_complete">미션</TabsTrigger>
            <TabsTrigger value="post_create">커뮤니티</TabsTrigger>
          </TabsList>
        </Tabs>

        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <p>활동 기록을 불러오는 중...</p>
          </div>
        ) : filteredActivities.length === 0 ? (
          <div className="flex flex-col justify-center items-center h-40">
            <p className="text-slate-500 mb-2">활동 기록이 없습니다.</p>
            <Button variant="outline" size="sm" onClick={onBack}>
              마이페이지로 돌아가기
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedActivities).map(([date, dateActivities]) => (
              <div key={date} className="space-y-2">
                <div className="flex items-center">
                  <Calendar size={14} className="text-slate-400 mr-2" />
                  <h3 className="text-sm font-medium text-slate-600">{date}</h3>
                </div>

                <Card>
                  <CardContent className="p-0">
                    <div className="divide-y">
                      {dateActivities.map((activity) => (
                        <div key={activity.id} className="p-3">
                          <div className="flex items-start">
                            <div className="mt-1 mr-3">{getActivityIcon(activity.type)}</div>
                            <div className="flex-1">
                              <div className="flex items-center mb-1">
                                <Badge className={`mr-2 text-xs ${getActivityBadgeColor(activity.type)}`}>
                                  {getActivityBadgeText(activity.type)}
                                </Badge>
                                <span className="text-xs text-slate-400">
                                  {new Date(activity.createdAt).toLocaleTimeString("ko-KR", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </span>
                              </div>
                              <p className="text-sm font-medium">{activity.title}</p>
                              {activity.description && (
                                <p className="text-xs text-slate-600 mt-1">{activity.description}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
