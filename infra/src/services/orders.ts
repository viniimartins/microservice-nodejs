import * as awsx from '@pulumi/awsx'
import * as pulumi from '@pulumi/pulumi'

import { ordersDockerImage } from '../images/orders'
import { rabbitMQAdminHttpListener, rabbitMQService } from './rabbitmq'
import { cluster } from '../cluster'

export const ordersService = new awsx.classic.ecs.FargateService('fargate-orders', {
  cluster,
  desiredCount: 1,
  waitForSteadyState: false,
  taskDefinitionArgs: {
    container: {
      image: ordersDockerImage.ref,
      cpu: 256,
      memory: 512,
      environment: [
        {
          name: 'BROKER_URL',
          value: pulumi.interpolate`amqp://admin:admin@${rabbitMQAdminHttpListener.endpoint.hostname}:${rabbitMQAdminHttpListener.endpoint.port}`
        }
      ]
    }
  }
})