// app/page.tsx
import StatPieChart from "@/components/dashboard/PieChart";
import TrendRefundValues from "@/components/dashboard/Refund";
import TrendTicketCount from "@/components/dashboard/TicketCount";
import ExportPanel from "@/components/dashboard/ExportPanes";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 px-2 py-2 lg:px-10">
      {/* Header */}
      <div className="mb-2">
        <h1 className="font-header text-3xl text-gray-800">Dashboard</h1>
        <p className="text-sm text-gray-500">
          Ringkasan proses refund &amp; exchange ticket.
        </p>
      </div>

      {/* Layout: kiri chart, kanan export */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_320px]">
        {/* Kiri: 3 chart */}
        <div className="space-y-6">
          {/* Baris 1: Pie full width (atau bisa dipasangkan nanti) */}
          <StatPieChart />

          {/* Baris 2: 2 line chart side by side */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <TrendRefundValues />
            <TrendTicketCount />
          </div>
        </div>

        {/* Kanan: Export panel (sticky) */}
        <div className="xl:sticky xl:top-6 xl:self-start">
          <ExportPanel />
        </div>
      </div>
    </div>
  );
}
