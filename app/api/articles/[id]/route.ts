import { json, query, execute } from "@/lib/db";
import type { NextRequest } from "next/server";
import type { DBArticleRow } from "@/types/article";
export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  if (!Number.isInteger(id) || id <= 0) return json({ error: "invalid id" }, { status: 400 });
  const rows = (await query(
    "SELECT id,title,body,tags,status,deleted,created_at,updated_at FROM articles WHERE id=? AND deleted=0",
    [id]
  )) as DBArticleRow[];
  if (!rows.length) return json({ error: "not found" }, { status: 404 });
  const r = rows[0];
  let tags: string[] = [];
  try {
    tags = JSON.parse(r.tags ?? "[]");
  } catch {
    tags = [];
  }
  return json({ ...r, tags });
}
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  if (!Number.isInteger(id) || id <= 0) return json({ error: "invalid id" }, { status: 400 });
  const body = await req.json();
  const fields: string[] = [];
  const values: unknown[] = [];
  if (typeof body.title === "string") {
    const v = body.title.trim();
    if (!v) return json({ error: "title cannot be empty" }, { status: 400 });
    fields.push("title=?");
    values.push(v);
  }
  if (typeof body.body === "string") {
    const v = body.body;
    if (!v) return json({ error: "body cannot be empty" }, { status: 400 });
    fields.push("body=?");
    values.push(v);
  }
  if (Array.isArray(body.tags)) {
    const tags = (body.tags as unknown[])
      .filter((t) => typeof t === "string" && (t as string).trim())
      .map((t) => (t as string).trim());
    fields.push("tags=?");
    values.push(JSON.stringify(tags));
  }
  if (body.status === "published" || body.status === "draft") {
    fields.push("status=?");
    values.push(body.status);
  }
  if (!fields.length) return json({ error: "no valid fields" }, { status: 400 });
  fields.push("updated_at=NOW()");
  const [res] = (await execute(
    `UPDATE articles SET ${fields.join(",")} WHERE id=?`,
    [...values, id]
  )) as [
    { affectedRows?: number },
    unknown
  ];
  const affected = res.affectedRows ?? 0;
  if (!affected) return json({ error: "not found" }, { status: 404 });
  return json({ affected });
}
export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  if (!Number.isInteger(id) || id <= 0) return json({ error: "invalid id" }, { status: 400 });
  const [res] = (await execute(
    "UPDATE articles SET deleted=1, updated_at=NOW() WHERE id=?",
    [id]
  )) as [
    { affectedRows?: number },
    unknown
  ];
  const affected = res.affectedRows ?? 0;
  if (!affected) return json({ error: "not found" }, { status: 404 });
  return json({ affected });
}
