import { z } from "zod/v3";

export const childProfileSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().optional(),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  gender: z.enum(["male", "female", "other"]),
  bloodGroup: z.enum(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]).optional(),
  photoUrl: z.string().optional(),
  allergies: z.array(z.string()).default([]),
  chronicConditions: z.array(z.string()).default([]),
  familyMedicalHistory: z.array(z.string()).default([]),
  notes: z.string().optional(),
});

export const growthRecordSchema = z.object({
  childId: z.string().uuid(),
  date: z.string().min(1, "Date is required"),
  weightKg: z.number().positive().optional(),
  heightCm: z.number().positive().optional(),
  headCircumferenceCm: z.number().positive().optional(),
  notes: z.string().optional(),
});

export const nutritionRecordSchema = z.object({
  childId: z.string().uuid(),
  date: z.string().min(1, "Date is required"),
  mealType: z.enum(["breakfast", "lunch", "dinner", "snack"]),
  foodItems: z.array(z.object({
    name: z.string(),
    quantity: z.string(),
    calories: z.number().optional(),
  })).default([]),
  totalCalories: z.number().optional(),
  protein: z.number().optional(),
  carbs: z.number().optional(),
  fat: z.number().optional(),
  fiber: z.number().optional(),
  waterIntakeMl: z.number().optional(),
  notes: z.string().optional(),
});

export const appointmentSchema = z.object({
  childId: z.string().uuid().optional(),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  doctorName: z.string().optional(),
  location: z.string().optional(),
  dateTime: z.string().min(1, "Date and time is required"),
  notes: z.string().optional(),
});

export const vaccinationSchema = z.object({
  childId: z.string().uuid(),
  vaccineName: z.string().min(1, "Vaccine name is required"),
  dateAdministered: z.string().optional(),
  dueDate: z.string().optional(),
  doseNumber: z.number().optional(),
  provider: z.string().optional(),
  isCompleted: z.boolean().default(false),
  notes: z.string().optional(),
});

export type ChildProfileInput = z.infer<typeof childProfileSchema>;
export type GrowthRecordInput = z.infer<typeof growthRecordSchema>;
export type NutritionRecordInput = z.infer<typeof nutritionRecordSchema>;
export type AppointmentInput = z.infer<typeof appointmentSchema>;
export type VaccinationInput = z.infer<typeof vaccinationSchema>;
