"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { useEffect, useMemo, useState } from "react";
import { GOOGLE_SHEET } from "@/lib/constants";
import { SchemeMapper } from "@/features/scheme-mapper/SchemeMapper";

async function safeFetchJson(input: RequestInfo | URL, init?: RequestInit) {
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


type Payload = {
  floorOrLevel: string | number;
  imageId: string;
  imageUrl?: string;
  imageSizes: { widthPx: number; heightPx: number };
  units: { unitId: string; polygons: { points: [number, number][] }[] }[];
};

function isPayload(v: any): v is Payload {
  return (
    v &&
    (typeof v.floorOrLevel === "string" || typeof v.floorOrLevel === "number") &&
    typeof v.imageId === "string" &&
    v.imageSizes &&
    typeof v.imageSizes.widthPx === "number" &&
    typeof v.imageSizes.heightPx === "number" &&
    Array.isArray(v.units)
  );
}

function Section({
  title,
  children,
  right,
}: {
  title: string;
  children: React.ReactNode;
  right?: React.ReactNode;
}) {
  return (
    <section
      style={{
        border: "1px solid #e5e7eb",
        borderRadius: 14,
        padding: 18,
        background: "#ffffff",
        boxShadow: "0 6px 24px rgba(2, 76, 227, 0.05)",
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          paddingBottom: 12,
          marginBottom: 14,
          borderBottom: "1px solid #e6efff",
        }}
      >
        <h2 style={{ margin: 0, fontSize: 22, color: "#0b2a6b" }}>{title}</h2>
        {right}
      </div>
      {children}
    </section>
  );
}

function Table({ headers, rows }: { headers: string[]; rows: (string | number)[][] }) {
  return (
    <div
      style={{
        overflowX: "auto",
        border: "1px solid #e6efff",
        borderRadius: 10,
        boxShadow: "0 1px 8px rgba(2,76,227,0.05)",
      }}
    >
      <table style={{ borderCollapse: "collapse", width: "100%" }}>
        <thead>
          <tr>
            {headers.map((h) => (
              <th
                key={h}
                style={{
                  textAlign: "left",
                  padding: "10px 12px",
                  borderBottom: "1px solid #e6efff",
                  background: "#f6faff",
                  color: "#0b2a6b",
                  fontWeight: 700,
                  whiteSpace: "nowrap",
                  fontSize: 13,
                }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={headers.length} style={{ padding: 12, color: "#6b7280" }}>
                (empty)
              </td>
            </tr>
          ) : (
            rows.map((r, i) => (
              <tr key={i}>
                {r.map((c, j) => (
                  <td
                    key={j}
                    style={{
                      padding: "10px 12px",
                      borderBottom: "1px solid #f1f5f9",
                      verticalAlign: "top",
                      fontFamily:
                        j >= 2
                          ? "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace"
                          : undefined,
                    }}
                  >
                    {String(c)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default function Home() {
  const { data: session } = useSession();
  const [mode, setMode] = useState<"create" | "update" | "markup">("create");

  // CREATE state
  const [jsonText, setJsonText] = useState(
    JSON.stringify(
      {
        floorOrLevel: "5",
        imageId: "layout-v1",
        imageUrl: "http://...",
        imageSizes: { widthPx: 3000, heightPx: 1800 },
        units: [
          {
            unitId: "A-501",
            polygons: [
              { points: [[0.12, 0.45], [0.25, 0.46], [0.22, 0.55], [0.1, 0.53]] },
              { points: [[0.28, 0.44], [0.33, 0.44], [0.33, 0.5], [0.28, 0.5]] },
            ],
          },
          {
            unitId: "B-502",
            polygons: [{ points: [[0.1, 0.1], [0.9, 0.1], [0.9, 0.3], [0.1, 0.3]] }],
          },
          {
            unitId: "C-503",
            polygons: [{ points: [[0.6, 0.4], [0.8, 0.4], [0.85, 0.55], [0.75, 0.62], [0.6, 0.58]] }],
          },
        ],
      },
      null,
      2
    )
  );
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const preview = useMemo(() => {
    try {
      const parsed = JSON.parse(jsonText);
      if (!isPayload(parsed)) return { valid: false } as const;

      const floorsHeaders = [
        "floorOrLevel",
        "imageId",
        "imageUrl",
        "widthPx",
        "heightPx",
        "updatedUtc (on write)",
      ];
      const floorsRows: (string | number)[][] = [
        [
          String(parsed.floorOrLevel),
          parsed.imageId,
          parsed.imageUrl ?? "",
          parsed.imageSizes.widthPx,
          parsed.imageSizes.heightPx,
          "(server time)",
        ],
      ];

      const polygonsHeaders = ["floorOrLevel", "unitId", "polygonsJson", "updatedUtc (on write)"];
      const polygonsRows: (string | number)[][] = (parsed.units ?? []).map((u) => [
        String(parsed.floorOrLevel),
        u.unitId,
        JSON.stringify({ polygons: u.polygons ?? [] }),
        "(server time)",
      ]);

      return {
        valid: true as const,
        floors: { headers: floorsHeaders, rows: floorsRows },
        polygons: { headers: polygonsHeaders, rows: polygonsRows },
      };
    } catch {
      return { valid: false } as const;
    }
  }, [jsonText]);

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setResult(null);

    let payload: any;
    try {
      payload = JSON.parse(jsonText);
    } catch {
      setError("Invalid JSON");
      return;
    }

    setSaving(true);
    const { ok, status, data } = await safeFetchJson("/api/sheets/upsert", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setResult(data);
    if (!ok || !data.success) setError(data.error || `HTTP ${status}`);
    setSaving(false);
  }

  // UPDATE state
  const [floors, setFloors] = useState<string[]>([]);
  const [selectedFloor, setSelectedFloor] = useState<string>("");
  const [loadingFloors, setLoadingFloors] = useState(false);
  const [loadingFloorJson, setLoadingFloorJson] = useState(false);
  const [updateJsonText, setUpdateJsonText] = useState<string>("");
  const [updateRes, setUpdateRes] = useState<any>(null);
  const [updateErr, setUpdateErr] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);

  async function loadFloors() {
    setLoadingFloors(true);
    setUpdateErr(null);
    const { ok, status, data } = await safeFetchJson("/api/sheets/floors");
    if (!ok || !data.ok) {
      setUpdateErr(data.error || `HTTP ${status}`);
      setFloors([]);
    } else {
      setFloors(data.floors || []);
      if (data.floors?.length && !selectedFloor) setSelectedFloor(String(data.floors[0]));
    }
    setLoadingFloors(false);
  }

  async function loadFloorPolygons() {
    if (!selectedFloor) return;
    setLoadingFloorJson(true);
    setUpdateErr(null);
    setUpdateRes(null);

    const { ok, status, data } = await safeFetchJson(
      `/api/sheets/polygons?floor=${encodeURIComponent(selectedFloor)}`
    );
    if (!ok || !data.ok) {
      setUpdateErr(data.error || `HTTP ${status}`);
    } else {
      setUpdateJsonText(JSON.stringify(data.payload, null, 2));
    }
    setLoadingFloorJson(false);
  }

  async function onUpdatePolygons() {
    setUpdating(true);
    setUpdateErr(null);
    setUpdateRes(null);

    let payload: any;
    try {
      payload = JSON.parse(updateJsonText);
      if (!isPayload(payload)) throw new Error("Payload schema mismatch");
    } catch (e: any) {
      setUpdateErr(e?.message || "Invalid JSON");
      setUpdating(false);
      return;
    }

    const { ok, status, data } = await safeFetchJson("/api/sheets/upsert", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setUpdateRes(data);
    if (!ok || !data.success) setUpdateErr(data.error || `HTTP ${status}`);
    setUpdating(false);
  }

  useEffect(() => {
    if (mode === "update" && session) loadFloors();
  }, [mode, session]);

  if (!session) {
    return (
      <div style={{ padding: 20 }}>
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
          <button onClick={() => signIn("google")} style={{ padding: "8px 12px" }}>
            Sign in with Google
          </button>
        </div>
        <h2 style={{ marginTop: 0 }}>Sign in to continue</h2>
      </div>
    );
  }

  // header (right)
  const headerBar = (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-end",
        marginBottom: 10,
      }}
    >
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <div style={{ color: "#0b2a6b" }}>
          Signed in as <b>{session.user?.email}</b>
        </div>
        <button onClick={() => signOut()} style={{ padding: "6px 10px" }}>
          Sign out
        </button>
      </div>
    </div>
  );

  // switcher (center)
  const Switcher = (
    <div style={{ display: "flex", justifyContent: "center", marginBottom: 6 }}>
      <div
        style={{
          display: "inline-flex",
          border: "1px solid #cfe0ff",
          borderRadius: 999,
          overflow: "hidden",
          background: "#f6faff",
          boxShadow: "0 1px 8px rgba(2,76,227,0.06)",
        }}
      >
        {[
          { key: "markup", label: "Mark up an image" },
          { key: "create", label: "Create polygons" },
          { key: "update", label: "Update polygons" },
        ].map((tab) => {
          const active = mode === (tab.key as any);
          return (
            <button
              key={tab.key}
              onClick={() => setMode(tab.key as any)}
              style={{
                padding: "8px 16px",
                border: "none",
                cursor: "pointer",
                background: active ? "#ffffff" : "transparent",
                color: active ? "#0b2a6b" : "#2956a3",
                fontWeight: active ? 700 : 600,
                transition: "background 120ms",
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );

  const topInfo = (
    <div
      style={{
        fontSize: 14,
        opacity: 0.85,
        marginBottom: 10,
        textAlign: "center",
        color: "#2956a3",
      }}
    >
      Target spreadsheet: <code>{GOOGLE_SHEET.id}</code> — Sheets:{" "}
      <code>{GOOGLE_SHEET.sheets.floors}</code>, <code>{GOOGLE_SHEET.sheets.polygons}</code>
    </div>
  );

  const MarkupSection = (
    <Section title="Mark up an image">
      <SchemeMapper />
    </Section>
  );

  const UpdateSection = (
    <Section title="Update polygons">
      <div style={{ display: "grid", gap: 12 }}>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <button
            onClick={loadFloors}
            disabled={loadingFloors}
            style={{ background: "#e8f0ff", border: "1px solid #cfe0ff", borderRadius: 8, padding: "8px 12px" }}
          >
            {loadingFloors ? "Loading floors..." : "Reload floors"}
          </button>

          <select
            value={selectedFloor}
            onChange={(e) => setSelectedFloor(e.target.value)}
            style={{
              padding: 8,
              minWidth: 180,
              border: "1px solid #cfe0ff",
              borderRadius: 8,
              background: "#fff",
            }}
          >
            <option value="">Select floor...</option>
            {floors.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>

          <button
            disabled={!selectedFloor || loadingFloorJson}
            onClick={loadFloorPolygons}
            style={{ background: "#e8f0ff", border: "1px solid #cfe0ff", borderRadius: 8, padding: "8px 12px" }}
          >
            {loadingFloorJson ? "Loading polygons..." : "Load polygons"}
          </button>
        </div>

        <label style={{ display: "grid", gap: 6 }}>
          <span style={{ color: "#0b2a6b", fontWeight: 600 }}>Payload JSON</span>
          <textarea
            value={updateJsonText}
            onChange={(e) => setUpdateJsonText(e.target.value)}
            rows={16}
            spellCheck={false}
            placeholder="Loaded JSON will appear here"
            style={{
              width: "100%",
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
              padding: 10,
              borderRadius: 8,
              border: "1px solid #cfe0ff",
              background: "#fdfefe",
            }}
          />
        </label>

        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={onUpdatePolygons}
            disabled={!updateJsonText || updating}
            style={{
              background: "#0b61ff",
              color: "#fff",
              border: "1px solid #0b61ff",
              borderRadius: 8,
              padding: "10px 14px",
              boxShadow: "0 3px 10px rgba(2,76,227,0.2)",
            }}
          >
            {updating ? "Updating..." : "Update polygons"}
          </button>
        </div>

        {updateErr && (
          <div style={{ color: "#b00020", whiteSpace: "pre-wrap" }}>
            <b>Error:</b> {updateErr}
          </div>
        )}
        {updateRes && (
          <pre style={{ background: "#eef6ff", padding: 10, borderRadius: 8, border: "1px solid #cfe0ff" }}>
            {JSON.stringify(updateRes, null, 2)}
          </pre>
        )}
      </div>
    </Section>
  );

  const CreateSection = (
    <Section title="Create polygons">
      <form onSubmit={onSave} style={{ display: "grid", gap: 12 }}>
        <label style={{ display: "grid", gap: 6 }}>
          <span style={{ color: "#0b2a6b", fontWeight: 600 }}>Payload JSON</span>
          <textarea
            value={jsonText}
            onChange={(e) => setJsonText(e.target.value)}
            rows={18}
            spellCheck={false}
            style={{
              width: "100%",
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
              padding: 10,
              borderRadius: 8,
              border: "1px solid #cfe0ff",
              background: "#fdfefe",
            }}
          />
        </label>

        <div style={{ display: "grid", gap: 16 }}>
          <h3 style={{ margin: 0, color: "#0b2a6b" }}>Preview in tables</h3>

          {!preview.valid ? (
            <div style={{ color: "#b00020" }}>Invalid JSON or schema mismatch.</div>
          ) : (
            <>
              <div style={{ fontWeight: 700, marginTop: 4, color: "#2956a3" }}>
                Sheet: {GOOGLE_SHEET.sheets.floors}
              </div>
              <Table headers={preview.floors.headers} rows={preview.floors.rows} />

              <div style={{ fontWeight: 700, marginTop: 8, color: "#2956a3" }}>
                Sheet: {GOOGLE_SHEET.sheets.polygons} (rows: {preview.polygons.rows.length})
              </div>
              <Table headers={preview.polygons.headers} rows={preview.polygons.rows} />
            </>
          )}
        </div>

        <button
          disabled={saving || !preview.valid}
          style={{
            padding: "10px 14px",
            background: "#0b61ff",
            color: "#fff",
            border: "1px solid #0b61ff",
            borderRadius: 8,
            boxShadow: "0 3px 10px rgba(2,76,227,0.2)",
          }}
        >
          {saving ? "Saving..." : "Save to Sheets"}
        </button>
      </form>

      {error && (
        <div style={{ color: "#b00020", whiteSpace: "pre-wrap", marginTop: 8 }}>
          <b>Error:</b> {error}
        </div>
      )}
      {result && (
        <pre
          style={{
            background: "#eef6ff",
            padding: 10,
            borderRadius: 8,
            border: "1px solid #cfe0ff",
            marginTop: 8,
          }}
        >
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </Section>
  );

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: 20, display: "grid", gap: 14 }}>
      {headerBar}
      {Switcher}
      <div
        style={{
          fontSize: 14,
          opacity: 0.85,
          marginBottom: 10,
          textAlign: "center",
          color: "#2956a3",
        }}
      >
        Target spreadsheet: <code>{GOOGLE_SHEET.id}</code> — Sheets:{" "}
        <code>{GOOGLE_SHEET.sheets.floors}</code>, <code>{GOOGLE_SHEET.sheets.polygons}</code>
      </div>

      { mode === "markup" && MarkupSection }
      { mode === "update" && UpdateSection }
      { mode === "create" && CreateSection }      
    </div>
  );
}
