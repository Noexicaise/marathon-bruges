import React, { useState, useEffect } from 'react';
import { db } from './firebase'; // Import de ton instance Firestore
import { doc, getDoc, setDoc } from "firebase/firestore";
import { 
  Calendar, Activity, Timer, Map, CheckCircle2, Flame, HeartPulse, 
  Wind, Trophy, ChevronRight, ChevronLeft, Info, BarChart3, Dumbbell, BookOpen
} from 'lucide-react';

// ... (Garde tes constantes PROFILE, ZONES, TRAINING_DATA, ADVICE_CONTENT et getWorkoutStyle ici, ils ne changent pas)

export default function MarathonApp() {
  const [currentWeekIndex, setCurrentWeekIndex] = useState(0);
  const [completedDays, setCompletedDays] = useState([]);
  const [activeTab, setActiveTab] = useState('plan');
  const [loading, setLoading] = useState(true);

  // ID unique pour ton document de progression
  const userId = "julien_nicaise"; 

  // Charger les données depuis Firestore au démarrage
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

  // Sauvegarder dans Firestore à chaque changement
  const toggleDayCompletion = async (id) => {
    const updatedDays = completedDays.includes(id) 
      ? completedDays.filter(item => item !== id) 
      : [...completedDays, id];
    
    setCompletedDays(updatedDays);
    await setDoc(doc(db, "progression", userId), { days: updatedDays });
  };

  const currentWeek = TRAINING_DATA[currentWeekIndex];
  const progressPercent = Math.round((completedDays.length / (12 * 7)) * 100);

  if (loading) return <div className="text-white p-8">Chargement...</div>;

  return (
    // ... (Le reste de ton JSX reste identique, assure-toi juste d'appeler toggleDayCompletion comme ceci)
    // <div onClick={() => toggleDayCompletion(dayData.id)} ... >
  );
}