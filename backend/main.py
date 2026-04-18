from fastapi import FastAPI


app = FastAPI()

@app.get("/HelloWorld")
def hello_world():
    return {"message": "Hello, World!"}