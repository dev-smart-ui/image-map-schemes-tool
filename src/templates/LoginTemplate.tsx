'use client'

import { Button } from "@/components/ui/buttons/Button";
import { useState } from "react";

export const LoginTemplate = () => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setError('');

    const res = await fetch('/api/simple-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      window.location.href = '/';
    } else {
      setPassword('');
      setError('Wrong password!');
    }
  };

  const onSendHanler = () => {
    handleLogin()
  }

  return (
    <div className="min-h-screen flex">
      <div className="m-auto w-full max-w-[400px] bg-white p-4 rounded-lg flex flex-col">
        <div className="font-bold text-[18px] flex justify-between items-center gap-2">
          Authorization
        </div>
        <div className="border-t border-[var(--primary-color)] pt-2 mt-2 text-[14px] max-h-[500px] overflow-auto">
          <div className="flex flex-col gap-2">
            <label htmlFor="inputPassword">Password:</label>
            <input 
              id="inputPassword"
              type="password" 
              className="bg-[var(--primary-color)] p-2 text-[14px]" 
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>

          {error && (
            <div className="text-[var(--error-color)] mt-2">{error}</div>
          )}
        </div>
        
        <div className="mt-8">
          <Button 
            type="default" 
            onClick={onSendHanler}
            disabled={!password}
          >
            Send
          </Button>
        </div>
      </div>
    </div>
  );
}