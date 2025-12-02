from fastapi import Request, HTTPException
from fastapi.security import HTTPBearer


class HTTPAuthorization(HTTPBearer):
    """
    Class with custom error message and header
    e.g. Authorization: <token>
    """
    t = "token-qj1wJLDQTl56qKyT62C1LHAI8cLJljxcox0vddcwda"

    async def __call__(self, request: Request):
        auth = request.headers.get("Authorization")

        if not auth:
            raise HTTPException(
                status_code=401,
                detail={
                    "message": "Authorization header missing",
                    "error_code": "NO_AUTH_HEADER"
                }
            )

        try:
            token = auth
            if token != self.t:
                raise ValueError(f"Invalid token, "
                                 f"make sure you have passed this token: '{self.t}' via '/tmp/auth-token' file.")

        except ValueError as e:
            raise HTTPException(
                status_code=401,
                detail={
                    "message": e.__str__(),
                    "error_code": "UNAUTHORIZED"
                }
            )

        return token


def validate_host_header(request: Request):
    """
     Value of the Host header must be 'buggy-app.challenge'
    """
    h = "buggy-app.challenge"
    host = request.headers.get("host")
    if host and host.split(":")[0] == h:
        return True
    raise ValueError(f"Incorrect hostname, check ingress rules and make sure to use '{h}'")
