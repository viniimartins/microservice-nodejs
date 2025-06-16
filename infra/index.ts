import * as pulumi from '@pulumi/pulumi'

import { ordersService } from './src/services/orders'
import { appLoadBalancer } from './src/load-balancer'
import { rabbitMQService } from './src/services/rabbitmq'

export const ordersId = ordersService.service.id
export const rabbitMQId = rabbitMQService.service.id
export const rabbitMQAdminUrl = pulumi.interpolate`http://${appLoadBalancer.listeners[0].endpoint.hostname}:15672`

// postgresql://orders_owner:npg_9xOsd4IbyzuF@ep-jolly-frog-a4d1ie45.us-east-1.aws.neon.tech/orders?sslmode=require

// postgresql://invoices_owner:npg_SEKzAsk5w9VT@ep-ancient-grass-a48jvkeq.us-east-1.aws.neon.tech/invoices?sslmode=require