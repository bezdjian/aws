import os

from dotenv import load_dotenv
from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI

from .schemas import InsightStats

# Load environment variables
load_dotenv()


class AIAgent:
  def __init__(self, model_name: str = "gpt-3.5-turbo",
      temperature: float = 0.7):
    """
    Initialize the AI Agent with OpenAI model.
    """
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
      raise ValueError("OPENAI_API_KEY not found in environment variables.")

    self.llm = ChatOpenAI(model=model_name, temperature=temperature)

    self.prompt = ChatPromptTemplate.from_messages(
        [
          (
            "system",
            "You are a helpful financial assistant helping IT consultants with their income in Sweden.",
          ),
          ("user", "{question}"),
        ]
    )

    # Simple chain using LCEL (LangChain Expression Language)
    self.chain = self.prompt | self.llm

  def get_financial_insights(self, insight_stats: InsightStats) -> str:
    """
    Insight stats feedback and recommendation from AI.
    """

    prompt = f"""
    Given the following financial statistics:
    - Total Gross Salary: {insight_stats.total_gross_salary / insight_stats.count} SEK
    - Total Invoiced Amount: {insight_stats.total_invoiced / insight_stats.count} SEK
    - Hourly Rate: {insight_stats.hourly_rate / insight_stats.count} SEK
    - Total Buffer Amount: {insight_stats.total_buffer} SEK
    The gross salary is based on invoiced amount minus buffer, pension and taxes.
    Based on the data, analyze if it is going well or actions needs to be taken.
    Provide feedback, insights and recommendations.
    Response with human friendly language.
    Also keep in mind that {insight_stats.count} is the number of the months these stats are based on.
    DO NOT repeat the stats in your answer.
    Use HTML tags for the response.
    """

    try:
      response = self.chain.invoke({"question": prompt})
      return response.content
    except Exception as e:
      return f"Error: {str(e)}"
