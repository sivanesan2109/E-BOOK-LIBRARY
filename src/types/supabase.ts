export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      books: {
        Row: {
          id: string
          title: string
          author: string
          category: string
          url: string
          img_url:string
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          author: string
          category: string
          url: string
          img_url:string
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          author?: string
          category?: string
          url?: string
          img_url:string
          created_at?: string
        }
      }
      user_books: {
        Row: {
          id: string
          user_id: string
          book_id: string
          read: boolean
          highlights: Json
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          book_id: string
          read?: boolean
          highlights?: Json
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          book_id?: string
          read?: boolean
          highlights?: Json
          created_at?: string
        }
      }
    }
  }
}