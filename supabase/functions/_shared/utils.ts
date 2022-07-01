type ErrorResponse = {
    error: boolean,
    details: {}
}
type ResponseContent = ErrorResponse | string

export function response(content:ResponseContent): Response {
    return new Response(JSON.stringify(content), 
                        { 
                            headers: { 
                            "Content-Type": "application/json" 
                            } 
                        })
}