// =========================================================
// ELEMENTS
// =========================================================

const syllabusFile =
    document.getElementById("syllabusFile");

const selectedFileName =
    document.getElementById("selectedFileName");

const uploadBtn =
    document.getElementById("uploadBtn");

const uploadStatus =
    document.getElementById("uploadStatus");

const syllabusGenerationCard =
    document.getElementById("syllabusGenerationCard");

const generateSyllabusBtn =
    document.getElementById("generateSyllabusBtn");

const syllabusTopic =
    document.getElementById("syllabusTopic");

const syllabusDifficulty =
    document.getElementById("syllabusDifficulty");

const syllabusLanguage =
    document.getElementById("syllabusLanguage");

const syllabusGenerationStatus =
    document.getElementById("syllabusGenerationStatus");

const syllabusResult =
    document.getElementById("syllabusResult");

const syllabusResultContent =
    document.getElementById("syllabusResultContent");

const copySyllabusBtn =
    document.getElementById("copySyllabusBtn");

const downloadSyllabusBtn =
    document.getElementById("downloadSyllabusBtn");

const regenerateSyllabusBtn =
    document.getElementById("regenerateSyllabusBtn");

const clearResultBtn =
    document.getElementById("clearResultBtn");

const resultSearch =
    document.getElementById("resultSearch");

const resultMeta =
    document.getElementById("resultMeta");


// =========================================================
// SELECTED CONTENT TYPE
// =========================================================

// Default content type
let selectedContentType = "Lecture Notes";


// =========================================================
// CONTENT TYPE CARDS
// =========================================================

const contentTypeCards =
    document.querySelectorAll(".content-type-card");


contentTypeCards.forEach(card => {

    card.addEventListener("click", () => {

        // Remove selected state from all cards
        contentTypeCards.forEach(item => {
            item.classList.remove("selected");
        });


        // Select clicked card
        card.classList.add("selected");


        // Store selected content type
        selectedContentType =
            card.dataset.type;


        console.log(
            "Selected content type:",
            selectedContentType
        );

    });

});


// =========================================================
// FILE SELECTION
// =========================================================

syllabusFile.addEventListener("change", () => {

    const file =
        syllabusFile.files[0];


    if (!file) {

        selectedFileName.innerText =
            "No file selected";

        selectedFileName.classList.remove(
            "file-selected"
        );

        return;

    }


    selectedFileName.innerText =
        "📄 " + file.name;


    selectedFileName.classList.add(
        "file-selected"
    );

});


// =========================================================
// UPLOAD SYLLABUS
// =========================================================

uploadBtn.addEventListener(
    "click",
    async () => {

        const file =
            syllabusFile.files[0];


        // -------------------------------------------------
        // CHECK FILE
        // -------------------------------------------------

        if (!file) {

            alert(
                "Please select a syllabus file first."
            );

            return;

        }


        const extension =
            file.name
                .split(".")
                .pop()
                .toLowerCase();


        if (
            extension !== "pdf" &&
            extension !== "txt"
        ) {

            alert(
                "Please upload only a PDF or TXT file."
            );

            return;

        }


        // -------------------------------------------------
        // SHOW PROCESSING
        // -------------------------------------------------

        uploadBtn.disabled = true;

        uploadBtn.innerText =
            "⏳ Processing...";


        uploadStatus.innerHTML = `

            <div class="status-box processing">

                <div class="status-icon">
                    ⏳
                </div>

                <div>

                    <strong>
                        Processing syllabus...
                    </strong>

                    <p>
                        Reading your course syllabus.
                        Please wait.
                    </p>

                </div>

            </div>

        `;


        uploadStatus.style.display =
            "block";


        try {

            // -------------------------------------------------
            // CREATE FORM DATA
            // -------------------------------------------------

            const formData =
                new FormData();


            formData.append(
                "file",
                file
            );


            // -------------------------------------------------
            // SEND TO BACKEND
            // -------------------------------------------------

            const response =
                await fetch(
                    "http://127.0.0.1:8000/upload-syllabus",
                    {
                        method: "POST",
                        body: formData
                    }
                );


            const data =
                await response.json();


            console.log(
                "Upload response:",
                data
            );


            // -------------------------------------------------
            // CHECK RESPONSE
            // -------------------------------------------------

            if (
                !response.ok ||
                data.success === false
            ) {

                throw new Error(
                    data.message ||
                    data.detail ||
                    "Upload failed."
                );

            }


            // -------------------------------------------------
            // SUCCESS
            // -------------------------------------------------

            uploadStatus.innerHTML = `

                <div class="status-box success">

                    <div class="status-icon">
                        ✓
                    </div>

                    <div>

                        <strong>
                            Syllabus uploaded successfully
                        </strong>

                        <p>
                            ${escapeHtml(
                                data.filename || file.name
                            )}
                        </p>

                        <small>
                            Your syllabus is ready for AI generation.
                        </small>

                    </div>

                </div>

            `;


            uploadStatus.style.display =
                "block";


            // -------------------------------------------------
            // UPDATE STEP INDICATOR
            // -------------------------------------------------

            updateSteps(2);


            // -------------------------------------------------
            // SHOW GENERATION SECTION
            // -------------------------------------------------

            syllabusGenerationCard.style.display =
                "block";


            // Scroll smoothly to generation section

            setTimeout(() => {

                syllabusGenerationCard.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });

            }, 300);


            console.log(
                "SYLLABUS UPLOAD SUCCESS"
            );


        } catch (error) {

            console.error(
                "Upload error:",
                error
            );


            uploadStatus.innerHTML = `

                <div class="status-box error">

                    <div class="status-icon">
                        ✕
                    </div>

                    <div>

                        <strong>
                            Upload failed
                        </strong>

                        <p>
                            ${escapeHtml(
                                error.message
                            )}
                        </p>

                    </div>

                </div>

            `;


            uploadStatus.style.display =
                "block";

        } finally {

            uploadBtn.disabled =
                false;

            uploadBtn.innerText =
                "✨ Upload Syllabus";

        }

    }
);


