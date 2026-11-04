import os
from dotenv import load_dotenv
from groq import Groq


load_dotenv()

api_key = os.getenv("GROQ_API_KEY")

if not api_key:
    raise ValueError("GROQ_API_KEY is not set in the .env file.")


client = Groq(
    api_key=api_key,
    timeout=120.0
)


def generate_ai_response(prompt: str) -> str:

    response = client.chat.completions.create(
        model="qwen/qwen3.8-27b",
        messages=[
            {
                "role": "system",
                "content": """
You are an expert university teaching assistant.

Create clear, accurate and student-friendly educational content.

IMPORTANT:
- Keep the response concise.
- Complete all requested sections.
- Do not stop in the middle of a section.
- Do not unnecessarily repeat information.
- Prefer short explanations and bullet points.
- If examples are needed, use small examples.
- Always finish the response properly.
"""
            },
            {
                "role": "user",
                "content": prompt
            }
        ],
        temperature=0.5,
        max_tokens=900
    )

    return response.choices[0].message.content