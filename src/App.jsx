import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { doc, getDoc, setDoc } from "firebase/firestore";
import { 
  Calendar, Activity, Timer, Map, CheckCircle2, Flame, HeartPulse, 
  Wind, Trophy, ChevronRight, ChevronLeft, Info, BarChart3, Dumbbell, BookOpen
} from 'lucide-react';

const PROFILE = { age: 46, vo2max: 70, fcRepos: "35-36", imc: 21, goal: "2h57", paceGoal: "4'12\"/km" };

const ZONES = [
  { name: "Endurance Fondamentale (EF)", pace: "5'00\" - 5'25\"", hr: "< 120 bpm", color: "text-emerald-400", bg: "bg-emerald-950/30", border: "border-emerald-600" },
  { name: "Endurance Active (EA)", pace: "4'45\" - 4'59\"", hr: "120-130 bpm", color: "text-sky-400", bg: "bg-sky-950/30", border: "border-sky-600" },
  { name: "Allure Spécifique (AS42)", pace: "4'12\"", hr: "135-145 bpm", color: "text-violet-400", bg: "bg-violet-950/30", border: "border-violet-600" },
  { name: "Seuil +", pace: "3'55\" - 4'05\"", hr: "148-155 bpm", color: "text-amber-400", bg: "bg-amber-950/30", border: "border-amber-600" },
  { name: "VMA / Vitesse", pace: "3'15\" - 3'30\"", hr: "Max", color: "text-rose-400", bg: "bg-rose-950/30", border: "border-rose-600" }
];

const TRAINING_DATA = [
  { week: 1, dates: "20/07 au 26/07", volume_km: 65, block: "Bloc 1", days: [{ id: "w1-d1", day: "Lun", type: "Repos", title: "Repos", desc: "Mobilité/Gainage." }, { id: "w1-d2", day: "Mar", type: "VMA", title: "VMA/Force", desc: "3 km EF + 10x 200m." }, { id: "w1-d3", day: "Mer", type: "EA", title: "EA", desc: "12 km EA (4'50\")." }, { id: "w1-d4", day: "Jeu", type: "Repos", title: "Repos", desc: "Repos total." }, { id: "w1-d5", day: "Ven", type: "Seuil", title: "Seuil", desc: "3 km EF + 3x 2000m." }, { id: "w1-d6", day: "Sam", type: "EF", title: "Récup", desc: "Vélo souple." }, { id: "w1-d7", day: "Dim", type: "SL", title: "Sortie Longue", desc: "16 km Progressifs." }] },
  // ... (Tu peux garder tout ton TRAINING_DATA original ici)
];

const ADVICE_CONTENT = [
  { title: "Nutrition", icon: <Flame className="w-6 h-6 text-orange-400" />, content: "Recharge glucidique 72h avant." },
  { title: "Récupération", icon: <HeartPulse className="w-6 h-6 text-red-400" />, content: "Sommeil = arme n°1." },
  { title: "Renforcement", icon: <Dumbbell className="w-6 h-6 text-blue-400" />, content: "Gainage 2x/sem." },
  { title: "Stratégie", icon: <Trophy className="w-6 h-6 text-yellow-400" />, content: "Ne partez pas trop vite." }
];

const getWorkoutStyle = (type) => {
  switch(type) {
    case 'Repos': return { bg: 'bg-slate-800', border: 'border-slate-700', text: 'text-slate-400', icon: <HeartPulse className="w-5 h-5" /> };
    case 'EF': return { bg: 'bg-emerald-950/30', border: 'border-emerald-600', text: 'text-emerald-400', icon: <Wind className="w-5 h-5" /> };
    case 'EA': return { bg: 'bg-sky-950/30', border: 'border-sky-600', text: 'text-sky-400', icon: <Activity className="w-5 h-5" /> };
    case 'AS42': return { bg: 'bg-violet-950/30', border: 'border-violet-600', text: 'text-violet-400', icon: <Map className="w-5 h-5" /> };
    case 'Seuil': 
    case 'VMA': return { bg: 'bg-amber-950/30', border: 'border-amber-600', text: 'text-amber-400', icon: <Flame className="w-5 h-5" /> };
    case 'SL': return { bg: 'bg-rose-950/30', border: 'border-rose-600', text: 'text-rose-400', icon: <Timer className="w-5 h-5" /> };
    case 'RACE': return { bg: 'bg-gradient-to-r from-orange-600 to-amber-500', border: 'border-orange-400', text: 'text-white', icon: <Trophy className="w-6 h-6 animate-pulse" /> };
    default: return { bg: 'bg-slate-800', border: 'border-slate-700', text: 'text-slate-400', icon: <Activity className="w-5 h-5" /> };
  }
};

export default function MarathonApp() {
  const [currentWeekIndex, setCurrentWeekIndex] = useState(0);
  const [completedDays, setCompletedDays] = useState([]);
  const [activeTab, setActiveTab] = useState('plan');
  const [loading, setLoading] = useState(true);

  const userId = "julien_nicaise"; 

  useEffect(() => {
    const loadData = async () => {
      const docRef = doc(db, "progression", userId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setCompletedDays(docSnap.data().days || []);
      }
      setLoading(false);
    };
    loadData();
  }, []);

  const toggleDayCompletion = async (id) => {
    const updatedDays = completedDays.includes(id) 
      ? completedDays.filter(item => item !== id) 
      : [...completedDays, id];
    
    setCompletedDays(updatedDays);
    await setDoc(doc(db, "progression", userId), { days: updatedDays });
  };

  if (loading) return <div className="min-h-screen bg-slate-950 text-white p-8">Chargement de votre programme...</div>;

  const currentWeek = TRAINING_DATA[currentWeekIndex];
  const progressPercent = Math.round((completedDays.length / (12 * 7)) * 100);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans p-4">
      <div className="max-w-5xl mx-auto space-y-6">
        <header className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Trophy className="text-amber-400 w-8 h-8" /> Marathon de Bruges
          </h1>
          <p className="text-purple-400">Progression : {progressPercent}%</p>
          <div className="mt-4 w-full bg-slate-800 h-2 rounded-full overflow-hidden">
             <div className="h-full bg-emerald-500" style={{ width: `${progressPercent}%` }}></div>
          </div>
        </header>

        {/* ... (Reste de ton JSX : Tab Switcher, Grille des jours) */}
        {/* Assure-toi d'appeler l'événement comme ceci : */}
        {/* <div onClick={() => toggleDayCompletion(dayData.id)} ... > */}
      </div>
    </div>
  );
}