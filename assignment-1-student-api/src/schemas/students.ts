import { z } from "zod";
import { positiveIdSchema } from "./common.js";

// ตรวจสอบ Parameter :id ที่ส่งมาทาง URL
export const studentIdParamsSchema = z.strictObject({
  id: positiveIdSchema,
});

// ตรวจสอบข้อมูลตอนสร้างนักศึกษาใหม่ (POST)
export const createStudentSchema = z.strictObject({
  studentId: z.string().trim().min(3).max(20),
  firstName: z.string().trim().min(1).max(100),
  lastName: z.string().trim().min(1).max(100),
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format must be YYYY-MM-DD"),
  gender: z.enum(["Male", "Female", "Other", "male", "female", "other"]),
});

// ตรวจสอบข้อมูลตอนแก้ไข (PATCH) - สามารถแก้ไขแค่บางฟิลด์ได้
export const updateStudentSchema = createStudentSchema.partial();