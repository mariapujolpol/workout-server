import { Router, Request, Response } from "express";
import prisma from "../db";

const router = Router();

// GET exercises (optionally filtered by workout)
router.get("/", async (req: Request, res: Response) => {
  try {
    const { workoutId } = req.query as { workoutId?: string };

    const data = await prisma.exercise.findMany({
      where: workoutId ? { workoutId } : undefined,
      orderBy: { position: "asc" },
      include: { workout: true }
    });

    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error fetching exercises" });
  }
});

// CREATE exercise
router.post("/", async (req: Request, res: Response) => {
  try {
    const { workoutId, name, scheme, weight, unit, comment, position } = req.body as {
      workoutId?: string;
      name?: string;
      scheme?: string;
      weight?: number | string | null;
      unit?: string | null;
      comment?: string | null;
      position?: number | string | null;
    };

    if (!workoutId || !name || !scheme) {
      return res.status(400).json({ message: "workoutId, name and scheme are required" });
    }

    const data = await prisma.exercise.create({
      data: {
        workoutId,
        name,
        scheme,
        weight:
          weight === undefined || weight === null
            ? null
            : typeof weight === "string"
              ? parseFloat(weight)
              : weight,
        unit: unit || null,
        comment: comment || null,
        position:
          position === undefined || position === null
            ? undefined
            : typeof position === "string"
              ? parseInt(position, 10)
              : position
      }
    });

    res.status(201).json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error creating exercise" });
  }
});

// UPDATE exercise
router.put("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const { name, scheme, weight, unit, comment, position, workoutId, completed } = req.body as {
      workoutId?: string;
      name?: string;
      scheme?: string;
      weight?: number | string | null;
      unit?: string | null;
      comment?: string | null;
      position?: number | string | null;
      completed?: boolean;
    };

    const data = await prisma.exercise.update({
      where: { id },
      data: {
        workoutId: workoutId ?? undefined,
        name: name ?? undefined,
        scheme: scheme ?? undefined,
        weight:
          weight === undefined
            ? undefined
            : weight === null
              ? null
              : typeof weight === "string"
                ? parseFloat(weight)
                : weight,
        unit: unit ?? undefined,
        comment: comment ?? undefined,
        position:
          position === undefined
            ? undefined
            : position === null
              ? null
              : typeof position === "string"
                ? parseInt(position, 10)
                : position,
        completed: completed ?? undefined,
        completedAt: completed === undefined ? undefined : completed ? new Date() : null
      }
    });

    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error updating exercise" });
  }
});

// TOGGLE exercise completion
router.patch("/:id/toggle", async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };

    const exercise = await prisma.exercise.findUnique({ where: { id } });
    if (!exercise) {
      return res.status(404).json({ message: "Exercise not found" });
    }

    const data = await prisma.exercise.update({
      where: { id },
      data: {
        completed: !exercise.completed,
        completedAt: !exercise.completed ? new Date() : null
      }
    });

    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error toggling exercise" });
  }
});

// DELETE exercise
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };

    await prisma.exercise.delete({
      where: { id }
    });

    res.json({ message: "Exercise deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error deleting exercise" });
  }
});

export default router;
