export type PostStatus = 0 | 1

export interface PostListItem {
  id: number
  title: string
  content: string
  author: string | null
  status: PostStatus
  views: number
  created_at: string
  tags: string[]
}

export interface PostDetail extends PostListItem {
  updated_at: string
}

export interface PagedResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
}

