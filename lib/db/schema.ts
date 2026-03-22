import {
  pgTable,
  text,
  timestamp,
  uuid,
  integer,
  real,
  boolean,
  pgEnum,
  jsonb,
  date,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Enums
export const userRoleEnum = pgEnum("user_role", [
  "parent",
  "caregiver",
  "healthcare_provider",
]);

export const genderEnum = pgEnum("gender", ["male", "female", "other"]);

export const bloodGroupEnum = pgEnum("blood_group", [
  "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-",
]);

export const mealTypeEnum = pgEnum("meal_type", [
  "breakfast", "lunch", "dinner", "snack",
]);

export const alertTypeEnum = pgEnum("alert_type", [
  "vaccination", "medication", "growth_anomaly", "appointment", "ai_summary",
]);

export const alertStatusEnum = pgEnum("alert_status", [
  "pending", "sent", "read", "dismissed",
]);

// Users table (synced from Clerk)
export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  clerkId: text("clerk_id").notNull().unique(),
  email: text("email").notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  imageUrl: text("image_url"),
  role: userRoleEnum("role").default("parent").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Children profiles
export const children = pgTable("children", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  firstName: text("first_name").notNull(),
  lastName: text("last_name"),
  dateOfBirth: date("date_of_birth").notNull(),
  gender: genderEnum("gender").notNull(),
  bloodGroup: bloodGroupEnum("blood_group"),
  photoUrl: text("photo_url"),
  allergies: jsonb("allergies").$type<string[]>().default([]),
  chronicConditions: jsonb("chronic_conditions").$type<string[]>().default([]),
  familyMedicalHistory: jsonb("family_medical_history").$type<string[]>().default([]),
  medications: jsonb("medications").$type<{ name: string; dosage: string; frequency: string }[]>().default([]),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Growth records
export const growthRecords = pgTable("growth_records", {
  id: uuid("id").defaultRandom().primaryKey(),
  childId: uuid("child_id").notNull().references(() => children.id, { onDelete: "cascade" }),
  date: date("date").notNull(),
  weightKg: real("weight_kg"),
  heightCm: real("height_cm"),
  headCircumferenceCm: real("head_circumference_cm"),
  bmi: real("bmi"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Developmental milestones
export const milestones = pgTable("milestones", {
  id: uuid("id").defaultRandom().primaryKey(),
  childId: uuid("child_id").notNull().references(() => children.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  category: text("category").notNull(), // motor, cognitive, social, language
  achievedDate: date("achieved_date"),
  expectedAgeMonths: integer("expected_age_months"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Nutrition records
export const nutritionRecords = pgTable("nutrition_records", {
  id: uuid("id").defaultRandom().primaryKey(),
  childId: uuid("child_id").notNull().references(() => children.id, { onDelete: "cascade" }),
  date: date("date").notNull(),
  mealType: mealTypeEnum("meal_type").notNull(),
  foodItems: jsonb("food_items").$type<{ name: string; quantity: string; calories?: number }[]>().default([]),
  totalCalories: integer("total_calories"),
  protein: real("protein"),
  carbs: real("carbs"),
  fat: real("fat"),
  fiber: real("fiber"),
  waterIntakeMl: integer("water_intake_ml"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Vaccination records
export const vaccinations = pgTable("vaccinations", {
  id: uuid("id").defaultRandom().primaryKey(),
  childId: uuid("child_id").notNull().references(() => children.id, { onDelete: "cascade" }),
  vaccineName: text("vaccine_name").notNull(),
  dateAdministered: date("date_administered"),
  dueDate: date("due_date"),
  doseNumber: integer("dose_number"),
  provider: text("provider"),
  isCompleted: boolean("is_completed").default(false),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// AI Health Assessments
export const healthAssessments = pgTable("health_assessments", {
  id: uuid("id").defaultRandom().primaryKey(),
  childId: uuid("child_id").notNull().references(() => children.id, { onDelete: "cascade" }),
  assessmentType: text("assessment_type").notNull(), // comprehensive, growth, nutrition, risk
  summary: text("summary").notNull(),
  riskLevel: text("risk_level"), // low, moderate, high
  findings: jsonb("findings").$type<{ category: string; finding: string; severity: string }[]>().default([]),
  recommendations: jsonb("recommendations").$type<string[]>().default([]),
  rawResponse: text("raw_response"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Alerts & Notifications
export const alerts = pgTable("alerts", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  childId: uuid("child_id").references(() => children.id, { onDelete: "cascade" }),
  type: alertTypeEnum("type").notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  status: alertStatusEnum("status").default("pending").notNull(),
  scheduledFor: timestamp("scheduled_for"),
  sentAt: timestamp("sent_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Appointments
export const appointments = pgTable("appointments", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  childId: uuid("child_id").references(() => children.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  doctorName: text("doctor_name"),
  location: text("location"),
  dateTime: timestamp("date_time").notNull(),
  isCompleted: boolean("is_completed").default(false),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Test Reports (AI Advisor)
export const testReports = pgTable("test_reports", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  childId: uuid("child_id").references(() => children.id, { onDelete: "set null" }),
  fileName: text("file_name").notNull(),
  fileUrl: text("file_url").notNull(),
  mimeType: text("mime_type").notNull(),
  analysis: jsonb("analysis").$type<{
    reportType: string;
    summary: string;
    findings: { test: string; value: string; normalRange: string; status: string }[];
    concerns: string[];
    isReportRelated: boolean;
  }>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Report Chat Messages
export const reportChatMessages = pgTable("report_chat_messages", {
  id: uuid("id").defaultRandom().primaryKey(),
  reportId: uuid("report_id").notNull().references(() => testReports.id, { onDelete: "cascade" }),
  role: text("role").notNull(), // "user" | "model"
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  children: many(children),
  alerts: many(alerts),
  appointments: many(appointments),
  testReports: many(testReports),
}));

export const childrenRelations = relations(children, ({ one, many }) => ({
  user: one(users, { fields: [children.userId], references: [users.id] }),
  growthRecords: many(growthRecords),
  milestones: many(milestones),
  nutritionRecords: many(nutritionRecords),
  vaccinations: many(vaccinations),
  healthAssessments: many(healthAssessments),
  alerts: many(alerts),
  appointments: many(appointments),
}));

export const growthRecordsRelations = relations(growthRecords, ({ one }) => ({
  child: one(children, { fields: [growthRecords.childId], references: [children.id] }),
}));

export const milestonesRelations = relations(milestones, ({ one }) => ({
  child: one(children, { fields: [milestones.childId], references: [children.id] }),
}));

export const nutritionRecordsRelations = relations(nutritionRecords, ({ one }) => ({
  child: one(children, { fields: [nutritionRecords.childId], references: [children.id] }),
}));

export const vaccinationsRelations = relations(vaccinations, ({ one }) => ({
  child: one(children, { fields: [vaccinations.childId], references: [children.id] }),
}));

export const healthAssessmentsRelations = relations(healthAssessments, ({ one }) => ({
  child: one(children, { fields: [healthAssessments.childId], references: [children.id] }),
}));

export const alertsRelations = relations(alerts, ({ one }) => ({
  user: one(users, { fields: [alerts.userId], references: [users.id] }),
  child: one(children, { fields: [alerts.childId], references: [children.id] }),
}));

export const appointmentsRelations = relations(appointments, ({ one }) => ({
  user: one(users, { fields: [appointments.userId], references: [users.id] }),
  child: one(children, { fields: [appointments.childId], references: [children.id] }),
}));

export const testReportsRelations = relations(testReports, ({ one, many }) => ({
  user: one(users, { fields: [testReports.userId], references: [users.id] }),
  child: one(children, { fields: [testReports.childId], references: [children.id] }),
  messages: many(reportChatMessages),
}));

export const reportChatMessagesRelations = relations(reportChatMessages, ({ one }) => ({
  report: one(testReports, { fields: [reportChatMessages.reportId], references: [testReports.id] }),
}));
