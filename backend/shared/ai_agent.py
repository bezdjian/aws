from dotenv import load_dotenv
from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI
from pydantic import SecretStr

from .SsmService import get_openai_api_key
from .schemas import InsightStats

# Load environment variables
load_dotenv()


class AIAgent:
  def __init__(self, model_name: str = "gpt-3.5-turbo",
      temperature: float = 0.7):
    """
    Initialize the AI Agent with OpenAI model.
    """

    api_key = get_openai_api_key()
    if not api_key:
      raise ValueError(
          "OPENAI_API_KEY must be provided via environment variable or SSM."
      )

    self.llm = ChatOpenAI(
        model=model_name, temperature=temperature, api_key=SecretStr(api_key)
    )

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
          Analyze the following financial stats for an IT consultant in Sweden operating under an 80/20 model:
          - Average Gross Salary (Monthly): {insight_stats.total_gross_salary / insight_stats.count:,.0f} SEK
          - Average Invoiced Amount (Monthly): {insight_stats.total_invoiced / insight_stats.count:,.0f} SEK
          - Average Hourly Rate: {insight_stats.hourly_rate / insight_stats.count:,.0f} SEK
          - Total Safety Buffer (Accumulated): {insight_stats.total_buffer:,.0f} SEK
          - Data Period: {insight_stats.count} months

          CONTEXT FOR ANALYSIS:
          - The consultant follows the 80/20 rule: 20% of the Invoiced Amount goes to the umbrella company/agency.
          - From the remaining 80%, all employer-side costs must be covered: Employer Social Fees (Arbetsgivaravgifter ~31.42%), Pension contributions, and the Safety Buffer.
          - The 'Gross Salary' is what remains AFTER these deductions. It is NORMAL and EXPECTED for the Gross Salary to be significantly lower than the Invoiced Amount (often around 50-60% of the total invoice).
          - NEVER suggest that a Gross Salary lower than the Invoiced Amount is an 'inefficiency' or a 'gap'—this is the core mechanic of the model.
      
          TASK:
          1. Evaluate if the hourly rate is competitive for the Swedish IT market (typically 800-1400+ SEK).
          2. Assess if the safety buffer is healthy relative to the monthly turnover (standard is 1-3 months of salary).
          3. Provide actionable advice on how to optimize the balance between salary, pension, and buffer.
          4. Keep the tone professional, encouraging, and expert.
          
          OUTPUT REQUIREMENTS:
          - Use HTML tags for formatting (e.g., <strong>, <p>, <ul>, <li>).
          - DO NOT repeat the input statistics in your response.
          - Focus on the quality of the financial health and future recommendations.
          """

    try:
      response = self.chain.invoke({"question": prompt})
      return response.content
    except Exception as e:
      return f"Error: {str(e)}"
