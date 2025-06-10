import '@opentelemetry/auto-instrumentations-node/register'

import { fastify } from "fastify"
import { fastifyCors } from "@fastify/cors"
import { trace } from '@opentelemetry/api'
import { z } from 'zod'
import {
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider
} from 'fastify-type-provider-zod'
import { randomUUID } from 'node:crypto'
import { setTimeout } from 'node:timers/promises'

import { schema } from "../db/schema/index.ts"
import { db } from "../db/client.ts"
import { dispatchOrderCreated } from "../broker/messages/order-created.ts"
import { tracer } from '../tracer/tracer.ts'

const app = fastify().withTypeProvider<ZodTypeProvider>()

app.setSerializerCompiler(serializerCompiler)
app.setValidatorCompiler(validatorCompiler)

app.register(fastifyCors, { origin: '*' })

app.get('/health', () => {
  return 'OK'
})

app.post('/orders', {
  schema: {
    body: z.object({
      amount: z.coerce.number(),
    })
  }
}, async (request, reply) => {
  const { amount } = request.body

  const orderId = randomUUID()

  await db.insert(schema.orders).values({
    id: orderId,
    customerId: 'efb1ff27-b164-4756-8a45-c8a84d4e1605',
    amount,
  })

  const span = tracer.startSpan('create-order')

  span.setAttribute('teste', 'hello world')
  await setTimeout(2000)

  span.end()

  trace.getActiveSpan()?.setAttribute('order_id', orderId)

  dispatchOrderCreated({
    orderId,
    amount,
    customer: {
      id: 'efb1ff27-b164-4756-8a45-c8a84d4e1605'
    }
  })

  return reply.status(201).send()
})

app.listen({ host: '0.0.0.0', port: 3333 }).then(() => {
  console.log('[Orders] HTTP Server running! ')
})