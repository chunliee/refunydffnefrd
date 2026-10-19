// app/page.tsx
import StatPieChart from "@/components/dashboard/PieChart";
import TrendRefundValues from "@/components/dashboard/Refund";
import ExportPanel from "@/components/dashboard/ExportPanes";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 px-2 py-2 lg:px-10">
      {/* Header */}
      {/* <div className="mb-2">
        <h1 className="font-header text-3xl text-gray-800">Dashboard</h1>
        <p className="text-sm text-gray-500">
          Ringkasan proses refund &amp; exchange ticket.
        </p>
      </div> */}

      {/* Layout: kiri chart, kanan export */}

      <div className="space-y-6">
        {/* Baris atas: dua chart */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <StatPieChart />
          <TrendRefundValues />
        </div>

        {/* Baris bawah: export full width */}
        <ExportPanel />
      </div>
    </div>
  );
}
