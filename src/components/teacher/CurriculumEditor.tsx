"use client";

import { useState } from "react";
import { Plus, Trash2, GripVertical, Save, CheckCircle2, Calendar as CalendarIcon, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateBatchCurriculum } from "@/lib/actions";

interface CurriculumItem {
  id: string;
  topic: string;
  date: string;
  description: string;
  isCompleted: boolean;
}

export default function CurriculumEditor({ 
  batchId, 
  initialData 
}: { 
  batchId: string, 
  initialData: any[] 
}) {
  const [items, setItems] = useState<CurriculumItem[]>(
    initialData?.length > 0 ? initialData : [{ id: "1", topic: "", date: "", description: "", isCompleted: false }]
  );
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const addItem = () => {
    setItems([...items, { 
      id: Math.random().toString(36).substr(2, 9), 
      topic: "", 
      date: "", 
      description: "", 
      isCompleted: false 
    }]);
  };

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const updateItem = (id: string, field: keyof CurriculumItem, value: any) => {
    setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage("");
    // Filter out completely empty items
    const validItems = items.filter(i => i.topic.trim() !== "");
    const result = await updateBatchCurriculum(batchId, validItems);
    setSaving(false);
    
    if (result.success) {
      setMessage("Curriculum updated successfully!");
      setTimeout(() => setMessage(""), 3000);
    } else {
      setMessage("Error: " + result.error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-100 shadow-sm sticky top-4 z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white">
            <BookOpen size={20} />
          </div>
          <div>
            <h3 className="font-bold text-slate-900">Curriculum Roadmap</h3>
            <p className="text-xs text-green-600 font-medium">{message || "Plan what to teach when"}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={addItem} 
            variant="outline" 
            className="gap-2 border-slate-200 text-slate-600"
          >
            <Plus size={16} /> Add Topic
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={saving}
            className="bg-slate-900 hover:bg-slate-800 text-white gap-2 px-6 shadow-lg shadow-slate-200"
          >
            {saving ? "Saving..." : <><Save size={16} /> Save Roadmap</>}
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        {items.map((item, index) => (
          <div 
            key={item.id} 
            className={`bg-white p-5 rounded-2xl border transition-all ${item.isCompleted ? 'border-emerald-100 bg-emerald-50/20' : 'border-slate-100'}`}
          >
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
              {/* Order Indicator */}
              <div className="md:col-span-1 flex flex-col items-center justify-center pt-2">
                <span className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 text-xs font-bold flex items-center justify-center mb-2">
                  #{index + 1}
                </span>
                <button 
                  onClick={() => updateItem(item.id, "isCompleted", !item.isCompleted)}
                  className={`transition-colors ${item.isCompleted ? 'text-emerald-500' : 'text-slate-200 hover:text-slate-300'}`}
                >
                  <CheckCircle2 size={24} />
                </button>
              </div>

              {/* Main Info */}
              <div className="md:col-span-8 space-y-3">
                <Input 
                  placeholder="Topic Name (e.g. Introduction to React)" 
                  value={item.topic} 
                  onChange={(e) => updateItem(item.id, "topic", e.target.value)}
                  className={`font-bold border-0 bg-transparent p-0 text-lg shadow-none focus-visible:ring-0 ${item.isCompleted ? 'text-slate-400 line-through' : 'text-slate-900'}`}
                />
                <textarea
                  placeholder="Brief description of what will be covered..."
                  value={item.description}
                  onChange={(e) => updateItem(item.id, "description", e.target.value)}
                  className="w-full bg-slate-50/50 border border-slate-100 rounded-xl p-3 text-sm text-slate-600 focus:ring-2 focus:ring-slate-200 outline-none min-h-[80px]"
                />
              </div>

              {/* Date & Actions */}
              <div className="md:col-span-3 space-y-3">
                <div className="relative">
                  <CalendarIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <Input 
                    type="text" 
                    placeholder="Date or Week (e.g. Week 1)" 
                    value={item.date} 
                    onChange={(e) => updateItem(item.id, "date", e.target.value)}
                    className="pl-9 h-10 border-slate-200 rounded-xl text-sm"
                  />
                </div>
                <Button 
                  variant="ghost" 
                  onClick={() => removeItem(item.id)}
                  className="w-full text-red-400 hover:text-red-500 hover:bg-red-50 rounded-xl gap-2 font-medium"
                >
                  <Trash2 size={16} /> Remove Topic
                </Button>
              </div>
            </div>
          </div>
        ))}

        {items.length === 0 && (
          <div className="py-20 text-center bg-white rounded-3xl border border-dashed border-slate-200">
            <BookOpen className="mx-auto text-slate-200 mb-4" size={48} />
            <p className="text-slate-500 font-medium">Your curriculum is empty.</p>
            <p className="text-slate-400 text-sm mt-1">Start by adding your first lesson topic.</p>
            <Button onClick={addItem} className="mt-6 bg-slate-900 text-white rounded-xl">Add Topic</Button>
          </div>
        )}
      </div>

      <div className="p-6 bg-amber-50 rounded-2xl border border-amber-100 flex gap-4">
        <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600 shrink-0">
          <BookOpen size={20} />
        </div>
        <div>
          <h4 className="font-bold text-amber-900 text-sm">Teacher Tip</h4>
          <p className="text-amber-700/80 text-xs mt-1 leading-relaxed">
            Students can see this roadmap on their dashboard. Use it to keep them informed about upcoming topics and prerequisites. You can mark topics as completed to show progress!
          </p>
        </div>
      </div>
    </div>
  );
}
