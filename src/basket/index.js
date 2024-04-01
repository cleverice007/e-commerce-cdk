import { DeleteItemCommand, GetItemCommand, PutItemCommand, ScanCommand } from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import { ddbClient } from "./ddbClient";
import { ebClient } from "./eventBridgeClient";


exports.handler = async function(event) {
    console.log("request:", JSON.stringify(event, undefined, 2));

    let body;

    try {
        if (event.httpMethod === "GET") {
            if (event.pathParameters != null) {
                body = await getBasket(event.pathParameters.userName); // GET /basket/{userName}
            } else {
                body = await getAllBaskets(); // GET /basket
            }
        } else if (event.httpMethod === "POST") {
            if (event.path === "/basket/checkout") {
                body = await checkoutBasket(event); // POST /basket/checkout
            } else {
                body = await createBasket(event); // POST /basket
            }
        } else if (event.httpMethod === "DELETE") {
            body = await deleteBasket(event.pathParameters.userName); // DELETE /basket/{userName}
        } else {
            throw new Error(`Unsupported route: "${event.httpMethod}"`);
        }

        console.log(body);
        return {
            statusCode: 200,
            body: JSON.stringify({
                message: `Successfully finished operation: "${event.httpMethod}"`,
                body: body
            })
        };

    } catch (e) {
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
};

const getBasket = async (userName) => {
    console.log("getBasket");
    try {
        const params = {
          TableName: process.env.DYNAMODB_TABLE_NAME,
          Key: marshall({ userName: userName })
        };
     
        const { Item } = await ddbClient.send(new GetItemCommand(params));
    
        console.log(Item);
        return (Item) ? unmarshall(Item) : {};
    
      } catch(e) {
        console.error(e);
        throw e;
    }
  }
  
  const getAllBaskets = async () => {
    console.log("getAllBaskets");
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
  
  const createBasket = async (event) => {
    console.log(`createBasket function. event : "${event}"`);
    try {
      const requestBody = JSON.parse(event.body);
      const params = {
        TableName: process.env.DYNAMODB_TABLE_NAME,
        Item: marshall(requestBody || {})
      };  
  
      const createResult = await ddbClient.send(new PutItemCommand(params));
      console.log(createResult);
      return createResult;
  
    } catch(e) {
      console.error(e);
      throw e;
    }
  }
  
  const deleteBasket = async (userName) => {
    console.log(`deleteBasket function. userName : "${userName}"`);
    try {    
      const params = {
          TableName: process.env.DYNAMODB_TABLE_NAME,
          Key: marshall({ userName: userName }),
      };   
  
      const deleteResult = await ddbClient.send(new DeleteItemCommand(params));
      console.log(deleteResult);
      return deleteResult;
  
    } catch(e) {
      console.error(e);
      throw e;
    }   
  }
  

  const checkoutBasket = async (event) => {
    console.log("checkoutBasket");
  
    // expected request payload : { userName : swn, attributes[firstName, lastName, email ..] 
    const checkoutRequest = JSON.parse(event.body);
    if (checkoutRequest == null || checkoutRequest.userName == null) {
      throw new Error(`userName should exist in checkoutRequest: "${checkoutRequest}"`);
    }  
    
    // 1- Get existing basket with items
    const basket = await getBasket(checkoutRequest.userName);
  
    // 2- create an event json object with basket items, 
      // calculate totalprice, prepare order create json data to send ordering ms 
    const checkoutPayload = prepareOrderPayload(checkoutRequest, basket);
  
    // 3- publish an event to eventbridge - this will subscribe by order microservice and start ordering process.
    const publishedEvent = await publishCheckoutBasketEvent(checkoutPayload);
  
    // 4- remove existing basket
    await deleteBasket(checkoutRequest.userName);
    
  }