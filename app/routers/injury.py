from fastapi import FastAPI, Request, Response
from fastapi import APIRouter,Request,Depends,Response,status,Body
from pydantic import BaseModel
from typing import List, Dict
from app.model import addInjuriesSchema,UpdateInjurySchema
from app.database import InjuryDetails,TherapistDetails
import string
import random
from app.auth.jwt_bearer import jwtBearer,get_current_user
from app.userSerializers import addInjuryEntity,getInjuryEntity,getOneInjuryEntity,updateInjuryEntity

injuryFile = APIRouter()

people = [
    {"Title": "Elderly Impaired balance",
      "Aim": "The aim of the program is to increase balance and functional strength.", 
      "Description": "Patient walks slowly and uses a walking frame. He feels unsteady when turning, reaching or whwn distracted."},
    {"Title": "Mild Knee osteoarthritis", 
     "Aim": "The aim of the program is to increase balance and functional strength.", 
     "Description": "Patient has mild knee symptoms that are impacting her lifestyle. This program is suitable for someone with early stage(mild to moderate) knee osteoarthritis."},
    {"Title": "Spinal Cord Injury", 
     "Aim": "The aim of the program is to increase balance and functional strength.", 
     "Description": "Patient has to complete C7 tetraplegia. He wants exercises that will maintain his physical health. This program is suitable for people with C7 - C8 tetraplegia."},
]

def get_hospital_name(TIID):
    try:
        hospital = TherapistDetails.find_one({"email":TIID})
    except Exception as e:
        print("Exception In patient:get_hospital_name()")
        print(e)
        return {"status_code":status.HTTP_409_CONFLICT,"Info":"Hospital is not found","msg":"Fail"}
    return hospital["hospital"]


def generate_InjuryId(TID):
    N =6
    gen = True
    counter=0
    Hospital='I'
    while gen:
        IID = ''.join(random.choices(string.ascii_uppercase + string.digits, k=N))
        IID = Hospital+TID+IID
        try:
            gen =InjuryDetails.find_one({"injuryId":IID})
        except Exception as e:
            print("Exception In user:generate_InjuryId()")
            print(e)
            break
        counter = counter + 1
        if(counter>20):
            break  
    return IID


@injuryFile.post("/injuries",dependencies=[Depends(jwtBearer())],tags=["injury"])
async def add_injury(request: Request, injury_dict: addInjuriesSchema= Body(default=None)):
    data = await request.json()
    exerciseList = [value for key, value in data.items() if key.startswith('exercise')]
    injury_data = addInjuryEntity(injury_dict.dict())
    injury_data["i_exercises"] = exerciseList

    try:
        TID = TherapistDetails.find_one({"email":get_current_user()})
    except Exception as e:
        print("Exception In Injury:add_injury()")
        print(e)
        return {"status_code":status.HTTP_409_CONFLICT,"Info":"Therapist Record Not Found","msg":"Fail"}
    IID = generate_InjuryId(TID["therapistId"])
    injury_data["injuryId"]=IID
    injury_data["hospital"]=TID["hospital"]
    try:
        InjuryDetails.insert_one(injury_data)
    except Exception as e:
        print("Exception In injury :add_injury()")
        print(e)
        return {"status_code":status.HTTP_409_CONFLICT,"Info":"Injury Record Not Saved","msg":"Fail"}
    injury_data=0
    return {"status_code":status.HTTP_201_CREATED,"Info": "Injury added successfully", "msg":"Success"}


@injuryFile.delete("/injuries/{IID}",tags=["injury"])
def delete_injury(IID: str):
    try:
        InjuryDetails.delete_one({"injuryId":IID})
    except Exception as e:
        print("Exception In Injury:delete_injury()")
        print(e)
        return {"status_code":status.HTTP_409_CONFLICT,"Info":"Injury Record Not Deleted","msg":"Fail"}
    return {"info": "Injury deleted successfully!","msg":"Success"}

@injuryFile.get("/injuries",dependencies=[Depends(jwtBearer())],tags=["injury"])
def get_injuries():
    details=""
    
    try:
        details = InjuryDetails.find({"hospital":get_hospital_name(get_current_user())})
    except Exception as e:
        print("Exception In Injury:get_injuries()")
        print(e)
        return {"status_code":status.HTTP_409_CONFLICT,"Info":"Injury detail not found","msg":"Fail"}
    injuries = getInjuryEntity(details)
    return {"message": "Injury details updated successfully", "injuries" : injuries, "msg": "Success"}



@injuryFile.post("/editinjury",tags=["injury"])
async def update_injury(request: Request, injury: UpdateInjurySchema= Body(default=None)):
    injury_data = updateInjuryEntity(injury.dict())
    data = await request.json()
    exerciseList = [value for key, value in data.items() if key.startswith('exercise')]
    injury_data["i_exercises"] = exerciseList
    IID = injury_data["injuryId"]
    del injury_data["injuryId"]
    try:
        InjuryDetails.update_one({"injuryId":IID},{"$set":injury_data})

    except Exception as e:
            print("Exception In Injury:update_injury()")
            print(e)
            return {"status_code":status.HTTP_409_CONFLICT,"Info":"Injury detail not found","msg":"Fail"}   
    IID=injury_data=0
    return {"info": "Injury details updated successfully!","msg":"Success"}

@injuryFile.get("/injury/{i_Id}",dependencies=[Depends(jwtBearer())],tags=["injury"])
def get_injuries(i_Id : str):
    gen=""
    try:
        gen =InjuryDetails.find_one({"injuryId":i_Id})
    except Exception as e:
            print("Exception In Injury:get_injuries()")
            print(e)
            return {"status_code":status.HTTP_409_CONFLICT,"Info":"Injury detail not found","msg":"Fail"}   
    injury_data = getOneInjuryEntity([gen])
    exercises = ["Active assisted shoulder ROM exercises - position 2", "Situps or Standing up and sitting down","Active assisted knee flexion and extension"]

    return {"message": "Injuries retrieved successfully!","Injury":injury_data, "exercises": exercises, "msg":"Success"}





