from pydantic import BaseModel , Field , EmailStr,validator
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

    @validator('name')
    def validate_names(cls, v):
        if not v:
            raise ValueError('Name cannot be empty')
        elif len(v) < 3:
            raise ValueError('Name must be at least 3 characters long')
        return v

    
    @validator('gender')
    def validate_gender(cls, v):
        if not v:
            raise ValueError('Gender cannot be empty')
        return v
    
    @validator('injury_type')
    def validate_injury(cls, v):
        if not v:
            raise ValueError('injury cannot be empty')
        return v

    @validator('age')
    def validate_ages(cls, v):
        if v is not None and not isinstance(v, int):
            raise ValueError('Age must be an integer')
        if v is not None and (v < 0 or v > 120):
            raise ValueError('Age must be between 0 and 120')
        return v
    
    
    @validator('planned_sessions')
    def validate_planned_sessionss(cls, v):
        if v is not None and not isinstance(v, int):
            raise ValueError('Planned sessions must be an integer')
        if v is not None and (v < 1 or v > 20):
            raise ValueError('Planned sessions must be between 1 and 20')
        return v
    
    @validator('email_id')
    def email_ids_must_contain_at_and_com(cls, value):
        if '@' not in value or '.com' not in value:
            raise ValueError('invalid email address')
        return value
    

    @validator('contact_number')
    def validate_contact_numbers(cls, v):
        if not v.isdigit():
            raise ValueError('contact_number should contain only digits')
        if len(v) != 10:
            raise ValueError('contact_number should have exactly 10 digits')
        return v
    
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
    age: int = Field(default=None)
    planned_sessions : int = Field(default=None)
    email_id : EmailStr = Field(default=None)
    contact_number : str = Field(default=None)

    @validator('name')
    def validate_name(cls, v):
        if not v:
            raise ValueError('Name cannot be empty')
        return v


    @validator('age')
    def validate_age(cls, v):
        if v is not None and not isinstance(v, int):
            raise ValueError('Age must be an integer')
        if v is not None and (v < 0 or v > 120):
            raise ValueError('Age must be between 0 and 120')
        return v
    
    
    @validator('planned_sessions')
    def validate_planned_sessions(cls, v):
        if v is not None and not isinstance(v, int):
            raise ValueError('Planned sessions must be an integer')
        if v is not None and (v < 1 or v > 20):
            raise ValueError('Planned sessions must be between 1 and 20')
        return v
    
    @validator('email_id')
    def email_id_must_contain_at_and_com(cls, value):
        if '@' not in value or '.com' not in value:
            raise ValueError('invalid email address')
        return value
    

    @validator('contact_number')
    def validate_contact_number(cls, v):
        if not v.isdigit():
            raise ValueError('contact_number should contain only digits')
        if len(v) != 10:
            raise ValueError('contact_number should have exactly 10 digits')
        return v

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
         "description":"Description about John's injury",
         }
    }

class addInjuriesSchema(BaseModel):
    Title : str = Field(default=None)
    Aim : str = Field(default=None)
    Description : str = Field(default=None)
    Exercises : str = Field(default=None)
    class Config:
        schema_extra ={ 
            "add_demo":
            {   "Title":"John",
                "Aim":"",
                "Description":"Male",
                "Exercises": "[]"
            }
        }

class UpdateInjurySchema(BaseModel):
    i_id : str = Field(default=None)
    Title : str = Field(default=None)
    Aim : str = Field(default=None)
    Description : str = Field(default=None)
    class Config:
        schema_extra ={
            "add_demo":{
                "i_id":"I-TPRANDM-RANDOM",
                "Title":"",
                "Aim":"",
                "Description":"",
            }
        }
        
class addSessionExSchema(BaseModel):
    p_id : str = Field(default=None)
    start : str = Field(default=None)
    end : str = Field(default=None)
    exercise : str = Field(default=None)
    poses : str = Field(default=None)

    class Config:
        schema_extra ={
            "add_demo":{
                "p_id":"patient id",
                "start":"start time of session",
                "end":"end time of session",
                "exercise":"exercise name",
                "poses":"array of poses"
            }
        }