import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { ApiGateway } from './apigateway';
import {DynamoDB } from './database';
import {Microservices} from './microservice';
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class AwsMicroservicesStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const database = new DynamoDB(this, 'Database');    

    const microservices = new Microservices(this, 'Microservices', {
      productTable: database.productTable
    });

    const apigateway = new ApiGateway(this, 'ApiGateway', {
      productMicroservice: microservices.productMicroservice,
    });    
  }
}

    // example resource
    // const queue = new sqs.Queue(this, 'ECommerceCdkQueue', {
    //   visibilityTimeout: cdk.Duration.seconds(300)
    // });
