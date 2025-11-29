import { json, query, execute, getNumber } from "@/lib/db";
import type { NextRequest } from "next/server";
import type { DBArticleRow } from "@/types/article";
const SORTABLE = new Set(["created_at", "updated_at", "title", "status", "id"]);
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const page = getNumber(url.searchParams.get("page"), 1);
  const pageSize = getNumber(url.searchParams.get("pageSize"), 10);
  const sortByParam = url.searchParams.get("sortBy") || "created_at";
  const sortBy = SORTABLE.has(sortByParam) ? sortByParam : "created_at";
  const orderParam = url.searchParams.get("order") || "desc";
  const order = orderParam.toLowerCase() === "asc" ? "asc" : "desc";
  const status = url.searchParams.get("status");
  const keyword = url.searchParams.get("keyword");
  const where: string[] = ["deleted=0"];
  const params: unknown[] = [];
  if (status === "published" || status === "draft") {
    where.push("status=?");
    params.push(status);
  }
  if (keyword) {
    where.push("(title LIKE ? OR body LIKE ?)");
    params.push(`%${keyword}%`, `%${keyword}%`);
  }
  const countSql = `SELECT COUNT(*) as total FROM articles WHERE ${where.join(" AND ")}`;
  const totalRows = (await query(countSql, params)) as Array<{ total: number }>;
  const total = totalRows[0]?.total ?? 0;
  const sql = `SELECT id,title,body,tags,status,deleted,created_at,updated_at FROM articles WHERE ${where.join(" AND ")} ORDER BY ${sortBy} ${order} LIMIT ? OFFSET ?`;
  const listParams = params.slice();
  listParams.push(pageSize, (page - 1) * pageSize);
  const rows = (await query(sql, listParams)) as DBArticleRow[];
  const items = rows.map((r) => ({
    ...r,
    tags: (() => {
      try {
        return JSON.parse(r.tags ?? "[]");
      } catch {
        return [];
      }
    })(),
  }));
  return json({ items, page, pageSize, total });
}
export async function POST(req: NextRequest) {
  const body = await req.json();
  const title = typeof body.title === "string" ? body.title.trim() : "";
  const content = typeof body.body === "string" ? body.body : "";
  const rawTags = Array.isArray(body.tags) ? body.tags : [];
  const status = body.status === "published" ? "published" : "draft";
  if (!title || !content) return json({ error: "title and body are required" }, { status: 400 });
  const tags = (rawTags as unknown[])
    .filter((t) => typeof t === "string" && (t as string).trim())
    .map((t) => (t as string).trim());
  const [res] = (await execute(
    "INSERT INTO articles (title, body, tags, status, deleted, created_at, updated_at) VALUES (?,?,?,?,0, NOW(), NOW())",
    [title, content, JSON.stringify(tags), status]
  )) as [
    { insertId?: number },
    unknown
  ];
  const id = res.insertId;
  return json({ id });
}
export async function DELETE(req: NextRequest) {
  const url = new URL(req.url);
  const idsParam = url.searchParams.get("ids");
  const mode = url.searchParams.get("mode") === "hard" ? "hard" : "soft";
  if (!idsParam) return json({ error: "ids is required" }, { status: 400 });
  const ids = idsParam
    .split(",")
    .map((s) => Number(s))
    .filter((n) => Number.isInteger(n) && n > 0);
  if (!ids.length) return json({ error: "no valid ids" }, { status: 400 });
  if (mode === "soft") {
    const [res] = (await execute(
      `UPDATE articles SET deleted=1, updated_at=NOW() WHERE id IN (${ids.map(() => "?").join(",")})`,
      ids
    )) as [
      { affectedRows?: number },
      unknown
    ];
    const affected = res.affectedRows ?? 0;
    return json({ affected, mode });
  } else {
    const [res] = (await execute(
      `DELETE FROM articles WHERE id IN (${ids.map(() => "?").join(",")})`,
      ids
    )) as [
      { affectedRows?: number },
      unknown
    ];
    const affected = res.affectedRows ?? 0;
    return json({ affected, mode });
  }
}
