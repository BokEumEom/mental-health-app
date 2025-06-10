"use client"

import { useState, useEffect } from "react"
import { EmotionStats } from "@/components/emotion-stats"
import { EmotionRecorder } from "@/components/emotion-recorder"
import { RecoveryMission } from "@/components/recovery-mission"
import { EmotionHistory } from "@/components/emotion-history"
import { EmotionAnalysisSummary } from "@/components/emotion-analysis-summary"
import { EmotionPredictionSummary } from "@/components/emotion-prediction-summary"
import { EmotionCalendarSummary } from "@/components/emotion-calendar-summary"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRight, Heart } from "lucide-react"
import { useRouter } from "next/navigation"
import { filterPosts } from "@/utils/community-storage"
import type { Post } from "@/types/community"

export function HomeScreen() {
  const router = useRouter()
  const [communityPosts, setCommunityPosts] = useState<Post[]>([])

  // 커뮤니티 게시물 로드
  useEffect(() => {
    loadCommunityPosts()
  }, [])

  const loadCommunityPosts = () => {
    try {
      // 인기 게시물 2개 가져오기
      const posts = filterPosts({ sortBy: "popular" }).slice(0, 2)
      setCommunityPosts(posts)
    } catch (error) {
      console.error("커뮤니티 게시물 로드 중 오류:", error)
    }
  }

  // 커뮤니티 탭으로 이동
  const goToCommunity = () => {
    const tabsElement = document.querySelector('[value="community"]') as HTMLElement
    if (tabsElement) {
      tabsElement.click()
    }
  }

  return (
    <div className="flex flex-col p-4 pb-20 gap-6">
      {/* 오늘의 감정 상태 */}
      <EmotionStats />

      {/* 감정 기록하기 */}
      <EmotionRecorder />

      {/* 오늘의 회복 미션 */}
      <RecoveryMission />

      {/* 감정 분석 요약 */}
      <EmotionAnalysisSummary />

      {/* 감정 예측 요약 */}
      <EmotionPredictionSummary />

      {/* 감정 캘린더 요약 */}
      <EmotionCalendarSummary />

      {/* 공감 커뮤니티 */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium">공감 커뮤니티</h2>
            <Button variant="ghost" size="sm" className="text-slate-500 p-0 h-auto" onClick={goToCommunity}>
              더보기 <ArrowRight size={16} className="ml-1" />
            </Button>
          </div>

          <div className="space-y-4">
            {communityPosts.length > 0 ? (
              communityPosts.map((post) => (
                <div key={post.id} className="p-3 bg-slate-50 rounded-lg" onClick={goToCommunity}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">
                      {post.authorJob ? `${post.authorJob} • ${post.authorLevel}` : post.authorName}
                    </span>
                    <div className="flex items-center text-xs text-rose-500">
                      <Heart size={12} className="mr-1" /> {post.likeCount}
                    </div>
                  </div>
                  <p className="mt-2 text-sm font-medium">{post.title}</p>
                  <p className="mt-1 text-xs text-slate-600 line-clamp-2">{post.content}</p>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-slate-500">
                <p>커뮤니티 게시물을 불러오는 중...</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 감정 기록 히스토리 */}
      <EmotionHistory />
    </div>
  )
}
