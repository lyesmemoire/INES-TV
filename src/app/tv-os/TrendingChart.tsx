'use client'

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

export default function TrendingChart({ data }: { data: any[] }) {
  if (!data || data.length === 0) {
    return (
      <div className="h-[400px] flex items-center justify-center border-2 border-dashed border-white/5 rounded-3xl">
        <p className="text-gray-600 font-bold text-lg animate-pulse">En attente de signaux tèlèmétriques Cloud...</p>
      </div>
    )
  }

  return (
    <div className="h-[450px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 90 }}>
          <defs>
            <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#4F46E5" stopOpacity={1} />
              <stop offset="100%" stopColor="#818CF8" stopOpacity={0.8} />
            </linearGradient>
          </defs>
          <XAxis 
            dataKey="name" 
            stroke="#4B5563" 
            tick={{fill: '#9CA3AF', fontSize: 11, fontWeight: 700}} 
            angle={-40} 
            textAnchor="end" 
            interval={0}
            height={80}
            axisLine={false}
            tickLine={false}
          />
          <YAxis 
            stroke="#4B5563" 
            tick={{fill: '#9CA3AF', fontSize: 10}} 
            axisLine={false}
            tickLine={false}
          />
          <Tooltip 
            cursor={{fill: 'rgba(255,255,255,0.03)'}} 
            contentStyle={{
              backgroundColor: '#0F0F13', 
              borderColor: '#1F2937', 
              borderRadius: '16px', 
              color: '#fff',
              boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
              border: '1px solid rgba(255,255,255,0.1)'
            }} 
            itemStyle={{color: '#818CF8', fontWeight: 800}}
            labelStyle={{color: '#fff', marginBottom: '4px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '4px'}}
          />
          <Bar dataKey="Heat" fill="url(#barGradient)" radius={[6, 6, 0, 0]}>
             {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fillOpacity={1 - (index * 0.05)} />
             ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
