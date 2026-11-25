import os
import sys
import time
import uuid
import torch
from typing import List, Dict, Any, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import uvicorn
from transformers import AutoModelForCausalLM, AutoTokenizer

app = FastAPI(title="Local Qwen OpenAI-Compatible Server", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 1. Locate local Qwen model cache
DEFAULT_MODEL_DIR = os.path.expanduser(
    r"~/.cache/huggingface/hub/models--Qwen--Qwen2.5-Coder-7B-Instruct/snapshots/c03e6d358207e414f1eca0bb1891e29f1db0e242"
)
MODEL_ID_OR_PATH = os.environ.get("QWEN_MODEL_PATH", DEFAULT_MODEL_DIR)
if not os.path.exists(MODEL_ID_OR_PATH):
    MODEL_ID_OR_PATH = "Qwen/Qwen2.5-Coder-7B-Instruct"

print(f"📦 Loading Qwen Model from: {MODEL_ID_OR_PATH}")
print(f"🎮 GPU Available: {torch.cuda.is_available()}")
if torch.cuda.is_available():
    print(f"🚀 Using GPU: {torch.cuda.get_device_name(0)}")

tokenizer = None
model = None

def get_model_and_tokenizer():
    global tokenizer, model
    if model is None:
        print("⏳ Initializing Tokenizer...")
        tokenizer = AutoTokenizer.from_pretrained(
            MODEL_ID_OR_PATH,
            trust_remote_code=True,
        )

        print("⏳ Loading Model weights (device_map='auto')...")
        load_kwargs = {
            "torch_dtype": torch.bfloat16 if torch.cuda.is_available() else torch.float32,
            "device_map": "auto",
            "trust_remote_code": True,
        }

        # Check if 4-bit quantization can be used to fit comfortably in 8GB VRAM
        use_4bit = os.environ.get("LOAD_4BIT", "true").lower() in ("true", "1", "yes")
        if use_4bit and torch.cuda.is_available():
            try:
                from transformers import BitsAndBytesConfig
                load_kwargs["quantization_config"] = BitsAndBytesConfig(
                    load_in_4bit=True,
                    bnb_4bit_compute_dtype=torch.bfloat16,
                    bnb_4bit_quant_type="nf4",
                    bnb_4bit_use_double_quant=True,
                )
                print("⚡ Enabled 4-bit NF4 Quantization (fits comfortably inside 8GB VRAM)")
            except Exception as e:
                print(f"⚠️ Could not enable 4-bit, falling back to bfloat16: {e}")

        model = AutoModelForCausalLM.from_pretrained(
            MODEL_ID_OR_PATH,
            **load_kwargs
        )
        model.eval()
        print("✅ Qwen2.5-Coder-7B-Instruct loaded and ready for zero-cost inference!")
    return tokenizer, model

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatCompletionRequest(BaseModel):
    model: Optional[str] = "Qwen2.5-Coder-7B-Instruct"
    messages: List[ChatMessage]
    temperature: Optional[float] = 0.2
    top_p: Optional[float] = 0.95
    max_tokens: Optional[int] = 4096
    response_format: Optional[Dict[str, Any]] = None

@app.on_event("startup")
def startup_event():
    print("⏳ Pre-loading Qwen model and tokenizer into GPU memory at server startup...")
    get_model_and_tokenizer()
    print("✅ Model is pre-loaded and ready for instant inference without cold-start delay!")

@app.get("/health")
def health():
    return {
        "status": "healthy",
        "model": "Qwen2.5-Coder-7B-Instruct",
        "device": torch.cuda.get_device_name(0) if torch.cuda.is_available() else "CPU",
        "cost": "0.00 USD (Unlimited Local Inference)",
    }

@app.get("/v1/models")
def list_models():
    return {
        "object": "list",
        "data": [
            {
                "id": "Qwen2.5-Coder-7B-Instruct",
                "object": "model",
                "created": int(time.time()),
                "owned_by": "local-qwen",
            },
            {
                "id": "qwen2.5-coder-7b",
                "object": "model",
                "created": int(time.time()),
                "owned_by": "local-qwen",
            }
        ]
    }

@app.post("/v1/chat/completions")
def chat_completions(req: ChatCompletionRequest):
    tok, mdl = get_model_and_tokenizer()

    # Format messages
    conversation = [{"role": m.role, "content": m.content} for m in req.messages]

    # If JSON mode requested, reinforce JSON output instruction
    if req.response_format and req.response_format.get("type") == "json_object":
        has_system = any(m["role"] == "system" for m in conversation)
        json_instruction = "Respond strictly with valid JSON. Do not include markdown code block backticks (```json) outside the JSON."
        if has_system:
            for m in conversation:
                if m["role"] == "system":
                    m["content"] += f"\n\n{json_instruction}"
        else:
            conversation.insert(0, {"role": "system", "content": json_instruction})

    # Apply Qwen chat template
    prompt_text = tok.apply_chat_template(
        conversation,
        tokenize=False,
        add_generation_prompt=True
    )

    model_inputs = tok([prompt_text], return_tensors="pt").to(mdl.device)
    prompt_tokens = len(model_inputs.input_ids[0])

    gen_kwargs = {
        "max_new_tokens": req.max_tokens or 4096,
        "temperature": max(req.temperature or 0.2, 0.01),
        "top_p": req.top_p or 0.95,
        "do_sample": (req.temperature or 0.2) > 0.05,
    }

    with torch.no_grad():
        generated_ids = mdl.generate(
            **model_inputs,
            **gen_kwargs
        )

    # Slice output tokens to exclude prompt
    generated_tokens = [
        output_ids[len(input_ids):]
        for input_ids, output_ids in zip(model_inputs.input_ids, generated_ids)
    ]
    completion_text = tok.batch_decode(generated_tokens, skip_special_tokens=True)[0]
    completion_tokens = len(generated_tokens[0])

    return {
        "id": f"chatcmpl-{uuid.uuid4().hex[:12]}",
        "object": "chat.completion",
        "created": int(time.time()),
        "model": req.model or "Qwen2.5-Coder-7B-Instruct",
        "choices": [
            {
                "index": 0,
                "message": {
                    "role": "assistant",
                    "content": completion_text.strip(),
                },
                "finish_reason": "stop",
            }
        ],
        "usage": {
            "prompt_tokens": prompt_tokens,
            "completion_tokens": completion_tokens,
            "total_tokens": prompt_tokens + completion_tokens,
        },
    }

if __name__ == "__main__":
    port = int(os.environ.get("QWEN_PORT", "8000"))
    host = os.environ.get("QWEN_HOST", "0.0.0.0")
    print(f"\n=======================================================")
    print(f"🚀 LOCAL QWEN OPENAI-COMPATIBLE SERVER STARTING ON {host}:{port}")
    print(f"👉 Compatible Base URL: http://localhost:{port}/v1")
    print(f"=======================================================\n")
    uvicorn.run(app, host=host, port=port)