// =========================================================
// GENERATE FROM SYLLABUS
// =========================================================

generateSyllabusBtn.addEventListener(
    "click",
    async () => {

        const topic =
            syllabusTopic.value.trim();


        // -------------------------------------------------
        // CHECK TOPIC
        // -------------------------------------------------

        if (!topic) {

            alert(
                "Please enter a topic from your syllabus."
            );

            syllabusTopic.focus();

            return;

        }


        // -------------------------------------------------
        // SHOW LOADING
        // -------------------------------------------------

        generateSyllabusBtn.disabled =
            true;


        generateSyllabusBtn.innerText =
            "⏳ Generating...";


        syllabusGenerationStatus.innerHTML = `

            <div class="status-box processing">

                <div class="status-icon">
                    ✨
                </div>

                <div>

                    <strong>
                        AI is creating your learning material...
                    </strong>

                    <p>
                        Preparing ${escapeHtml(
                            selectedContentType
                        )} for <strong>${escapeHtml(
                            topic
                        )}</strong>.
                    </p>

                </div>

            </div>

        `;


        syllabusGenerationStatus.style.display =
            "block";


        syllabusResult.style.display =
            "none";


        // -------------------------------------------------
        // UPDATE STEP
        // -------------------------------------------------

        updateSteps(3);


        try {

            // -------------------------------------------------
            // SEND REQUEST
            // -------------------------------------------------

            const response =
                await fetch(
                    "http://127.0.0.1:8000/generate-from-syllabus",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({

                            topic:
                                topic,

                            content_type:
                                selectedContentType,

                            difficulty:
                                syllabusDifficulty.value,

                            language:
                                syllabusLanguage.value

                        })

                    }
                );


            const data =
                await response.json();


            console.log(
                "Generation response:",
                data
            );


            // -------------------------------------------------
            // CHECK RESPONSE
            // -------------------------------------------------

            if (
                !response.ok ||
                data.success === false
            ) {

                throw new Error(
                    data.message ||
                    data.detail ||
                    "Generation failed."
                );

            }


            // -------------------------------------------------
            // SUCCESS STATUS
            // -------------------------------------------------

            syllabusGenerationStatus.innerHTML = `

                <div class="status-box success">

                    <div class="status-icon">
                        ✓
                    </div>

                    <div>

                        <strong>
                            Content generated successfully
                        </strong>

                        <p>
                            Your learning material is ready.
                        </p>

                    </div>

                </div>

            `;


            // -------------------------------------------------
            // DISPLAY RESULT
            // -------------------------------------------------

            const content =
                data.content ||
                "No content generated.";


            syllabusResultContent.innerHTML =
                formatAIContent(content);


            // -------------------------------------------------
            // RESULT META
            // -------------------------------------------------

            resultMeta.innerText =
                `${selectedContentType} • ${topic} • ${syllabusLanguage.value}`;


            // -------------------------------------------------
            // SHOW RESULT
            // -------------------------------------------------

            syllabusResult.style.display =
                "block";


            // Clear search

            resultSearch.value = "";


            // Scroll to result

            setTimeout(() => {

                syllabusResult.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });

            }, 300);


            console.log(
                "SYLLABUS CONTENT GENERATED"
            );


        } catch (error) {

            console.error(
                "Generation error:",
                error
            );


            syllabusGenerationStatus.innerHTML = `

                <div class="status-box error">

                    <div class="status-icon">
                        ✕
                    </div>

                    <div>

                        <strong>
                            Generation failed
                        </strong>

                        <p>
                            ${escapeHtml(
                                error.message
                            )}
                        </p>

                    </div>

                </div>

            `;

        } finally {

            generateSyllabusBtn.disabled =
                false;

            generateSyllabusBtn.innerText =
                "✨ Generate Learning Material";

        }

    }
);


// =========================================================
// COPY CONTENT
// =========================================================

