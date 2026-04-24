import { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { format } from 'date-fns';
import { LogOut, Droplet, Plus, Minus, ArrowLeft, ArrowRight, Pill, Dumbbell, Utensils, Crown } from 'lucide-react';
import { Button } from './components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from './components/ui/card';
import { Progress } from './components/ui/progress';
import { Checkbox } from './components/ui/checkbox';
import { getDailyLog, createOrUpdateDailyLog, DailyLog } from './lib/data';
import { SHIFT_SCHEDULES, WORKOUT_PLAN } from './lib/constants';
import { AIRecipeGenerator } from './components/AIRecipeGenerator';

interface DashboardProps {
  user: User;
  logout: () => void;
}

export default function Dashboard({ user, logout }: DashboardProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [log, setLog] = useState<DailyLog | null>(null);
  const [loading, setLoading] = useState(true);
  const [prepChecked, setPrepChecked] = useState<number[]>([]);

  const dateStr = format(currentDate, 'yyyy-MM-dd');

  useEffect(() => {
    loadDailyData();
    setPrepChecked([]);
  }, [dateStr]);

  const loadDailyData = async () => {
    setLoading(true);
    let data = await getDailyLog(user.uid, dateStr);
    if (!data) {
      await createOrUpdateDailyLog(user.uid, dateStr, { shiftType: 'early' });
      data = await getDailyLog(user.uid, dateStr);
    }
    setLog(data);
    setLoading(false);
  };

  const shiftData = log ? SHIFT_SCHEDULES[log.shiftType as keyof typeof SHIFT_SCHEDULES] : null;
  const isPrepDay = log?.shiftType === 'off';

  const mealBitmask = log?.mealsCompleted || 0;
  let completedMealsCount = 0;
  for (let i = 0; i < 10; i++) {
    if ((mealBitmask & (1 << i)) !== 0) completedMealsCount++;
  }

  const updateLog = async (field: keyof DailyLog, value: any) => {
    if (!log) return;
    const newLog = { ...log, [field]: value };
    setLog(newLog);
    await createOrUpdateDailyLog(user.uid, dateStr, { [field]: value });
  };

  const changeDate = (days: number) => {
    const nextDate = new Date(currentDate);
    nextDate.setDate(currentDate.getDate() + days);
    setCurrentDate(nextDate);
  };

  if (loading || !log) return <div className="min-h-screen bg-[#F5F5F0] p-8 text-center text-[#3D3D2D] opacity-70">Loading daily log...</div>;

  return (
    <div className="min-h-screen bg-[#F5F5F0] pb-24 font-sans text-[#3D3D2D]">
      {/* Header */}
      <header className="bg-[#F5F5F0] border-b border-[#D1D1C7] sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-6 md:px-10 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-serif italic text-[#5A5A40]">NurseFit Premium</h1>
              <span className="inline-flex items-center gap-1 rounded-full border border-[#D1D1C7] bg-[#FAF9F6] px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-[#5A5A40]">
                <Crown size={12} />
                VIP
              </span>
            </div>
            <p className="text-[10px] tracking-widest uppercase opacity-70 font-bold">{user.displayName}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={logout} className="text-[#3D3D2D] hover:bg-[#E5E5DF] rounded-full h-10 w-10">
            <LogOut size={18} />
          </Button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 md:px-10 pt-8 flex flex-col gap-6">
        
        {/* Date Selector */}
        <div className="flex items-center justify-between bg-white rounded-full px-4 py-2 shadow-sm border border-[#E5E5DF]">
          <Button variant="ghost" size="icon" onClick={() => changeDate(-1)} className="rounded-full hover:bg-[#FAF9F6]"><ArrowLeft size={18} /></Button>
          <div className="text-center">
            <h2 className="font-semibold text-lg">{format(currentDate, 'EEEE, MMM d')}</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={() => changeDate(1)} className="rounded-full hover:bg-[#FAF9F6]"><ArrowRight size={18} /></Button>
        </div>

        {/* Shift Configuration */}
        <Card className="rounded-[32px] border border-[#E5E5DF] shadow-sm bg-white">
          <CardHeader className="pb-3 pt-6">
            <CardTitle className="text-xs font-bold uppercase tracking-widest text-[#5A5A40]">Today's Shift Focus</CardTitle>
          </CardHeader>
          <CardContent className="pb-6">
            <div className="flex w-full bg-[#FAF9F6] p-1.5 rounded-2xl border border-[#D1D1C7]">
              <button
                className={`flex-1 py-2 text-sm font-semibold rounded-xl transition-all ${log.shiftType === 'early' ? 'bg-[#5A5A40] text-white shadow-sm' : 'text-[#3D3D2D] opacity-70 hover:bg-[#E5E5DF]'}`}
                onClick={() => updateLog('shiftType', 'early')}
              >
                Early Shift
              </button>
              <button
                className={`flex-1 py-2 text-sm font-semibold rounded-xl transition-all ${log.shiftType === 'afternoon' ? 'bg-[#5A5A40] text-white shadow-sm' : 'text-[#3D3D2D] opacity-70 hover:bg-[#E5E5DF]'}`}
                onClick={() => updateLog('shiftType', 'afternoon')}
              >
                Late Shift
              </button>
              <button
                className={`flex-1 py-2 text-sm font-semibold rounded-xl transition-all ${log.shiftType === 'off' ? 'bg-[#5A5A40] text-white shadow-sm' : 'text-[#3D3D2D] opacity-70 hover:bg-[#E5E5DF]'}`}
                onClick={() => updateLog('shiftType', 'off')}
              >
                Prep / Off
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-2 gap-4">
          {/* Hydration */}
          <Card className="rounded-[40px] border border-[#E5E5DF] shadow-sm bg-white overflow-hidden flex flex-col justify-center text-center p-6">
            <CardContent className="p-0 relative flex flex-col items-center">
              <Droplet className="w-8 h-8 text-[#5A5A40] mb-2 mx-auto" strokeWidth={1.5} />
              <div className="text-4xl font-serif italic mb-1 text-[#3D3D2D]">{log.waterLiters.toFixed(1)}</div>
              <div className="text-[10px] uppercase font-bold opacity-50 mb-4 tracking-widest text-[#3D3D2D]">Hydration (Goal: 3L)</div>
              
              <div className="flex items-center justify-center gap-2">
                <Button variant="outline" size="icon" className="h-8 w-8 rounded-full border-[#E5E5DF] text-[#5A5A40] hover:bg-[#FAF9F6]" onClick={() => updateLog('waterLiters', Math.max(0, log.waterLiters - 0.5))}>
                  <Minus size={14} />
                </Button>
                <div className="w-12 text-sm text-center font-medium">+0.5L</div>
                <Button variant="outline" size="icon" className="h-8 w-8 rounded-full border-[#E5E5DF] text-[#5A5A40] hover:bg-[#FAF9F6]" onClick={() => updateLog('waterLiters', log.waterLiters + 0.5)}>
                  <Plus size={14} />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats side */}
          <div className="flex flex-col gap-4">
            {/* Supplements */}
            <Card className={`rounded-[28px] border border-[#E5E5DF] shadow-sm flex-1 cursor-pointer transition-colors overflow-hidden ${log.supplementsCompleted ? 'bg-[#5A5A40] text-white' : 'bg-white hover:bg-[#FAF9F6] text-[#3D3D2D]'}`} onClick={() => updateLog('supplementsCompleted', !log.supplementsCompleted)}>
              <CardContent className="p-0 flex h-full">
                <div className={`w-14 flex items-center justify-center ${log.supplementsCompleted ? 'bg-[#3D3D2D] text-white' : 'bg-[#FAF9F6] border-r border-[#E5E5DF] text-[#5A5A40]'}`}>
                  <Pill size={20} />
                </div>
                <div className="p-4 flex flex-col justify-center">
                  <span className="text-[10px] uppercase font-bold opacity-50 tracking-widest">{log.supplementsCompleted ? 'Taken today' : 'Morning/Night'}</span>
                  <span className="text-lg font-serif italic tracking-tight leading-tight mt-0.5">Supplements</span>
                </div>
              </CardContent>
            </Card>

            {/* Workout */}
            <Card className={`rounded-[28px] border border-[#E5E5DF] shadow-sm flex-1 cursor-pointer transition-colors overflow-hidden ${log.workoutCompleted ? 'bg-[#5A5A40] text-white' : 'bg-white hover:bg-[#FAF9F6] text-[#3D3D2D]'}`} onClick={() => updateLog('workoutCompleted', !log.workoutCompleted)}>
               <CardContent className="p-0 flex h-full">
                <div className={`w-14 flex items-center justify-center ${log.workoutCompleted ? 'bg-[#3D3D2D] text-white' : 'bg-[#FAF9F6] border-r border-[#E5E5DF] text-[#5A5A40]'}`}>
                  <Dumbbell size={20} />
                </div>
                <div className="p-4 flex flex-col justify-center">
                  <span className="text-[10px] uppercase font-bold opacity-50 tracking-widest">{log.workoutCompleted ? 'Completed' : '3x Full Body'}</span>
                  <span className="text-lg font-serif italic tracking-tight leading-tight mt-0.5">Workout</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Daily Schedule - Meals */}
        <Card className="rounded-[32px] border border-[#E5E5DF] shadow-sm bg-white overflow-hidden">
          <CardHeader className="pb-4 pt-6">
            <div className="flex items-center gap-2">
              <Utensils size={18} className="text-[#5A5A40]" />
              <CardTitle className="text-xl font-serif italic text-[#3D3D2D]">Meal Plan & Routine</CardTitle>
            </div>
            <CardDescription className="opacity-70 text-[#3D3D2D] text-sm mt-1">Target: protein included, 1 extra snack mapped.</CardDescription>
          </CardHeader>
          <CardContent className="pt-0 pb-6">
            
            <div className="mb-6 bg-[#FAF9F6] p-4 rounded-3xl border border-[#D1D1C7]">
              <div className="flex justify-between items-end mb-3">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#5A5A40]">Completed Meals</span>
                <span className="text-xl italic font-serif leading-none">{completedMealsCount}/{shiftData?.meals.length}</span>
              </div>
              <Progress value={(completedMealsCount / (shiftData?.meals.length || 4)) * 100} className="rounded-full h-1.5 bg-[#D1D1C7] [&>div]:bg-[#5A5A40]" />
            </div>

            <div className="space-y-3">
              {shiftData?.meals.map((meal: any, idx: number) => {
                const complete = (mealBitmask & (1 << idx)) !== 0;
                return (
                  <div key={meal.id} 
                    className={`flex items-start gap-4 p-4 rounded-3xl border transition-colors cursor-pointer ${complete ? 'bg-[#E5E5DF] border-[#D1D1C7] opacity-70' : 'bg-white border-[#E5E5DF] shadow-sm'}`}
                    onClick={() => {
                        const nextCount = complete ? (mealBitmask & ~(1 << idx)) : (mealBitmask | (1 << idx));
                        updateLog('mealsCompleted', nextCount);
                    }}
                  >
                    <div className="mt-0.5 relative flex-shrink-0">
                      {complete ? <div className="w-5 h-5 rounded-full border border-[#5A5A40] bg-[#5A5A40] flex items-center justify-center text-[10px] text-white italic pb-[1px]">✓</div> : <div className="w-5 h-5 rounded-full border-2 border-[#D1D1C7]" />}
                    </div>
                    <div className="flex-1">
                      <h4 className={`text-[10px] uppercase tracking-widest font-bold ${complete ? 'text-[#3D3D2D]' : 'text-[#5A5A40] opacity-60'}`}>{meal.label}</h4>
                      <p className="text-sm text-[#3D3D2D] mt-1.5 font-medium leading-relaxed">{meal.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>

          </CardContent>
        </Card>

        {/* Context Content: Prep Details OR Workout Details */}
        {isPrepDay ? (
          <>
            <Card className="rounded-[32px] border border-[#E5E5DF] shadow-sm bg-white overflow-hidden">
              <CardHeader className="pb-4 pt-6">
                <CardTitle className="text-xl font-serif italic text-[#3D3D2D]">Meal Prep Checklist</CardTitle>
                <CardDescription className="opacity-70 text-[#3D3D2D] text-sm mt-1">Setup your week for success.</CardDescription>
              </CardHeader>
              <CardContent className="pb-6">
                <div className="space-y-3 text-sm text-[#3D3D2D]">
                  {SHIFT_SCHEDULES.off.prepTools?.map((tool, i) => {
                    const isChecked = prepChecked.includes(i);
                    return (
                      <div key={i} 
                           className={`flex items-center gap-4 p-4 rounded-3xl border transition-colors cursor-pointer ${isChecked ? 'bg-[#E5E5DF] border-[#D1D1C7] opacity-70' : 'bg-[#FAF9F6] border-[#E5E5DF]'}`}
                           onClick={() => setPrepChecked(prev => isChecked ? prev.filter(x => x !== i) : [...prev, i])}
                      >
                        <div className="mt-0.5 relative flex-shrink-0">
                          {isChecked ? <div className="w-5 h-5 rounded-full border border-[#5A5A40] bg-[#5A5A40] flex items-center justify-center text-[10px] text-white italic pb-[1px]">✓</div> : <div className="w-5 h-5 rounded-full border-2 border-[#D1D1C7]" />}
                        </div>
                        <span className="font-medium leading-relaxed">{tool}</span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <AIRecipeGenerator />
          </>
        ) : (
          <Card className="rounded-[32px] border border-[#E5E5DF] shadow-sm bg-white overflow-hidden">
            <CardHeader className="pb-4 pt-6">
              <CardTitle className="text-xl font-serif italic text-[#3D3D2D]">Full Body Routine</CardTitle>
              <CardDescription className="opacity-70 text-[#3D3D2D] text-sm mt-1">Focus on progressive overload. 3 sets of 8-12 reps.</CardDescription>
            </CardHeader>
            <CardContent className="pb-6">
              <ul className="space-y-3 text-sm text-[#3D3D2D] font-medium p-6 bg-[#FAF9F6] rounded-3xl border border-[#E5E5DF]">
                {WORKOUT_PLAN.map((exercise, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-[#5A5A40] flex-shrink-0 opacity-80" />
                    <span className="leading-relaxed">{exercise}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

      </main>
    </div>
  );
}
