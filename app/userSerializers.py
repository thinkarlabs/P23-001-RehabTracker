from datetime import datetime,date,timedelta,timezone
import json
def userLoginEntity(user) -> dict:
    return {
        "email": user["email"],
        "password": user["password"]
    }
    
def terapistEntity(user) -> dict:
        return {
        "name":user["name"],
        "email": user["email"],
        "hospital": user["hospital"],
        "hcode": user["hcode"],
        "active": user["active"]
    }

def addPatientEntity(patient) -> dict:
        return {
        "p_name":patient["name"],
        "p_email": patient["email_id"],
        "p_age": patient["age"],
        "p_gender":patient["gender"],
        "p_contact": patient["contact_number"],
        "p_injury": patient["injury_type"],
        "Total_sessions":patient["planned_sessions"],
        "p_description":patient["discription"]
    }

def getPatientEntity(patients) -> list:
    result=[]
    for patient in patients:
        result.append({
            "name":patient["p_name"],
            "gender":patient["p_gender"],
            "age":patient["p_age"],
            "injury_type":patient["p_injury"],
            "Last_Visit":patient["p_last_visit"].strftime("%d-%m-%Y %H:%M"),
            "p_Id":patient["patientId"]
          })
    return result
              
def getOnePatientEntity(patients) -> list:
    result=[]
    for patient in patients:
        result.append({
            "name":patient["p_name"],
            "gender":patient["p_gender"],
            "age":patient["p_age"],
            "contact_number":patient["p_contact"],
            "email":patient["p_email"],
            "description":patient["p_description"],
            "planned_sessions":patient["Total_sessions"],
            "injury_type":patient["p_injury"],
            "Last_Visit":patient["p_last_visit"].strftime("%d-%m-%Y %H:%M"),
            "p_Id":patient["patientId"]
          })
    return result

def updatePatientEntity(patient) -> dict:
        return {
        "patientId":patient["p_id"],
        "p_name":patient["name"],
        "p_age": patient["age"],
        "Total_sessions":patient["planned_sessions"],
        "p_email": patient["email_id"],
        "p_contact": patient["contact_number"]
        }

def addInjuryEntity(Injury) -> dict:
        return {
        "i_title":Injury["Title"],
        "i_aim": Injury["Aim"],
        "i_description": Injury["Description"],
        "i_exercises" :  Injury["Exercises"]
    } 

def getInjuryEntity(Injury) -> list:
    result=[]
    for injuries in Injury:
        result.append({
            "title":injuries["i_title"],
            "aim":injuries["i_aim"],
            "description":injuries["i_description"],
            "i_Id":injuries["injuryId"]
          })
    return result

def getOneInjuryEntity(Injury) -> list:
    result=[]
    for injuries in Injury:
        result.append({
            "title":injuries["i_title"],
            "aim":injuries["i_aim"],
            "description":injuries["i_description"],
            "i_Id":injuries["injuryId"],
            "exercises":injuries["i_exercises"]
          })
    return result

def updateInjuryEntity(Injury) -> dict:
        return {
        "injuryId":Injury["i_id"],
        "i_title":Injury["Title"],
        "i_aim": Injury["Aim"],
        "i_description": Injury["Description"]
    }
    
def getSessionsEntity(sessions) -> list:
    result=[]
    for session in sessions:
        result.append({
            "session_date":session["date"].strftime("%d-%m-%Y %H:%M"),
            "session_dur":"{}:{}".format(int(((session["date"]-session["end"]).total_seconds()//60)//60),int(((session["date"]-session["end"]).total_seconds()//60) % 60)),
            "session_excount":len(session["exercises"]),
            "session_observer":set([i["Observer"] for i in session["exercises"]]),
            "p_Id":session["p_id"]
          })
    return result
    
def getOneExercise(patient) -> dict:
    ist_offset = timedelta(hours=5, minutes=30)
    # Create a timezone object with the UTC offset
    ist = timezone(ist_offset)
    #From front end we are getting timestamp in UTC . Here we are coverting it to IST
    sdate=datetime.utcfromtimestamp(int(patient["start"])/ 1000).replace(tzinfo=timezone.utc)
    sdate_ist = sdate.astimezone(ist)
    edate=datetime.utcfromtimestamp(int(patient["end"])/ 1000).replace(tzinfo=timezone.utc)
    edate_ist = edate.astimezone(ist)
    return {
        "patientId":patient["p_id"],
        "exercise":patient["exercise"],
        "timefrom": sdate_ist,
        "timeto": edate_ist,
        "url":"Under Implementation",
        "poses": json.loads(patient["poses"])
    }