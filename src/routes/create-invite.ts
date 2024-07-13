import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { dayjs } from "../lib/dayjs";
import { getMailClient } from "../lib/mail";
import nodemailer from "nodemailer";
import { ClientError } from "../errors/client-error";
import { env } from "../env";

export default async function createInvite(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    "/trips/:tripId/invites",
    {
      schema: {
        params: z.object({
          tripId: z.string().uuid(),
        }),
        body: z.object({
          email: z.string().email(),
        }),
      },
    },
    async (req) => {
      const { tripId } = req.params;
      const { email } = req.body;

      const trip = await prisma.trip.findUnique({
        where: {
          id: tripId,
        },
      });

      if (!trip) {
        throw new ClientError("trip not found");
      }

      const participant = await prisma.participant.create({
        data: {
          email,
          trip_id: tripId,
        },
      });

      const formattedStartDate = dayjs(trip.start_at).format("LL");
      const formattedEndDate = dayjs(trip.ends_at).format("LL");

      const mail = await getMailClient(); // pega as informações da função getmail client que gera automaticamente de acordo com as configurações que foram inseridas nesse arquivo

      const confirmationLink = `${env.API_BASE_URL}/participants/${participant.id}/confirm`;
      const message = await mail.sendMail({
        from: {
          name: "Equipe plann.er",
          address: "oi@plann.er",
        },
        to: participant.email,
        subject: `Confirme sua presença para ${trip.destination} em ${formattedStartDate}`,
        html: `
          <div style="font-family: sans-serif; font-size: 16; line-height: 1.6;">
            <p>Você foi convidado para uma viagem para <strong>${trip.destination}</strong>, Brasil nas datas de <strong>${formattedStartDate}</strong> até <strong>${formattedEndDate}<strong/> </p>
            <p>Para confirmar sua viagem, clique no link abaixo:</p>
            <p><a href="${confirmationLink}">Confirmar sua viagem</a></p>
            <p>Caso você não saiba do que se trata esse e-mail, apenas igonre esse e-mail</p>
          </div>
        `.trim(),
      });

      console.log(nodemailer.getTestMessageUrl(message));

      return { participantId: participant.id };
    }
  );
}
