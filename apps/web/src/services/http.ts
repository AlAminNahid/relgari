import type { ApiError, ApiErrorCode } from "@/types/api";

export type RequestErrorCode = ApiErrorCode | "NETWORK";

export class ApiRequestError extends Error {
  constructor(
    readonly status: number,
    readonly code: RequestErrorCode,
    readonly fields?: ApiError["fields"],
  ) {
    super(code);
  }
}

export async function api<T = void>(
  path: string,
  options: { method?: string; body?: unknown } = {},
): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`/api${path}`, {
      method: options.method ?? "GET",
      headers:
        options.body === undefined
          ? undefined
          : { "Content-Type": "application/json" },
      body:
        options.body === undefined ? undefined : JSON.stringify(options.body),
      credentials: "same-origin",
    });
  } catch {
    throw new ApiRequestError(0, "NETWORK");
  }

  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as Partial<ApiError>;
    throw new ApiRequestError(res.status, body.code ?? "INTERNAL", body.fields);
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}
