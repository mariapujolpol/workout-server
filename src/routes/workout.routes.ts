import { Router, Request, Response } from "express";
import { WorkoutStatus } from "@prisma/client";
import prisma from "../db";
import { verifyToken } from "../middleware/auth.middleware";

const router = Router();
router.use(verifyToken);

const syncWeekCompletion = async (weekId: string) => {
  const workouts = await prisma.workout.findMany({
    where: { weekId },
    select: { status: true }
  });

  const allDone = workouts.length > 0 && workouts.every((workout) => workout.status === WorkoutStatus.DONE);

  await prisma.week.update({
    where: { id: weekId },
    data: {
      isCompleted: allDone,
      completedAt: allDone ? new Date() : null
    }
  }).catch(() => undefined);
};

const parseStatus = (value?: string | null): WorkoutStatus | undefined => {
  if (!value) return undefined;
  const upper = value.toUpperCase();
  if (upper in WorkoutStatus) {
    return upper as WorkoutStatus;
  }
  return undefined;
};

// GET workouts (optionally filter by week)
router.get("/", async (req: Request, res: Response) => {
  try {
    const { weekId } = req.query as { weekId?: string };

    const data = await prisma.workout.findMany({
      where: weekId ? { weekId } : undefined,
      orderBy: { dayOrder: "asc" },
      include: {
        week: true,
        exercises: {
          orderBy: { position: "asc" }
        }
      }
    });

    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error fetching workouts" });
  }
});

// GET one workout
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };

    const data = await prisma.workout.findUnique({
      where: { id },
      include: {
        week: true,
        exercises: {
          orderBy: { position: "asc" }
        }
      }
    });

    if (!data) {
      return res.status(404).json({ message: "Workout not found" });
    }

    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error fetching workout" });
  }
});

// CREATE workout
router.post("/", async (req: Request, res: Response) => {
  try {
    const { weekId, dayOrder, dayLabel, focusTag, notes, date, status } = req.body as {
      weekId?: string;
      dayOrder?: number | string;
      dayLabel?: string;
      focusTag?: string | null;
      notes?: string | null;
      date?: string | null;
      status?: string | null;
    };

    if (!weekId || dayOrder === undefined || !dayLabel) {
      return res.status(400).json({
        message: "weekId, dayOrder and dayLabel are required"
      });
    }

    const parsedStatus = parseStatus(status);
    if (status && !parsedStatus) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const userId = (req as any).user.id;

    const workout = await prisma.workout.create({
      data: {
        weekId,
        userId,
        dayOrder: typeof dayOrder === "string" ? parseInt(dayOrder, 10) : dayOrder,
        dayLabel,
        focusTag: focusTag || null,
        notes: notes || null,
        date: date ? new Date(date) : null,
        status: parsedStatus,
        completedAt: parsedStatus === WorkoutStatus.DONE ? new Date() : undefined
      }
    });

    await syncWeekCompletion(weekId);

    res.status(201).json(workout);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error creating workout" });
  }
});

// UPDATE workout
router.put("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const { weekId, dayOrder, dayLabel, focusTag, notes, date, status } = req.body as {
      weekId?: string;
      dayOrder?: number | string;
      dayLabel?: string;
      focusTag?: string | null;
      notes?: string | null;
      date?: string | null;
      status?: string | null;
    };

    const existing = await prisma.workout.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ message: "Workout not found" });
    }

    const parsedStatus = parseStatus(status);
    if (status && !parsedStatus) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const data = await prisma.workout.update({
      where: { id },
      data: {
        weekId: weekId ?? undefined,
        dayOrder:
          dayOrder === undefined
            ? undefined
            : typeof dayOrder === "string"
              ? parseInt(dayOrder, 10)
              : dayOrder,
        dayLabel: dayLabel ?? undefined,
        focusTag: focusTag ?? undefined,
        notes: notes ?? undefined,
        date: date === undefined ? undefined : date ? new Date(date) : null,
        status: parsedStatus ?? undefined,
        completedAt:
          parsedStatus === undefined
            ? undefined
            : parsedStatus === WorkoutStatus.DONE
              ? new Date()
              : null
      },
      include: {
        week: true,
        exercises: {
          orderBy: { position: "asc" }
        }
      }
    });

    await syncWeekCompletion(data.weekId);
    if (existing.weekId !== data.weekId) {
      await syncWeekCompletion(existing.weekId);
    }

    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error updating workout" });
  }
});

// UPDATE workout status quick toggle
router.patch("/:id/status", async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const { status } = req.body as { status?: string };

    const parsedStatus = parseStatus(status);
    if (!parsedStatus) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const data = await prisma.workout.update({
      where: { id },
      data: {
        status: parsedStatus,
        completedAt: parsedStatus === WorkoutStatus.DONE ? new Date() : null
      },
      include: {
        week: true,
        exercises: {
          orderBy: { position: "asc" }
        }
      }
    });

    await syncWeekCompletion(data.weekId);

    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error updating status" });
  }
});

// DELETE workout
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };

    const workout = await prisma.workout.delete({
      where: { id }
    });

    await syncWeekCompletion(workout.weekId);

    res.json({ message: "Workout deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error deleting workout" });
  }
});

export default router;
