from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse, FileResponse, RedirectResponse
from pymongo import MongoClient
from app.routers.user import sign
from app.routers.patient import patientapp 


app = FastAPI()
app.mount("/static", StaticFiles(directory="static"), name="static")
app.include_router(sign, prefix="/user")
app.include_router(patientapp)

@app.get("/")
async def index(request: Request):
  return FileResponse('static/index.html')

    


#if __name__ == "__main__":
#    uvicorn.run("main:web_app", host="0.0.0.0", port=port, reload=False)