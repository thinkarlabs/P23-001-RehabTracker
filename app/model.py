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

class UpdatePatientSchema(BaseModel):
    p_id : str = Field(default=None)
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
                "p_id":"P-DDMMYYYY-RANDM",
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
