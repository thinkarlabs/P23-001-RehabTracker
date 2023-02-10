from fastapi import APIRouter,Request,Depends,Response,status,Body 
from app.model import PostSchema,UserSchema,UserLoginSchema
from app.auth.jwt_handler import signJwt
from app.auth.jwt_bearer import jwtBearer
posts = [
    {
        "id":1,
        "title":"Dog",
        "content":"dog bark"   
    },
    {
        "id":2,
        "title":"Cat",
        "content":"cat meow"   
    }
]

users =[
    {
        "email":"thandavagupta@gmail.com",
        "password":"123"
    },
    {
        "email":"ram@gmail.com",
        "password":"123"
    }
]
sign = APIRouter()

@sign.post("/signup",tags=["user"])
def user_signup(user: UserSchema = Body(default=None)):
    users.append(user)
    return signJwt(user.email)
    
def check_user(data: UserLoginSchema):
    for user in users:
        if user['email'] == data.email and user['password'] == data.password:
            return True
    return False
        
@sign.post("/login",tags=["user"])
def user_login(request: Request,response: Response,user: UserLoginSchema=Body(default=None)):
    if check_user(user):
        token = signJwt(user.email)
        #response.set_cookie(key="access_token",value=f"Bearer {token['access token']}", httponly=True,samesite='none')
        return {"access_token": token['access token'], "token_type": "bearer","msg":"Success"}
    else:
        return {"status_code":status.HTTP_401_UNAUTHORIZED,"error":"Invalid Login"}
        
@sign.post("/logout",dependencies=[Depends(jwtBearer())],tags=["user"])
def user_logout(response: Response):
    return {"status_code":status.HTTP_204_NO_CONTENT,"msg":"Success"}