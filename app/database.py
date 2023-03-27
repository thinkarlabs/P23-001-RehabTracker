from pymongo import mongo_client
import pymongo
from configparser import ConfigParser

config = ConfigParser()
config.read(".config")
config = config["MONGO"]
DATABASE_URL = config["db_url"]
MONGO_INITDB_DATABASE = config["db_name"]
client = mongo_client.MongoClient(DATABASE_URL)
print('Connected to MongoDB...')

db = client[MONGO_INITDB_DATABASE]
UserLogin = db.userLogin
PatientDetails = db.patientDetails
TherapistDetails = db.therapistDetails
InjuryDetails = db.injuryDetails
SessionDetails = db.sessionDetails
ExcerciseDetails = db.excerciseDetails
UserLoginIndexes = UserLogin.index_information()
PatientDetailsIndexes = PatientDetails.index_information()
TherapistDetailsIndexes = TherapistDetails.index_information()
InjuryDetailsIndexes = InjuryDetails.index_information()
ExcerciseDetailsIndexes = ExcerciseDetails.index_information()

if(len(UserLoginIndexes)==0):
    UserLogin.create_index([("email", pymongo.ASCENDING),("userId", pymongo.ASCENDING)], unique=True)
if(len(PatientDetailsIndexes)==0):
    PatientDetails.create_index([("patientId", pymongo.ASCENDING),("mobile", pymongo.ASCENDING)], unique=True)
if(len(TherapistDetailsIndexes)==0):
    TherapistDetails.create_index([("therapistId", pymongo.ASCENDING),("email", pymongo.ASCENDING)], unique=True)
if(len(InjuryDetailsIndexes)==0):
    InjuryDetails.create_index([("injuryId", pymongo.ASCENDING)], unique=True)
if(len(ExcerciseDetailsIndexes)==0):
    ExcerciseDetails.create_index([("ename", pymongo.ASCENDING)],unique=True)
