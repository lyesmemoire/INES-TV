export default function VideoPlayerOverlay({ state, onRetry }: any) {
  if (state.error) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-40">
        <div className="text-center">
          <p className="text-red-500 mb-4">{state.error}</p>
          <button onClick={onRetry} className="bg-red-600 px-4 py-2 rounded text-white font-bold">Retry</button>
        </div>
      </div>
    )
  }
  return null
}
