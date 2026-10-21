// app/page.tsx
import StatPieChart from "@/components/dashboard/PieChart";
import TrendRefundValues from "@/components/dashboard/Refund";
import SlaPieChart from "@/components/dashboard/Slapiechart";
import ExportPanel from "@/components/dashboard/ExportPanes";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 px-2 py-2 lg:px-10">
      <div className="space-y-6">
        {/* Baris atas: 2 chart */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <StatPieChart />
          <SlaPieChart />
        </div>

        {/* Baris bawah: chart + export */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <TrendRefundValues />
          <ExportPanel />
        </div>
      </div>
    </div>
  );
}
