import { Calendar, Clock, BookOpen, Video } from "lucide-react";
import { Button } from "@/components/ui/button";

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const schedule = [
  { day: "Mon", entries: [{ time: "6:00 PM", batch: "English Speaking A1", topic: "Pronunciation Basics", duration: "90 min" }, { time: "8:00 PM", batch: "English Speaking B2", topic: "Advanced Grammar", duration: "90 min" }] },
  { day: "Tue", entries: [] },
  { day: "Wed", entries: [{ time: "6:00 PM", batch: "English Speaking A1", topic: "Vowel Sounds", duration: "90 min" }, { time: "8:00 PM", batch: "English Speaking B2", topic: "Tense Review", duration: "90 min" }] },
  { day: "Thu", entries: [] },
  { day: "Fri", entries: [{ time: "6:00 PM", batch: "English Speaking A1", topic: "Reading Skills", duration: "90 min" }] },
  { day: "Sat", entries: [] },
  { day: "Sun", entries: [] },
];

const colorMap: Record<string, string> = {
  "English Speaking A1": "bg-blue-100 text-blue-800 border-blue-200",
  "English Speaking B2": "bg-indigo-100 text-indigo-800 border-indigo-200",
};

export default function TeacherSchedulePage() {
  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Schedule</h1>
          <p className="text-slate-500 mt-1">Week of April 4–10, 2026</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">← Prev Week</Button>
          <Button variant="outline" size="sm">Next Week →</Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center"><Calendar size={16} className="text-blue-600" /></div>
            <p className="text-sm font-medium text-slate-600">Classes This Week</p>
          </div>
          <p className="text-2xl font-bold text-slate-900">5</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center"><Clock size={16} className="text-emerald-600" /></div>
            <p className="text-sm font-medium text-slate-600">Total Hours</p>
          </div>
          <p className="text-2xl font-bold text-slate-900">7.5 hrs</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-violet-50 rounded-lg flex items-center justify-center"><BookOpen size={16} className="text-violet-600" /></div>
            <p className="text-sm font-medium text-slate-600">Active Batches</p>
          </div>
          <p className="text-2xl font-bold text-slate-900">2</p>
        </div>
      </div>

      {/* Weekly Grid */}
      <div className="grid grid-cols-7 gap-3">
        {schedule.map(day => (
          <div key={day.day} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className={`px-3 py-2 text-center border-b border-slate-100 ${day.entries.length > 0 ? "bg-blue-50" : "bg-slate-50"}`}>
              <p className={`text-xs font-bold ${day.entries.length > 0 ? "text-blue-700" : "text-slate-400"}`}>{day.day}</p>
            </div>
            <div className="p-2 min-h-32 space-y-2">
              {day.entries.length === 0 ? (
                <p className="text-xs text-slate-300 text-center mt-4">Free</p>
              ) : day.entries.map(entry => (
                <div key={entry.time} className={`p-2 rounded-lg border text-xs ${colorMap[entry.batch] || "bg-slate-100 text-slate-700 border-slate-200"}`}>
                  <p className="font-bold">{entry.time}</p>
                  <p className="font-medium leading-tight mt-0.5">{entry.batch}</p>
                  <p className="opacity-70 mt-0.5">{entry.duration}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Upcoming classes list */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm mt-6">
        <div className="p-6 border-b border-slate-50"><h2 className="font-semibold text-slate-900">Upcoming Classes</h2></div>
        <div className="divide-y divide-slate-50">
          {[
            { batch: "English Speaking A1", time: "Today, 6:00 PM", topic: "Pronunciation Basics", link: "https://meet.google.com/abc-def-ghi" },
            { batch: "English Speaking B2", time: "Today, 8:00 PM", topic: "Advanced Grammar", link: "https://meet.google.com/xyz-uvw-rst" },
            { batch: "English Speaking A1", time: "Wed, 6:00 PM", topic: "Vowel Sounds", link: "https://meet.google.com/abc-def-ghi" },
          ].map(cls => (
            <div key={cls.topic} className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-colors">
              <div className="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0"><Video size={16} className="text-blue-600" /></div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-900">{cls.batch}</p>
                <p className="text-xs text-slate-500">{cls.time} · {cls.topic}</p>
              </div>
              <a href={cls.link} target="_blank" rel="noopener noreferrer">
                <Button size="sm" variant="outline" className="text-xs gap-1.5">Start Class</Button>
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
