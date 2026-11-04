const generateBtn = document.getElementById("generateBtn");
const loading = document.getElementById("loading");
const resultSection = document.getElementById("resultSection");
const resultTitle = document.getElementById("resultTitle");
const resultContent = document.getElementById("resultContent");
const copyBtn = document.getElementById("copyBtn");


// =========================================================
// SIDEBAR ACTIVE ITEM
// =========================================================

const navItems = document.querySelectorAll(".nav-item");

navItems.forEach((item) => {

    item.addEventListener("click", () => {

        navItems.forEach((nav) => {
            nav.classList.remove("active");
        });

        item.classList.add("active");

    });

});


// =========================================================
// GENERATE COURSE CONTENT
// =========================================================

generateBtn.addEventListener("click", async () => {

    const subject =
        document.getElementById("subject").value.trim();

    const topic =
        document.getElementById("topic").value.trim();

    const contentType =
        document.getElementById("contentType").value;

    const difficulty =
        document.getElementById("difficulty").value;

    const language =
        document.getElementById("language").value;


    if (!subject || !topic) {

        alert("Please enter both Subject and Topic.");

        return;

    }


    // Show loading
    loading.classList.remove("hidden");


    // Hide old result while generating
   resultSection.classList.add("hidden");
resultSection.style.setProperty(
    "display",
    "none",
    "important"
);
    generateBtn.disabled = true;
    generateBtn.innerText = "Generating...";


    try {

        const response = await fetch(
            "http://127.0.0.1:8000/generate",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    subject: subject,
                    topic: topic,
                    content_type: contentType,
                    difficulty: difficulty,
                    language: language
                })
            }
        );


        const data = await response.json();


        if (!response.ok) {

            throw new Error(
                data.detail ||
                "Unable to generate content."
            );

        }


        // =================================================
        // DISPLAY GENERATED CONTENT
        // =================================================

        resultTitle.innerText =
            `${topic} - ${contentType}`;


        if (data.content) {

            if (typeof marked !== "undefined") {

                resultContent.innerHTML =
                    marked.parse(data.content);

            } else {

                resultContent.innerText =
                    data.content;

            }

        } else {

            resultContent.innerText =
                "No content was returned.";

        }


        // =================================================
// FORCE RESULT SECTION TO STAY VISIBLE
// =================================================

resultSection.classList.remove("hidden");

resultSection.removeAttribute("hidden");

resultSection.style.setProperty(
    "display",
    "block",
    "important"
);

resultSection.style.setProperty(
    "visibility",
    "visible",
    "important"
);

resultSection.style.setProperty(
    "opacity",
    "1",
    "important"
);

console.log("RESULT SECTION SHOWN");
console.log("Generated content:", data.content);


        // Scroll to generated result
        setTimeout(() => {

            resultSection.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

        }, 200);


    } catch (error) {

        console.error(
            "Generation error:",
            error
        );


        alert(
            "Unable to generate content.\n\n" +
            error.message
        );


    } finally {

        loading.classList.add("hidden");

        generateBtn.disabled = false;

        generateBtn.innerText =
            "Generate Course Content";

    }

});


// =========================================================
// TRANSLATE BUTTON
// =========================================================

const translateBtn =
    document.createElement("button");

translateBtn.id = "translateBtn";

translateBtn.innerText = "Translate";

translateBtn.style.marginLeft = "10px";

translateBtn.style.cursor = "pointer";


// Add Translate button beside Copy
const resultActions =
    document.querySelector(".result-actions");


if (resultActions) {

    resultActions.appendChild(translateBtn);

}


// =========================================================
// TRANSLATE GENERATED CONTENT
// =========================================================

translateBtn.addEventListener("click", async () => {

    const language =
        document.getElementById("language").value;


    const content =
        resultContent.innerText.trim();


    if (!content) {

        alert(
            "Please generate course content first."
        );

        return;

    }


    if (language === "English") {

        alert(
            "The content is already in English."
        );

        return;

    }


    translateBtn.disabled = true;

    translateBtn.innerText =
        "Translating...";


    try {

        const response = await fetch(
            "http://127.0.0.1:8000/translate",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    content: content,
                    target_language: language
                })
            }
        );


        const data = await response.json();


        if (!response.ok) {

            throw new Error(
                data.detail ||
                "Unable to translate content."
            );

        }


        const translatedContent =
            data.translated_content;


        if (translatedContent) {

            if (typeof marked !== "undefined") {

                resultContent.innerHTML =
                    marked.parse(
                        translatedContent
                    );

            } else {

                resultContent.innerText =
                    translatedContent;

            }

        } else {

            resultContent.innerText =
                "No translated content returned.";

        }


        resultTitle.innerText =
            `${document.getElementById("topic").value} - ${language}`;


        // Make sure result remains visible
        resultSection.classList.remove("hidden");

        resultSection.style.display = "block";
        resultSection.style.visibility = "visible";
        resultSection.style.opacity = "1";


    } catch (error) {

        console.error(
            "Translation error:",
            error
        );


        alert(
            "Unable to translate content.\n\n" +
            error.message
        );


    } finally {

        translateBtn.disabled = false;

        translateBtn.innerText =
            "Translate";

    }

});


// =========================================================
// COPY GENERATED / TRANSLATED CONTENT
// =========================================================

copyBtn.addEventListener("click", async () => {

    const text =
        resultContent.innerText.trim();


    if (!text) {

        alert(
            "There is no generated content to copy."
        );

        return;

    }


    try {

        await navigator.clipboard.writeText(text);


        copyBtn.innerText =
            "Copied!";


        setTimeout(() => {

            copyBtn.innerText =
                "Copy";

        }, 2000);


    } catch (error) {

        console.error(
            "Copy error:",
            error
        );


        alert(
            "Unable to copy the content."
        );

    }

});