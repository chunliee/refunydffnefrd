// lib/dummy-data.ts

// 1. Pie: 1_action distribution
export const actionDistribution = [
  { name: "Autocheck", value: 3750, fill: "#3b82f6" }, // biru
  { name: "Manual", value: 220, fill: "#f97316" }, // oranye
  { name: "Rejected", value: 80, fill: "#ef4444" }, // merah
];

// helper generate 14 hari terakhir
const last14Days = () => {
  const days: string[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().slice(0, 10)); // yyyy-mm-dd
  }
  return days;
};

const days = last14Days();

// 2. Line: sum 46_refund_values per day (exclude rejected)
//    range realistis 10k - 15k
export const refundValuesTrend = days.map((date, i) => ({
  date,
  value: Math.round(10000 + Math.random() * 5000 + Math.sin(i / 2) * 1500),
}));

// 3. Line: count _id per day (exclude rejected)
//    range realistis 2 MILYAR - 5 MILYAR
export const ticketCountTrend = days.map((date, i) => ({
  date,
  count: Math.round(
    2_000_000_000 +
      Math.random() * 3_000_000_000 +
      Math.cos(i / 2) * 400_000_000,
  ),
}));
