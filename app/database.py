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
UserLoginIndexes = UserLogin.index_information()
PatientDetailsIndexes = PatientDetails.index_information()
TherapistDetailsIndexes = TherapistDetails.index_information()
if(len(UserLoginIndexes)==0):
    UserLogin.create_index([("email", pymongo.ASCENDING),("userId", pymongo.ASCENDING)], unique=True)
if(len(PatientDetailsIndexes)==0):
    PatientDetails.create_index([("patientId", pymongo.ASCENDING),("mobile", pymongo.ASCENDING)], unique=True)
if(len(TherapistDetailsIndexes)==0):
    TherapistDetails.create_index([("therapistId", pymongo.ASCENDING),("email", pymongo.ASCENDING)], unique=True)

