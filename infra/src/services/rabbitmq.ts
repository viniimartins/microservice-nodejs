import * as awsx from '@pulumi/awsx'
import { cluster } from '../cluster'
import { appLoadBalancer, networkLoadBalancer } from '../load-balancer'

const rabbitMQAdminTargetGroup = appLoadBalancer.createTargetGroup('rabbitmq-admin-target', {
  port: 15672,
  protocol: 'HTTP',
  healthCheck: {
    path: '/',
    protocol: 'HTTP',
  }
})

export const rabbitMQAdminHttpListener = appLoadBalancer.createListener('rabbitmq-admin-listener', {
  port: 15672,
  protocol: 'HTTP',
  targetGroup: rabbitMQAdminTargetGroup
})

const ampqTargetGroup = networkLoadBalancer.createTargetGroup('amqp-target', {
  protocol: 'TCP',
  port: 5672,
  targetType: 'ip',
  healthCheck: {
    protocol: 'TCP',
    port: '5672',
  }
})

export const amqpListener = networkLoadBalancer.createListener('amqp-listener', {
  port: 5672,
  protocol: 'TCP',
  targetGroup: ampqTargetGroup,
})

export const rabbitMQService = new awsx.classic.ecs.FargateService('fargate-rabbitmq', {
  cluster,
  desiredCount: 1,
  waitForSteadyState: false,
  taskDefinitionArgs: {
    container: {
      image: 'rabbitmq:3-management',
      cpu: 256,
      memory: 512,
      portMappings: [
        rabbitMQAdminHttpListener,
        amqpListener
      ],
      environment: [
        { name: 'RABBITMQ_DEFAULT_USER', value: 'admin' },
        { name: 'RABBITMQ_DEFAULT_PASS', value: 'admin' },
      ]
    }
  }
})