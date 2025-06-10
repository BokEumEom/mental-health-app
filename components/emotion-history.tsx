"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, Trash2 } from "lucide-react"
import { getEmotionRecords, deleteEmotionRecord } from "@/utils/emotion-storage"
import { type EmotionRecord, emotionColors } from "@/types/emotion"
import { useToast } from "@/hooks/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export function EmotionHistory() {
  const [records, setRecords] = useState<EmotionRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const { toast } = useToast()

  // 감정 기록 로드
  useEffect(() => {
    loadRecords()
  }, [])

  const loadRecords = () => {
    setIsLoading(true)
    try {
      const allRecords = getEmotionRecords()
      setRecords(allRecords.sort((a, b) => b.timestamp - a.timestamp))
    } catch (error) {
      console.error("감정 기록 로드 중 오류:", error)
      toast({
        title: "기록 로드 실패",
        description: "감정 기록을 불러오는 중 문제가 발생했습니다.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // 감정 기록 삭제
  const handleDelete = (id: string) => {
    setDeleteId(id)
  }

  const confirmDelete = () => {
    if (!deleteId) return

    try {
      deleteEmotionRecord(deleteId)
      setRecords((prev) => prev.filter((record) => record.id !== deleteId))
      toast({
        title: "기록 삭제 완료",
        description: "감정 기록이 삭제되었습니다.",
      })
    } catch (error) {
      console.error("감정 기록 삭제 중 오류:", error)
      toast({
        title: "삭제 실패",
        description: "감정 기록을 삭제하는 중 문제가 발생했습니다.",
        variant: "destructive",
      })
    } finally {
      setDeleteId(null)
    }
  }

  // 날짜 포맷팅
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  // 시간 포맷팅
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6 flex justify-center items-center h-40">
          <p>감정 기록을 불러오는 중...</p>
        </CardContent>
      </Card>
    )
  }

  if (records.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 flex flex-col justify-center items-center h-40">
          <p className="text-slate-500 mb-2">아직 기록된 감정이 없습니다.</p>
          <Button variant="outline" size="sm" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
            첫 감정 기록하기
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>감정 기록 히스토리</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            {records.map((record) => (
              <div key={record.id} className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="flex items-center text-sm text-slate-500 mb-1">
                      <Calendar size={14} className="mr-1" />
                      <span>{formatDate(record.timestamp)}</span>
                      <Clock size={14} className="ml-2 mr-1" />
                      <span>{formatTime(record.timestamp)}</span>
                    </div>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {record.emotions.map((emotion) => {
                        const colors = emotionColors[emotion.category]
                        return (
                          <span
                            key={`${record.id}-${emotion.category}`}
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${colors.bg} ${colors.text}`}
                          >
                            {emotion.category} {Array(emotion.intensity).fill("●").join("")}
                          </span>
                        )
                      })}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-slate-400 hover:text-red-500"
                    onClick={() => handleDelete(record.id)}
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>

                {record.situation && (
                  <div className="mb-2">
                    <p className="text-sm font-medium">상황</p>
                    <p className="text-sm text-slate-600">{record.situation}</p>
                  </div>
                )}

                {record.note && (
                  <div className="mb-2">
                    <p className="text-sm font-medium">메모</p>
                    <p className="text-sm text-slate-600">{record.note}</p>
                  </div>
                )}

                <div>
                  <p className="text-sm font-medium">에너지 레벨</p>
                  <div className="w-full bg-slate-100 rounded-full h-2 mt-1">
                    <div className="bg-teal-500 h-2 rounded-full" style={{ width: `${record.energyLevel}%` }}></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>감정 기록 삭제</AlertDialogTitle>
            <AlertDialogDescription>
              이 감정 기록을 정말 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-500 hover:bg-red-600">
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
