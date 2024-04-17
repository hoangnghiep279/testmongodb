import express, { json } from "express";
import { PrismaClient } from "@prisma/client";
import argon2 from "argon2";

(async () => {
    const prisma = new PrismaClient();
    const app = express();
    app.use(json());

    app.get("/", (req, res) => {
        res.json({
            message: "hello world",
        });
    });

    app.post("/register", async (req, res) => {
        const email = req.body?.email;
        const password = req.body?.password;

        if (!email || !password) {
            return res.status(400).json({
                message: "Invalid credentials",
            });
        }

        const checkUser = await prisma.user.findUnique({ where: { email } });

        if (checkUser) {
            return res.status(422).json({
                message: "Email already exists.",
            });
        }

        const user = await prisma.user.create({
            data: {
                email,
                password: await argon2.hash(password),
            },
        });

        const { password: p, ...rest } = user;

        res.json(rest);
    });

    app.listen(3000);
})();
