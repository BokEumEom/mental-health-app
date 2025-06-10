"use client"

import { Button } from "@/components/ui/button"
import { HelpCircle } from "lucide-react"
import { useTutorial } from "@/contexts/tutorial-context"

export function TutorialButton() {
  const { startTutorial } = useTutorial()

  return (
    <Button
      variant="outline"
      size="icon"
      className="h-8 w-8 rounded-full"
      onClick={startTutorial}
      aria-label="튜토리얼 시작"
    >
      <HelpCircle size={16} />
    </Button>
  )
}
