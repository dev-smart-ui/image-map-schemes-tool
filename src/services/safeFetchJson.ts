

export const safeFetchJson = async (input: RequestInfo | URL, init?: RequestInit) => {
  try {
    const res = await fetch(input, init);
    const ct = res.headers.get("content-type") || "";
    if (ct.includes("application/json")) {
      const data = await res.json();
      return { ok: res.ok, status: res.status, data };
    }
    const text = await res.text();
    return {
      ok: false,
      status: res.status,
      data: { success: false, ok: false, error: `Non-JSON response (${res.status})`, details: text.slice(0, 2000) },
    };
  } catch (err: any) {
    return {
      ok: false,
      status: 0,
      data: { success: false, ok: false, error: "Failed to fetch", details: String(err?.message || err) },
    };
  }
}
