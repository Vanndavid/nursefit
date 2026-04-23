import { doc, getDoc, setDoc, updateDoc, serverTimestamp, FieldValue } from 'firebase/firestore';
import { db, auth } from './firebase';

export interface DailyLog {
  userId: string;
  date: string;
  shiftType: string;
  waterLiters: number;
  mealsCompleted: number;
  workoutCompleted: boolean;
  supplementsCompleted: boolean;
  createdAt: string | FieldValue;
  updatedAt: string | FieldValue;
}

export interface UserProfile {
  uid: string;
  email: string;
  name: string;
  createdAt: string | FieldValue;
}

export const ensureUserExists = async (user: any) => {
  if (!user) return;
  const userRef = doc(db, 'users', user.uid);
  const snap = await getDoc(userRef);
  if (!snap.exists()) {
    const defaultProfile: UserProfile = {
      uid: user.uid,
      email: user.email || '',
      name: user.displayName || 'Nurse',
      createdAt: serverTimestamp(),
    };
    await setDoc(userRef, defaultProfile);
  }
};

export const getDailyLog = async (userId: string, date: string): Promise<DailyLog | null> => {
  const logRef = doc(db, `users/${userId}/dailyLogs`, date);
  const snap = await getDoc(logRef);
  if (snap.exists()) {
    return snap.data() as DailyLog;
  }
  return null;
};

export const createOrUpdateDailyLog = async (
  userId: string,
  date: string,
  data: Partial<DailyLog> & { shiftType?: string, waterLiters?: number }
) => {
  const logRef = doc(db, `users/${userId}/dailyLogs`, date);
  const snap = await getDoc(logRef);
  
  if (!snap.exists()) {
    const shift = data.shiftType || 'early';
    const newLog: DailyLog = {
      userId,
      date,
      shiftType: shift,
      waterLiters: data.waterLiters || 0,
      mealsCompleted: data.mealsCompleted || 0,
      workoutCompleted: data.workoutCompleted || false,
      supplementsCompleted: data.supplementsCompleted || false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    await setDoc(logRef, newLog);
  } else {
    // Only update valid keys as per validation rules 
    const updates: any = { 
      ...data,
      updatedAt: serverTimestamp()
    };
    // remove invalid fields if they slipped in
    delete updates.createdAt;
    delete updates.userId;
    delete updates.date;
    
    await updateDoc(logRef, updates);
  }
};

