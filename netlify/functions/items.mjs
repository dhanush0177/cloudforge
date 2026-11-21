export default async (request) => {
  const apiUrl = process.env.CLOUDFORGE_API_URL?.replace(/\/+$/, "");
  const apiKey = process.env.CLOUDFORGE_API_KEY;

  if (!apiUrl || !apiKey) {
    return json({ error: "The API connection is not configured yet." }, 500);
  }

  if (!["GET", "POST", "DELETE"].includes(request.method)) {
    return json({ error: "Method not allowed." }, 405);
  }

  const itemId = new URL(request.url).searchParams.get("id");
  if (request.method === "DELETE" && !itemId) {
    return json({ error: "An item ID is required." }, 400);
  }

  try {
    const path = request.method === "DELETE"
      ? `${apiUrl}/api/v1/items/${encodeURIComponent(itemId)}`
      : `${apiUrl}/api/v1/items/`;

    const upstream = await fetch(path, {
      method: request.method,
      headers: {
        "X-API-Key": apiKey,
        Accept: "application/json",
        ...(request.method === "POST" ? { "Content-Type": "application/json" } : {}),
      },
      ...(request.method === "POST" ? { body: await request.text() } : {}),
    });

    const body = await upstream.text();
    return new Response(body || null, {
      status: upstream.status,
      headers: {
        "Content-Type": upstream.headers.get("content-type") || "application/json",
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return json({ error: "Could not reach the API. Please try again shortly." }, 502);
  }
};

function json(value, status) {
  return new Response(JSON.stringify(value), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
  });
}
