import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { promise, z } from "zod";
import nodemailer from "nodemailer";
import { prisma } from "../lib/prisma";
import { dayjs } from "../lib/dayjs";
import { getMailClient } from "../lib/mail";
import { ClientError } from "../errors/client-error";
import { env } from "../env";

export default async function confirmTrip(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    "/trips/:tripId/confirm",
    {
      schema: {
        params: z.object({
          tripId: z.string().uuid(),
        }),
      },
    },
    async (req, reply) => {
      const { tripId } = req.params; //pega o parametro do Id que é passado na rota /trips/:tripId <--

      const trip = await prisma.trip.findUnique({
        where: {
          id: tripId, // pega o parametro tripid e associa com a trip criada caso exista
        },
        include: {
          // o include adiciona na query de trip a tabela de participantes que tem nessa tripId, então só preciso passar que não seja o dono o is+owner
          participants: {
            where: {
              is_owner: false,
            },
          },
        },
      });

      if (!trip) {
        throw new ClientError("Trip not found!"); // caso a viagem não exista, jogara um erro
      }

      if (trip.is_confirmed) {
        return reply.redirect(`${env.WEB_BASE_URL}/trips/${tripId}`);
      }

      await prisma.trip.update({
        where: { id: tripId }, // confirma a viagem caso o if de cima não seja verdadeiro
        data: {
          is_confirmed: true,
        },
      });

      const formattedStartDate = dayjs(trip.start_at).format("LL");
      const formattedEndDate = dayjs(trip.ends_at).format("LL");

      const mail = await getMailClient(); // pega as informações da função getmail client que gera automaticamente de acordo com as configurações que foram inseridas nesse arquivo

      await Promise.all(
        trip.participants.map(async (participant) => {
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
        })
      );

      return reply.redirect(`${env.WEB_BASE_URL}/trips/${tripId}`);
    }
  );
}
