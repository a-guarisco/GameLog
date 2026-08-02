from sqlmodel import Field, SQLModel


class Config(SQLModel, table=True):
    key: str = Field(primary_key=True, max_length=255)
    value: str = Field(max_length=1024)