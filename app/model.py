from pydantic import BaseModel , Field , EmailStr
from fastapi import Form
        
class UserSchema(BaseModel):
    name: str =Field(default=None)
    email : EmailStr = Field(default=None)
    password : str = Field(default=None,min_length=8)
    hospital: str =Field(default=None)
    hcode: str =Field(default=None)
    active: bool = Field(default=True)
    class Config :
        user_schema ={
            "uesr_demo":{
                "name":"Thandava",
                "email":"thandavagupta@gmail.com",
                "password":"123",
                "hospital":"hospital_name",
                "active":True
            }
        }
        
class UserLoginSchema(BaseModel):
    email : EmailStr = Field(default=None)
    password : str = Field(default=None)
    class Config :
        user_schema ={
            "uesr_demo":{
                "email":"thandavagupta@gmail.com",
                "password":"123"
            }
        }