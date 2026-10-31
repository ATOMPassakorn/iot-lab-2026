import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import {
  createStudentSchema,
  studentIdParamsSchema,
  updateStudentSchema,
} from "../schemas/students.js";
import {
  createStudent,
  deleteStudent,
  getStudentById,
  getStudents,
  updateStudent,
} from "../services/students.js";

export const studentsController = new Hono();

// 1. GET /api/students - ดึงรายชื่อทั้งหมด
studentsController.get("/", async (c) => {
  const list = await getStudents();
  return c.json(list);
});

// 2. GET /api/students/:id - ดึงรายบุคคล
studentsController.get("/:id", zValidator("param", studentIdParamsSchema), async (c) => {
  const { id } = c.req.valid("param");
  const student = await getStudentById(id);
  if (!student) {
    return c.json({ error: "Student not found" }, 404);
  }
  return c.json(student);
});

// 3. POST /api/students - สร้างข้อมูลนักศึกษาใหม่
studentsController.post("/", zValidator("json", createStudentSchema), async (c) => {
  const body = c.req.valid("json");
  const student = await createStudent(body);
  c.header("Location", `/api/students/${student.id}`);
  return c.json(student, 201);
});

// 4. PATCH /api/students/:id - แก้ไขข้อมูลนักศึกษา
studentsController.patch(
  "/:id",
  zValidator("param", studentIdParamsSchema),
  zValidator("json", updateStudentSchema),
  async (c) => {
    const { id } = c.req.valid("param");
    const body = c.req.valid("json");
    const updated = await updateStudent(id, body);
    if (!updated) {
      return c.json({ error: "Student not found" }, 404);
    }
    return c.json(updated);
  },
);

// 5. DELETE /api/students/:id - ลบข้อมูลนักศึกษา
studentsController.delete("/:id", zValidator("param", studentIdParamsSchema), async (c) => {
  const { id } = c.req.valid("param");
  const deleted = await deleteStudent(id);
  if (!deleted) {
    return c.json({ error: "Student not found" }, 404);
  }
  return c.body(null, 204);
});