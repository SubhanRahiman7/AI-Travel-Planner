from pydantic import BaseModel, ConfigDict
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
	gemini_api_key: str = ""
	groq_api_key: str = ""
	api_v1_prefix: str = "/api/v1"

	model_config = ConfigDict(env_file=".env", extra="ignore")


settings = Settings()
