export interface RecoveryNote {
  id: string
  title: string
  content: string
  mood: string
  tags: string[]
  createdAt: number
  updatedAt: number
  isPrivate: boolean
}

export interface RecoveryNoteFilter {
  searchQuery?: string
  tags?: string[]
  startDate?: number
  endDate?: number
  sortBy?: "recent" | "oldest" | "mood"
}
