from pydantic import BaseModel, Field
from typing import List


class Forsamling(BaseModel):
    """Represents a församling (parish) within a kommun."""
    kyrkoavgift: float = Field(..., description="Church tax rate")
    id: int = Field(..., description="Parish ID")
    namn: str = Field(..., description="Parish name")


class Lan(BaseModel):
    """Represents a län (county)."""
    namn: str = Field(..., description="County name")
    kod: int = Field(..., description="County code")
    regionskatt: float = Field(..., description="Regional tax rate")


class Kommun(BaseModel):
    """Represents a kommun (municipality) with tax information."""
    basNamn: str = Field(..., alias="basNamn", description="Base name of the municipality")
    glesbygd: bool = Field(..., description="Whether it's a rural area")
    namn: str = Field(..., description="Municipality name")
    begravningsavgift: float = Field(..., description="Funeral fee rate")
    kommunalskatt: float = Field(..., description="Municipal tax rate")
    kod: int = Field(..., description="Municipality code")
    forsamlingar: List[Forsamling] = Field(..., description="List of parishes")
    lan: Lan = Field(..., description="County information")

    class Config:
        populate_by_name = True