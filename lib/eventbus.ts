import { EventBus, Rule } from "aws-cdk-lib/aws-events";
import { LambdaFunction } from "aws-cdk-lib/aws-events-targets";
import { IFunction } from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";

interface EventBusProps {
    publisherFunction: IFunction;
    targetFunction: IFunction;
}

export class EventBusConstruct extends Construct{
   
        constructor(scope: Construct, id: string, props: EventBusProps) {
            super(scope, id);
    
            //eventbus
            const bus = new EventBus(this, 'EventBus', {
                eventBusName: 'EventBus'
            });
        
            const checkoutBasketRule = new Rule(this, 'CheckoutBasketRule', {
                eventBus: bus,
                enabled: true,
                description: 'When Basket microservice checkout the basket',
                eventPattern: {
                    source: ['com.basket.checkoutbasket'],
                    detailType: ['CheckoutBasket']
                },
                ruleName: 'CheckoutBasketRule'
            });
        
            // need to pass target to Ordering Lambda service
            checkoutBasketRule.addTarget(new LambdaFunction(props.targetFunction)); 
            
            bus.grantPutEventsTo(props.publisherFunction);
                // AccessDeniedException - is not authorized to perform: events:PutEvents
    
        }
    }