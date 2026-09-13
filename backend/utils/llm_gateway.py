import os
import re
import json
import logging
from typing import Optional, Dict, Any

logger = logging.getLogger(__name__)

class LLMGateway:
    """
    Unified LLM Gateway supporting Google Gemini, OpenAI, Groq, DeepSeek,
    Anthropic, and local Ollama via LiteLLM with structured JSON parsing
    and resilient error handling.
    """

    def __init__(self):
        self._provider = None
        self._model = None
        self._initialized = False
        self._configure()

    def _configure(self):
        # Auto-detect available provider keys
        gemini_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
        openai_key = os.getenv("OPENAI_API_KEY")
        groq_key = os.getenv("GROQ_API_KEY")
        deepseek_key = os.getenv("DEEPSEEK_API_KEY")
        anthropic_key = os.getenv("ANTHROPIC_API_KEY")
        configured_model = os.getenv("DEFAULT_LLM_MODEL", "").strip()

        # Set environment variables for litellm if needed
        if gemini_key and not os.getenv("GEMINI_API_KEY"):
            os.environ["GEMINI_API_KEY"] = gemini_key

        if configured_model:
            self._model = configured_model
            if "gemini" in configured_model.lower():
                self._provider = "gemini"
            elif "gpt" in configured_model.lower() or "openai" in configured_model.lower():
                self._provider = "openai"
            elif "groq" in configured_model.lower() or "llama" in configured_model.lower():
                self._provider = "groq"
            elif "deepseek" in configured_model.lower():
                self._provider = "deepseek"
            elif "claude" in configured_model.lower() or "anthropic" in configured_model.lower():
                self._provider = "anthropic"
            elif "ollama" in configured_model.lower():
                self._provider = "ollama"
            else:
                self._provider = "custom"
        elif gemini_key:
            self._provider = "gemini"
            self._model = "gemini/gemini-2.0-flash"
        elif openai_key:
            self._provider = "openai"
            self._model = "gpt-4o-mini"
        elif groq_key:
            self._provider = "groq"
            self._model = "groq/llama-3.3-70b-versatile"
        elif deepseek_key:
            self._provider = "deepseek"
            self._model = "deepseek/deepseek-chat"
        elif anthropic_key:
            self._provider = "anthropic"
            self._model = "claude-3-5-haiku-20241022"
        else:
            self._provider = None
            self._model = None

        self._initialized = True
        if self._model:
            logger.info("LLMGateway configured with model: %s (provider: %s)", self._model, self._provider)
        else:
            logger.info("No LLM API keys detected. System will operate in High-Grade Offline Fallback mode.")

    def is_available(self) -> bool:
        """Returns True if a valid LLM provider and model are available."""
        if not self._initialized:
            self._configure()
        return bool(self._model)

    def get_status(self) -> Dict[str, Any]:
        """Returns the current status and provider details of the LLM Gateway."""
        if not self._initialized:
            self._configure()
        return {
            "available": bool(self._model),
            "provider": self._provider or "offline",
            "model": self._model or "none",
            "mode": "llm_connected" if self._model else "offline_fallback",
        }

    def generate_text(
        self,
        system_prompt: str,
        user_prompt: str,
        temperature: float = 0.7,
        max_tokens: int = 1500,
    ) -> Optional[str]:
        """Generate text from LLM with automatic error handling."""
        if not self.is_available():
            return None

        try:
            import litellm
            litellm.suppress_debug_info = True

            messages = [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ]

            response = litellm.completion(
                model=self._model,
                messages=messages,
                temperature=temperature,
                max_tokens=max_tokens,
            )

            choices = response.get("choices", [])
            if choices and len(choices) > 0:
                content = choices[0].get("message", {}).get("content", "")
                return content.strip() if content else None
            return None

        except Exception as e:
            logger.warning("LLM text generation failed (%s: %s). Falling back.", type(e).__name__, e)
            return None

    def generate_json(
        self,
        system_prompt: str,
        user_prompt: str,
        temperature: float = 0.3,
        max_tokens: int = 2500,
    ) -> Optional[Any]:
        """
        Generate structured JSON from LLM, automatically extracting JSON blocks
        and recovering from common markdown formatting.
        """
        if not self.is_available():
            return None

        sys_with_json = f"{system_prompt}\n\nIMPORTANT: You MUST respond ONLY with valid JSON. Do not include introductory text, conversational remarks, or outside commentary."

        raw_text = self.generate_text(
            system_prompt=sys_with_json,
            user_prompt=user_prompt,
            temperature=temperature,
            max_tokens=max_tokens,
        )

        if not raw_text:
            return None

        return self._extract_json(raw_text)

    def _extract_json(self, text: str) -> Optional[Any]:
        """Extract and parse JSON from LLM response text."""
        clean_text = text.strip()

        # 1. Try direct json parse
        try:
            return json.loads(clean_text)
        except Exception:
            pass

        # 2. Extract from markdown code blocks ```json ... ``` or ``` ... ```
        block_match = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", clean_text, re.IGNORECASE)
        if block_match:
            try:
                return json.loads(block_match.group(1).strip())
            except Exception:
                pass

        # 3. Find first outer [ ... ] or { ... }
        start_brace = clean_text.find("{")
        start_bracket = clean_text.find("[")

        if start_brace != -1 and (start_bracket == -1 or start_brace < start_bracket):
            end_brace = clean_text.rfind("}")
            if end_brace > start_brace:
                try:
                    return json.loads(clean_text[start_brace : end_brace + 1])
                except Exception:
                    pass
        elif start_bracket != -1:
            end_bracket = clean_text.rfind("]")
            if end_bracket > start_bracket:
                try:
                    return json.loads(clean_text[start_bracket : end_bracket + 1])
                except Exception:
                    pass

        logger.warning("Could not parse valid JSON from LLM response: %s", clean_text[:200])
        return None
