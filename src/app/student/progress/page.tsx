import { TrendingUp, Award, BookOpen, Calendar, CheckCircle2, Clock } from "lucide-react";

const modules = [
  { name: "Pronunciation Basics", score: 92, completed: true },
  { name: "Vowel Sounds & Rhythm", score: 88, completed: true },
  { name: "Reading Comprehension", score: 76, completed: true },
  { name: "Essay Writing", score: null, completed: false },
  { name: "Public Speaking Intro", score: null, completed: false },
];

const assignmentHistory = [
  { title: "Week 1 – Introduction Essay", grade: "B+", submittedOn: "Mar 22", maxScore: 100, score: 78 },
  { title: "Week 2 – Reading Comprehension", grade: "A", submittedOn: "Mar 29", maxScore: 100, score: 90 },
  { title: "Week 3 – Pronunciation Exercise", grade: null, submittedOn: null, maxScore: 100, score: null },
];

const attendance = [
  { month: "January", classes: 12, attended: 12 },
  { month: "February", classes: 10, attended: 9 },
  { month: "March", classes: 14, attended: 13 },
];

export default function StudentProgressPage() {
  const overallScore = 85;
  const attendanceRate = 92;

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">My Progress</h1>
        <p className="text-slate-500 mt-1">Track your performance and learning journey</p>
      </div>

      {/* Overall Score Card */}
      <div className="bg-gradient-to-r from-violet-600 to-indigo-600 rounded-2xl p-6 mb-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white/70 text-sm mb-1">Overall Performance Score</p>
            <div className="flex items-end gap-3">
              <span className="text-6xl font-black">{overallScore}</span>
              <span className="text-2xl text-white/70 mb-2">/100</span>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <span className="bg-white/20 px-3 py-0.5 rounded-full text-sm font-medium">English Speaking A1</span>
            </div>
          </div>
          <div className="text-right">
            <div className="w-24 h-24 rounded-full bg-white/10 border-4 border-white/30 flex flex-col items-center justify-center">
              <TrendingUp size={28} className="text-white mb-1" />
              <span className="text-sm font-bold">Top 20%</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Module Progress */}
        <div className="xl:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm">
          <div className="p-6 border-b border-slate-50"><h2 className="font-semibold text-slate-900">Course Modules</h2></div>
          <div className="p-4 space-y-3">
            {modules.map((mod, i) => (
              <div key={mod.name} className={`flex items-center gap-4 p-4 rounded-xl ${mod.completed ? "bg-slate-50" : "bg-amber-50/50 border border-amber-100"}`}>
                <span className="text-sm font-bold text-slate-300 w-6">#{i + 1}</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-semibold text-slate-900">{mod.name}</p>
                    {mod.completed
                      ? <div className="flex items-center gap-1.5 text-emerald-600"><CheckCircle2 size={15} /><span className="text-xs font-bold">{mod.score}/100</span></div>
                      : <span className="text-xs text-amber-600 font-medium flex items-center gap-1"><Clock size={12} />In Progress</span>
                    }
                  </div>
                  <div className="bg-slate-200 rounded-full h-1.5">
                    <div className={`h-1.5 rounded-full ${mod.completed ? "bg-emerald-500" : "bg-amber-400"}`} style={{ width: mod.completed ? `${mod.score}%` : "40%" }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar stats */}
        <div className="space-y-4">
          {/* Attendance */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center"><Calendar size={16} className="text-emerald-600" /></div>
              <h3 className="font-semibold text-slate-900">Attendance</h3>
            </div>
            <div className="flex flex-col items-center mb-4">
              <div className="w-24 h-24 rounded-full bg-emerald-50 border-8 border-emerald-100 flex flex-col items-center justify-center mb-2">
                <span className="text-2xl font-black text-emerald-700">{attendanceRate}%</span>
              </div>
              <p className="text-sm text-slate-500">Overall Attendance</p>
            </div>
            <div className="space-y-2">
              {attendance.map(a => (
                <div key={a.month} className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">{a.month}</span>
                  <span className="font-medium text-slate-900">{a.attended}/{a.classes}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Assignment Grades */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-violet-50 rounded-lg flex items-center justify-center"><Award size={16} className="text-violet-600" /></div>
              <h3 className="font-semibold text-slate-900">Assignment Grades</h3>
            </div>
            <div className="space-y-3">
              {assignmentHistory.map(a => (
                <div key={a.title} className="flex items-center justify-between">
                  <div className="flex-1 min-w-0 mr-3">
                    <p className="text-xs font-medium text-slate-700 truncate">{a.title}</p>
                    <p className="text-xs text-slate-400">{a.submittedOn ?? "Not submitted"}</p>
                  </div>
                  {a.grade
                    ? <span className="text-sm font-black text-violet-700 bg-violet-100 w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0">{a.grade}</span>
                    : <span className="text-xs text-amber-600 font-medium">Pending</span>
                  }
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
