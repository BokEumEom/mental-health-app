"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { ChevronLeft, Plus, Search, Tag, Calendar, Edit2, Trash2, Lock, Eye } from "lucide-react"
import {
  getAllRecoveryNotes,
  saveRecoveryNote,
  updateRecoveryNote,
  deleteRecoveryNote,
} from "@/utils/recovery-note-storage"
import type { RecoveryNote } from "@/types/recovery-note"
import { useToast } from "@/hooks/use-toast"

export function RecoveryNoteScreen({ onBack }: { onBack: () => void }) {
  const [notes, setNotes] = useState<RecoveryNote[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState<"all" | "private" | "public">("all")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedNote, setSelectedNote] = useState<RecoveryNote | null>(null)
  const [newNote, setNewNote] = useState<{
    title: string
    content: string
    mood: string
    tags: string
    isPrivate: boolean
  }>({
    title: "",
    content: "",
    mood: "",
    tags: "",
    isPrivate: false,
  })

  const { toast } = useToast()

  // 노트 로드
  useEffect(() => {
    loadNotes()
  }, [])

  const loadNotes = () => {
    setIsLoading(true)
    try {
      const allNotes = getAllRecoveryNotes()
      setNotes(allNotes)
    } catch (error) {
      console.error("회복 노트 로드 중 오류:", error)
      toast({
        title: "노트 로드 실패",
        description: "회복 노트를 불러오는 중 문제가 발생했습니다.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // 필터링된 노트
  const filteredNotes = notes.filter((note) => {
    // 탭 필터링
    if (activeTab === "private" && !note.isPrivate) return false
    if (activeTab === "public" && note.isPrivate) return false

    // 검색어 필터링
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return (
        note.title.toLowerCase().includes(query) ||
        note.content.toLowerCase().includes(query) ||
        note.mood.toLowerCase().includes(query) ||
        note.tags.some((tag) => tag.toLowerCase().includes(query))
      )
    }

    return true
  })

  // 노트 생성
  const handleCreateNote = () => {
    try {
      const tagsArray = newNote.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0)

      const createdNote = saveRecoveryNote({
        title: newNote.title,
        content: newNote.content,
        mood: newNote.mood,
        tags: tagsArray,
        isPrivate: newNote.isPrivate,
      })

      setNotes((prev) => [createdNote, ...prev])
      setIsCreateDialogOpen(false)
      setNewNote({
        title: "",
        content: "",
        mood: "",
        tags: "",
        isPrivate: false,
      })

      toast({
        title: "노트 생성 완료",
        description: "회복 노트가 성공적으로 저장되었습니다.",
      })
    } catch (error) {
      console.error("노트 생성 중 오류:", error)
      toast({
        title: "노트 생성 실패",
        description: "회복 노트를 저장하는 중 문제가 발생했습니다.",
        variant: "destructive",
      })
    }
  }

  // 노트 수정
  const handleEditNote = () => {
    if (!selectedNote) return

    try {
      const tagsArray = newNote.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0)

      const updatedNote = updateRecoveryNote(selectedNote.id, {
        title: newNote.title,
        content: newNote.content,
        mood: newNote.mood,
        tags: tagsArray,
        isPrivate: newNote.isPrivate,
      })

      if (updatedNote) {
        setNotes((prev) => prev.map((note) => (note.id === updatedNote.id ? updatedNote : note)))
        setIsEditDialogOpen(false)
        setSelectedNote(null)

        toast({
          title: "노트 수정 완료",
          description: "회복 노트가 성공적으로 수정되었습니다.",
        })
      }
    } catch (error) {
      console.error("노트 수정 중 오류:", error)
      toast({
        title: "노트 수정 실패",
        description: "회복 노트를 수정하는 중 문제가 발생했습니다.",
        variant: "destructive",
      })
    }
  }

  // 노트 삭제
  const handleDeleteNote = (id: string) => {
    try {
      const success = deleteRecoveryNote(id)

      if (success) {
        setNotes((prev) => prev.filter((note) => note.id !== id))
        toast({
          title: "노트 삭제 완료",
          description: "회복 노트가 성공적으로 삭제되었습니다.",
        })
      }
    } catch (error) {
      console.error("노트 삭제 중 오류:", error)
      toast({
        title: "노트 삭제 실패",
        description: "회복 노트를 삭제하는 중 문제가 발생했습니다.",
        variant: "destructive",
      })
    }
  }

  // 노트 편집 모달 열기
  const openEditDialog = (note: RecoveryNote) => {
    setSelectedNote(note)
    setNewNote({
      title: note.title,
      content: note.content,
      mood: note.mood,
      tags: note.tags.join(", "),
      isPrivate: note.isPrivate,
    })
    setIsEditDialogOpen(true)
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

  return (
    <div className="flex flex-col pb-20">
      <div className="p-4 border-b">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ChevronLeft size={20} />
          </Button>
          <h2 className="text-lg font-medium ml-2">나의 회복 노트</h2>
        </div>
      </div>

      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="relative flex-1 mr-2">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
            <Input
              placeholder="노트 검색..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus size={16} className="mr-1" /> 작성하기
          </Button>
        </div>

        <Tabs defaultValue="all" onValueChange={(value) => setActiveTab(value as "all" | "private" | "public")}>
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="all">전체</TabsTrigger>
            <TabsTrigger value="private">비공개</TabsTrigger>
            <TabsTrigger value="public">공개</TabsTrigger>
          </TabsList>
        </Tabs>

        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <p>노트를 불러오는 중...</p>
          </div>
        ) : filteredNotes.length === 0 ? (
          <div className="flex flex-col justify-center items-center h-40">
            <p className="text-slate-500 mb-2">노트가 없습니다.</p>
            <Button variant="outline" size="sm" onClick={() => setIsCreateDialogOpen(true)}>
              첫 노트 작성하기
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredNotes.map((note) => (
              <Card key={note.id} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-lg">{note.title}</h3>
                      <div className="flex items-center space-x-1">
                        {note.isPrivate ? (
                          <Lock size={14} className="text-slate-400" />
                        ) : (
                          <Eye size={14} className="text-slate-400" />
                        )}
                        <span className="text-xs text-slate-400">{note.isPrivate ? "비공개" : "공개"}</span>
                      </div>
                    </div>

                    <div className="flex items-center text-xs text-slate-500 mb-2">
                      <Calendar size={12} className="mr-1" />
                      <span>{formatDate(note.createdAt)}</span>
                      <span className="mx-2">•</span>
                      <Tag size={12} className="mr-1" />
                      <span>{note.mood}</span>
                    </div>

                    <p className="text-sm text-slate-600 mb-3 line-clamp-3">{note.content}</p>

                    <div className="flex flex-wrap gap-1 mb-3">
                      {note.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2 text-slate-500"
                        onClick={() => openEditDialog(note)}
                      >
                        <Edit2 size={14} className="mr-1" />
                        수정
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2 text-red-500"
                        onClick={() => handleDeleteNote(note.id)}
                      >
                        <Trash2 size={14} className="mr-1" />
                        삭제
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* 노트 생성 다이얼로그 */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>회복 노트 작성</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">제목</Label>
              <Input
                id="title"
                value={newNote.title}
                onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                placeholder="노트 제목을 입력하세요"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="content">내용</Label>
              <Textarea
                id="content"
                value={newNote.content}
                onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                placeholder="노트 내용을 입력하세요"
                className="min-h-[150px]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mood">감정/기분</Label>
              <Input
                id="mood"
                value={newNote.mood}
                onChange={(e) => setNewNote({ ...newNote, mood: e.target.value })}
                placeholder="현재 감정이나 기분을 입력하세요 (예: 평온함, 성취감)"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tags">태그</Label>
              <Input
                id="tags"
                value={newNote.tags}
                onChange={(e) => setNewNote({ ...newNote, tags: e.target.value })}
                placeholder="쉼표로 구분하여 태그를 입력하세요"
              />
              <p className="text-xs text-slate-500">쉼표(,)로 구분하여 여러 태그를 입력할 수 있습니다.</p>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="private"
                checked={newNote.isPrivate}
                onCheckedChange={(checked) => setNewNote({ ...newNote, isPrivate: checked })}
              />
              <Label htmlFor="private">비공개 노트로 설정</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              취소
            </Button>
            <Button onClick={handleCreateNote}>저장</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 노트 수정 다이얼로그 */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>회복 노트 수정</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">제목</Label>
              <Input
                id="edit-title"
                value={newNote.title}
                onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                placeholder="노트 제목을 입력하세요"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-content">내용</Label>
              <Textarea
                id="edit-content"
                value={newNote.content}
                onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                placeholder="노트 내용을 입력하세요"
                className="min-h-[150px]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-mood">감정/기분</Label>
              <Input
                id="edit-mood"
                value={newNote.mood}
                onChange={(e) => setNewNote({ ...newNote, mood: e.target.value })}
                placeholder="현재 감정이나 기분을 입력하세요 (예: 평온함, 성취감)"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-tags">태그</Label>
              <Input
                id="edit-tags"
                value={newNote.tags}
                onChange={(e) => setNewNote({ ...newNote, tags: e.target.value })}
                placeholder="쉼표로 구분하여 태그를 입력하세요"
              />
              <p className="text-xs text-slate-500">쉼표(,)로 구분하여 여러 태그를 입력할 수 있습니다.</p>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="edit-private"
                checked={newNote.isPrivate}
                onCheckedChange={(checked) => setNewNote({ ...newNote, isPrivate: checked })}
              />
              <Label htmlFor="edit-private">비공개 노트로 설정</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              취소
            </Button>
            <Button onClick={handleEditNote}>저장</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
