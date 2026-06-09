from fastapi import FastAPI

app = FastAPI(
    title="Failure Museum API",
    version="1.0.0"
)

@app.get("/")
def root():
    return {
        "message": "Welcome to Failure Museum"
    }


@app.get("/health")
def health():
    return {
        "status": "ok"
    }