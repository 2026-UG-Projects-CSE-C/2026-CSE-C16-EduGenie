from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from backend.services.content_generator import (
    create_course_content,
    create_syllabus_based_content
)
from backend.services.translator import translate_content

from pathlib import Path
from datetime import datetime
import json
import uuid


app = FastAPI(
    title="AI Course Assistant",
    description="AI-Powered Autonomous Course Content Generation and Multilingual Teaching Assistant",
    version="1.0.0"
)


# =========================================================
# CORS
# =========================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================================================
# REQUEST MODEL
# =========================================================

class GenerateRequest(BaseModel):
    subject: str
    topic: str
    content_type: str = "Lecture Notes"
    difficulty: str = "University Level"
    language: str = "English"


# =========================================================
# HOME
# =========================================================

@app.get("/")
def home():
    return {
        "message": "AI Course Assistant is running!"
    }


# =========================================================
# GENERATE CONTENT
# =========================================================

@app.post("/generate")
def generate_content(request: GenerateRequest):

    # Generate content using AI
    content = create_course_content(
        subject=request.subject,
        topic=request.topic,
        content_type=request.content_type,
        difficulty=request.difficulty,
        language=request.language
    )


    # =====================================================
    # SAVE GENERATED CONTENT
    # =====================================================

    generated_folder = Path("generated_content")

    generated_folder.mkdir(
        exist_ok=True
    )


    # Create unique filename
    file_id = uuid.uuid4().hex[:8]

    filename = (
        f"{request.subject}_"
        f"{request.topic}_"
        f"{file_id}.json"
    )

    # Remove characters that are not good for filenames
    filename = (
        filename
        .replace("/", "_")
        .replace("\\", "_")
        .replace(":", "_")
        .replace("?", "_")
        .replace("*", "_")
        .replace('"', "_")
        .replace("<", "_")
        .replace(">", "_")
        .replace("|", "_")
    )


    file_path = generated_folder / filename


    saved_data = {
        "id": file_id,
        "subject": request.subject,
        "topic": request.topic,
        "content_type": request.content_type,
        "difficulty": request.difficulty,
        "language": request.language,
        "content": content,
        "created_at": datetime.now().isoformat()
    }


    with open(
        file_path,
        "w",
        encoding="utf-8"
    ) as file:

        json.dump(
            saved_data,
            file,
            ensure_ascii=False,
            indent=4
        )


    # =====================================================
    # SEND RESPONSE TO FRONTEND
    # =====================================================

    return {
        "id": file_id,
        "subject": request.subject,
        "topic": request.topic,
        "content_type": request.content_type,
        "difficulty": request.difficulty,
        "language": request.language,
        "content": content,
        "saved": True
    }
   

   # =========================================================
# GET SAVED COURSES
# =========================================================

@app.get("/courses")
def get_courses():
    generated_folder = Path("generated_content")

    if not generated_folder.exists():
        return []

    courses = []

    for file_path in generated_folder.glob("*.json"):
        try:
            with open(file_path, "r", encoding="utf-8") as file:
                data = json.load(file)

            courses.append({
                "id": data.get("id"),
                "subject": data.get("subject"),
                "topic": data.get("topic"),
                "content_type": data.get("content_type"),
                "difficulty": data.get("difficulty"),
                "language": data.get("language"),
                "created_at": data.get("created_at")
            })

        except Exception:
            continue

    courses.sort(
        key=lambda x: x.get("created_at", ""),
        reverse=True
    )

    return courses

    # =========================================================
# GET COMPLETE COURSE CONTENT
# =========================================================

@app.get("/course/{course_id}")
def get_course(course_id: str):

    generated_folder = Path("generated_content")

    if not generated_folder.exists():
        return {
            "error": "No generated courses found."
        }

    for file_path in generated_folder.glob("*.json"):

        try:

            with open(
                file_path,
                "r",
                encoding="utf-8"
            ) as file:

                data = json.load(file)


            if data.get("id") == course_id:

                return data


        except Exception:

            continue


    return {
        "error": "Course not found."
    }


    # =========================================================
# TRANSLATE COURSE CONTENT
# =========================================================

class TranslateRequest(BaseModel):
    content: str
    target_language: str


@app.post("/translate")
def translate_course_content(request: TranslateRequest):

    translated_content = translate_content(
        content=request.content,
        target_language=request.target_language
    )

    return {
        "translated_content": translated_content,
        "target_language": request.target_language
    }

  # =========================================================
# UPLOAD AND PROCESS SYLLABUS
# =========================================================

