# Prompt Under Preview

An extension for **Stable Diffusion WebUI** (AUTOMATIC1111) and its forks,
including **Forge** and **Forge Neo**.

While images are being generated, it shows the exact prompt used for the
image being made right now, in a box directly under the preview.

## Why use it

When you use wildcards, Dynamic Prompts, Prompt Matrix, or "Prompts from file",
every image in a run can get a different prompt. Normally you only find out
which prompt made which image after the run ends, by opening each image's
info. This extension shows the prompt live, as each image is generated, so you
can see straight away which prompt is producing what you see in the preview.

## What it shows

- The full prompt for the current image, with LoRA and other extra-network
  tags kept in.
- A label such as **Image 3 of 8**, so you know where you are in the run.
- If **Batch size** is more than 1, every image in the current batch is listed.
- Works on both the **txt2img** and **img2img** tabs.
- The box hides on its own when the run finishes.

## Installation

### Option 1: install from the WebUI (recommended)

1. Open the WebUI and go to the **Extensions** tab.
2. Open the **Install from URL** sub-tab.
3. Paste this address into **URL for extension's git repository**:
   `https://github.com/Guyanonymous-x/Guyanonymous_sd_webui_PromptPreview`
4. Click **Install** and wait for the message that it has been installed.
5. Fully close and restart the WebUI. "Apply and restart UI" or "Reload UI"
   may not be enough the first time.

### Option 2: install by hand

1. Download this repository as a ZIP (green **Code** button, then
   **Download ZIP**).
2. Unzip it into your WebUI's `extensions` folder, so the `scripts` folder,
   the `javascript` folder and `style.css` sit directly inside one folder
   there, for example
   `extensions/Guyanonymous_sd_webui_PromptPreview/scripts/`.
3. Fully close and restart the WebUI (not just "Reload UI").

## How to use

There's nothing to set up. Click **Generate** as usual, and the prompt box
appears under the preview once the first image starts.

## Notes and limits

- Only runs started from the WebUI page are shown. Runs sent to the WebUI from
  other programs through its API are not.
- While a run is going, the page checks for the current prompt once a second,
  the same rate the WebUI uses to refresh its own preview.
- If the box doesn't appear, or appears in the wrong place, in your WebUI
  version, please open an issue saying which WebUI and version you use.

## Files

- `scripts/prompt_under_preview.py`: records each image's prompt during the run.
- `javascript/prompt_under_preview.js`: shows the prompt under the preview.
- `style.css`: the look of the prompt box.
