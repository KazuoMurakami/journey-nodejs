import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { ClientError } from "../errors/client-error";

export default async function getTripAll(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get("/trips/all", async (req) => {
    const trip = await prisma.trip.findMany({
      where: {
        destination: "frança",
      },
    });

    if (!trip) {
      throw new ClientError("trip not found");
    }

    return { trip };
  });
}
