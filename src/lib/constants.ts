export const SHIFT_SCHEDULES = {
  early: {
    name: 'Early Shift',
    meals: [
      { id: 'm1', label: 'Breakfast', description: 'Oats + milk + banana + PB OR Eggs + toast', complete: false },
      { id: 'm2', label: 'Lunch', description: 'Chicken + rice + veg', complete: false },
      { id: 'm3', label: 'Snacks', description: 'Yoghurt, banana, nuts, sandwich', complete: false },
      { id: 'm4', label: 'Dinner', description: 'Protein + carbs + veg', complete: false }
    ],
    supplements: 'Morning: Vit D3 + K2 + Fish Oil. Night: Magnesium Glycinate'
  },
  afternoon: {
    name: 'Afternoon Shift',
    meals: [
      { id: 'm1', label: 'Morning Meal', description: 'Eggs + toast OR Oats OR Smoothie', complete: false },
      { id: 'm2', label: 'Pre-shift', description: 'Chicken + rice + veg', complete: false },
      { id: 'm3', label: 'Work Snacks', description: 'Fruit, yoghurt, nuts, protein bar', complete: false },
      { id: 'm4', label: 'Post-shift', description: 'Light protein meal', complete: false }
    ],
    supplements: 'Morning: Vit D3 + K2 + Fish Oil. Night: Magnesium Glycinate'
  },
  off: {
    name: 'Day Off / Prep Day',
    meals: [
      { id: 'm1', label: 'Breakfast', description: 'Oats/Eggs', complete: false },
      { id: 'm2', label: 'Lunch', description: 'Meal prep run', complete: false },
      { id: 'm3', label: 'Snacks', description: 'Fruit/Protein', complete: false },
      { id: 'm4', label: 'Dinner', description: 'Protein + Carbs + Veg', complete: false }
    ],
    supplements: 'Morning: Vit D3 + K2 + Fish Oil. Night: Magnesium Glycinate',
    prepTools: [
      'Cook chicken (6-8 portions)',
      'Cook rice/pasta',
      'Prepare frozen veg',
      'Boil 8-10 eggs',
      'Prep grab-and-go boxes'
    ]
  }
};

export const WORKOUT_PLAN = [
  'Squats or leg press (3 sets of 8-12 reps)',
  'Push-ups or bench press (3 sets of 8-12 reps)',
  'Rows (3 sets of 8-12 reps)',
  'Shoulder press (3 sets of 8-12 reps)',
  'Glutes or deadlifts (3 sets of 8-12 reps)',
  'Plank (3 sets max hold)'
];
