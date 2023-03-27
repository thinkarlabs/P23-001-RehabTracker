from fastapi import FastAPI
from typing import List, Dict
from fastapi import APIRouter,Request,Depends,Response,status,Body 
from pydantic import BaseModel, EmailStr
from app.model import addPatientSchema
from app.model import UpdatePatientSchema,addSessionExSchema
from enum import Enum
from datetime import datetime,date
from app.database import PatientDetails,TherapistDetails,SessionDetails
from app.userSerializers import addPatientEntity,getPatientEntity,getOnePatientEntity,updatePatientEntity,getSessionsEntity,getOneExercise
from app.auth.jwt_bearer import jwtBearer,get_current_user
import string
import random
import re

patientapp = APIRouter()
def getTherapistName(tp):
    try:
        name = TherapistDetails.find_one({"therapistId":tp})
    except Exception as e:
        print("Exception In patient:getTherapistName()")
        print(e)
        return {"status_code":status.HTTP_409_CONFLICT,"Info":"Hospital is not found","msg":"Fail"}
    return name["name"]

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
    
def getOnePatient(pdata):
    patient=""
    mobile_pattern = re.compile(r'[6-9][0-9]{9}\b') # 1) check startswith 6,7 or 8 or 9 . 2) Then contains 9 digits
    try:
        print(mobile_pattern.match(pdata))
        if(mobile_pattern.match(pdata)):
            print("Iam here")
            patient =PatientDetails.find_one({"p_contact":pdata})
            print(patient)
        else:
            patient =PatientDetails.find_one({"patientId":pdata})
    except Exception as e:
            print("Exception In Patient:getOnePatient()")
            print(e)
            return 0   
    if patient:
        patient_data = getOnePatientEntity([patient])
    else:
        return 0
    return patient_data

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
    patient_data = getOnePatient(p_id)
    if patient_data == 0:
        return {"status_code":status.HTTP_409_CONFLICT,"Info":"Patient detail not found","msg":"Fail"}
    return {"message": "Patients retrieved successfully!","patients":patient_data,"msg":"Success"}

@patientapp.get("/getsession/{pdata}",dependencies=[Depends(jwtBearer())],tags=["Session"])
def get_patient_sessions(pdata : str):
    patient_data = getOnePatient(pdata)
    patient=""
    appo =""
    if patient_data == 0:
        return {"status_code":status.HTTP_409_CONFLICT,"Info":"Patient detail not found","msg":"Fail"}
    try:
        patient =SessionDetails.find({"p_id":pdata})
        appo = getSessionsEntity(patient)
        lst =[]
        for tp in appo:
            for i in tp["session_observer"]:
                lst.append(getTherapistName(i))
            tp["session_observer"]=lst
            lst=[]
    except Exception as e:
            print("Exception In Patient:get_patient_sessions")
            print(e)
            return {"status_code":status.HTTP_409_CONFLICT,"Info":"Session detail not found","msg":"Fail"}    
    return {"Info": "Patient retrieved successfully!","patients":patient_data,"appointments":appo,"msg":"Success"}
    
@patientapp.get("/addsession/{p_id}",dependencies=[Depends(jwtBearer())],tags=["Session"])
def add_patient_session(p_id : str):
    patient_data = getOnePatient(p_id)[0]
    if patient_data == 0:
        return {"status_code":status.HTTP_409_CONFLICT,"Info":"Patient detail not found","msg":"Fail"}
    
    fromd = datetime.combine(date.today(), datetime.min.time())
    try:
        check =SessionDetails.find_one({"date": {"$gte": fromd, "$lt": datetime.today()},"p_id":p_id})
        if(check is None):
            Session_data={}
            TID = TherapistDetails.find_one({"email":get_current_user()})
            Session_data["date"]=datetime.today()
            Session_data["p_id"]=p_id
            Session_data["Injury"]=patient_data["injury_type"]
            Session_data["c_s"]=0
            Session_data["end"]=datetime.today()
            Session_data["hospital"]=TID["hospital"]
            Session_data["exercises"]=[]
            SessionDetails.insert_one(Session_data)
            Session_data={}
            return {"message": "Patient Session Started successfully!","msg":"Success"}
        else:
            return {"message": "Patient Session Already Started","msg":"Success"}
    except Exception as e:
            print("Exception In Patient:add_patient_session")
            print(e)
            return {"status_code":status.HTTP_409_CONFLICT,"Info":"Session Not Started","msg":"Fail"}     

@patientapp.post("/addexercisesession/",dependencies=[Depends(jwtBearer())],tags=["Session"])
def add_exercise_session(ex: addSessionExSchema= Body(default=None)):
    ex_data=getOneExercise(ex.dict())
    p_id=ex_data["patientId"]
    del ex_data["patientId"]
    try :
        TID = TherapistDetails.find_one({"email":get_current_user()})
        ex_data["Observer"]=TID["therapistId"]
        fromd = datetime.combine(date.today(), datetime.min.time())
        SessionDetails.update_one({"date": {"$gte": fromd, "$lt": datetime.today()},"p_id":p_id},{'$push':{"exercises":ex_data},"$set":{"end":ex_data["timeto"]}})
        ex_data=[]
    except Exception as e:
            print("Exception In Patient:add_patient_session")
            print(e)
            return {"status_code":status.HTTP_409_CONFLICT,"Info":"Exercise Not Saved","msg":"Fail"}    
    return {"message": "Patient Exercise Details Saved","msg":"Success"}