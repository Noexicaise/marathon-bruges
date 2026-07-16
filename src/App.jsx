import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { doc, getDoc, setDoc } from "firebase/firestore";
import { 
  Calendar, Activity, Timer, Map, CheckCircle2, Flame, HeartPulse, 
  Wind, Trophy, ChevronRight, ChevronLeft, Info, BarChart3, Dumbbell, BookOpen
} from 'lucide-react';

// ... (Garde tes constantes PROFILE, ZONES, TRAINING_DATA, ADVICE_CONTENT, getWorkoutStyle ici)

export default function MarathonApp() {
  const [currentWeekIndex, setCurrentWeekIndex] = useState(0);
  const [completedDays, setCompletedDays] = useState([]);
  const [activeTab, setActiveTab] = useState('plan');
  const [loading, setLoading] = useState(true);

  const userId = "julien_nicaise"; 

  useEffect(() => {
    const loadData = async () => {
      try {
        const docRef = doc(db, "progression", userId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) setCompletedDays(docSnap.data().days || []);
      } catch (e) { console.error("Erreur chargement:", e); }
      setLoading(false);
    };
    loadData();
  }, []);

  const toggleDayCompletion = async (id) => {
    const updatedDays = completedDays.includes(id) 
      ? completedDays.filter(item => item !== id) 
      : [...completedDays, id];
    setCompletedDays(updatedDays);
    try { await setDoc(doc(db, "progression", userId), { days: updatedDays }); }
    catch (e) { console.error("Erreur sauvegarde:", e); }
  };

  if (loading) return <div className="p-8 text-white">Chargement...</div>;

  const progressPercent = Math.round((completedDays.length / (12 * 7)) * 100);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-4">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header complet */}
        <header className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                <Trophy className="text-amber-400" /> Marathon de Bruges
              </h1>
              <p className="text-purple-400">Objectif Sub 3h</p>
            </div>
            <div className="text-right">
              <span className="text-emerald-400 font-bold text-2xl">{progressPercent}%</span>
              <p className="text-xs">Progression</p>
            </div>
          </div>
          <div className="mt-4 w-full bg-slate-800 h-2 rounded-full overflow-hidden">
             <div className="h-full bg-emerald-500 transition-all" style={{ width: `${progressPercent}%` }}></div>
          </div>
        </header>

        {/* Zones */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          {ZONES.map((z, i) => (
            <div key={i} className={`p-3 rounded-lg border ${z.bg} ${z.border}`}>
              <p className="text-[10px] uppercase font-bold text-slate-400">{z.name}</p>
              <p className="font-bold text-sm text-white">{z.pace}</p>
            </div>
          ))}
        </div>

        {/* Onglets */}
        <div className="flex gap-2 bg-slate-900 p-1 rounded-xl border border-slate-800">
           {['plan', 'summary', 'advice'].map(tab => (
             <button key={tab} onClick={() => setActiveTab(tab)} 
               className={`flex-1 py-2 rounded-lg font-bold capitalize ${activeTab === tab ? 'bg-purple-600 text-white' : 'text-slate-400'}`}>
               {tab}
             </button>
           ))}
        </div>

        {/* Grille */}
        {activeTab === 'plan' && (
           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
             {TRAINING_DATA[currentWeekIndex].days.map((d) => (
               <div key={d.id} className={`p-4 rounded-xl border cursor-pointer ${completedDays.includes(d.id) ? 'bg-slate-800 opacity-50' : 'bg-slate-900 border-slate-700'}`}
                    onClick={() => toggleDayCompletion(d.id)}>
                 <h3 className="font-bold text-white">{d.day}: {d.title}</h3>
                 <p className="text-xs text-slate-400">{d.desc}</p>
               </div>
             ))}
           </div>
        )}
      </div>
    </div>
  );
}