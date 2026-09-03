export type SignalStatus = "Normal" | "Watch" | "Critical";
export type SignalDateFilter = "all" | "today" | "7d" | "30d";
export type SignalSortOrder = "newest" | "oldest";

export type SignalRecord = {
  timestamp: string;
  signal: string;
  reading: string;
  unit: string;
  status: SignalStatus;
};

export function filterAndSortSignals(
  records: SignalRecord[],
  dateFilter: SignalDateFilter,
  statusFilter: SignalStatus | "all",
  sortOrder: SignalSortOrder,
  now = new Date(),
): SignalRecord[] {
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  const dateThresholds: Record<Exclude<SignalDateFilter, "all">, number> = {
    today: startOfToday.getTime(),
    "7d": now.getTime() - 7 * 24 * 60 * 60 * 1000,
    "30d": now.getTime() - 30 * 24 * 60 * 60 * 1000,
  };
  const threshold = dateFilter === "all" ? null : dateThresholds[dateFilter];

  return records
    .filter((record) => {
      const matchesStatus = statusFilter === "all" || record.status === statusFilter;
      const recordTime = new Date(record.timestamp).getTime();
      const matchesDate = threshold === null || recordTime >= threshold;
      return matchesStatus && matchesDate;
    })
    .sort((left, right) => {
      const difference = new Date(left.timestamp).getTime() - new Date(right.timestamp).getTime();
      return sortOrder === "newest" ? -difference : difference;
    });
}

function escapeCsvValue(value: string): string {
  return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

export function signalsToCsv(records: SignalRecord[]): string {
  const header = ["Date", "Signal", "Reading", "Unit", "Status"];
  const rows = records.map((record) => [record.timestamp, record.signal, record.reading, record.unit, record.status]);
  return [header, ...rows].map((row) => row.map(escapeCsvValue).join(",")).join("\n");
}
