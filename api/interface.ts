
export interface StoryObject {
  id: number,
  title: string,
  points?: number | null,
  user?: string | null,
  time: number,
  time_ago: string,
  comments_count: number,
  type: string,
  url: string,
  domain?: string | null,
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

export interface Poll {
  title: string,
  score: number
}

export interface Kids {
  by: string,
  id: number,
  parent: number,
  text: string,
  time: number,
  type: string,
  deleted?: string,
  dead?: string,
  comments?: Kids[]
  _kids: Kids[]
}

export interface Kid {
  by: string,
  id: number,
  kids?: number[],
  parent: number,
  text: string,
  time: number,
  type: string
}

interface KidRes {
  id: number,
  level?: number,
  user: string,
  time: number,
  time_ago: string,
  content?: string | undefined,
  deleted?: string,
  dead?: string,
  comments: KidRes[]
}

export interface Item {
  id: number,
  title?: string,
  level?: number,
  points?: number,
  user?: string,
  time: number,
  time_ago: string,
  type?: string,
  content?: string,
  deleted?: string,
  dead?: string,
  url?: string,
  poll?: Poll[],
  domain?: string,
  comments_count?: number,
  comments?: Item[]
}
