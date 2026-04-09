export interface Profile {
  id: string
  nickname: string
  birthday: string
  avatar_url: string | null
  created_at: string
}

export interface Car {
  id: string
  user_id: string
  nickname: string | null
  make: string
  model: string
  year: number
  photos: string[]
  created_at: string
}

export interface Club {
  id: string
  name: string
  description: string | null
  logo_url: string | null
  whatsapp_link: string | null
  requires_approval: boolean
  created_by: string
  created_at: string
}

export interface ClubMember {
  id: string
  club_id: string
  user_id: string
  role: 'leader' | 'admin' | 'member'
  joined_at: string
}

export interface ClubMemberWithProfile extends ClubMember {
  profiles: Profile
}

export interface EventRow {
  id: string
  club_id: string
  title: string
  description: string | null
  date_time: string
  location: string | null
  event_type: string | null
  created_by: string
  created_at: string
}

export interface EventRsvp {
  id: string
  event_id: string
  user_id: string
  status: 'going' | 'not_going' | 'maybe'
  created_at: string
}

export type ReactionType = 'like' | 'fire' | 'angry' | 'poop' | 'laugh'

export interface Post {
  id: string
  club_id: string
  user_id: string
  content: string | null
  photos: string[]
  created_at: string
  profiles?: Profile
}

export interface PostReaction {
  id: string
  post_id: string
  user_id: string
  type: ReactionType
  created_at: string
}

export interface PostComment {
  id: string
  post_id: string
  user_id: string
  content: string
  created_at: string
  profiles?: Profile
}

export interface MerchItem {
  id: string
  club_id: string
  name: string
  description: string | null
  price: number
  photo_url: string | null
  active: boolean
  created_by: string
  created_at: string
}

export interface MerchRequest {
  id: string
  item_id: string
  user_id: string
  size: string | null
  notes: string | null
  quantity: number
  status: 'pending' | 'approved' | 'delivered' | 'cancelled'
  created_at: string
  profiles?: Profile
  merch_items?: MerchItem
}

export interface Notification {
  id: string
  user_id: string
  type: string
  title: string
  body: string | null
  read: boolean
  data: Record<string, unknown>
  created_at: string
}
