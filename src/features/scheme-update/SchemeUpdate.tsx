import { Button } from "@/components/ui/buttons/Button"
import { useEffect, useState } from "react";
import { Divider } from "../scheme-mapper/Divider";
import { safeFetchJson } from "@/services/safeFetchJson";
import classNames from "classnames";

export const SchemeUpdate = () => {
  const [schemes, setSchemes] = useState([]);
  const [error, setError] = useState('');
  const [result, setResult] = useState('');
  const [selectedScheme, setSelectedScheme] = useState("");
  const [updateJsonText, setUpdateJsonText] = useState("");
  const [isLoadingSchemes, setIsLoadingSchemes] = useState(false);
  const [isUpdatingSchemes, setIsUpdatingSchemes] = useState(false);
  const [isLoadingJsonByScheme, setIsLoadingJsonByScheme] = useState(false);

  const loadSchemes = async () => {
    setIsLoadingSchemes(true);
    setError('');
    setResult('');

    const { ok, status, data } = await safeFetchJson("/api/sheets/floors");

    if (!ok || !data.ok) {
      setError(data.error || `HTTP ${status}`);
      setSchemes([]);
    } else {
      setSchemes(data.floors || []);

      if (data.floors?.length && !selectedScheme) setSelectedScheme(String(data.floors[0]));
    }

    setIsLoadingSchemes(false);
  }

  const loadJsonByScheme = async () => {
    if (!selectedScheme) return;
    
    setIsLoadingJsonByScheme(true);
    setError('');
    setResult('');

    const { ok, status, data } = await safeFetchJson(
      `/api/sheets/polygons?floor=${encodeURIComponent(selectedScheme)}`
    );

    if (!ok || !data.ok) {
      setError(data.error || `HTTP ${status}`);
    } else {
      setUpdateJsonText(JSON.stringify(data.payload, null, 2));
    }

    setIsLoadingJsonByScheme(false);
  }

  const onUpdateSchemes = async () => {
    setIsUpdatingSchemes(true);
    setError('');
    setResult('');

    let parsed: any;
    try {
      parsed = JSON.parse(updateJsonText);
    } catch (e: any) {
      setError(e?.message || "Invalid JSON");
      setIsUpdatingSchemes(false);

      return;
    }

    const body = {
      name: String(parsed?.name ?? ""),
      url: String(parsed?.image?.url ?? ""),
      json: parsed,
      mode: "update",
    };
    if (!body.name || !body.url) {
      setError("Payload must contain name and image.url");
      setIsUpdatingSchemes(false);
      return;
    }

    const { ok, status, data } = await safeFetchJson("/api/sheets/upsert", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    setResult(data);
    
    if (!ok || !data.success) setError(data.error || `HTTP ${status}`);

    setIsUpdatingSchemes(false);
  }

  useEffect(() => {
    loadSchemes()
  }, [])

  useEffect(() => {
    if (selectedScheme) {
      loadJsonByScheme()
    }    
  }, [selectedScheme])

  return (
    <div>
      <div className="flex gap-2 items-center">
        <Button 
          type="secondary"
          onClick={loadSchemes}
          withIcon
        >
          {isLoadingSchemes ? "Reloading..." : "Reload schemes"}
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
          </svg>
        </Button>

        { !!schemes.length && (
          <select
            className="p-2 min-w-[180px] border border-[var(--primary-color)] rounded-lg"
            onChange={(e) => setSelectedScheme(e.target.value)}
          >
            <option value="">Select scheme...</option>
            {schemes.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        )}        
      </div>

      <div className="flex flex-col gap-2 mt-4">
        <label htmlFor="updatePayload" className="">Payload JSON</label>
        <textarea
          id="updatePayload"
          rows={18}
          spellCheck={false}
          className={classNames('w-full p-3 rounded-lg border border-[var(--primary-color)]', {
            'bg-[var(--primary-color)] pointer-events-none': !schemes.length
          })}
          value={updateJsonText}
          onChange={(e) => setUpdateJsonText(e.target.value)}
          placeholder={isLoadingJsonByScheme ? 'Loading json...' : ''}
          readOnly={!schemes.length}
        />
      </div>

      <Button 
        className="mt-8"
        onClick={onUpdateSchemes}
        disabled={!updateJsonText}
        withIcon
      >
        {isUpdatingSchemes ? "Updating..." : "Update"}
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
