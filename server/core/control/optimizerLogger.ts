export function logOptimizerDecision(data: {
  key: string;
  suggested: number;
  final: number;
  fillRate: number;
  forecastDelta: number;
}) {
  console.log("🧠 OPTIMIZER", {
    key: data.key,
    suggested: data.suggested.toFixed(3),
    final: data.final.toFixed(3),
    fillRate: data.fillRate.toFixed(3),
    delta: data.forecastDelta.toFixed(5),
  });
}
