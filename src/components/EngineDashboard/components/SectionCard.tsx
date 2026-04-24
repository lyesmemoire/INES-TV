import React from 'react';

export default function SectionCard({ section, index }: { section: any; index: number }) {
  return (
    <div id={section.id} className="p-6 bg-slate-900 border border-slate-800 rounded-xl hover:border-indigo-500/50 transition-colors">
      <h2 className="text-xl font-bold text-white mb-2">{section.title}</h2>
      <p className="text-slate-400 leading-relaxed">{section.description}</p>
    </div>
  );
}
