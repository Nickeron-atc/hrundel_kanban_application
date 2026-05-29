from fastapi import FastAPI

app = FastAPI(title="Hrundel kanban application API")

@app.get("/")
def read_root():
    return {"message": "Hello,хуй!"}
