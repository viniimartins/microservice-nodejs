import { fastify } from "fastify"
import { fastifyCors } from "@fastify/cors"
import { z } from 'zod'
import {
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider
} from 'fastify-type-provider-zod'
import { randomUUID } from 'node:crypto'
import { schema } from "../db/schema/index.ts"
import { db } from "../db/client.ts"
import { dispatchOrderCreated } from "../../broker/messages/order-created.ts"
import { ca } from "zod/v4/locales"

const app = fastify().withTypeProvider<ZodTypeProvider>()

app.setSerializerCompiler(serializerCompiler)
app.setValidatorCompiler(validatorCompiler)

app.register(fastifyCors, { origin: '*' })

app.get('/health', () => {
  return 'OK'
})



app.listen({ host: '0.0.0.0', port: 3333 }).then(() => {
  console.log('[Invoices] HTTP Server running! ')
})