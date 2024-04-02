import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { ApiGateway } from './apigateway';
import {DynamoDB } from './database';
import {Microservices} from './microservice';
import { EventBusConstruct } from './eventbus';
// import * as sqs from 'aws-cdk-lib/aws-sqs';
export class ECommerceCdkStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const database = new DynamoDB(this, 'Database');    

    const microservices = new Microservices(this, 'Microservices', {
      productTable: database.productTable,
      basketTable: database.basketTable,
      orderTable: database.orderTable
    });

    const apigateway = new ApiGateway(this, 'ApiGateway', {
      productMicroservice: microservices.productMicroservice,
      basketMicroservice: microservices.basketMicroservice,
      orderMicroservice: microservices.orderMicroservice
    });

    const eventbus = new EventBusConstruct(this, 'EventBus', {
      publisherFunction: microservices.basketMicroservice,
      targetFunction: microservices.orderMicroservice
    });
  }
}

    // example resource
    // const queue = new sqs.Queue(this, 'ECommerceCdkQueue', {
    //   visibilityTimeout: cdk.Duration.seconds(300)
    // });
