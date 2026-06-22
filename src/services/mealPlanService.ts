import { api } from './api';
import { type MealPlan } from '../mocks/mockData';

export const mealPlanService = {
  getMealPlans: async (): Promise<MealPlan[]> => {
    return api.get<MealPlan[]>('/api/mealplans');
  },

  getMealPlanById: async (id: string): Promise<MealPlan> => {
    return api.get<MealPlan>(`/api/mealplans/${id}`);
  }
};
