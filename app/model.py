from pydantic import BaseModel , Field , EmailStr
from fastapi import Form
class PostSchema(BaseModel):
    id:int = Field(default=None)
    title: str = Field(default=None)
    content:str = Field(default=None)
    class Config:
        schema_extra ={
            "post_demo":{
                "title":"Some animal",
                "content":"Content about some animal"
            }
        }
        
class UserSchema(BaseModel):
    fullname : str =Field(default=None)
    email : EmailStr = Field(default=None)
    password : str = Field(default=None)
    class Config :
        user_schema ={
            "uesr_demo":{
                "name":"Thandava",
                "email":"thandavagupta@gmail.com",
                "password":"123"
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