from backend.services.ai_service import generate_ai_response


def create_course_content(
    subject: str,
    topic: str,
    content_type: str = "Lecture Notes",
    difficulty: str = "University Level",
    language: str = "English"
) -> str:

    prompt = f"""
You are an expert university teaching assistant and educational content designer.

The user is creating learning material for a university course.

SUBJECT:
{subject}

TOPIC:
{topic}

CONTENT TYPE:
{content_type}

DIFFICULTY LEVEL:
{difficulty}

LANGUAGE:
{language}

Your task is to create high-quality educational material based on the
information above.

IMPORTANT RULES:

1. Write the complete response in {language}.
2. Use simple, clear and student-friendly language.
3. Keep the explanation appropriate for {difficulty}.
4. Organize the answer using clear headings and subheadings.
5. Use bullet points wherever useful.
6. Give practical examples.
7. Avoid unnecessary repetition.
8. Make the material useful for actual university teaching and learning.
9. Do not mention that you are an AI.
10. Do not include unnecessary introductory statements.

CONTENT TYPE INSTRUCTIONS:

If the content type is "Lecture Notes":
Create well-structured lecture notes including:
- Topic introduction
- Learning objectives
- Important concepts
- Detailed explanation
- Examples
- Practical applications
- Important points
- Summary
- Five review questions

If the content type is "Study Notes":
Create concise but complete study notes including:
- Key concepts
- Definitions
- Important points
- Examples
- Quick revision section
- Practice questions

If the content type is "Question Bank":
Create a question bank containing:
- 5 easy questions
- 5 medium questions
- 5 difficult questions
- Answers or expected answer points

If the content type is "Question Paper":
Create a university-style question paper containing:
- Section A: Short-answer questions
- Section B: Medium-answer questions
- Section C: Long-answer questions
- Proper marks distribution
- Questions based on the given topic

If the content type is "Topic Explanation":
Explain the topic step-by-step as if a teacher is teaching a student
who is learning the concept for the first time.
Include simple examples and real-world applications.

If the content type is "Revision Notes":
Create quick revision material containing:
- Important definitions
- Key formulas or rules if applicable
- Main concepts
- Common mistakes
- Quick recap
- Short practice questions

Now generate the requested educational material.
"""

    return generate_ai_response(prompt)


# =========================================================
# SYLLABUS-BASED CONTENT GENERATION
# =========================================================

def create_syllabus_based_content(
    syllabus_text: str,
    topic: str,
    content_type: str = "Lecture Notes",
    difficulty: str = "University Level",
    language: str = "English"
) -> str:

    # Keep the syllabus within a reasonable size
    syllabus_text = syllabus_text[:12000]

    prompt = f"""
You are an expert university teaching assistant.

Generate educational content using the uploaded university syllabus.

UPLOADED SYLLABUS:
{syllabus_text}

SELECTED TOPIC:
{topic}

CONTENT TYPE:
{content_type}

DIFFICULTY LEVEL:
{difficulty}

LANGUAGE:
{language}

IMPORTANT RULES:

1. Use the uploaded syllabus as the main source.
2. Keep the generated content relevant to the selected topic.
3. Do not generate topics that are unrelated to the syllabus.
4. Write the complete response in {language}.
5. Use simple and clear student-friendly language.
6. Organize the response using headings and bullet points.
7. Include useful examples where appropriate.
8. Keep the content suitable for university students.
9. Do not mention that you are an AI.
10. Avoid unnecessary repetition.

CONTENT TYPE:

If the content type is "Lecture Notes":
Create:
- Topic introduction
- Learning objectives
- Important concepts
- Explanation
- Examples
- Important points
- Summary
- Review questions

If the content type is "Study Notes":
Create:
- Key concepts
- Definitions
- Important points
- Examples
- Quick revision
- Practice questions

If the content type is "Question Bank":
Create:
- Easy questions
- Medium questions
- Difficult questions
- Answers or expected answer points

If the content type is "Question Paper":
Create a university-style question paper based only on topics
covered by the uploaded syllabus.

If the content type is "Topic Explanation":
Explain the selected topic step-by-step with simple examples.

If the content type is "Revision Notes":
Create concise revision material containing:
- Important definitions
- Main concepts
- Key points
- Common mistakes
- Quick recap
- Practice questions

Now generate the requested content based on the uploaded syllabus.
"""

    return generate_ai_response(prompt)


# =========================================================
# TEST
# =========================================================

if __name__ == "__main__":

    result = create_course_content(
        subject="Data Structures",
        topic="Binary Search Tree",
        content_type="Lecture Notes",
        difficulty="University Level",
        language="English"
    )

    print(result)