import React from 'react';

export default function Sidebar({ sections, activeId }: { sections: any[]; activeId: string }) {
  return (
    <aside className="w-64 hidden lg:block sticky top-24 h-fit">
      <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4">Architecture</h3>
      <nav className="flex flex-col gap-2">
        {sections.map(s => (
          <a
            key={s.id}
            href={`#${s.id}`}
            className={`text-sm py-2 border-l-2 pl-4 transition-all ${
              activeId === s.id ? 'border-indigo-500 text-indigo-400 font-bold' : 'border-slate-800 text-slate-500 hover:text-slate-300 hover:border-slate-600'
            }`}
          >
            {s.title}
          </a>
        ))}
      </nav>
    </aside>
  );
}
