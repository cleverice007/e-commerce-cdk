import { PutItemCommand } from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import { ddbClient } from "./ddbClient";


exports.handler = async function(event) {
  console.log("request:", JSON.stringify(event, undefined, 2));
 
  const eventType = event['detail-type'];
  if (eventType !== undefined) {
    await eventBridgeInvocation(event);

  } else {
    return await apiGatewayInvocation(event);
  }
};

const eventBridgeInvocation = async (event) => {
console.log(`eventBridgeInvocation function. event : "${event}"`);

// create order item into db
await createOrder(event.detail);
}



const createOrder = async (basketCheckoutEvent) => {
  try {
    console.log(`createOrder function. event : "${basketCheckoutEvent}"`);

    // set orderDate for SK of order dynamodb
    const orderDate = new Date().toISOString();
    basketCheckoutEvent.orderDate = orderDate;
    console.log(basketCheckoutEvent);
    
    const params = {
      TableName: process.env.DYNAMODB_TABLE_NAME,
      Item: marshall(basketCheckoutEvent || {})
    };

    const createResult = await ddbClient.send(new PutItemCommand(params));
    console.log(createResult);
    return createResult;

  } catch(e) {
    console.error(e);
    throw e;
  }
}

const getAllOrders = async () => {  
  console.log("getAllOrders");    
  try {
      const params = {
      TableName: process.env.DYNAMODB_TABLE_NAME
      };
  
      const { Items } = await ddbClient.send(new ScanCommand(params));

      console.log(Items);
      return (Items) ? Items.map((item) => unmarshall(item)) : {};

  } catch(e) {
      console.error(e);
      throw e;
  }
}

const apiGatewayInvocation = async (event) => {
  let body;

  try {
    if (event.httpMethod === "GET") {
        if (event.pathParameters != null) {
            // if there are path parameters, get the order
            body = await getOrder(event);
        } else {
            // if there are no path parameters, get all orders
            body = await getAllOrders();
        }
    } else {
        // if the HTTP method is not GET, throw an error
        throw new Error(`Unsupported route: "${event.httpMethod}"`);
    }

    // return the response
    console.log(body);
    return {
        statusCode: 200,
        body: JSON.stringify({
            message: `Successfully finished operation: "${event.httpMethod}"`,
            body: body
        })
    };
  }
  catch(e) {
      // if there is an error, log the error
      console.error(e);
      return {
      statusCode: 500,
      body: JSON.stringify({
          message: "Failed to perform operation.",
          errorMsg: e.message,
          errorStack: e.stack,
        })
      };
  }
}
