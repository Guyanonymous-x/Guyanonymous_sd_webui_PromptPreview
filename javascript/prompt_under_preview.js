// Prompt Under Preview - shows the current image's prompt under the live preview.
(function () {
    const POLL_MS = 1000;            // same as the webui's default live-preview refresh
    const GIVE_UP_MS = 10 * 60000;   // stop waiting if a job never starts (e.g. it errored)

    let polling = false;

    function findGalleryAnchor(tab) {
        // Try the known spots, in order, and put our box right after the first found.
        return (
            gradioApp().querySelector(`#${tab}_gallery_container`) ||
            gradioApp().querySelector(`#${tab}_gallery`) ||
            gradioApp().querySelector(`#${tab}_results`)
        );
    }

    function getBox(tab) {
        let box = gradioApp().querySelector(`#${tab}_prompt_under_preview`);
        if (box) return box;
        const anchor = findGalleryAnchor(tab);
        if (!anchor) return null;
        box = document.createElement("div");
        box.id = `${tab}_prompt_under_preview`;
        box.className = "prompt-under-preview";
        box.style.display = "none";
        anchor.parentNode.insertBefore(box, anchor.nextSibling);
        return box;
    }

    function hideAll() {
        for (const tab of ["txt2img", "img2img"]) {
            const box = gradioApp().querySelector(`#${tab}_prompt_under_preview`);
            if (box) box.style.display = "none";
        }
    }

    function render(data) {
        const tab = data.is_img2img ? "img2img" : "txt2img";
        const other = data.is_img2img ? "txt2img" : "img2img";
        const otherBox = gradioApp().querySelector(`#${other}_prompt_under_preview`);
        if (otherBox) otherBox.style.display = "none";

        const box = getBox(tab);
        if (!box) return;
        if (!data.prompts || data.prompts.length === 0) {
            box.style.display = "none";
            return;
        }

        box.textContent = "";
        const total = data.n_iter * data.batch_size;
        data.prompts.forEach((prompt, i) => {
            const num = data.batch_number * data.batch_size + i + 1;
            const item = document.createElement("div");
            item.className = "puv-item";
            const label = document.createElement("div");
            label.className = "puv-label";
            label.textContent = `Image ${num} of ${total}`;
            const text = document.createElement("div");
            text.className = "puv-text";
            text.textContent = prompt;
            item.appendChild(label);
            item.appendChild(text);
            box.appendChild(item);
        });
        box.style.display = "";
    }

    async function pollLoop() {
        if (polling) return;
        polling = true;
        const started = Date.now();
        let seenActive = false;
        try {
            while (true) {
                let data = null;
                try {
                    const res = await fetch("./prompt-under-preview/current", { cache: "no-store" });
                    if (res.ok) data = await res.json();
                } catch (e) { /* server busy; just try again next tick */ }

                if (data) {
                    if (data.active) {
                        seenActive = true;
                        render(data);
                    } else if (seenActive) {
                        hideAll();
                        break;
                    }
                }
                if (!seenActive && Date.now() - started > GIVE_UP_MS) break;
                await new Promise(r => setTimeout(r, POLL_MS));
            }
        } finally {
            polling = false;
        }
    }

    onUiLoaded(() => {
        // Start watching when either Generate button is pressed
        // (also covers Ctrl+Enter and "Generate forever", which click it too).
        for (const tab of ["txt2img", "img2img"]) {
            const btn = gradioApp().querySelector(`#${tab}_generate`);
            if (btn) btn.addEventListener("click", () => setTimeout(pollLoop, 300));
        }
        // If a job is already running when the page loads, pick it up.
        pollLoop();
    });
})();
