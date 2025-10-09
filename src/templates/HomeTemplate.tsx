"use client";

import { useEffect, useState } from "react";
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
        overflow: "hidden",
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

export default function HomeTemplate() {
  const [mode, setMode] = useState<"create" | "update" | "markup">("create");

  // CREATE state
  const [jsonText, setJsonText] = useState(
    JSON.stringify(
      {
        name: "TOWER",
        image: {
          url: "https://image-map-schemes-tool.vercel.app/images/tower.png",
          width: 1728,
          height: 1330,
        },
        areas: [
          {
            id: "c45bf1a6",
            name: "NONAME",
            shape: "poly",
            coords: [413, 228, 506, 212, 542, 301, 440, 329, 389, 291],
            polygon: [
              [413, 228],
              [506, 212],
              [542, 301],
              [440, 329],
              [389, 291],
            ],
            strokeColor: "#000",
            fillColor: "rgba(255,0,0,0.3)",
            preFillColor: "rgba(255,0,0,0.5)",
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

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setResult(null);

    let parsed: any;
    try {
      parsed = JSON.parse(jsonText);
    } catch {
      setError("Invalid JSON");
      return;
    }

    const body = {
      name: String(parsed?.name ?? ""),
      url: String(parsed?.image?.url ?? ""),
      json: parsed,
      mode: "create",
    };
    if (!body.name || !body.url) {
      setError("Payload must contain name and image.url");
      return;
    }

    setSaving(true);
    const { ok, status, data } = await safeFetchJson("/api/sheets/upsert", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
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

    let parsed: any;
    try {
      parsed = JSON.parse(updateJsonText);
    } catch (e: any) {
      setUpdateErr("Invalid JSON");
      setUpdating(false);
      return;
    }

    const body = {
      name: String(parsed?.name ?? ""),
      url: String(parsed?.image?.url ?? ""),
      json: parsed,
      mode: "update",
    };
    if (!body.name || !body.url) {
      setUpdateErr("Payload must contain name and image.url");
      setUpdating(false);
      return;
    }

    const { ok, status, data } = await safeFetchJson("/api/sheets/upsert", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setUpdateRes(data);
    if (!ok || !data.success) setUpdateErr(data.error || `HTTP ${status}`);
    setUpdating(false);
  }

  useEffect(() => {
    if (mode === "update") loadFloors();
  }, [mode]);

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

        <button
          disabled={saving || !jsonText}
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
      {Switcher}

      {mode === "markup" && MarkupSection}
      {mode === "update" && UpdateSection}
      {mode === "create" && CreateSection}
    </div>
  );
}
