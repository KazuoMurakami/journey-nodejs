import fastify from "fastify";
import cors from "@fastify/cors";
import createTrip from "./routes/create-trips";
import {
  validatorCompiler,
  serializerCompiler,
} from "fastify-type-provider-zod";
import confirmTrip from "./routes/confirm-trip";
import confirmParticipant from "./routes/confirm-participant";
import createActivities from "./routes/create-activities";
import getActivities from "./routes/get-activities";
import createLink from "./routes/create-links";
import getLinks from "./routes/get-links";
import getParticipants from "./routes/get-participants";
import createInvite from "./routes/create-invite";
import updateTrip from "./routes/update-trip";
import getTripDetails from "./routes/get-trip-details";
import getParticipant from "./routes/get-participant";
import { errorHandler } from "./error-handler";
import { env } from "./env";
import getTripAll from "./routes/get-trips";

const app = fastify();

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

app.register(cors, {
  origin: "https://localhost:3333",
});

app.setErrorHandler(errorHandler); //define o error handler

app.register(createTrip);
app.register(confirmTrip);
app.register(confirmParticipant);
app.register(createActivities);
app.register(getActivities);
app.register(createLink);
app.register(getLinks);
app.register(getParticipants);
app.register(createInvite);
app.register(updateTrip);
app.register(getTripDetails);
app.register(getParticipant);
app.register(getTripAll);

app.listen({ port: env.PORT }).then(() => {
  console.log("conectado");
});
