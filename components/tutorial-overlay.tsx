"use client"

import { useState, useEffect, useRef } from "react"
import { useTutorial, tutorialSteps } from "@/contexts/tutorial-context"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight, X } from "lucide-react"

export function TutorialOverlay() {
  const { isTutorialActive, currentStepIndex, nextStep, prevStep, skipTutorial, completeTutorial } = useTutorial()

  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 })
  const tooltipRef = useRef<HTMLDivElement>(null)

  const currentStep = tutorialSteps[currentStepIndex]
  const isFirstStep = currentStepIndex === 0
  const isLastStep = currentStepIndex === tutorialSteps.length - 1

  // 타겟 요소 위치에 따라 툴팁 위치 계산
  useEffect(() => {
    if (!isTutorialActive || !currentStep) return

    const positionTooltip = () => {
      if (!currentStep.targetElement) {
        // 타겟 요소가 없는 경우 화면 중앙에 표시
        setTooltipPosition({
          top: window.innerHeight / 2 - 100,
          left: window.innerWidth / 2 - 150,
        })
        return
      }

      const targetElement = document.querySelector(`#${currentStep.targetElement}, .${currentStep.targetElement}`)

      if (!targetElement || !tooltipRef.current) return

      const targetRect = targetElement.getBoundingClientRect()
      const tooltipRect = tooltipRef.current.getBoundingClientRect()

      let top = 0
      let left = 0

      // 위치 계산 (position 속성에 따라)
      switch (currentStep.position) {
        case "top":
          top = targetRect.top - tooltipRect.height - 10
          left = targetRect.left + targetRect.width / 2 - tooltipRect.width / 2
          break
        case "right":
          top = targetRect.top + targetRect.height / 2 - tooltipRect.height / 2
          left = targetRect.right + 10
          break
        case "bottom":
          top = targetRect.bottom + 10
          left = targetRect.left + targetRect.width / 2 - tooltipRect.width / 2
          break
        case "left":
          top = targetRect.top + targetRect.height / 2 - tooltipRect.height / 2
          left = targetRect.left - tooltipRect.width - 10
          break
        default:
          top = targetRect.bottom + 10
          left = targetRect.left + targetRect.width / 2 - tooltipRect.width / 2
      }

      // 화면 경계 체크
      if (left < 10) left = 10
      if (left + tooltipRect.width > window.innerWidth - 10) left = window.innerWidth - tooltipRect.width - 10
      if (top < 10) top = 10
      if (top + tooltipRect.height > window.innerHeight - 10) top = window.innerHeight - tooltipRect.height - 10

      setTooltipPosition({ top, left })
    }

    // 초기 위치 설정
    setTimeout(positionTooltip, 100)

    // 화면 크기 변경 시 위치 재계산
    window.addEventListener("resize", positionTooltip)
    return () => window.removeEventListener("resize", positionTooltip)
  }, [isTutorialActive, currentStep, currentStepIndex])

  if (!isTutorialActive) return null

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      {/* 반투명 오버레이 */}
      <div className="absolute inset-0 bg-black/50 pointer-events-auto" />

      {/* 타겟 요소 하이라이트 */}
      {currentStep.targetElement && <HighlightElement elementSelector={currentStep.targetElement} />}

      {/* 툴팁 */}
      <AnimatePresence mode="wait">
        <motion.div
          ref={tooltipRef}
          key={currentStep.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="absolute bg-white rounded-lg shadow-lg p-4 w-[300px] pointer-events-auto"
          style={{
            top: `${tooltipPosition.top}px`,
            left: `${tooltipPosition.left}px`,
          }}
        >
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-bold text-lg">{currentStep.title}</h3>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={skipTutorial}>
              <X size={16} />
            </Button>
          </div>

          <p className="text-sm text-gray-600 mb-4">{currentStep.description}</p>

          <div className="flex justify-between items-center">
            <div className="flex space-x-1">
              {tutorialSteps.map((_, index) => (
                <div
                  key={index}
                  className={`h-1.5 w-1.5 rounded-full ${index === currentStepIndex ? "bg-primary" : "bg-gray-300"}`}
                />
              ))}
            </div>

            <div className="flex space-x-2">
              {!isFirstStep && (
                <Button variant="outline" size="sm" onClick={prevStep} className="h-8">
                  <ChevronLeft size={16} className="mr-1" />
                  이전
                </Button>
              )}

              {isLastStep ? (
                <Button variant="default" size="sm" onClick={completeTutorial} className="h-8">
                  완료
                </Button>
              ) : (
                <Button variant="default" size="sm" onClick={nextStep} className="h-8">
                  다음
                  <ChevronRight size={16} className="ml-1" />
                </Button>
              )}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

// 타겟 요소 하이라이트 컴포넌트
function HighlightElement({ elementSelector }: { elementSelector: string }) {
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0, height: 0 })

  useEffect(() => {
    const updatePosition = () => {
      const element = document.querySelector(`#${elementSelector}, .${elementSelector}`)

      if (!element) return

      const rect = element.getBoundingClientRect()
      setPosition({
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
      })
    }

    updatePosition()
    window.addEventListener("resize", updatePosition)
    return () => window.removeEventListener("resize", updatePosition)
  }, [elementSelector])

  return (
    <div
      className="absolute border-2 border-primary rounded-lg pointer-events-none"
      style={{
        top: `${position.top - 4}px`,
        left: `${position.left - 4}px`,
        width: `${position.width + 8}px`,
        height: `${position.height + 8}px`,
        boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.5)",
      }}
    >
      <div className="absolute inset-0 bg-primary/10 rounded-lg" />
    </div>
  )
}
