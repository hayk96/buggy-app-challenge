from fastapi import FastAPI, Request, Depends, HTTPException, status, Response
import validations as v
import asyncio
import k8s

security = v.HTTPAuthorization()
app = FastAPI()


async def executor(req: Request, resp: Response, exec_func):
    try:
        v.validate_host_header(req)
        try:
            return await asyncio.wait_for(
                asyncio.to_thread(exec_func),
                timeout=5
            )
        except asyncio.TimeoutError:
            raise HTTPException(status_code=504, detail="Request timeout")
    except ValueError as e:
        resp.status_code = status.HTTP_400_BAD_REQUEST
        return {"error": e.__str__()}


@app.get("/ready")
async def ready():
    return {
        "status": "ready",
        "message": "Backend is ready to receive requests"
    }


@app.get("/health")
async def health():
    try:
        result = await asyncio.wait_for(
            asyncio.to_thread(k8s.ping_k8s_api),
            timeout=3
        )
        return {
            "status": "healthy",
            "message": "Backend is healthy",
            "kubernetes_api": result
        }
    except asyncio.TimeoutError:
        raise HTTPException(
            status_code=503,
            detail="Health check timeout - Kubernetes API not responding"
        )
    except Exception as e:
        raise HTTPException(
            status_code=503,
            detail=f"Health check failed: {str(e)}"
        )


@app.get("/pods")
async def pods(request: Request, response: Response, token: str = Depends(security)):
    return await executor(request, response, k8s.k8s_list_pod_for_all_namespaces)


@app.get("/events")
async def events(request: Request, response: Response, token: str = Depends(security)):
    return await executor(request, response, k8s.k8s_list_event_for_all_namespaces)


@app.get("/services")
async def services(request: Request, response: Response, token: str = Depends(security)):
    return await executor(request, response, k8s.k8s_list_service_for_all_namespaces)
