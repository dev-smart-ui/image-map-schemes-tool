import { Button } from "@/components/ui/buttons/Button"
import { Divider } from "../scheme-mapper/Divider"
import { useState } from "react";
import { safeFetchJson } from "@/services/safeFetchJson";

export const SchemeAdd = () => {
  const [error, setError] = useState('');
  const [result, setResult] = useState('');
  const [jsonText, setJsonText] = useState('')
  const [saving, setSaving] = useState(false);

  const onSave = async () => {
    setError('');
    setResult('');

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

  return (
    <div>
      <div className="flex flex-col gap-2">
        <label htmlFor="addPayload" className="">Payload JSON</label>
        <textarea
          id="addPayload"
          rows={18}
          spellCheck={false}
          className="w-full p-3 rounded-lg border border-[var(--primary-color)]"
          value={jsonText}
          onChange={e => setJsonText(e.target.value)}
        />
      </div>

      <Button 
        className="mt-8"
        onClick={onSave}
        disabled={!jsonText}
        withIcon
      >
        {saving ? "Saving..." : "Save"}
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
        </svg>
      </Button>

      {(error || result) && (
        <>
          <Divider size={1} offset={20} />

          {error && (
            <div className="text-[var(--error-color)]">
              <b>Error:</b> {error}
            </div>
          )}

          {result && (
            <pre className="bg-[var(--accent-light-color)] p-3 rounded-lg border border-[var(--grey-color)] mt-2">
              {JSON.stringify(result, null, 2)}
            </pre>
          )}
        </>
      )}
    </div>
  )
}
