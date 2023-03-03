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