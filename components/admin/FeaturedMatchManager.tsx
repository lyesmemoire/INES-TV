"use client"

import { useEffect, useState } from "react"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

interface Match {
  id: string
  homeTeam: string
  awayTeam: string
  status: string
}

function SortableItem({ match }: { match: Match }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: match.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`bg-[#111] border ${isDragging ? 'border-red-500 shadow-2xl scale-[1.02]' : 'border-white/10 hover:border-white/20'} p-4 rounded-xl mb-3 cursor-grab flex items-center justify-between transition-colors`}
    >
      <div className="flex items-center space-x-4">
        <span className="text-xl cursor-grab active:cursor-grabbing text-gray-500">
          ⋮⋮
        </span>
        <span className="text-yellow-500 text-xl">⭐</span>
        <span className="font-semibold text-white text-lg">
          {match.homeTeam} <span className="text-gray-500 font-normal mx-2">vs</span> {match.awayTeam}
        </span>
      </div>
      {match.status === "LIVE" && (
        <span className="px-2 py-1 bg-red-500/20 text-red-500 text-xs font-bold uppercase tracking-wider rounded">
          Live
        </span>
      )}
    </div>
  )
}

export default function FeaturedMatchManager() {
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  useEffect(() => {
    fetch("/api/admin/matches/featured")
      .then(res => res.json())
      .then(data => {
        setMatches(data)
        setLoading(false)
      })
      .catch(console.error)
  }, [])

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over) return

    if (active.id !== over.id) {
      setMatches((items) => {
        const oldIndex = items.findIndex(m => m.id === active.id)
        const newIndex = items.findIndex(m => m.id === over.id)
        return arrayMove(items, oldIndex, newIndex)
      })
    }
  }

  async function saveOrder() {
    setSaving(true)
    try {
      const res = await fetch("/api/admin/matches/featured", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          featuredIds: matches.map(m => m.id)
        })
      })
      
      if (!res.ok) {
        const errorText = await res.text()
        alert(`Error: ${errorText}`)
      } else {
        // Show success somehow, maybe a toast in real app. Alert for now per user spec.
        alert("Featured order successfully updated!")
      }
    } catch (err) {
      console.error(err)
      alert("An error occurred while saving.")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="text-gray-400 p-4 bg-white/5 rounded-xl animate-pulse">Loading featured matches...</div>
  }

  return (
    <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 shadow-2xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            Featured Matches
            <span className="bg-yellow-500/20 text-yellow-500 text-xs px-2 py-1 rounded-full">
              Max 3
            </span>
          </h2>
          <p className="text-sm text-gray-400 mt-1">Drag and drop to reorder matches shown in the Hero section.</p>
        </div>
        
        <button
          onClick={saveOrder}
          disabled={saving || matches.length === 0}
          className="bg-red-600 hover:bg-red-700 disabled:bg-red-600/50 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-lg font-bold transition-colors shadow-lg shadow-red-500/20"
        >
          {saving ? "Saving..." : "Save Order"}
        </button>
      </div>

      {matches.length > 0 ? (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext
            items={matches.map(m => m.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2">
              {matches.map(match => (
                <SortableItem key={match.id} match={match} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      ) : (
        <div className="text-center py-12 bg-white/5 rounded-xl border border-dashed border-white/10">
          <span className="text-4xl opacity-50 mb-4 block">⭐</span>
          <p className="text-gray-400 font-medium">No matches are currently featured.</p>
          <p className="text-sm text-gray-500 mt-1">Edit a match to feature it, or wait for a match to go LIVE.</p>
        </div>
      )}
    </div>
  )
}
