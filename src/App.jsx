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
  { week: 1, dates: "20/07 au 26/07", volume_km: 65, block: "Bloc 1 : Développement Foncier", days: [{ id: "w1-d1", day: "Lundi", type: "Repos", title: "Repos/Mobilité", desc: "Repos ou 20 min Mobilité/Gainage." }, { id: "w1-d2", day: "Mardi", type: "VMA", title: "VMA/Force", desc: "3 km EF + 10x 200m (3'15\"-3'20\"/km), récup 45\" marche + 2 km EF." }, { id: "w1-d3", day: "Mercredi", type: "EA", title: "Endurance Active", desc: "12 km en EA à 4'50\"/km constants (Cardio <130 bpm)." }, { id: "w1-d4", day: "Jeudi", type: "Repos", title: "Repos complet", desc: "Repos total." }, { id: "w1-d5", day: "Vendredi", type: "Seuil", title: "Seuil", desc: "3 km EF + 3x 2000m au Seuil (3'58\"/km), récup 2'30\" EF + 2 km EF." }, { id: "w1-d6", day: "Samedi", type: "EF", title: "Récupération", desc: "45 min de vélo souple ou repos." }, { id: "w1-d7", day: "Dimanche", type: "SL", title: "Sortie Longue", desc: "16 km Progressifs (Départ 5'15\", accélération de 5\" tous les 3 km, fin < 4'45\"/km)." }] },
  { week: 2, dates: "27/07 au 02/08", volume_km: 70, block: "Bloc 1 : Développement Foncier", days: [{ id: "w2-d1", day: "Lundi", type: "Repos", title: "Repos complet", desc: "Repos total." }, { id: "w2-d2", day: "Mardi", type: "VMA", title: "Côtes", desc: "4 km EF + 8x 150m en côte dynamique, retour descente trottée + 2 km EF." }, { id: "w2-d3", day: "Mercredi", type: "EF", title: "Endurance F.", desc: "14 km en EF pure (5'10\"/km) – Parcours plat." }, { id: "w2-d4", day: "Jeudi", type: "AS42", title: "Intro AS42", desc: "3 km EF + 4x 1500m à AS42 (4'12\"/km), récup 1'30\" EF + 2 km EF." }, { id: "w2-d5", day: "Vendredi", type: "Repos", title: "Repos complet", desc: "Repos total + Hydratation renforcée." }, { id: "w2-d6", day: "Samedi", type: "EF", title: "Régénération", desc: "Footing 8 km très lent (>5'25\"/km) ou rando-course si chaleur." }, { id: "w2-d7", day: "Dimanche", type: "SL", title: "Sortie Longue", desc: "18 km comprenant 3x 2 km à 4'12\"/km (récup 1 km à 5'00\"/km au sein de la sortie)." }] },
  { week: 3, dates: "03/08 au 09/08", volume_km: 75, block: "Bloc 1 : Développement Foncier", days: [{ id: "w3-d1", day: "Lundi", type: "Repos", title: "Repos complet", desc: "Repos total." }, { id: "w3-d2", day: "Mardi", type: "VMA", title: "VMA Longue", desc: "3 km EF + 6x 500m (3'30\"/km), récup 1'15\" marche/trot + 2 km EF." }, { id: "w3-d3", day: "Mercredi", type: "EA", title: "Endurance Active", desc: "15 km EA stabilisés à 4'55\"/km." }, { id: "w3-d4", day: "Jeudi", type: "Repos", title: "Repos complet", desc: "Repos total." }, { id: "w3-d5", day: "Vendredi", type: "Seuil", title: "Seuil dur", desc: "3 km EF + 4000m (4'00\"/km) + récup 3' EF + 2000m (3'55\"/km) + 2 km EF." }, { id: "w3-d6", day: "Samedi", type: "EF", title: "PPG", desc: "Repos ou 30 min de PPG légère à la maison." }, { id: "w3-d7", day: "Dimanche", type: "SL", title: "Sortie Longue", desc: "20 km : 10 premiers à 5'05\"/km, 10 derniers à 4'45\"/km." }] },
  { week: 4, dates: "10/08 au 16/08", volume_km: 50, block: "Bloc 1 : Décharge / Assimilation", days: [{ id: "w4-d1", day: "Lundi", type: "Repos", title: "Repos complet", desc: "Repos total." }, { id: "w4-d2", day: "Mardi", type: "EF", title: "Entretien", desc: "10 km EF pure (5'15\"/km) incluant 5 lignes droites de 100m relâchées." }, { id: "w4-d3", day: "Mercredi", type: "Repos", title: "Repos complet", desc: "Repos total." }, { id: "w4-d4", day: "Jeudi", type: "AS42", title: "Rappel AS42 court", desc: "3 km EF + 3000m à 4'12\"/km + 2 km EF." }, { id: "w4-d5", day: "Vendredi", type: "Repos", title: "Repos complet", desc: "Repos total." }, { id: "w4-d6", day: "Samedi", type: "EF", title: "Régénération", desc: "8 km très souples ou Rando-Course." }, { id: "w4-d7", day: "Dimanche", type: "EF", title: "Sortie Souple", desc: "12 km à sensation, allure libre, max 125 bpm." }] },
  { week: 5, dates: "17/08 au 23/08", volume_km: 80, block: "Bloc 2 : Spécifique AS42 & Volume", days: [{ id: "w5-d1", day: "Lundi", type: "Repos", title: "Repos complet", desc: "Repos total." }, { id: "w5-d2", day: "Mardi", type: "Seuil", title: "Seuil", desc: "3 km EF + 3x 3000m (3'58\"/km), récup 3' EF + 2 km EF." }, { id: "w5-d3", day: "Mercredi", type: "EA", title: "Foncier", desc: "16 km de course continue à 4'50\"/km (Endurance Active)." }, { id: "w5-d4", day: "Jeudi", type: "Repos", title: "Repos complet", desc: "Repos total." }, { id: "w5-d5", day: "Vendredi", type: "AS42", title: "AS42 Bloc", desc: "3 km EF + 3x 3000m à AS42 (4'12\"/km), récup 1 km à 5'00\"/km + 2 km EF." }, { id: "w5-d6", day: "Samedi", type: "EF", title: "Récupération", desc: "Footing 8 km (5'20\"/km)." }, { id: "w5-d7", day: "Dimanche", type: "SL", title: "Sortie Longue+", desc: "22 km : Intégrer 5 km à 4'12\"/km entre le 12e et le 17e km." }] },
  { week: 6, dates: "24/08 au 30/08", volume_km: 85, block: "Bloc 2 : Spécifique AS42 & Volume", days: [{ id: "w6-d1", day: "Lundi", type: "Repos", title: "Repos complet", desc: "Repos total." }, { id: "w6-d2", day: "Mardi", type: "VMA", title: "VMA Entretien", desc: "3 km EF + 12x 300m (3'20\"/km), récup 1' trot + 2 km EF." }, { id: "w6-d3", day: "Mercredi", type: "EA", title: "Endurance Active", desc: "18 km stabilisés en EA (4'48\"/km) sur parcours vallonné." }, { id: "w6-d4", day: "Jeudi", type: "Repos", title: "Repos complet", desc: "Repos total." }, { id: "w6-d5", day: "Vendredi", type: "Seuil", title: "Grand Seuil", desc: "3 km EF + 3x 4000m (4'02\"/km), récup 4' EF + 2 km EF." }, { id: "w6-d6", day: "Samedi", type: "EF", title: "Régénération", desc: "8 km pure (>5'30\"/km) ou repos." }, { id: "w6-d7", day: "Dimanche", type: "SL", title: "Sortie Longue Capitale", desc: "25 km en EF linéaire (5'05\"/km). Focus alimentation." }] },
  { week: 7, dates: "31/08 au 06/09", volume_km: 95, block: "Bloc 2 : Pic de Volume Maximal", days: [{ id: "w7-d1", day: "Lundi", type: "Repos", title: "Repos complet", desc: "Repos total." }, { id: "w7-d2", day: "Mardi", type: "VMA", title: "Rappel Force", desc: "4 km EF + 10x 200m en côtes explosives + 3 km EF." }, { id: "w7-d3", day: "Mercredi", type: "EA", title: "Foncier Long", desc: "20 km continus en EA à 4'52\"/km. Validation mécanique." }, { id: "w7-d4", day: "Jeudi", type: "Repos", title: "Repos / Mobilité", desc: "Repos ou 20 min d'étirements/mobilité." }, { id: "w7-d5", day: "Vendredi", type: "AS42", title: "Test AS42", desc: "3 km EF + 3x 4000m à AS42 (4'12\"/km), récup 1000m à 5'00\"/km." }, { id: "w7-d6", day: "Samedi", type: "EF", title: "Récup Active", desc: "Footing 10 km (5'20\"/km)." }, { id: "w7-d7", day: "Dimanche", type: "SL", title: "Sortie Longue XL", desc: "28 km : 18 km à 5'00\"/km + 8 km à 4'12\"/km + 2 km retour au calme." }] },
  { week: 8, dates: "07/09 au 13/09", volume_km: 60, block: "Bloc 2 : Décharge intermédiaire", days: [{ id: "w8-d1", day: "Lundi", type: "Repos", title: "Repos complet", desc: "Repos total." }, { id: "w8-d2", day: "Mardi", type: "VMA", title: "VMA Courte", desc: "3 km EF + 10x 200m (3'15\"/km), récup 45\" marche + 2 km EF." }, { id: "w8-d3", day: "Mercredi", type: "EF", title: "Endurance F.", desc: "12 km en EF (5'10\"/km)." }, { id: "w8-d4", day: "Jeudi", type: "Repos", title: "Repos complet", desc: "Repos total." }, { id: "w8-d5", day: "Vendredi", type: "Seuil", title: "Seuil léger", desc: "3 km EF + 5000m continu à 4'00\"/km + 2 km EF." }, { id: "w8-d6", day: "Samedi", type: "Repos", title: "Repos complet", desc: "Repos total." }, { id: "w8-d7", day: "Dimanche", type: "SL", title: "Sortie Longue Modérée", desc: "16 km progressifs, sans forcer, cardio < 125 bpm." }] },
  { week: 9, dates: "14/09 au 20/09", volume_km: 85, block: "Bloc 3 : Assimilation et Optimisation", days: [{ id: "w9-d1", day: "Lundi", type: "Repos", title: "Repos complet", desc: "Repos total." }, { id: "w9-d2", day: "Mardi", type: "Seuil", title: "Seuil Anaérobie", desc: "3 km EF + 4x 2000m (3'55\"/km), récup 3' EF + 2 km EF." }, { id: "w9-d3", day: "Mercredi", type: "EA", title: "Endurance Active", desc: "16 km en EA à 4'50\"/km." }, { id: "w9-d4", day: "Jeudi", type: "Repos", title: "Repos complet", desc: "Repos total." }, { id: "w9-d5", day: "Vendredi", type: "AS42", title: "Gros Bloc AS42", desc: "3 km EF + 12 km continus à 4'12\"/km. Valider la facilité (<142 bpm)." }, { id: "w9-d6", day: "Samedi", type: "EF", title: "Récupération", desc: "8 km très lent." }, { id: "w9-d7", day: "Dimanche", type: "SL", title: "Dernière Très Longue", desc: "30 km : 20 km à 5'05\"/km + 8 km à 4'12\"/km + 2 km EF." }] },
  { week: 10, dates: "21/09 au 27/09", volume_km: 65, block: "Bloc 3 : Début de l'affûtage (T-3)", days: [{ id: "w10-d1", day: "Lundi", type: "Repos", title: "Repos complet", desc: "Repos total." }, { id: "w10-d2", day: "Mardi", type: "VMA", title: "Entretien VMA", desc: "3 km EF + 8x 400m (3'25\"/km), récup 1'15\" trot + 2 km EF." }, { id: "w10-d3", day: "Mercredi", type: "EF", title: "Endurance F.", desc: "12 km en EF pure (5'15\"/km)." }, { id: "w10-d4", day: "Jeudi", type: "Repos", title: "Repos complet", desc: "Repos total." }, { id: "w10-d5", day: "Vendredi", type: "AS42", title: "Rappel AS42", desc: "3 km EF + 3x 3000m à 4'12\"/km, récup 1000m à 5'05\"/km." }, { id: "w10-d6", day: "Samedi", type: "Repos", title: "Repos complet", desc: "Repos total." }, { id: "w10-d7", day: "Dimanche", type: "SL", title: "Sortie Longue Réduite", desc: "18 km linéaires à 4'55\"/km. Sensation de facilité absolue." }] },
  { week: 11, dates: "28/09 au 04/10", volume_km: 45, block: "Bloc 4 : Affûtage (J-14)", days: [{ id: "w11-d1", day: "Lundi", type: "Repos", title: "Repos complet", desc: "Repos total." }, { id: "w11-d2", day: "Mardi", type: "Seuil", title: "Seuil léger", desc: "3 km EF + 3x 1500m (3'58\"/km), récup 2'30\" EF + 2 km EF." }, { id: "w11-d3", day: "Mercredi", type: "EF", title: "Régénération", desc: "10 km en EF pure (5'20\"/km)." }, { id: "w11-d4", day: "Jeudi", type: "Repos", title: "Repos complet", desc: "Repos total." }, { id: "w11-d5", day: "Vendredi", type: "AS42", title: "Rappel Allure Court", desc: "3 km EF + 4000m à 4'12\"/km + 2 km EF." }, { id: "w11-d6", day: "Samedi", type: "Repos", title: "Repos complet", desc: "Repos total." }, { id: "w11-d7", day: "Dimanche", type: "EF", title: "Sortie Confiance", desc: "12 km dont 3 km à 4'12\"/km au milieu. Reste très souple." }] },
  { week: 12, dates: "05/10 au 11/10", volume_km: 15, block: "Bloc 4 : Semaine de la Course", days: [{ id: "w12-d1", day: "Lundi", type: "Repos", title: "Repos complet", desc: "Repos total." }, { id: "w12-d2", day: "Mardi", type: "EF", title: "Réveil musculaire", desc: "8 km EF (5'15\"/km) + 3 lignes droites de 100m relâchées." }, { id: "w12-d3", day: "Mercredi", type: "Repos", title: "Repos complet", desc: "Repos total." }, { id: "w12-d4", day: "AS42", title: "Rappel T. Court", desc: "5 km EF dont 1500m à 4'12\"/km pour mémoriser la foulée." }, { id: "w12-d5", day: "Vendredi", type: "Repos", title: "Recharge Glucidique", desc: "Repos complet. Début recharge glucidique, eau et sel." }, { id: "w12-d6", day: "Samedi", type: "EF", title: "Déblocage", desc: "15-20 min footing ultra-lent (2-3 km) + étirements légers." }, { id: "w12-d7", day: "RACE", title: "MARATHON DE BRUGES", desc: "Objectif SUB 3H (4'12\"/km constants). Let's go!" }] }
];

