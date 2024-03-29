import { LambdaRestApi } from "aws-cdk-lib/aws-apigateway";
import { IFunction } from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";

interface ApiGatewayProps {
    productMicroservice: IFunction,
    basketMicroservice: IFunction,
    orderingMicroservices: IFunction
}

export class ApiGateway extends Construct {

    constructor(scope: Construct, id: string, props: ApiGatewayProps){
        super(scope, id);

        // Product api gateway
        this.createProductApi(props.productMicroservice);
        // Basket api gateway
      
    }

    private createProductApi(productMicroservice: IFunction) {

        // Product microservices api gateway
        // root name = product

        // GET /product
        // POST /product

        // Single product with id parameter
        // GET /product/{id}
        // PUT /product/{id}
        // DELETE /product/{id}

        const apigw = new LambdaRestApi(this, 'productApi', {
            restApiName: 'Product Service',
            handler: productMicroservice,
            proxy: false
        });

        const product = apigw.root.addResource('product');
        product.addMethod('GET');  // GET /product
        product.addMethod('POST');  // POST /product

        const singleProduct = product.addResource('{id}');
        singleProduct.addMethod('GET');  // GET /product/{id}
        singleProduct.addMethod('PUT'); // PUT /product/{id}
        singleProduct.addMethod('DELETE'); // DELETE /product/{id}

        return singleProduct;
    }
}