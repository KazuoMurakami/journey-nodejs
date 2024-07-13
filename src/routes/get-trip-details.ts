import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { ClientError } from "../errors/client-error";

export default async function getTripDetails(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    "/trips/:tripId",
    {
      schema: {
        params: z.object({
          tripId: z.string().uuid(),
        }),
      },
    },
    async (req) => {
      const { tripId } = req.params;

      const trip = await prisma.trip.findUnique({
        select: {
          destination: true,
          created_at: true,
          ends_at: true,
          is_confirmed: true,
        },
        where: {
          id: tripId,
        },
      });

      if (!trip) {
        throw new ClientError("trip not found");
      }

      return { trip };
    }
  );
}
