import { Duration } from "aws-cdk-lib";
import { IFunction } from "aws-cdk-lib/aws-lambda";
import { EventSource } from "aws-cdk-lib/aws-lambda-event-sources";
import { IQueue, Queue } from "aws-cdk-lib/aws-sqs";
import { Construct } from "constructs";

interface QueueProps {
    consumer: IFunction;
}

export class QueueConstruct extends Construct {
    public readonly orderQueue: IQueue;
    constructor(scope: Construct, id: string, props: QueueProps) {
        super(scope, id);

      //queue
      this.orderQueue = new Queue(this, 'OrderQueue', {
        queueName : 'OrderQueue',
        visibilityTimeout: Duration.seconds(30) // default value
      });
      
      props.consumer.addEventSource(new EventSource(this.orderQueue, {
          batchSize: 1
      }));
    }
}