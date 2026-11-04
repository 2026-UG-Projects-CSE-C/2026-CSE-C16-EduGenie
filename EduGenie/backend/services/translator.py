from backend.services.ai_service import generate_ai_response


def translate_content(content: str, target_language: str) -> str:
    """
    Translate generated educational content into the selected language.
    """

    prompt = f"""
Translate the following educational course content into {target_language}.

Important instructions:
- Preserve the original meaning.
- Keep headings and structure clear.
- Do not remove important information.
- Keep technical terms accurate.
- Keep code examples unchanged.
- Use natural and easy-to-understand language suitable for university students.
- Return only the translated content.

COURSE CONTENT:

{content}
"""

    translated_content = generate_ai_response(prompt)

    return translated_content