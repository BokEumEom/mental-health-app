import { v4 as uuidv4 } from "uuid"
import type { RecoveryNote, RecoveryNoteFilter } from "@/types/recovery-note"

// 로컬 스토리지 키
const RECOVERY_NOTES_KEY = "workplace_emotion_app_recovery_notes"

// 회복 노트 저장
export const saveRecoveryNote = (note: Omit<RecoveryNote, "id" | "createdAt" | "updatedAt">): RecoveryNote => {
  const notes = getAllRecoveryNotes()

  const newNote: RecoveryNote = {
    ...note,
    id: uuidv4(),
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }

  notes.unshift(newNote)
  localStorage.setItem(RECOVERY_NOTES_KEY, JSON.stringify(notes))

  return newNote
}

// 회복 노트 업데이트
export const updateRecoveryNote = (id: string, noteData: Partial<RecoveryNote>): RecoveryNote | null => {
  const notes = getAllRecoveryNotes()
  const noteIndex = notes.findIndex((note) => note.id === id)

  if (noteIndex === -1) return null

  const updatedNote = {
    ...notes[noteIndex],
    ...noteData,
    updatedAt: Date.now(),
  }

  notes[noteIndex] = updatedNote
  localStorage.setItem(RECOVERY_NOTES_KEY, JSON.stringify(notes))

  return updatedNote
}

// 회복 노트 삭제
export const deleteRecoveryNote = (id: string): boolean => {
  const notes = getAllRecoveryNotes()
  const filteredNotes = notes.filter((note) => note.id !== id)

  if (filteredNotes.length === notes.length) return false

  localStorage.setItem(RECOVERY_NOTES_KEY, JSON.stringify(filteredNotes))
  return true
}

// 모든 회복 노트 가져오기
export const getAllRecoveryNotes = (): RecoveryNote[] => {
  if (typeof window === "undefined") return []

  const notesJson = localStorage.getItem(RECOVERY_NOTES_KEY)
  return notesJson ? JSON.parse(notesJson) : []
}

// 회복 노트 ID로 가져오기
export const getRecoveryNoteById = (id: string): RecoveryNote | null => {
  const notes = getAllRecoveryNotes()
  return notes.find((note) => note.id === id) || null
}

// 회복 노트 필터링
export const filterRecoveryNotes = (filter: RecoveryNoteFilter): RecoveryNote[] => {
  let notes = getAllRecoveryNotes()

  // 검색어 필터링
  if (filter.searchQuery) {
    const query = filter.searchQuery.toLowerCase()
    notes = notes.filter(
      (note) =>
        note.title.toLowerCase().includes(query) ||
        note.content.toLowerCase().includes(query) ||
        note.tags.some((tag) => tag.toLowerCase().includes(query)),
    )
  }

  // 태그 필터링
  if (filter.tags && filter.tags.length > 0) {
    notes = notes.filter((note) => filter.tags!.some((tag) => note.tags.includes(tag)))
  }

  // 날짜 범위 필터링
  if (filter.startDate) {
    notes = notes.filter((note) => note.createdAt >= filter.startDate!)
  }

  if (filter.endDate) {
    notes = notes.filter((note) => note.createdAt <= filter.endDate!)
  }

  // 정렬
  switch (filter.sortBy) {
    case "oldest":
      notes.sort((a, b) => a.createdAt - b.createdAt)
      break
    case "mood":
      notes.sort((a, b) => a.mood.localeCompare(b.mood))
      break
    case "recent":
    default:
      notes.sort((a, b) => b.createdAt - a.createdAt)
      break
  }

  return notes
}

// 샘플 회복 노트 생성
export const initializeRecoveryNotes = (): void => {
  if (typeof window === "undefined") return

  // 이미 데이터가 있는지 확인
  const existingNotes = localStorage.getItem(RECOVERY_NOTES_KEY)

  if (!existingNotes) {
    const sampleNotes: RecoveryNote[] = [
      {
        id: uuidv4(),
        title: "오늘의 작은 성취",
        content:
          "오늘 업무 중 어려운 문제를 해결했다. 처음에는 막막했지만, 차분히 접근하니 해결책을 찾을 수 있었다. 이런 경험이 쌓이면 자신감도 함께 쌓인다는 것을 느꼈다.",
        mood: "성취감",
        tags: ["업무", "문제해결", "자신감"],
        createdAt: Date.now() - 2 * 24 * 60 * 60 * 1000,
        updatedAt: Date.now() - 2 * 24 * 60 * 60 * 1000,
        isPrivate: false,
      },
      {
        id: uuidv4(),
        title: "스트레스 관리 방법",
        content:
          "업무 스트레스가 심할 때 5분 명상이 도움이 된다. 잠시 눈을 감고 호흡에 집중하면 마음이 차분해진다. 오늘도 회의 전에 시도해봤는데 효과가 있었다.",
        mood: "평온함",
        tags: ["스트레스", "명상", "자기관리"],
        createdAt: Date.now() - 5 * 24 * 60 * 60 * 1000,
        updatedAt: Date.now() - 5 * 24 * 60 * 60 * 1000,
        isPrivate: true,
      },
      {
        id: uuidv4(),
        title: "동료와의 갈등 해결",
        content:
          "팀원과 의견 충돌이 있었지만, 솔직한 대화로 해결했다. 서로의 관점을 이해하는 것이 중요하다는 것을 다시 한번 깨달았다. 앞으로도 열린 마음으로 소통하려고 한다.",
        mood: "안도감",
        tags: ["갈등", "소통", "팀워크"],
        createdAt: Date.now() - 10 * 24 * 60 * 60 * 1000,
        updatedAt: Date.now() - 10 * 24 * 60 * 60 * 1000,
        isPrivate: false,
      },
    ]

    localStorage.setItem(RECOVERY_NOTES_KEY, JSON.stringify(sampleNotes))
  }
}
