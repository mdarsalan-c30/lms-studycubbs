"use client";

import { useRouter, useSearchParams } from "next/navigation";

export function MonthFilter({ currentMonth }: { currentMonth: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const years = ["2024", "2025", "2026"];
  const options = years.flatMap(y => months.map(m => `${m} ${y}`));

  const handleMonthChange = (month: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("month", month);
    router.push(`/admin/fees?${params.toString()}`);
  };

  return (
    <select 
      value={currentMonth}
      onChange={(e) => handleMonthChange(e.target.value)}
      className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold shadow-sm outline-none cursor-pointer hover:bg-slate-50 transition-all text-slate-900 h-10"
    >
      {options.map(m => (
        <option key={m} value={m}>{m}</option>
      ))}
    </select>
  );
}
