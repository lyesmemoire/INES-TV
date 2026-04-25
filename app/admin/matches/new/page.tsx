"use client";

import MatchForm from "@/components/Admin/MatchForm";

export default function NewMatchPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-black mb-2">Créer un nouveau match</h1>
        <p className="text-zinc-500">
          Ajoutez un match avec toutes ses sources de streaming
        </p>
      </div>

      <MatchForm />
    </div>
  );
}
