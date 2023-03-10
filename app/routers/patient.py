from fastapi import FastAPI
from typing import List, Dict
from fastapi import APIRouter,Request,Depends,Response,status,Body 
from pydantic import BaseModel, EmailStr
from app.model import addPatientSchema
from app.model import UpdatePatientSchema
from enum import Enum
from datetime import datetime,date
from app.database import PatientDetails,TherapistDetails
from app.userSerializers import addPatientEntity,getPatientEntity,getOnePatientEntity,updatePatientEntity
from app.auth.jwt_bearer import jwtBearer,get_current_user
import string
import random


patientapp = APIRouter()


def get_hospital_name(TPID):
    try:
        hospital = TherapistDetails.find_one({"email":TPID})
    except Exception as e:
        print("Exception In patient:get_hospital_name()")
        print(e)
        return {"status_code":status.HTTP_409_CONFLICT,"Info":"Hospital is not found","msg":"Fail"}
    return hospital["hospital"]
    
def generate_PatientId():
    N =5
    gen = True
    counter=0
    Hospital='P-'
    date_time = datetime.now()
    MidID = date_time.strftime("%d%m%Y")+"-"
    while gen:
        PID = ''.join(random.choices(string.ascii_uppercase + string.digits, k=N))
        PID = Hospital+MidID+PID
        try:
            gen =PatientDetails.find_one({"patientId":PID})
        except Exception as e:
            print("Exception In user:generate_PatientId()")
            print(e)
            break
        counter = counter + 1
        if(counter>20):
            break
        
    return PID

@patientapp.post("/patient",dependencies=[Depends(jwtBearer())],tags=["patient"])
def add_person(person: addPatientSchema= Body(default=None)):
    PID = generate_PatientId()
    patient_data = addPatientEntity(person.dict())
    patient_data["patientId"]=PID
    patient_data["completed_sessions"]=0
    patient_data["p_last_visit"]=datetime.today()
    try:
        TID = TherapistDetails.find_one({"email":get_current_user()})
    except Exception as e:
        print("Exception In Patient:add_person()")
        print(e)
        return {"status_code":status.HTTP_409_CONFLICT,"Info":"Therapist Record Not Found","msg":"Fail"}
    patient_data["createdby"]= TID["therapistId"]
    patient_data["hospital"]=TID["hospital"]
    patient_data["active"]=True
    try:
        PatientDetails.insert_one(patient_data)
    except Exception as e:
        print("Exception In Patient:add_person()")
        print(e)
        return {"status_code":status.HTTP_409_CONFLICT,"Info":"Patient Record Not Saved","msg":"Fail"}
    patient_data=0
    return {"status_code":status.HTTP_201_CREATED,"Info": "Patient added successfully", "msg":"Success"}


@patientapp.delete("/patient/{name}",dependencies=[Depends(jwtBearer())],tags=["patient"])
def delete_person(name: str):
    try:
        PatientDetails.update_one({"patientId":name},{"$set":{"active":False}})
    except Exception as e:
        print("Exception In Patient:delete_person()")
        print(e)
        return {"status_code":status.HTTP_409_CONFLICT,"Info":"Patient Record Not Deleted","msg":"Fail"}
    return {"info": "Patient deleted successfully!","msg":"Success"}


class myinjury(str,Enum):
    All = "All"
    Spinal_Cord_Injury="Spinal Cord Injury"
    Multiple_Scerosis= "Multiple Scerosis"
    Knee_osteoarthritis="Knee osteoarthritis"    
    
@patientapp.get("/patient",dependencies=[Depends(jwtBearer())],tags=["patient"])
def get_patients(injury: myinjury = None):
    if injury == "All":
        return patients
    elif injury is not None:
        filtered_patients = [p for p in patients if p["injury"] == injury]
        return filtered_patients
    else:
        details=""
        try:
            details = PatientDetails.find({"hospital":get_hospital_name(get_current_user()),"active":True})
        except Exception as e:
            print("Exception In Patient:get_patients()")
            print(e)
            return {"status_code":status.HTTP_409_CONFLICT,"Info":"Patient detail not found","msg":"Fail"}
        patients = getPatientEntity(details)
        return {"message": "Patients retrieved successfully!","patients":patients,"msg":"Success"}
    

    
@patientapp.post("/editpatient",dependencies=[Depends(jwtBearer())],tags=["patient"])
def update_person(person: UpdatePatientSchema= Body(default=None)):
    patient_data = updatePatientEntity(person.dict())
    PID = patient_data["patientId"]
    del patient_data["patientId"]
    try:
        PatientDetails.update_one({"patientId":PID},{"$set":patient_data})
    except Exception as e:
            print("Exception In Patient:update_person()")
            print(e)
            return {"status_code":status.HTTP_409_CONFLICT,"Info":"Patient detail not found","msg":"Fail"}   
    PID=patient_data=0
    return {"info": "Person details updated successfully!","msg":"Success"}


@patientapp.get("/patients/{p_id}",dependencies=[Depends(jwtBearer())],tags=["patient"])
def get_person(p_id : str):
    gen=""
    try:
        gen =PatientDetails.find_one({"patientId":p_id})
    except Exception as e:
            print("Exception In Patient:get_person()")
            print(e)
            return {"status_code":status.HTTP_409_CONFLICT,"Info":"Patient detail not found","msg":"Fail"}   
    patient_data = getOnePatientEntity([gen])
    return {"message": "Patients retrieved successfully!","patients":patient_data,"msg":"Success"}

   
            
    
