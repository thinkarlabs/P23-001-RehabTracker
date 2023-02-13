from datetime import datetime,timedelta
import jwt
from configparser import ConfigParser

config = ConfigParser()
config.read(".config")
config = config["JWT"]

JWT_SECRET = config["secret"]
JWT_PRIVATE = config["private_key"]
JWT_PUBLIC = config["public_key"]
JWT_ALGORITHM = config["algorithm"]
JWT_LIFE = config["ACCESS_TOKEN_EXPIRE_MINUTES"]
jwt_options = {
        'verify_signature': True,
        'verify_exp': True
    }

def token_resp(token:str):
    return {"access token":token}
    
def signJwt(userID: str):
    exp_time = datetime.utcnow() + timedelta(minutes=int(JWT_LIFE))
    payload={
        "userID":userID,
        "exp":exp_time
    }
    token = jwt.encode(payload, JWT_PRIVATE,algorithm=JWT_ALGORITHM)
    return token_resp(token)
    
def decodeJWT(token:str):
    try:
        decode_token = jwt.decode(token,JWT_PUBLIC,algorithms=JWT_ALGORITHM)
        return decode_token
    except Exception as e:
        print("Issue In decodeJWT :",e)
        return None