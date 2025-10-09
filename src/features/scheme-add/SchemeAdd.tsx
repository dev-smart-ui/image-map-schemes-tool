import { Button } from "@/components/ui/buttons/Button"
import { Divider } from "../scheme-mapper/Divider"
import { useState } from "react";
import { safeFetchJson } from "@/services/safeFetchJson";
import classNames from "classnames";

export const SchemeAdd = () => {
  const [error, setError] = useState('');
  const [errorJson, setErrorJson] = useState(false);
  const [result, setResult] = useState('');
  const [jsonText, setJsonText] = useState('')
  const [schemeName, setSchemeName] = useState('')
  const [schemeImageUrl, setSchemeImageUrl] = useState('')
  const [saving, setSaving] = useState(false);

  const onJsonTextChangeHandler = (value: string) => {
    setError('');
    setErrorJson(false);
    setSchemeName('');
    setSchemeImageUrl('');

    let parsedValue: any = '';
    setJsonText(value);

    try {
      parsedValue = JSON.parse(value);
    } catch {
      setError("Invalid JSON");
      setErrorJson(true);

      return
    }

    const schemeNameToBeSaved = parsedValue?.name;
    const schemeImageUrlToBeSaved = parsedValue?.image?.url;

    if (schemeNameToBeSaved) {
      setSchemeName(schemeNameToBeSaved)
    }

    if (schemeImageUrlToBeSaved) {
      setSchemeImageUrl(schemeImageUrlToBeSaved)
    }    
  }

  const onSave = async () => {
    setError('');
    setResult('');

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

  return (
    <div>
      <div className="flex items-start gap-4">
        <div className="flex flex-col gap-2">
          <label htmlFor="inputSchemeName">Scheme name:</label>
          <input 
            id="inputSchemeName" 
            type="text" 
            className="bg-[var(--primary-color)] p-2 text-[14px]" 
            value={schemeName} 
            onChange={e => setSchemeName(e.target.value)} 
          />
        </div>
        <div className="flex flex-col gap-2 w-full">
          <label htmlFor="schemeImageUrl">Scheme image url:</label>
          <input 
            id="schemeImageUrl" 
            type="text" 
            className="bg-[var(--primary-color)] p-2 text-[14px]" 
            value={schemeImageUrl} 
            onChange={e => setSchemeImageUrl(e.target.value)} 
          />
        </div>
      </div>

      <div className="flex flex-col gap-2 mt-4">
        <label htmlFor="addPayload" className="">Payload JSON</label>
        <textarea
          id="addPayload"
          rows={18}
          spellCheck={false}
          className={classNames('w-full p-3 rounded-lg border border-[var(--primary-color)]', {
            '!border-[var(--error-color)] outline-none': errorJson,
          })}
          value={jsonText}
          onChange={e => onJsonTextChangeHandler(e.target.value)}
        />
      </div>

      <Button 
        className="mt-8"
        onClick={onSave}
        disabled={!jsonText || !schemeName || !schemeImageUrl}
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