@app.post("/upload-syllabus")
async def upload_syllabus(file: UploadFile = File(...)):

    uploads_folder = Path("uploads")

    uploads_folder.mkdir(
        exist_ok=True
    )

    # -----------------------------------------------------
    # Check file type
    # -----------------------------------------------------

    filename = file.filename or ""

    extension = Path(filename).suffix.lower()

    if extension not in [".pdf", ".txt"]:

        return {
            "success": False,
            "message": "Please upload only a PDF or TXT file."
        }

    # -----------------------------------------------------
    # Read uploaded file
    # -----------------------------------------------------

    file_content = await file.read()

    # -----------------------------------------------------
    # Save original file
    # -----------------------------------------------------

    safe_filename = (
        filename
        .replace("/", "_")
        .replace("\\", "_")
        .replace(":", "_")
        .replace("?", "_")
        .replace("*", "_")
        .replace('"', "_")
        .replace("<", "_")
        .replace(">", "_")
        .replace("|", "_")
    )

    file_path = uploads_folder / safe_filename

    with open(
        file_path,
        "wb"
    ) as saved_file:

        saved_file.write(file_content)

    # -----------------------------------------------------
    # Extract syllabus text
    # -----------------------------------------------------

    extracted_text = ""

    try:

        if extension == ".txt":

            extracted_text = file_content.decode(
                "utf-8",
                errors="ignore"
            )

        elif extension == ".pdf":

            from pypdf import PdfReader

            reader = PdfReader(
                str(file_path)
            )

            pages = []

            for page in reader.pages:

                text = page.extract_text()

                if text:
                    pages.append(text)

            extracted_text = "\n\n".join(pages)

    except Exception as error:

        return {
            "success": False,
            "message": "Unable to process the syllabus.",
            "error": str(error)
        }

    # -----------------------------------------------------
    # Check extracted text
    # -----------------------------------------------------

    if not extracted_text.strip():

        return {
            "success": False,
            "message": "The file was uploaded, but no readable text was found."
        }

    # -----------------------------------------------------
    # Save extracted syllabus text
    # -----------------------------------------------------

    syllabus_data = {
        "filename": filename,
        "uploaded_at": datetime.now().isoformat(),
        "text": extracted_text
    }

    syllabus_json = uploads_folder / "current_syllabus.json"

    with open(
        syllabus_json,
        "w",
        encoding="utf-8"
    ) as file:

        json.dump(
            syllabus_data,
            file,
            ensure_ascii=False,
            indent=4
        )

    # -----------------------------------------------------
    # Return result to frontend
    # -----------------------------------------------------

    return {
        "success": True,
        "message": "Syllabus uploaded and processed successfully.",
        "filename": filename,
        "text_length": len(extracted_text),
        "preview": extracted_text[:2000]
    }

    # =========================================================
# GENERATE CONTENT FROM UPLOADED SYLLABUS
# =========================================================

class SyllabusGenerateRequest(BaseModel):
    topic: str
    content_type: str = "Lecture Notes"
    difficulty: str = "University Level"
    language: str = "English"


@app.post("/generate-from-syllabus")
def generate_from_syllabus(request: SyllabusGenerateRequest):

    syllabus_json = Path("uploads/current_syllabus.json")

    # -----------------------------------------------------
    # Check whether syllabus exists
    # -----------------------------------------------------

    if not syllabus_json.exists():

        return {
            "success": False,
            "message": "Please upload a syllabus first."
        }

    # -----------------------------------------------------
    # Read syllabus
    # -----------------------------------------------------

    try:

        with open(
            syllabus_json,
            "r",
            encoding="utf-8"
        ) as file:

            syllabus_data = json.load(file)

    except Exception as error:

        return {
            "success": False,
            "message": "Unable to read the uploaded syllabus.",
            "error": str(error)
        }

    syllabus_text = syllabus_data.get("text", "")

    if not syllabus_text.strip():

        return {
            "success": False,
            "message": "The uploaded syllabus does not contain readable text."
        }

    # -----------------------------------------------------
    # Generate AI content
    # -----------------------------------------------------

    try:

        content = create_syllabus_based_content(
            syllabus_text=syllabus_text,
            topic=request.topic,
            content_type=request.content_type,
            difficulty=request.difficulty,
            language=request.language
        )

    except Exception as error:

        return {
            "success": False,
            "message": "AI content generation failed.",
            "error": str(error)
        }

    # -----------------------------------------------------
    # Return generated content
    # -----------------------------------------------------

    return {
        "success": True,
        "message": "Content generated successfully.",
        "topic": request.topic,
        "content_type": request.content_type,
        "difficulty": request.difficulty,
        "language": request.language,
        "content": content
    }