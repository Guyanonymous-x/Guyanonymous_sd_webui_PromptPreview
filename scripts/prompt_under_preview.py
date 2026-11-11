"""
Prompt Under Preview
Shows the prompt used for the image(s) currently being generated, right under
the live preview. Works with A1111 sd-webui, Forge and Forge Neo.

How it works:
- An always-on script records the prompts of each batch just before that batch
  is generated (before LoRA/extra-network tags are stripped, so you see the
  full prompt, including anything Dynamic Prompts / wildcards produced).
- A tiny local API route hands that info to the browser.
"""

import threading

import modules.scripts as scripts
from modules import script_callbacks

_lock = threading.Lock()
_state = {
    "active": False,
    "job": 0,            # increases every generation, so the page can tell runs apart
    "is_img2img": False,
    "batch_number": 0,   # 0-based index of the current batch
    "n_iter": 1,         # batch count
    "batch_size": 1,
    "prompts": [],
}


def _update(**kwargs):
    with _lock:
        _state.update(kwargs)


class PromptUnderPreview(scripts.Script):
    def title(self):
        return "Prompt Under Preview"

    def show(self, is_img2img):
        return scripts.AlwaysVisible

    def ui(self, is_img2img):
        return []

    def process(self, p, *args):
        with _lock:
            job = _state["job"] + 1
        self._seen_batch = -1
        _update(
            active=True,
            job=job,
            is_img2img=self.is_img2img,
            batch_number=0,
            n_iter=int(getattr(p, "n_iter", 1) or 1),
            batch_size=int(getattr(p, "batch_size", 1) or 1),
            prompts=[],
        )

    def _record(self, batch_number, prompts):
        self._seen_batch = batch_number
        _update(
            batch_number=int(batch_number),
            prompts=[str(x) for x in (prompts or [])],
        )

    # Runs before LoRA tags are removed from the prompt -> preferred.
    def before_process_batch(self, p, *args, **kwargs):
        self._record(kwargs.get("batch_number", 0), kwargs.get("prompts") or getattr(p, "prompts", []))

    # Fallback for builds that don't call before_process_batch.
    def process_batch(self, p, *args, **kwargs):
        n = kwargs.get("batch_number", 0)
        if getattr(self, "_seen_batch", -1) != n:
            self._record(n, kwargs.get("prompts") or getattr(p, "prompts", []))

    def postprocess(self, p, processed, *args):
        _update(active=False)


def _on_app_started(demo, app):
    @app.get("/prompt-under-preview/current")
    def current():
        with _lock:
            return dict(_state)


script_callbacks.on_app_started(_on_app_started)
