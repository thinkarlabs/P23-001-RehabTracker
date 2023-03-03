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
UserLogin.create_index([("email", pymongo.ASCENDING),("userId", pymongo.ASCENDING)], unique=True)
PatientDetails.create_index([("patientId", pymongo.ASCENDING),("mobile", pymongo.ASCENDING)], unique=True)
TherapistDetails.create_index([("therapistId", pymongo.ASCENDING),("email", pymongo.ASCENDING)], unique=True)

