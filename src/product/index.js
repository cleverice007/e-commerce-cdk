export async function handler(event) {
    console.log("request:", JSON.stringify(event, undefined, 2));
    
    // define the handler functions
    const methodHandlers = {
        "GET": async () => {
            if (event.queryStringParameters != null) {
                return await getProductsByCategory(event);
            } else if (event.pathParameters != null) {
                return await getProduct(event.pathParameters.id);
            } else {
                return await getAllProducts();
            }
        },
        "POST": async () => await createProduct(event),
        "DELETE": async () => await deleteProduct(event.pathParameters.id),
        "PUT": async () => await updateProduct(event)
    };
    
    try {
        // check if the method is supported
        if (methodHandlers[event.httpMethod]) {
            const body = await methodHandlers[event.httpMethod]();
            console.log(body);
            return {
                statusCode: 200,
                body: JSON.stringify({
                    message: `Successfully finished operation: "${event.httpMethod}"`,
                    body: body
                })
            };
        } else {
            throw new Error(`Unsupported route: "${event.httpMethod}"`);
        }
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
}
