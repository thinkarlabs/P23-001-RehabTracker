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



class addPatientSchema(BaseModel):
    name : str = Field(default=None)
    age : int = Field(default=None)
    gender : str = Field(default=None)
    contact_number : str = Field(default=None)
    email_id : EmailStr = Field(default=None)
    injury_type : str = Field(default=None)
    planned_sessions : int = Field(default=None)
    discription : str = Field(default=None)

    class Config:
        schema_extra ={
            "add_demo":{
                "name":"John",
                "age":25,
                "gender":"Male",
                "contact_number":"1234567890",
                "email_id":"john@example.com",
                "injury_type":"Back pain",
                "planned_sessions":10,
                "discription":"Description about John's injury",
               
                
            }
        }

