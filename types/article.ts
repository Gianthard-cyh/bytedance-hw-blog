export type ArticleStatus = "published" | "draft";
export interface Article {
  id: number;
  title: string;
  body: string;
  tags: string[];
  status: ArticleStatus;
  deleted: number;
  created_at: string;
  updated_at: string;
}
export interface DBArticleRow {
  id: number;
  title: string;
  body: string;
  tags: string | null;
  status: ArticleStatus;
  deleted: number;
  created_at: string;
  updated_at: string;
}