const ADVICE_CONTENT = [
  { title: "Nutrition", icon: <Flame className="w-6 h-6 text-orange-400" />, content: "Focus sur la recharge glucidique les 72h avant. Testez vos gels/boissons à l'effort durant les sorties longues. Hydratation : 500ml/heure min." },
  { title: "Récupération", icon: <HeartPulse className="w-6 h-6 text-red-400" />, content: "Le sommeil est votre arme n°1. Si possible, siestes de 20min. Utilisez le froid (douches froides) en période de gros volume pour réduire l'inflammation." },
  { title: "Renforcement", icon: <Dumbbell className="w-6 h-6 text-blue-400" />, content: "Gainage obligatoire 2x/sem. Travail excentrique des quadriceps (fentes, chaise) pour éviter la casse musculaire après le 30e km." },
  { title: "Stratégie", icon: <Trophy className="w-6 h-4 text-yellow-400" />, content: "Ne partez pas trop vite. Les 10 premiers km doivent paraître trop lents. Gardez 5% de réserve pour le semi-marathon." }
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
      try {
        const docRef = doc(db, "progression", userId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setCompletedDays(docSnap.data().days || []);
        }
      } catch (e) {
        console.error("Erreur chargement:", e);
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
    try {
      await setDoc(doc(db, "progression", userId), { days: updatedDays });
    } catch (e) {
      console.error("Erreur sauvegarde:", e);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">Chargement...</div>;
  }

  const currentWeek = TRAINING_DATA[currentWeekIndex];
  const progressPercent = Math.round((completedDays.length / (12 * 7)) * 100);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Header Section */}
        <header className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white mb-2 flex items-center gap-3">
                <Trophy className="text-amber-400 w-8 h-8" />
                Marathon de Bruges
              </h1>
              <p className="text-purple-400 font-semibold text-lg">Objectif Sub 3h (Allure {PROFILE.paceGoal})</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm bg-slate-950/50 p-4 rounded-xl border border-slate-800">
              <div className="flex flex-col"><span className="text-slate-500">VO2Max</span><span className="font-bold text-white text-lg">{PROFILE.vo2max}</span></div>
              <div className="flex flex-col"><span className="text-slate-500">FC Repos</span><span className="font-bold text-white text-lg">{PROFILE.fcRepos}</span></div>
              <div className="flex flex-col"><span className="text-slate-500">IMC</span><span className="font-bold text-white text-lg">{PROFILE.imc}</span></div>
              <div className="flex flex-col">
                <span className="text-slate-500">Progression</span>
                <span className="font-bold text-emerald-400 text-lg">{progressPercent}%</span>
              </div>
            </div>
          </div>
          <div className="mt-6 w-full bg-slate-800 h-2 rounded-full overflow-hidden">
             <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${progressPercent}%` }}></div>
          </div>
        </header>

        {/* Zones Section */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><Info className="w-5 h-5 text-slate-500" /> Allures & Zones de Référence</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {ZONES.map((zone, i) => (
              <div key={i} className={`p-4 rounded-xl border ${zone.bg} ${zone.border}`}>
                <h3 className={`font-bold text-xs uppercase mb-1 ${zone.color}`}>{zone.name}</h3>
                <p className="text-lg font-black text-white">{zone.pace}</p>
                <p className="text-xs text-slate-400 mt-2">{zone.hr}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation Section */}
        <div className="flex gap-2 p-1 bg-slate-900 border border-slate-800 rounded-2xl">
          <button onClick={() => setActiveTab('plan')} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all ${activeTab === 'plan' ? 'bg-purple-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800'}`}>
            <Calendar className="w-5 h-5" /> Programme
          </button>
          <button onClick={() => setActiveTab('summary')} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all ${activeTab === 'summary' ? 'bg-purple-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800'}`}>
            <BarChart3 className="w-5 h-5" /> Récapitulatif
          </button>
          <button onClick={() => setActiveTab('advice')} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all ${activeTab === 'advice' ? 'bg-purple-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800'}`}>
            <BookOpen className="w-5 h-5" /> Conseils
          </button>
        </div>

        {/* Tabs Content */}
        {activeTab === 'plan' && (
          <section className="space-y-4">
            <div className="flex items-center justify-between bg-slate-900 border border-slate-800 rounded-2xl p-4">
              <button onClick={() => setCurrentWeekIndex(p => Math.max(0, p-1))} disabled={currentWeekIndex === 0} className="p-2 rounded-lg hover:bg-slate-800 disabled:opacity-30"><ChevronLeft className="w-6 h-6" /></button>
              <div className="text-center">
                <h2 className="text-xl md:text-2xl font-black text-white">Semaine {currentWeek.week}</h2>
                <div className="text-sm text-slate-400">{currentWeek.dates} | {currentWeek.volume_km} km</div>
              </div>
              <button onClick={() => setCurrentWeekIndex(p => Math.min(11, p+1))} disabled={currentWeekIndex === 11} className="p-2 rounded-lg hover:bg-slate-800 disabled:opacity-30"><ChevronRight className="w-6 h-6" /></button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {currentWeek.days.map((dayData) => {
                const style = getWorkoutStyle(dayData.type);
                const isDone = completedDays.includes(dayData.id);
                return (
                  <div key={dayData.id} className={`rounded-xl border p-4 cursor-pointer transition-all ${isDone ? 'opacity-50 border-slate-700' : `${style.bg} ${style.border}`}`} onClick={() => toggleDayCompletion(dayData.id)}>
                    <div className="flex justify-between mb-2">{style.icon} {isDone && <CheckCircle2 className="text-emerald-500 w-5 h-5" />}</div>
                    <h3 className="font-bold text-white text-sm">{dayData.day}: {dayData.title}</h3>
                    <p className="text-xs text-slate-400 mt-2 line-clamp-2">{dayData.desc}</p>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {activeTab === 'summary' && (
          <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-6">Charge & Volume par Semaine</h2>
            <div className="grid grid-cols-1 gap-3">
              {TRAINING_DATA.map((week) => (
                <div key={week.week} className="flex items-center gap-4 p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <div className="w-8 h-8 flex items-center justify-center font-bold bg-slate-900 rounded-lg">W{week.week}</div>
                  <div className="flex-1">
                    <div className="w-full bg-slate-800 h-4 rounded-full overflow-hidden">
                      <div className="h-full bg-purple-500" style={{ width: `${(week.volume_km / 100) * 100}%` }}></div>
                    </div>
                  </div>
                  <div className="font-bold text-purple-400 w-16 text-right">{week.volume_km} km</div>
                </div>
              ))}
            </div>
          </section>
        )}

        {activeTab === 'advice' && (
          <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ADVICE_CONTENT.map((item, i) => (
              <div key={i} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex gap-4">
                <div className="p-3 bg-slate-800 rounded-xl h-fit">{item.icon}</div>
                <div>
                  <h3 className="font-bold text-lg text-white mb-2">{item.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{item.content}</p>
                </div>
              </div>
            ))}
          </section>
        )}
      </div>
    </div>
  );
}