"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { JobRole, EmotionState, Situation } from "@/data/conversation-topics"
import type { UserProfile } from "@/utils/topic-recommender"

type UserProfileContextType = {
  userProfile: UserProfile
  updateJobRole: (jobRole: JobRole) => void
  addEmotion: (emotion: EmotionState) => void
  addSituation: (situation: Situation) => void
  resetProfile: () => void
}

const UserProfileContext = createContext<UserProfileContextType | undefined>(undefined)

export function UserProfileProvider({ children }: { children: ReactNode }) {
  // 로컬 스토리지에서 사용자 프로필 불러오기
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    if (typeof window !== "undefined") {
      const savedProfile = localStorage.getItem("userProfile")
      return savedProfile ? JSON.parse(savedProfile) : { recentEmotions: [], recentSituations: [] }
    }
    return { recentEmotions: [], recentSituations: [] }
  })

  // 프로필 변경 시 로컬 스토리지에 저장
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("userProfile", JSON.stringify(userProfile))
    }
  }, [userProfile])

  // 직무 업데이트
  const updateJobRole = (jobRole: JobRole) => {
    setUserProfile((prev) => ({ ...prev, jobRole }))
  }

  // 감정 추가 (최대 5개 유지)
  const addEmotion = (emotion: EmotionState) => {
    setUserProfile((prev) => {
      const emotions = prev.recentEmotions || []
      const updatedEmotions = [emotion, ...emotions.filter((e) => e !== emotion)].slice(0, 5)
      return { ...prev, recentEmotions: updatedEmotions }
    })
  }

  // 상황 추가 (최대 5개 유지)
  const addSituation = (situation: Situation) => {
    setUserProfile((prev) => {
      const situations = prev.recentSituations || []
      const updatedSituations = [situation, ...situations.filter((s) => s !== situation)].slice(0, 5)
      return { ...prev, recentSituations: updatedSituations }
    })
  }

  // 프로필 초기화
  const resetProfile = () => {
    setUserProfile({ recentEmotions: [], recentSituations: [] })
  }

  return (
    <UserProfileContext.Provider value={{ userProfile, updateJobRole, addEmotion, addSituation, resetProfile }}>
      {children}
    </UserProfileContext.Provider>
  )
}

// 커스텀 훅
export function useUserProfile() {
  const context = useContext(UserProfileContext)
  if (context === undefined) {
    throw new Error("useUserProfile must be used within a UserProfileProvider")
  }
  return context
}
