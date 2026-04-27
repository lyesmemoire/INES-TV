export default function TVHeader({ channelCount }: { channelCount: number }) {
  return (
    <header className="px-10 py-6 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent">
      <h1 className="text-3xl font-bold">TV Mode</h1>
      <span className="text-gray-400">{channelCount} channels</span>
    </header>
  )
}
