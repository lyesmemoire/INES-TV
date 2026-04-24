type Props = {
  data: number[];
};

export default function Chart({ data }: Props) {
  const max = Math.max(...data, 1);

  return (
    <div className="w-full h-40 flex items-end gap-1">
      {data.map((v, i) => (
        <div
          key={i}
          className="bg-blue-500 rounded"
          style={{
            height: `${(v / max) * 100}%`,
            width: "100%",
          }}
        />
      ))}
    </div>
  );
}
