import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import nodemailer from "nodemailer";
import { getMailClient } from "../lib/mail";
import { dayjs } from "../lib/dayjs";
import { ClientError } from "../errors/client-error";
import { env } from "../env";

export default async function createTrip(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    "/trips",
    {
      schema: {
        body: z.object({
          destination: z.string().min(4),
          start_at: z.coerce.date(),
          ends_at: z.coerce.date(),
          owner_name: z.string(),
          owner_email: z.string().email(),
          emails_to_envite: z.array(z.string().email()),
        }),
      },
    },
    async (req) => {
      const {
        destination,
        start_at,
        ends_at,
        owner_name,
        owner_email,
        emails_to_envite,
      } = req.body;

      if (dayjs(start_at).isBefore(new Date())) {
        throw new ClientError("invalid trip start date");
      }

      if (dayjs(ends_at).isBefore(start_at)) {
        throw new ClientError("invalid trip end date");
      }

      const trip = await prisma.trip.create({
        data: {
          destination,
          start_at,
          ends_at,
          participants: {
            // cria um participante dentro da viagem trip e não é necessario passar o tripid pois ele já entende que se trata dessa trip criada
            createMany: {
              data: [
                {
                  name: owner_name,
                  email: owner_email,
                  is_owner: true,
                  is_confirmed: true,
                },
                ...emails_to_envite.map((email) => {
                  return { email }; // percorre a array criada e joga na array anterior com o spring ...
                }),
              ],
            },
          },
        },
      });

      const formattedStartDate = dayjs(start_at).format("LL");
      const formattedEndDate = dayjs(ends_at).format("LL");

      const confirmationLink = `${env.API_BASE_URL}/trips/${trip.id}/confirm`;

      const mail = await getMailClient(); // pega as informações da função getmail client que gera automaticamente de acordo com as configurações que foram inseridas nesse arquivo

      const message = await mail.sendMail({
        from: {
          name: "Equipe plann.er",
          address: "oi@plann.er",
        },
        to: {
          name: owner_name,
          address: owner_email,
        },
        subject: `Confirme sua viagem para ${destination}`,
        html: `
          <div style="font-family: sans-serif; font-size: 16; line-height: 1.6;">
            <p>Você solicitou a criação de uma viaghem para <strong>${destination}</strong>, Brasil nas datas de <strong>${formattedStartDate}</strong> até <strong>${formattedEndDate}<strong/> </p>
            <p>Para confirmar sua viagem, clique no link abaixo:</p>
            <p><a href="${confirmationLink}">Confirmar sua viagem</a></p>
            <p>Caso você não saiba do que se trata esse e-mail, apenas igonre esse e-mail</p>
          </div>
        `.trim(),
      });

      console.log(nodemailer.getTestMessageUrl(message));
      return { trip: trip.id };
    }
  );
}
