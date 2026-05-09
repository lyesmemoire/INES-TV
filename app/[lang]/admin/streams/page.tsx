"use client"

import { useState } from "react"
import SafeClient from "@/components/SafeClient"


export default function AdminStreamsPage() {
  const [m3uUrl, setM3uUrl] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [fbUrl, setFbUrl] = useState("")
  const [ytUrl, setYtUrl] = useState("")

  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  // =====================
  // HANDLE IMPORT
  // =====================
  const handleImport = async () => {
    setLoading(true)
    setResult(null)

    try {
      let body: any = {}

      // M3U URL
      if (m3uUrl) {
        body.m3uUrl = m3uUrl
      }

      // FILE UPLOAD
      if (file) {
        const text = await file.text()
        body.m3uContent = text
      }

      // SOCIAL LINKS
      if (fbUrl) body.fbUrl = fbUrl
      if (ytUrl) body.ytUrl = ytUrl


      const res = await fetch("/api/streams/import", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
      })

      const data = await res.json()
      setResult(data)
    } catch (err) {
      console.error(err)
      setResult({ error: "Import failed" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeClient>
      <div className="min-h-screen bg-black text-white p-8">
        <div className="max-w-4xl mx-auto space-y-8">

          <h1 className="text-3xl font-bold">
            📡 IPTV Import Manager
          </h1>

          {/* ===================== */}
          {/* M3U8 LINK */}
          {/* ===================== */}
          <div className="bg-white/5 p-6 rounded-xl space-y-4 border border-white/10">
            <h2 className="text-xl font-semibold">M3U8 Link</h2>

            <input
              type="text"
              placeholder="https://example.com/stream.m3u8 or playlist.m3u"
              value={m3uUrl}
              onChange={(e) => setM3uUrl(e.target.value)}
              className="w-full p-3 bg-black border border-gray-700 rounded-lg focus:border-red-600 outline-none transition"
            />
          </div>

          {/* ===================== */}
          {/* FILE UPLOAD */}
          {/* ===================== */}
          <div className="bg-white/5 p-6 rounded-xl space-y-4 border border-white/10">
            <h2 className="text-xl font-semibold">Upload File</h2>

            <input
              type="file"
              accept=".m3u,.m3u8"
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  setFile(e.target.files[0])
                }
              }}
              className="block w-full text-sm text-gray-400
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-red-600 file:text-white
                hover:file:bg-red-700 transition"
            />
          </div>


          {/* ===================== */}
          {/* SOCIAL LINKS */}
          {/* ===================== */}
          <div className="bg-white/5 p-6 rounded-xl space-y-6 border border-white/10">
            <h2 className="text-xl font-semibold flex items-center gap-2">
               📡 Social Media Streams
            </h2>

            <div className="space-y-2">
               <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Facebook Live URL</label>
               <input
                 type="text"
                 placeholder="https://facebook.com/watch/live/..."
                 value={fbUrl}
                 onChange={(e) => setFbUrl(e.target.value)}
                 className="w-full p-3 bg-black border border-gray-700 rounded-lg focus:border-blue-500 outline-none transition"
               />
            </div>

            <div className="space-y-2">
               <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">YouTube Live URL</label>
               <input
                 type="text"
                 placeholder="https://youtube.com/watch?v=..."
                 value={ytUrl}
                 onChange={(e) => setYtUrl(e.target.value)}
                 className="w-full p-3 bg-black border border-gray-700 rounded-lg focus:border-red-600 outline-none transition"
               />
            </div>
          </div>


          {/* ===================== */}
          {/* ACTION */}
          {/* ===================== */}
          <button
            onClick={handleImport}
            disabled={loading}
            className="w-full py-4 bg-red-600 hover:bg-red-700 rounded-xl font-bold text-lg shadow-lg shadow-red-600/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Importing..." : "🚀 Start Import"}
          </button>

          {/* ===================== */}
          {/* RESULT */}
          {/* ===================== */}
          {result && (
            <div className={`p-6 rounded-xl border ${result.error ? 'bg-red-500/10 border-red-500/50' : 'bg-green-500/10 border-green-500/50'}`}>
              <h3 className={`font-bold mb-2 ${result.error ? 'text-red-500' : 'text-green-500'}`}>
                {result.error ? '❌ Error' : '✅ Success'}
              </h3>
              <pre className="text-sm overflow-auto max-h-40">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </SafeClient>
  )
}
