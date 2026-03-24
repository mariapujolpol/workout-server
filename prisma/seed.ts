import { PrismaClient, WorkoutStatus } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.exercise.deleteMany();
  await prisma.workout.deleteMany();
  await prisma.week.deleteMany();

  const start = new Date("2026-03-25");

  const week = await prisma.week.create({
    data: {
      title: "Mes Fuerza · Semana 1",
      startDate: start,
      notes: "Plantilla basada en la app de notas",
      isCompleted: false,
      workouts: {
        create: [
          {
            dayOrder: 1,
            dayLabel: "Día 1 — Upper Push",
            focusTag: "Upper",
            notes: "Calentamiento ligero + drop set final",
            date: start,
            status: WorkoutStatus.DONE,
            completedAt: new Date("2026-03-25T11:30:00Z"),
            exercises: {
              create: [
                {
                  position: 1,
                  name: "Press banca inclinada",
                  scheme: "4x8",
                  weight: 35,
                  unit: "kg",
                  comment: "Última serie asistida si hace falta",
                  completed: true,
                  completedAt: new Date("2026-03-25T10:15:00Z")
                },
                {
                  position: 2,
                  name: "Press militar mancuernas",
                  scheme: "3x10",
                  weight: 18,
                  unit: "kg",
                  completed: true,
                  completedAt: new Date("2026-03-25T10:40:00Z")
                },
                {
                  position: 3,
                  name: "Fondos en paralelas",
                  scheme: "3x12",
                  unit: "bw",
                  comment: "Añadir banda si es necesario",
                  completed: false
                }
              ]
            }
          },
          {
            dayOrder: 2,
            dayLabel: "Día 2 — Lower Body",
            focusTag: "Lower",
            notes: "Orientado a fuerza",
            date: new Date("2026-03-26"),
            status: WorkoutStatus.PLANNED,
            exercises: {
              create: [
                {
                  position: 1,
                  name: "Sentadilla trasera",
                  scheme: "5x5",
                  weight: 90,
                  unit: "kg",
                  completed: false
                },
                {
                  position: 2,
                  name: "Peso muerto rumano",
                  scheme: "4x8",
                  weight: 80,
                  unit: "kg",
                  completed: false
                },
                {
                  position: 3,
                  name: "Prensa unilateral",
                  scheme: "3x12",
                  weight: 40,
                  unit: "kg",
                  comment: "Controlar tempo",
                  completed: false
                }
              ]
            }
          },
          {
            dayOrder: 3,
            dayLabel: "Día 3 — Upper Pull",
            focusTag: "Upper",
            notes: "Añadir trabajo de agarre al final",
            date: new Date("2026-03-28"),
            status: WorkoutStatus.PLANNED,
            exercises: {
              create: [
                {
                  position: 1,
                  name: "Dominadas pronas",
                  scheme: "4x8",
                  unit: "bw",
                  comment: "Asistidas si cae de 6 reps",
                  completed: false
                },
                {
                  position: 2,
                  name: "Remo con barra",
                  scheme: "3x10",
                  weight: 70,
                  unit: "kg",
                  completed: false
                },
                {
                  position: 3,
                  name: "Face pulls",
                  scheme: "3x15",
                  weight: 25,
                  unit: "kg",
                  completed: false
                }
              ]
            }
          }
        ]
      }
    },
    include: {
      workouts: {
        include: { exercises: true }
      }
    }
  });

  console.log(`Seed creada: ${week.workouts.length} workouts, ${week.workouts.reduce((acc, w) => acc + w.exercises.length, 0)} ejercicios.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
