from fastapi import APIRouter,Request,Depends,Response,status,Body 
from app.model import UserSchema,UserLoginSchema
from app.auth.jwt_handler import signJwt
from app.auth.jwt_bearer import jwtBearer
from passlib.context import CryptContext
from app.database import UserLogin ,TherapistDetails
from app.userSerializers import userLoginEntity , terapistEntity
import string
import random

password_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
    
sign = APIRouter()
def get_hashed_password(password: str) -> str:
    return password_context.hash(password)


def verify_password(password: str, hashed_pass: str) -> bool:
    return password_context.verify(password, hashed_pass)
    
def generate_therapistId():
    N =6
    gen = True
    counter=0
    Hospital='TP'
    while gen:
        TID = ''.join(random.choices(string.ascii_uppercase + string.digits, k=N))
        TID = Hospital+TID
        try:
            gen =UserLogin.find_one({"userId":TID})
        except Exception as e:
            print("Exception In user:generate_therapistId()")
            print(e)
            break
        counter = counter + 1
        if(counter>20):
            break
        
    return TID

@sign.post("/signup",tags=["user"])
def user_signup(user: UserSchema = Body(default=None)):
    user.password=get_hashed_password(user.password)
    TID = generate_therapistId()
    if(len(TID)==8):
        forLogin = userLoginEntity(user.dict())
        forLogin["userId"]=TID
        forterapist = terapistEntity(user.dict())
        forterapist["therapistId"]=TID
        try:
            UserLogin.insert_one(forLogin)
            TherapistDetails.insert_one(forterapist)
        except Exception as e:
            print("Exception In user:user_signup()")
            print(e)
            return {"status_code":status.HTTP_409_CONFLICT,"Info":"Therapist Record Not Saved","msg":"Fail"}
        return {"status_code":status.HTTP_201_CREATED,"Info":"Therapist Record Saved","access_token": signJwt(user.email)['access token'], "token_type": "bearer","msg":"Success"}
        
    return {"status_code":status.HTTP_409_CONFLICT,"Info":"Therapist Record Not Saved","msg":"Fail"}
    
def check_user(data: UserLoginSchema):
    details=""
    try:
        details = userLoginEntity(UserLogin.find_one({"email":data.email}))
    except Exception as e:
        print("Exception In user:check_user()")
        print(e)
        return False
    if details['email'] == data.email and verify_password(data.password,details['password']):
        return True
    return False
        
@sign.post("/login",tags=["user"])
def user_login(request: Request,response: Response,user: UserLoginSchema=Body(default=None)):
    if check_user(user):
        token = signJwt(user.email)
        #response.set_cookie(key="access_token",value=f"Bearer {token['access token']}", httponly=True,samesite='none')
        return {"access_token": token['access token'], "token_type": "bearer","msg":"Success"}
    else:
        return {"status_code":status.HTTP_401_UNAUTHORIZED,"error":"Invalid Login","msg":"Fail"}
        
@sign.post("/logout",dependencies=[Depends(jwtBearer())],tags=["user"])
def user_logout(response: Response):
    return {"status_code":status.HTTP_204_NO_CONTENT,"msg":"Success"}