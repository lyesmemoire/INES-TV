"use client";

import { useEffect, useState } from "react";

export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  const [pathname, setPathname] = useState("");

  useEffect(() => {
    setPathname(window.location.pathname);
  }, []);

  console.error(error);

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <div className="max-w-lg w-full">
        <h1 className="text-xl font-bold mb-4">
          Erreur sur <code>{pathname || "/"}</code>
        </h1>

        <p className="text-red-400 mb-4">
          {error.message || "Erreur inconnue"}
        </p>

        {error.stack && (
          <pre className="text-xs bg-gray-900 p-4 rounded overflow-auto max-h-[300px]">
            {error.stack}
          </pre>
        )}
      </div>
    </div>
  );
}
