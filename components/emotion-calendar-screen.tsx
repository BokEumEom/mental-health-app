"use client"

import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"
import { EmotionCalendar } from "@/components/emotion-calendar"
import { useRouter } from "next/navigation"

export function EmotionCalendarScreen() {
  const router = useRouter()

  return (
    <div className="flex flex-col pb-20">
      <div className="p-4 border-b">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ChevronLeft size={20} />
          </Button>
          <h2 className="text-lg font-medium ml-2">감정 캘린더</h2>
        </div>
      </div>

      <div className="p-4">
        <EmotionCalendar />
      </div>
    </div>
  )
}
