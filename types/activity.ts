export type ActivityType =
  | "post_create"
  | "post_like"
  | "post_comment"
  | "post_bookmark"
  | "emotion_record"
  | "mission_complete"
  | "badge_earn"
  | "level_up"

export interface Activity {
  id: string
  userId: string
  type: ActivityType
  targetId?: string
  targetType?: string
  title: string
  description?: string
  createdAt: number
}
