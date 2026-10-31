import { eq } from "drizzle-orm";
import db from "../db/index.js";
import { students, type NewStudent, type Student } from "../db/schema.js";

// Read All
export async function getStudents(): Promise<Student[]> {
  return db.select().from(students);
}

// Read One
export async function getStudentById(id: number): Promise<Student | undefined> {
  const [student] = await db
    .select()
    .from(students)
    .where(eq(students.id, id))
    .limit(1);
  return student;
}

// Create
export async function createStudent(data: NewStudent): Promise<Student> {
  const [student] = await db.insert(students).values(data).returning();
  if (!student) {
    throw new Error("Failed to create student");
  }
  return student;
}

// Update
export async function updateStudent(
  id: number,
  data: Partial<NewStudent>,
): Promise<Student | undefined> {
  const [student] = await db
    .update(students)
    .set(data)
    .where(eq(students.id, id))
    .returning();
  return student;
}

// Delete
export async function deleteStudent(id: number): Promise<boolean> {
  const [deleted] = await db
    .delete(students)
    .where(eq(students.id, id))
    .returning({ id: students.id });
  return deleted !== undefined;
}