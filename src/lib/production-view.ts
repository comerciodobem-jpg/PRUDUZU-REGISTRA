import type { ProductionRecord } from "@/domain/types";

const APP_TIME_ZONE = "America/Belem";

function dateParts(value: Date | string) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: APP_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
  }).formatToParts(new Date(value));

  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";

  return {
    year: Number(get("year")),
    month: Number(get("month")),
    day: Number(get("day")),
    weekday: get("weekday"),
    key: `${get("year")}-${get("month")}-${get("day")}`,
  };
}

function belemMidday(parts: { year: number; month: number; day: number }): Date {
  return new Date(Date.UTC(parts.year, parts.month - 1, parts.day, 15));
}

function startOfWeek(now: Date): Date {
  const local = dateParts(now);
  const anchor = belemMidday(local);
  const weekday = new Intl.DateTimeFormat("en-US", {
    timeZone: APP_TIME_ZONE,
    weekday: "short",
  }).format(anchor);
  const index = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(weekday);
  const mondayDelta = index === 0 ? -6 : 1 - index;
  anchor.setUTCDate(anchor.getUTCDate() + mondayDelta);
  return anchor;
}

export function recordsForPeriod(
  records: ProductionRecord[],
  period: "today" | "week" | "month",
  now = new Date(),
): ProductionRecord[] {
  const nowParts = dateParts(now);
  if (period === "today") {
    return records.filter((record) => dateParts(record.recordedAt).key === nowParts.key);
  }

  if (period === "month") {
    return records.filter((record) => {
      const parts = dateParts(record.recordedAt);
      return parts.year === nowParts.year && parts.month === nowParts.month;
    });
  }

  const start = startOfWeek(now);
  const nextWeek = new Date(start);
  nextWeek.setUTCDate(nextWeek.getUTCDate() + 7);

  return records.filter((record) => {
    const recordDate = belemMidday(dateParts(record.recordedAt));
    return recordDate >= start && recordDate < nextWeek;
  });
}

export function aggregateByUnit(records: ProductionRecord[]): string {
  if (records.length === 0) return "0";
  const totals = new Map<string, number>();
  for (const record of records) {
    totals.set(
      record.unit,
      (totals.get(record.unit) ?? 0) + record.declaredQuantity,
    );
  }
  return [...totals.entries()]
    .map(([unit, quantity]) => `${formatNumber(quantity)} ${unit}`)
    .join(" · ");
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    maximumFractionDigits: 3,
  }).format(value);
}

export function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: APP_TIME_ZONE,
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function lastSevenDayCounts(
  records: ProductionRecord[],
  now = new Date(),
): Array<{ key: string; label: string; count: number }> {
  const today = belemMidday(dateParts(now));
  const result = [];
  const weekday = new Intl.DateTimeFormat("pt-BR", {
    timeZone: APP_TIME_ZONE,
    weekday: "short",
  });

  for (let offset = 6; offset >= 0; offset -= 1) {
    const day = new Date(today);
    day.setUTCDate(day.getUTCDate() - offset);
    const key = dateParts(day).key;
    result.push({
      key,
      label: weekday.format(day).replace(".", "").slice(0, 3),
      count: records.filter((record) => dateParts(record.recordedAt).key === key).length,
    });
  }

  return result;
}
