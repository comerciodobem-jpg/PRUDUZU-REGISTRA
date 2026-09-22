export function WeeklyBars({
  days,
}: {
  days: Array<{ key: string; label: string; count: number }>;
}) {
  const max = Math.max(1, ...days.map((day) => day.count));
  return (
    <div className="weekly-chart" aria-label="Registros dos últimos sete dias">
      {days.map((day) => (
        <div className="weekly-column" key={day.key}>
          <div className="weekly-value">{day.count}</div>
          <div className="weekly-track">
            <span style={{ height: `${Math.max(5, (day.count / max) * 100)}%` }} />
          </div>
          <strong>{day.label}</strong>
        </div>
      ))}
    </div>
  );
}
