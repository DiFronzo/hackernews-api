
export interface StoryObject {
  id: number,
  title: string,
  points?: number,
  user?: string,
  time: number,
  time_ago: string,
  comments_count: number,
  type: string,
  url: string,
  domain?: string,
}

export interface StoryItem {
  by: string,
  descendants: number,
  id: number,
  kids: number[],
  score: number,
  time: number,
  title: string,
  type: string,
  url?: string,
  text?: string
}

export interface QueryString {
  page?: string
}
