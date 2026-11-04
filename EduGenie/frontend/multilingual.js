const translateBtn =
    document.getElementById("translateBtn");

const contentInput =
    document.getElementById("content");

const targetLanguage =
    document.getElementById("targetLanguage");

const translateLoading =
    document.getElementById("translateLoading");

const translationResult =
    document.getElementById("translationResult");

const translationTitle =
    document.getElementById("translationTitle");

const translationContent =
    document.getElementById("translationContent");

const copyTranslationBtn =
    document.getElementById("copyTranslationBtn");


// =========================================================
// TRANSLATE CONTENT
// =========================================================

translateBtn.addEventListener("click", async () => {

    const content =
        contentInput.value.trim();

    const language =
        targetLanguage.value;


    if (!content) {

        alert(
            "Please enter learning content first."
        );

        return;

    }


    translateBtn.disabled = true;

    translateBtn.innerText =
        "Translating...";

    translateLoading.classList.remove("hidden");

    translationResult.classList.add("hidden");


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


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.detail ||
                "Unable to translate content."
            );

        }


        const translated =
            data.translated_content;


        translationTitle.innerText =
            `Translated to ${language}`;


        translationContent.innerText =
            translated ||
            "No translated content returned.";


        translationResult.classList.remove(
            "hidden"
        );


        translationResult.style.display =
            "block";


        translationResult.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });


    }

    catch (error) {

        console.error(
            "Translation error:",
            error
        );


        alert(
            "Unable to translate content.\n\n" +
            error.message
        );

    }

    finally {

        translateLoading.classList.add(
            "hidden"
        );

        translateBtn.disabled = false;

        translateBtn.innerText =
            "✨ Translate Content";

    }

});


// =========================================================
// COPY TRANSLATION
// =========================================================

copyTranslationBtn.addEventListener(
    "click",
    async () => {

        const text =
            translationContent.innerText.trim();


        if (!text) {

            alert(
                "There is no translated content to copy."
            );

            return;

        }


        try {

            await navigator.clipboard.writeText(
                text
            );


            copyTranslationBtn.innerText =
                "Copied!";


            setTimeout(() => {

                copyTranslationBtn.innerText =
                    "Copy";

            }, 2000);

        }

        catch (error) {

            console.error(
                "Copy error:",
                error
            );

            alert(
                "Unable to copy the translation."
            );

        }

    }
);