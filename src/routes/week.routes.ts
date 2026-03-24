import { Router, Request, Response } from "express";
import prisma from "../db";
import { verifyToken } from "../middleware/auth.middleware";

const router = Router();
router.use(verifyToken);

router.get("/", async (req: Request, res: Response) => {
  try {
    const { full } = req.query as { full?: string };
    const includeFull = full === "true" || full === "1";
    const userId = (req as any).user.id;

    const weeks = await prisma.week.findMany({
      where: { userId },
      orderBy: { startDate: "desc" },
      include: includeFull
        ? {
            workouts: {
              orderBy: { dayOrder: "asc" },
              include: {
                exercises: {
                  orderBy: { position: "asc" }
                }
              }
            }
          }
        : {
            _count: {
              select: { workouts: true }
            }
          }
    });

    res.json(weeks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error fetching weeks" });
  }
});

router.get("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };

    const week = await prisma.week.findUnique({
      where: { id },
      include: {
        workouts: {
          orderBy: { dayOrder: "asc" },
          include: {
            exercises: {
              orderBy: { position: "asc" }
            }
          }
        }
      }
    });

    if (!week) {
      return res.status(404).json({ message: "Week not found" });
    }

    res.json(week);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error fetching week" });
  }
});

router.post("/", async (req: Request, res: Response) => {
  try {
    const { title, startDate, notes } = req.body as {
      title?: string;
      startDate?: string;
      notes?: string | null;
    };

    if (!title || !startDate) {
      return res.status(400).json({ message: "title and startDate are required" });
    }

    const userId = (req as any).user.id;

    const week = await prisma.week.create({
      data: {
        userId,
        title,
        startDate: new Date(startDate),
        notes: notes || null
      }
    });

    res.status(201).json(week);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error creating week" });
  }
});

router.patch("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const { title, startDate, notes } = req.body as {
      title?: string;
      startDate?: string | null;
      notes?: string | null;
    };

    const week = await prisma.week.update({
      where: { id },
      data: {
        title: title ?? undefined,
        startDate: startDate === undefined ? undefined : startDate ? new Date(startDate) : null,
        notes: notes ?? undefined
      }
    });

    res.json(week);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error updating week" });
  }
});

router.patch("/:id/complete", async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const { isCompleted } = req.body as { isCompleted?: boolean };

    if (typeof isCompleted !== "boolean") {
      return res.status(400).json({ message: "isCompleted flag is required" });
    }

    if (isCompleted) {
      const pending = await prisma.workout.count({
        where: { weekId: id, status: { not: "DONE" } }
      });

      if (pending > 0) {
        return res.status(400).json({ message: "All workouts must be DONE before completing the week" });
      }
    }

    const week = await prisma.week.update({
      where: { id },
      data: {
        isCompleted,
        completedAt: isCompleted ? new Date() : null
      },
      include: {
        workouts: {
          orderBy: { dayOrder: "asc" }
        }
      }
    });

    res.json(week);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error toggling week completion" });
  }
});

router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };

    await prisma.week.delete({
      where: { id }
    });

    res.json({ message: "Week deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error deleting week" });
  }
});

export default router;
