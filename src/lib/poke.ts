export type PokePreferences = {
  apiKey: string;
  baseUrl?: string;
  inboundPath?: string;
  repliesPath?: string;
  defaultConversationId?: string;
};

export type PokeReply = {
  id: string;
  text: string;
  createdAt?: string;
  author?: string;
  raw?: unknown;
};

function trimSlashes(value: string) {
  return value.replace(/\/+$/, "").replace(/^\/+/, "");
}

export function buildUrl(baseUrl: string, path: string) {
  return `${baseUrl.replace(/\/+$/, "")}/${trimSlashes(path)}`;
}

export async function sendPokeMessage(params: {
  apiKey: string;
  baseUrl: string;
  inboundPath: string;
  message: string;
  conversationId?: string;
}) {
  const response = await fetch(buildUrl(params.baseUrl, params.inboundPath), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${params.apiKey}`,
    },
    body: JSON.stringify({
      message: params.message,
      conversationId: params.conversationId,
    }),
  });

  const text = await response.text();
  if (!response.ok) {
    throw new Error(text || `Request failed with status ${response.status}`);
  }

  return safeJsonParse(text);
}

export async function pollPokeReplies(params: {
  apiKey: string;
  baseUrl: string;
  repliesPath: string;
  conversationId: string;
  cursor?: string;
}) {
  const url = new URL(buildUrl(params.baseUrl, params.repliesPath));
  url.searchParams.set("conversationId", params.conversationId);
  if (params.cursor) {
    url.searchParams.set("cursor", params.cursor);
  }

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${params.apiKey}`,
      Accept: "application/json",
    },
  });

  const text = await response.text();
  if (!response.ok) {
    throw new Error(text || `Request failed with status ${response.status}`);
  }

  return safeJsonParse(text);
}

export function normalizeReplies(payload: unknown): { replies: PokeReply[]; nextCursor?: string } {
  if (Array.isArray(payload)) {
    return { replies: payload.map(normalizeReply) };
  }

  if (payload && typeof payload === "object") {
    const record = payload as Record<string, unknown>;
    const items = Array.isArray(record.items)
      ? record.items
      : Array.isArray(record.messages)
        ? record.messages
        : Array.isArray(record.replies)
          ? record.replies
          : [];

    return {
      replies: items.map(normalizeReply),
      nextCursor: typeof record.nextCursor === "string" ? record.nextCursor : typeof record.cursor === "string" ? record.cursor : undefined,
    };
  }

  return { replies: [] };
}

function normalizeReply(item: unknown): PokeReply {
  if (!item || typeof item !== "object") {
    return { id: crypto.randomUUID(), text: String(item ?? ""), raw: item };
  }

  const record = item as Record<string, unknown>;
  return {
    id: typeof record.id === "string" ? record.id : crypto.randomUUID(),
    text: typeof record.text === "string" ? record.text : typeof record.message === "string" ? record.message : JSON.stringify(item),
    createdAt: typeof record.createdAt === "string" ? record.createdAt : typeof record.timestamp === "string" ? record.timestamp : undefined,
    author: typeof record.author === "string" ? record.author : typeof record.role === "string" ? record.role : undefined,
    raw: item,
  };
}

function safeJsonParse(text: string) {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}
