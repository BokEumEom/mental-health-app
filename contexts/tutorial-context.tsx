"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

// 튜토리얼 단계 정의
export type TutorialStep = {
  id: string
  title: string
  description: string
  targetElement?: string // 하이라이트할 요소의 ID 또는 클래스
  position?: "top" | "right" | "bottom" | "left" // 툴팁 위치
}

// 튜토리얼 데이터
export const tutorialSteps: TutorialStep[] = [
  {
    id: "welcome",
    title: "마음퇴근에 오신 것을 환영합니다",
    description: "직장인의 감정 관리를 위한 앱, 마음퇴근을 시작해볼까요?",
    position: "bottom",
  },
  {
    id: "emotion-recorder",
    title: "감정 기록하기",
    description: "오늘의 감정을 기록하고 추적해보세요. 감정 기록은 자기 이해의 첫 걸음입니다.",
    targetElement: "emotion-recorder",
    position: "bottom",
  },
  {
    id: "recovery-mission",
    title: "회복 미션",
    description: "일상에서 실천할 수 있는 작은 회복 미션으로 감정 관리 능력을 키워보세요.",
    targetElement: "recovery-mission",
    position: "bottom",
  },
  {
    id: "chatbot",
    title: "AI 대화 도우미",
    description: "힘든 감정이 들 때 AI 대화 도우미와 대화하며 마음을 정리해보세요.",
    targetElement: "chatbot-tab",
    position: "bottom",
  },
  {
    id: "community",
    title: "공감 커뮤니티",
    description: "비슷한 경험을 가진 다른 직장인들과 이야기를 나누고 공감을 나눠보세요.",
    targetElement: "community-tab",
    position: "bottom",
  },
  {
    id: "emotion-calendar",
    title: "감정 캘린더",
    description: "기록된 감정을 캘린더에서 한눈에 확인하고 패턴을 분석해보세요.",
    targetElement: "calendar-tab",
    position: "bottom",
  },
  {
    id: "profile",
    title: "마이페이지",
    description: "회복 노트, 성장 배지, 저장한 글, 활동 기록 등 나만의 공간을 관리해보세요.",
    targetElement: "profile-tab",
    position: "bottom",
  },
  {
    id: "complete",
    title: "튜토리얼 완료!",
    description: "이제 마음퇴근의 모든 기능을 사용할 준비가 되었습니다. 감정 관리를 시작해볼까요?",
    position: "bottom",
  },
]

type TutorialContextType = {
  isFirstVisit: boolean
  isTutorialActive: boolean
  currentStepIndex: number
  startTutorial: () => void
  skipTutorial: () => void
  nextStep: () => void
  prevStep: () => void
  completeTutorial: () => void
  resetTutorial: () => void
}

const TutorialContext = createContext<TutorialContextType | undefined>(undefined)

export function TutorialProvider({ children }: { children: ReactNode }) {
  const [isFirstVisit, setIsFirstVisit] = useState(true)
  const [isTutorialActive, setIsTutorialActive] = useState(false)
  const [currentStepIndex, setCurrentStepIndex] = useState(0)

  // 첫 방문 여부 확인
  useEffect(() => {
    if (typeof window !== "undefined") {
      const visited = localStorage.getItem("tutorial_completed")
      setIsFirstVisit(visited !== "true")
    }
  }, [])

  // 첫 방문 시 자동으로 튜토리얼 시작
  useEffect(() => {
    if (isFirstVisit && !isTutorialActive) {
      // 약간의 지연 후 튜토리얼 시작 (앱 로딩 후)
      const timer = setTimeout(() => {
        startTutorial()
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [isFirstVisit, isTutorialActive])

  const startTutorial = () => {
    setCurrentStepIndex(0)
    setIsTutorialActive(true)
  }

  const skipTutorial = () => {
    setIsTutorialActive(false)
    if (isFirstVisit) {
      setIsFirstVisit(false)
      localStorage.setItem("tutorial_completed", "true")
    }
  }

  const nextStep = () => {
    if (currentStepIndex < tutorialSteps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1)
    } else {
      completeTutorial()
    }
  }

  const prevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1)
    }
  }

  const completeTutorial = () => {
    setIsTutorialActive(false)
    setIsFirstVisit(false)
    localStorage.setItem("tutorial_completed", "true")
  }

  const resetTutorial = () => {
    localStorage.removeItem("tutorial_completed")
    setIsFirstVisit(true)
    setCurrentStepIndex(0)
  }

  return (
    <TutorialContext.Provider
      value={{
        isFirstVisit,
        isTutorialActive,
        currentStepIndex,
        startTutorial,
        skipTutorial,
        nextStep,
        prevStep,
        completeTutorial,
        resetTutorial,
      }}
    >
      {children}
    </TutorialContext.Provider>
  )
}

export function useTutorial() {
  const context = useContext(TutorialContext)
  if (context === undefined) {
    throw new Error("useTutorial must be used within a TutorialProvider")
  }
  return context
}
