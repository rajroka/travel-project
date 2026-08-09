import { NextResponse } from "next/server";

/** Uniform success response */
export function successResponse(data: unknown, message = "Success", status = 200) {
  return NextResponse.json({ success: true, message, data }, { status });
}

/** Uniform error response */
export function errorResponse(message: string, status = 500, errors?: unknown) {
  return NextResponse.json({ success: false, message, ...(errors ? { errors } : {}) }, { status });
}

/** Build a mongoose pagination object */
export function paginate(page: number, limit: number) {
  const skip = (page - 1) * limit;
  return { skip, limit };
}

/** Build paginationMeta for responses */
export function paginationMeta(total: number, page: number, limit: number) {
  return {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    hasNextPage: page * limit < total,
    hasPrevPage: page > 1,
  };
}

/** Slugify a string */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Parse query params safely */
export function parseQuery(searchParams: URLSearchParams): Record<string, string> {
  const params: Record<string, string> = {};
  searchParams.forEach((value, key) => {
    params[key] = value;
  });
  return params;
}
