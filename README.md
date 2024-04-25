# Welcome to your CDK TypeScript project

This is a blank project for CDK development with TypeScript.

The `cdk.json` file tells the CDK Toolkit how to execute your app.

## Useful commands

* `npm run build`   compile typescript to js
* `npm run watch`   watch for changes and compile
* `npm run test`    perform the jest unit tests
* `npx cdk deploy`  deploy this stack to your default AWS account/region
* `npx cdk diff`    compare deployed stack with current state
* `npx cdk synth`   emits the synthesized CloudFormation template

# Serverless E-Commerce cdk
這個項目是使用 AWS Cloud Development Kit (CDK) 和 TypeScript 的serverless aws cdk backend。使用 AWS 服務來構建可擴展和可維護的serverless e-commerce application。

### Infra Stack

1. **API Gateway**
   - 作為所有外部請求的入口點。
   - 通過 Lambda 函數將傳入的請求路由到適當的微服務。

2. **Microservices**
   - 處理不同電子商務路徑（如產品、購物籃和訂單）的業務邏輯。
   - 每個微服務都實現為一個獨立的 AWS Lambda 函數。
   - 與 DynamoDB 交互以存儲和檢索數據。

3. **Eventbridge(Eventbus)**
   - 捕獲來自basket-microservice的事件並將其routing到order queue。

4. **queue**
   - 從購物籃路由緩衝事件並將其轉發到訂單路由進行處理。

5. **DynamoDB**
   - 作為存儲產品、購物籃和訂單數據的database。

## 基礎設施即代碼

該項目的基礎設施是使用 AWS CDK 以 TypeScript 程式化定義的。這種方法允許可複製的設置和輕鬆的版本控制。

## 設置和部署

### 先決條件

- AWS 帳戶
- 已安裝並配置的 AWS CLI
- 已安裝的 Node.js 和 npm
- 已安裝的 AWS CDK Toolkit (`npm install -g aws-cdk`)

### 部署步驟

1. **clone repo**
   ```bash
   git clone https://github.com/your-repository-url
   cd your-project-directory
   ```
   ```
   cdk deploy
   ```

## product mircoservice   

- **GET /products**: Retrieves all products.
- **GET /products/{id}**: Retrieves a single product by ID.
- **POST /products**: Creates a new product.
- **DELETE /products/{id}**: Deletes a product.

## basket microservice
- **GET /basket/{userName}** : Retrieves the basket for a specified user.
- **GET /basket**: Retrieves all baskets stored in the database
- **POST /basket**:Creates a new basket or updates an existing basket with new items.
- **/basket/checkout**:Processes the checkout of a basket, calculating the total price and initiating the order creation process.
  - description:This endpoint retrieves the current basket from DynamoDB, calculates the total price, and sends an event to EventBridge to trigger the order process. After       successful event publication, the basket is deleted from DynamoDB.
 
- **DELETE /basket/{userName}**:Deletes a specific user's basket.


## order microservice
- **GET /orders**:Retrieves all orders from the database.
- **GET /orders/{orderId}**:Retrieves a specific order by order ID.
- **POST /orders**: Creates a new order based on the provided order details.

Integrating Different Triggers

The Order Microservice can be triggered by different AWS services, each leading to specific operations based on the source of the request. This setup allows for flexible and scalable interactions within the serverless architecture. Below is an overview of how different services trigger various functionalities within the microservice.

### API Gateway
When triggered by API Gateway, the microservice directly handles HTTP requests for CRUD operations on orders. This is typically used for synchronous operations where immediate feedback is required for an HTTP client.

 Supported Operations
- **GET /orders**: Retrieves all orders or a specific order based on the provided path parameter.
- **POST /orders**: Creates a new order from the request body.
- **PUT /orders/{orderId}**: Updates an existing order with the provided order details.
- **DELETE /orders/{orderId}**: Deletes the specified order.

### Amazon SQS
SQS is primarily used for decoupling message processing. It buffers messages that require asynchronous processing, such as order processing tasks that do not need immediate response.
 Supported Operation
- **Create Order**: Constructs a new order based on event details like customer information and cart items received from the basket checkout process.
