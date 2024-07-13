# Agendamento de viagem

Projeto desenvolvido com base na edição NLW Journey - RocketSeat

Nesse projeto escolhido, segui pela trilha de Node.js para criar um sistema de agendamento de viagens, basicamente a ferramenta será utilizada para um participante criar uma viagem com destino,data, preço, atividades que podem ser adicionadas, participantes que foram convidados e podendo acrescentar novas rotas com base na necessidade que possa a vir surgir.

Trabalhei focado na parte do Back-end do projeto para criação das rotas que serão utilizadas para serem consumidas pelo front-end.

## Stack utilizada

**Back-end:** Node, Fastify, SQlite, Zod, Prisma

## Deploy

Para fazer o deploy desse projeto rode

```bash
  npm run dev
```

Para subir o banco de dados

```bash
  npx prisma studio
```

## Documentação da API

Breve exemplo das rotas que foram adicionadas

#### Criar um evento

```http
  POST /trips
```

| Retorno   | Tipo     | Descrição                                       |
| :-------- | :------- | :---------------------------------------------- |
| `trip_id` | `string` | **Obrigatório**. Retorno do id do evento criado |

| Parametros         | Tipo     | Descrição                                     |
| :----------------- | :------- | :-------------------------------------------- |
| `destination`      | `string` | **Obrigatório**. Local da viagem              |
| `start_at`         | `Date`   | **Obrigatório**. Começo da viagem             |
| `ends_at`          | `Date`   | **Obrigatório**. Fim da viagem                |
| `owner_name`       | `string` | **Obrigatório**. Nome do criador do evento    |
| `owner_email`      | `string` | **Obrigatório**. Email do criador do evento   |
| `emails_to_envite` | `string` | **Opcional**. Email dos convidados caso tenha |

#### Retorno de uma viagem especifica

```http
  GET trips/:trip_id
```

| Parâmetro | Tipo   | Descrição                                   |
| :-------- | :----- | :------------------------------------------ |
| `trip_id` | `UUID` | **Obrigatório**. O ID do item que você quer |

#### Retorno

## Screenshots

![App Screenshot](/static/Retorno-trip.png)
