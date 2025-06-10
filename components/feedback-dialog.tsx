"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import type { FeedbackCategory, FeedbackRating } from "@/types/feedback"
import { saveFeedback } from "@/utils/feedback-storage"
import { ThumbsUp, ThumbsDown, Minus, Send } from "lucide-react"

interface FeedbackDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  conversationId: string
  messageId: string
  userQuery: string
  aiResponse: string
}

export function FeedbackDialog({
  open,
  onOpenChange,
  conversationId,
  messageId,
  userQuery,
  aiResponse,
}: FeedbackDialogProps) {
  const [rating, setRating] = useState<FeedbackRating | null>(null)
  const [selectedCategories, setSelectedCategories] = useState<FeedbackCategory[]>([])
  const [comment, setComment] = useState("")
  const [submitted, setSubmitted] = useState(false)

  // 카테고리 토글
  const toggleCategory = (category: FeedbackCategory) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter((c) => c !== category))
    } else {
      setSelectedCategories([...selectedCategories, category])
    }
  }

  // 피드백 제출
  const handleSubmit = () => {
    if (!rating) return

    const feedback = {
      id: `feedback_${Date.now()}`,
      userId: "current_user", // 실제 구현에서는 사용자 ID를 사용
      conversationId,
      messageId,
      rating,
      categories: selectedCategories.length > 0 ? selectedCategories : undefined,
      comment: comment.trim() || undefined,
      timestamp: Date.now(),
      userQuery,
      aiResponse,
    }

    saveFeedback(feedback)
    setSubmitted(true)
  }

  // 다이얼로그 닫기
  const handleClose = () => {
    if (submitted) {
      // 제출 후 상태 초기화
      setRating(null)
      setSelectedCategories([])
      setComment("")
      setSubmitted(false)
    }
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{submitted ? "피드백이 제출되었습니다" : "응답 품질 피드백"}</DialogTitle>
        </DialogHeader>

        {submitted ? (
          <div className="py-6 text-center">
            <p className="mb-4">소중한 의견 감사합니다. 더 나은 서비스를 제공하기 위해 노력하겠습니다.</p>
            <Button onClick={handleClose}>닫기</Button>
          </div>
        ) : (
          <>
            <div className="space-y-4 py-4">
              {/* 평가 버튼 */}
              <div className="space-y-2">
                <Label>이 응답이 도움이 되었나요?</Label>
                <div className="flex gap-2">
                  <Button
                    variant={rating === "positive" ? "default" : "outline"}
                    className={`flex-1 ${rating === "positive" ? "bg-green-600 hover:bg-green-700" : ""}`}
                    onClick={() => setRating("positive")}
                  >
                    <ThumbsUp className="mr-2 h-4 w-4" />
                    도움됨
                  </Button>
                  <Button
                    variant={rating === "neutral" ? "default" : "outline"}
                    className={`flex-1 ${rating === "neutral" ? "bg-amber-500 hover:bg-amber-600" : ""}`}
                    onClick={() => setRating("neutral")}
                  >
                    <Minus className="mr-2 h-4 w-4" />
                    보통
                  </Button>
                  <Button
                    variant={rating === "negative" ? "default" : "outline"}
                    className={`flex-1 ${rating === "negative" ? "bg-red-600 hover:bg-red-700" : ""}`}
                    onClick={() => setRating("negative")}
                  >
                    <ThumbsDown className="mr-2 h-4 w-4" />
                    도움안됨
                  </Button>
                </div>
              </div>

              {/* 카테고리 선택 (평가가 선택된 경우에만 표시) */}
              {rating && (
                <div className="space-y-2">
                  <Label>어떤 부분이 {rating === "positive" ? "좋았나요" : "아쉬웠나요"}? (선택사항)</Label>
                  <div className="flex flex-wrap gap-2">
                    <Badge
                      variant={selectedCategories.includes("empathy") ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => toggleCategory("empathy")}
                    >
                      공감 능력
                    </Badge>
                    <Badge
                      variant={selectedCategories.includes("relevance") ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => toggleCategory("relevance")}
                    >
                      관련성
                    </Badge>
                    <Badge
                      variant={selectedCategories.includes("helpfulness") ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => toggleCategory("helpfulness")}
                    >
                      유용성
                    </Badge>
                    <Badge
                      variant={selectedCategories.includes("clarity") ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => toggleCategory("clarity")}
                    >
                      명확성
                    </Badge>
                    <Badge
                      variant={selectedCategories.includes("tone") ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => toggleCategory("tone")}
                    >
                      어조
                    </Badge>
                    <Badge
                      variant={selectedCategories.includes("length") ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => toggleCategory("length")}
                    >
                      길이
                    </Badge>
                    <Badge
                      variant={selectedCategories.includes("other") ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => toggleCategory("other")}
                    >
                      기타
                    </Badge>
                  </div>
                </div>
              )}

              {/* 추가 의견 (평가가 선택된 경우에만 표시) */}
              {rating && (
                <div className="space-y-2">
                  <Label>추가 의견 (선택사항)</Label>
                  <Textarea
                    placeholder="응답에 대한 의견을 자유롭게 작성해주세요."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="min-h-[100px]"
                  />
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleClose}>
                취소
              </Button>
              <Button onClick={handleSubmit} disabled={!rating} className="bg-teal-600 hover:bg-teal-700">
                <Send className="mr-2 h-4 w-4" />
                제출하기
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
