import { card, user } from "@/validators";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { handle } from "hono/vercel";
import { prisma } from "@/prisma";
import { z } from "zod";

const app = new Hono().basePath("/api");

app.get("/hello", (c) => {
  return c.json({
    message: "Hello Next.js!",
  });
});

app.post("/sign-up", zValidator("json", user), async (c) => {
  const { username, password } = c.req.valid("json");
  const existingUser = await prisma.user.findFirst({
    where: {
      username,
    },
  });
  if (existingUser) {
    return c.json(
      {
        message: "Username is already taken",
      },
      400
    );
  }
  await prisma.user.create({
    data: {
      username,
      password,
    },
  });
  return c.json({
    message: "Success!",
  });
});

app.post("/sign-in", zValidator("json", user), async (c) => {
  const { username, password } = c.req.valid("json");
  const user = await prisma.user.findFirst({
    where: {
      username,
      password,
    },
  });
  if (!user) {
    return c.json(
      {
        message: "Invalid credentials",
      },
      401
    );
  }
  return c.json({
    message: "Success!",
    user,
  });
});

app.post("/cards", zValidator("json", card), async (c) => {
  const { userId, name } = c.req.valid("json");
  await prisma.card.create({
    data: {
      name,
      ownerId: userId,
    },
  });

  return c.json({
    message: "Success!",
  });
});

app.get(
  "/cards",
  zValidator(
    "query",
    z.object({
      userId: z.string().optional(),
      search: z.string().optional(),
    })
  ),
  async (c) => {
    const { userId, search } = c.req.valid("query");

    const cards = await prisma.card.findMany({
      where: {
        ownerId: userId,
        name: {
          contains: search,
        },
      },
    });
    return c.json(cards);
  }
);

app.get("/users", async (c) => {
  const users = await prisma.user.findMany();
  return c.json(users);
});

export const GET = handle(app);
export const POST = handle(app);
