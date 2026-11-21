export default async (request) => {
  const apiUrl = process.env.CLOUDFORGE_API_URL?.replace(/\/+$/, "");
  const apiKey = process.env.CLOUDFORGE_API_KEY;

  if (!apiUrl || !apiKey) {
    return json({ error: "The API connection is not configured yet." }, 500);
  }
  if (request.method !== "GET" && request.method !== "POST") {
    return json({ error: "Method not allowed." }, 405);
  }

  try {
    const upstream = await fetch(`${apiUrl}/api/v1/items/`, {
      method: request.method,
      headers: {
        "X-API-Key": apiKey,
        Accept: "application/json",
        ...(request.method === "POST" ? { "Content-Type": "application/json" } : {}),
      },
      ...(request.method === "POST" ? { body: await request.text() } : {}),
    });

    return new Response(await upstream.text(), {
      status: upstream.status,
      headers: {
        "Content-Type": upstream.headers.get("content-type") || "application/json",
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Cloudforge API request failed:", error);
    return json({
      error: "Could not reach the API.",
      details: error instanceof Error ? error.message : String(error),
    }, 502);
  }
};

function json(value, status) {
  return new Response(JSON.stringify(value), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}