copySyllabusBtn.addEventListener(
    "click",
    async () => {

        const content =
            syllabusResultContent.innerText;


        if (!content.trim()) {

            return;

        }


        try {

            await navigator.clipboard.writeText(
                content
            );


            copySyllabusBtn.innerText =
                "✓ Copied!";


            setTimeout(() => {

                copySyllabusBtn.innerText =
                    "📋 Copy";

            }, 1500);


        } catch (error) {

            alert(
                "Unable to copy the content."
            );

        }

    }
);


// =========================================================
// DOWNLOAD CONTENT
// =========================================================

downloadSyllabusBtn.addEventListener(
    "click",
    () => {

        const content =
            syllabusResultContent.innerText;


        if (!content.trim()) {

            return;

        }


        const topic =
            syllabusTopic.value.trim()
                .replace(/[^a-z0-9]/gi, "_");


        const blob =
            new Blob(
                [content],
                {
                    type: "text/plain;charset=utf-8"
                }
            );


        const url =
            URL.createObjectURL(blob);


        const link =
            document.createElement("a");


        link.href =
            url;


        link.download =
            `${topic || "learning_material"}.txt`;


        document.body.appendChild(link);

        link.click();

        link.remove();


        URL.revokeObjectURL(url);

    }
);


// =========================================================
// SEARCH INSIDE RESULT
// =========================================================

resultSearch.addEventListener(
    "input",
    () => {

        const search =
            resultSearch.value
                .trim()
                .toLowerCase();


        const content =
            syllabusResultContent.innerText;


        if (!search) {

            syllabusResultContent.innerHTML =
                formatAIContent(content);

            return;

        }


        const escaped =
            escapeHtml(content);


        const regex =
            new RegExp(
                `(${escapeRegExp(search)})`,
                "gi"
            );


        syllabusResultContent.innerHTML =
            escaped.replace(
                regex,
                "<mark>$1</mark>"
            );

    }
);


// =========================================================
// GENERATE AGAIN
// =========================================================

regenerateSyllabusBtn.addEventListener(
    "click",
    () => {

        generateSyllabusBtn.click();

    }
);


// =========================================================
// CLEAR RESULT
// =========================================================

clearResultBtn.addEventListener(
    "click",
    () => {

        syllabusResult.style.display =
            "none";


        syllabusResultContent.innerHTML =
            "";


        syllabusGenerationStatus.innerHTML =
            "";


        syllabusGenerationStatus.style.display =
            "none";


        resultSearch.value =
            "";

    }
);


// =========================================================
// UPDATE STEP INDICATOR
// =========================================================

function updateSteps(activeStep) {

    const steps =
        document.querySelectorAll(
            ".resource-step"
        );


    steps.forEach(
        (step, index) => {

            const stepNumber =
                index + 1;


            step.classList.remove(
                "active",
                "completed"
            );


            if (
                stepNumber < activeStep
            ) {

                step.classList.add(
                    "completed"
                );

            }


            if (
                stepNumber === activeStep
            ) {

                step.classList.add(
                    "active"
                );

            }

        }
    );

}


// =========================================================
// FORMAT AI CONTENT
// =========================================================

function formatAIContent(text) {

    if (!text) {

        return "";

    }


    let html =
        escapeHtml(text);


    // Code blocks

    html =
        html.replace(
            /```([\s\S]*?)```/g,
            "<pre><code>$1</code></pre>"
        );


    // Headings

    html =
        html.replace(
            /^### (.*)$/gm,
            "<h4>$1</h4>"
        );


    html =
        html.replace(
            /^## (.*)$/gm,
            "<h3>$1</h3>"
        );


    html =
        html.replace(
            /^# (.*)$/gm,
            "<h2>$1</h2>"
        );


    // Bold

    html =
        html.replace(
            /\*\*(.*?)\*\*/g,
            "<strong>$1</strong>"
        );


    // Bullet points

    html =
        html.replace(
            /^\* (.*)$/gm,
            "<li>$1</li>"
        );


    html =
        html.replace(
            /^- (.*)$/gm,
            "<li>$1</li>"
        );


    // Numbered points

    html =
        html.replace(
            /^\d+\. (.*)$/gm,
            "<li>$1</li>"
        );


    // Group consecutive list items

    html =
        html.replace(
            /((?:<li>.*<\/li>\s*)+)/g,
            "<ul>$1</ul>"
        );


    // Paragraphs

    html =
        html.replace(
            /\n{2,}/g,
            "</p><p>"
        );


    html =
        "<p>" +
        html +
        "</p>";


    // Clean empty paragraphs

    html =
        html.replace(
            /<p>\s*<\/p>/g,
            ""
        );


    return html;

}


// =========================================================
// ESCAPE HTML
// =========================================================

function escapeHtml(text) {

    const div =
        document.createElement("div");


    div.textContent =
        text || "";


    return div.innerHTML;

}


// =========================================================
// ESCAPE REGEX
// =========================================================

function escapeRegExp(text) {

    return text.replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&"
    );

}


// =========================================================
// INITIAL STATE
// =========================================================

if (syllabusGenerationCard) {

    syllabusGenerationCard.style.display =
        "block";

}


updateSteps(1);