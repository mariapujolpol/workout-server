import { Router } from "express";
import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";
import prisma from "../db";

const router = Router();

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

router.post("/google", async (req, res) => {
  try {
    const { token } = req.body;

    // ✅ Verificar token de Google
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (!payload) {
      return res.status(401).json({ message: "Invalid token" });
    }

    // 💾 Buscar o crear el usuario en la DB
    const user = await prisma.user.upsert({
      where: { googleId: payload.sub },
      update: {
        name: payload.name,
        picture: payload.picture,
      },
      create: {
        googleId: payload.sub,
        email: payload.email!,
        name: payload.name,
        picture: payload.picture,
      },
    });

    // 🔐 Crear token propio (JWT) con el id de Prisma
    const appToken = jwt.sign(
      { id: user.id, email: user.email, name: user.name, picture: user.picture },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" }
    );

    res.json({
      token: appToken,
      user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Auth failed" });
  }
});

export default router;