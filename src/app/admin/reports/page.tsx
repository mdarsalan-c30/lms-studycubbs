// Admin Reports page
import { BarChart3, TrendingUp, Users, DollarSign, BookOpen, Award } from "lucide-react";

const monthlyData = [
  { month: "Nov", enrolled: 8, revenue: 64000 },
  { month: "Dec", enrolled: 12, revenue: 96000 },
  { month: "Jan", enrolled: 18, revenue: 144000 },
  { month: "Feb", enrolled: 22, revenue: 176000 },
  { month: "Mar", enrolled: 28, revenue: 224000 },
  { month: "Apr", enrolled: 14, revenue: 112000 },
];

const maxRevenue = Math.max(...monthlyData.map(d => d.revenue));
const maxEnrolled = Math.max(...monthlyData.map(d => d.enrolled));

const topBatches = [
  { name: "English Speaking A1", enrolled: 18, revenue: 144000, completion: 90 },
  { name: "Public Speaking L1", enrolled: 15, revenue: 150000, completion: 75 },
  { name: "English Speaking B2", enrolled: 12, revenue: 108000, completion: 80 },
];

export default function ReportsPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Reports & Analytics</h1>
        <p className="text-slate-500 mt-1">Platform performance overview</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-8">
        {[
          { label: "Total Revenue", value: "₹8,16,000", sub: "All time", icon: DollarSign, color: "text-violet-600", bg: "bg-violet-50" },
          { label: "Total Students", value: "128", sub: "+12 this month", icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Avg. Performance", value: "78%", sub: "Across all batches", icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Completion Rate", value: "82%", sub: "Assignments done", icon: Award, color: "text-amber-600", bg: "bg-amber-50" },
        ].map(k => (
          <div key={k.label} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <div className={`w-9 h-9 ${k.bg} rounded-xl flex items-center justify-center mb-3`}>
              <k.icon size={18} className={k.color} />
            </div>
            <p className="text-2xl font-bold text-slate-900">{k.value}</p>
            <p className="text-sm font-medium text-slate-600 mt-0.5">{k.label}</p>
            <p className="text-xs text-slate-400 mt-0.5">{k.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
        {/* Revenue Chart */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h2 className="font-semibold text-slate-900 mb-6">Monthly Revenue</h2>
          <div className="flex items-end gap-3 h-40">
            {monthlyData.map(d => (
              <div key={d.month} className="flex-1 flex flex-col items-center gap-2">
                <span className="text-xs text-slate-500 font-medium">₹{(d.revenue / 1000).toFixed(0)}k</span>
                <div className="w-full bg-slate-100 rounded-t-lg relative" style={{ height: `${(d.revenue / maxRevenue) * 120}px` }}>
                  <div className="absolute inset-0 bg-gradient-to-t from-violet-600 to-violet-400 rounded-t-lg" />
                </div>
                <span className="text-xs text-slate-500">{d.month}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Enrollment Chart */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h2 className="font-semibold text-slate-900 mb-6">Monthly Enrollments</h2>
          <div className="flex items-end gap-3 h-40">
            {monthlyData.map(d => (
              <div key={d.month} className="flex-1 flex flex-col items-center gap-2">
                <span className="text-xs text-slate-500 font-medium">{d.enrolled}</span>
                <div className="w-full bg-slate-100 rounded-t-lg relative" style={{ height: `${(d.enrolled / maxEnrolled) * 120}px` }}>
                  <div className="absolute inset-0 bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t-lg" />
                </div>
                <span className="text-xs text-slate-500">{d.month}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Performing Batches */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
        <div className="p-6 border-b border-slate-50"><h2 className="font-semibold text-slate-900">Top Performing Batches</h2></div>
        <div className="divide-y divide-slate-50">
          {topBatches.map((batch, i) => (
            <div key={batch.name} className="flex items-center gap-4 px-6 py-4">
              <span className="text-2xl font-black text-slate-200">#{i + 1}</span>
              <div className="flex-1">
                <p className="font-semibold text-slate-900">{batch.name}</p>
                <p className="text-sm text-slate-500">{batch.enrolled} students · ₹{batch.revenue.toLocaleString()} revenue</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-slate-900">{batch.completion}%</p>
                <p className="text-xs text-slate-400">completion</p>
              </div>
              <div className="w-24 bg-slate-100 rounded-full h-2">
                <div className="bg-violet-500 h-2 rounded-full" style={{ width: `${batch.completion}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
