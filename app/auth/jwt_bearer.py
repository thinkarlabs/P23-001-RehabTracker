from fastapi import Request, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from .jwt_handler import decodeJWT

loginuser=0
class jwtBearer(HTTPBearer):

    def __init__(self, auto_Error: bool = True):
        super(jwtBearer,self).__init__(auto_error=auto_Error)
        
    async def __call__(self , request:Request):
        credentials : HTTPAuthorizationCredentials = await super(jwtBearer,self).__call__(request)
        if credentials:
            if not credentials.scheme == "Bearer":
                raise HTTPException(status_code=403 ,details ="Invalid or Expired Token")
            if not self.verify_jwt(credentials.credentials):
                raise HTTPException(status_code=403, detail="Invalid token or expired token.")
            return credentials.credentials
            
        else:
            raise HTTPException(status_code=403 ,details ="Invalid or Expired Token")
            
    def verify_jwt(self,jwtoken:str):
        isTokenValid : bool = False
        payload = decodeJWT(jwtoken)
        if payload:
            global loginuser 
            loginuser = payload["userID"]
            isTokenValid = True
        return isTokenValid
    
def get_current_user():
    return loginuser