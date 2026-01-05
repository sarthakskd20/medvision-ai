"""
Gemini 3 API Service
Core AI service that leverages Gemini 3's 2M token context.
"""
import asyncio
from concurrent.futures import ThreadPoolExecutor
import google.generativeai as genai
from typing import Optional
from app.config import settings
from app.prompts.clinical_summary import CLINICAL_SUMMARY_PROMPT, build_patient_context
from app.prompts.trajectory_prediction import TRAJECTORY_PROMPT
from app.prompts.report_simplification import SIMPLIFY_REPORT_PROMPT

# Thread pool for running sync Gemini calls
_executor = ThreadPoolExecutor(max_workers=4)


class GeminiService:
    """Service for interacting with Gemini 3 API."""
    
    def __init__(self):
        self.api_key = settings.gemini_api_key
        if self.api_key:
            genai.configure(api_key=self.api_key)
            # Use gemini-2.5-flash for better quota limits
            # gemini-2.0-flash and gemini-2.0-flash-exp have strict quotas
            self.model = genai.GenerativeModel('gemini-2.5-flash')
        else:
            self.model = None
    
    def _sync_generate(self, prompt: str, temperature: float = 0.7, max_tokens: int = 8192) -> str:
        """Synchronous Gemini API call."""
        if not self.model:
            return "Error: Gemini API key not configured"
        
        generation_config = genai.types.GenerationConfig(
            temperature=temperature,
            max_output_tokens=max_tokens,
            top_p=0.95,
        )
        
        response = self.model.generate_content(
            prompt,
            generation_config=generation_config
        )
        
        return response.text
    
    async def _call_gemini(
        self,
        prompt: str,
        context: str = "",
        temperature: float = 0.7,
        max_tokens: int = 8192
    ) -> str:
        """
        Call Gemini 3 API with full context support.
        Runs synchronous SDK in thread pool to avoid blocking.
        """
        full_prompt = f"{context}\n\n---\n\n{prompt}" if context else prompt
        
        loop = asyncio.get_event_loop()
        result = await loop.run_in_executor(
            _executor,
            lambda: self._sync_generate(full_prompt, temperature, max_tokens)
        )
        return result
    
    async def _call_gemini_with_thinking(
        self,
        prompt: str,
        context: str = ""
    ) -> dict:
        """
        Call Gemini 3 with thinking mode for transparent reasoning.
        Returns both the thinking process and final answer.
        """
        thinking_prompt = f"""
You are a medical AI assistant. Think through this step-by-step.

CONTEXT:
{context}

TASK:
{prompt}

First, show your detailed reasoning process in <thinking> tags.
Then provide your final answer in <answer> tags.
Be thorough but concise in your reasoning.
"""
        
        response = await self._call_gemini(thinking_prompt, temperature=0.3)
        
        thinking = ""
        answer = ""
        
        if "<thinking>" in response and "</thinking>" in response:
            thinking = response.split("<thinking>")[1].split("</thinking>")[0].strip()
        
        if "<answer>" in response and "</answer>" in response:
            answer = response.split("<answer>")[1].split("</answer>")[0].strip()
        else:
            answer = response
        
        return {"thinking": thinking, "answer": answer}
    
    async def generate_clinical_summary(self, patient_data: dict) -> dict:
        """
        Generate a clinical summary for a patient.
        Uses full patient context in Gemini 3's 2M token window.
        """
        context = build_patient_context(patient_data)
        token_count = len(context.split())
        
        prompt = CLINICAL_SUMMARY_PROMPT
        
        response = await self._call_gemini(prompt, context, temperature=0.3)
        
        return {
            "summary": response,
            "token_count": token_count,
            "key_findings": [],
            "alerts": []
        }
    
    async def predict_trajectory(
        self,
        patient_data: dict,
        treatment_options: list[str] = None
    ) -> dict:
        """
        Predict patient trajectory based on similar cases.
        Uses thinking mode for transparent reasoning.
        """
        context = build_patient_context(patient_data)
        token_count = len(context.split())
        
        options_str = ", ".join(treatment_options) if treatment_options else "standard of care options"
        prompt = TRAJECTORY_PROMPT.format(treatment_options=options_str)
        
        result = await self._call_gemini_with_thinking(prompt, context)
        
        return {
            "thinking": result["thinking"],
            "predictions": result["answer"],
            "token_count": token_count,
            "recommendation": ""
        }
    
    async def simplify_lab_report(self, report_text: str) -> dict:
        """Simplify a lab report to plain language for patients."""
        prompt = SIMPLIFY_REPORT_PROMPT.format(report_text=report_text)
        response = await self._call_gemini(prompt, temperature=0.3)
        
        return {
            "simplified": response,
            "results": [],
            "summary": "",
            "questions": []
        }
    
    async def chat_response(self, message: str, context: str = "") -> dict:
        """Generate a chat response with optional patient context."""
        prompt = f"""
You are a helpful medical AI assistant. Answer the following question.
If patient context is provided, use it to give a personalized response.
Always be accurate and cite specific data when available.

Question: {message}
"""
        response = await self._call_gemini(prompt, context, temperature=0.7)
        
        return {
            "response": response,
            "sources": [],
            "confidence": 0.9
        }
    
    async def explain_lab_result(
        self,
        question: str,
        result_name: str,
        result_value: str,
        normal_range: str
    ) -> dict:
        """Explain a specific lab result in simple terms."""
        prompt = f"""
A patient is asking about their lab result. Explain in simple, friendly language.

Lab Test: {result_name}
Patient's Value: {result_value}
Normal Range: {normal_range}
Patient's Question: {question}

Provide:
1. A clear, simple answer to their question
2. Whether this result is concerning (yes/no)
3. Recommended next steps (if any)

Use language a non-medical person would understand. Be reassuring but honest.
"""
        response = await self._call_gemini(prompt, temperature=0.3)
        
        return {
            "answer": response,
            "is_concerning": "concerning" in response.lower() or "high" in result_value.lower(),
            "next_steps": []
        }
    
    async def compare_scans(self, scan1: dict, scan2: dict) -> dict:
        """Compare two medical scans and detect changes."""
        prompt = f"""
Compare these two medical scans and identify all changes.

SCAN 1 (Earlier - {scan1.get('date', 'Unknown date')}):
Type: {scan1.get('scan_type', 'Unknown')}
Findings: {scan1.get('findings', 'Not available')}

SCAN 2 (Later - {scan2.get('date', 'Unknown date')}):
Type: {scan2.get('scan_type', 'Unknown')}
Findings: {scan2.get('findings', 'Not available')}

Provide:
1. List of all changes detected
2. Measurements if available (e.g., tumor size change)
3. Urgency rating (1-10)
4. Recommended follow-up actions
"""
        response = await self._call_gemini(prompt, temperature=0.3)
        
        return {
            "comparison": response,
            "changes": [],
            "urgency": 5
        }
