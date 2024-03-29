import { LambdaRestApi } from "aws-cdk-lib/aws-apigateway";
import { IFunction } from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";

interface ApiGatewayProps {
    productMicroservice: IFunction,
    basketMicroservice: IFunction,
    orderingMicroservices: IFunction}

export class ApiGateway extends Construct {
    constructor(scope: Construct, id: string, props: ApiGatewayProps) {
        super(scope, id);
          // Product api gateway
          this.createProductApi(props.productMicroservice);
         
      }