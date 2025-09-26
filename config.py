import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    ZEP_API_KEY = os.environ.get("ZEP_API_KEY")
    OPENAI_MODEL = "gpt-4o-mini"
    DEFAULT_TEMPERATURE = 0
    DEFAULT_HISTORY_LIMIT = 6
    USER_NAME="jesse_buitenhuis"