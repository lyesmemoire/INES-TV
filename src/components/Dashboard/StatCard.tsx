type Props = {
  title: string;
  value: string | number;
  subtitle?: string;
};

export default function StatCard({ title, value, subtitle }: Props) {
  return (
    <div className="bg-white rounded-2xl shadow p-5 flex flex-col gap-2">
      <span className="text-gray-500 text-sm">{title}</span>
      <span className="text-2xl font-semibold">{value}</span>
      {subtitle && (
        <span className="text-xs text-gray-400">{subtitle}</span>
      )}
    </div>
  );
}
