import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
// Create an Amazon DynamoDB service client object.
const ddbClient = new DynamoDBClient();
export { ddbClient };