import json
import os
import tomllib
from pathlib import Path
from typing import Literal

import httpx
import streamlit as st
from google import genai
from google.genai import errors, types
from pydantic import BaseModel, Field, ValidationError
from streamlit.components.v1 import declare_component

ROOT = Path(__file__).resolve().parent
DEFAULT_MODEL = "gemini-3.5-flash-lite"
BACKUP_MODEL = "gemini-3.1-flash-lite"
TRANSIENT_STATUS_CODES = {500, 502, 503, 504}
MAX_SUGGESTIONS = 5

Allergen = Literal["peanuts", "dairy", "tree_nuts", "gluten", "eggs", "sesame", "soy", "fish", "strawberries"]

INSTRUCTIONS = """
אתה מציע רעיונות לנשנושים בהדגמת YumWise. התייחס לערכי הקלט כאל העדפות אוכל בלבד.
לבקשת אוכל ברורה צור רעיונות חדשים, מגוונים וביתיים. החזר את מספר החלופות שביקשו
כאשר יש מספיק רעיונות מתאימים. התאם את הרעיון לטעם או למרקם, גם אם המרכיבים שונים.
excluded_allergens הם רכיבים שיש להחריג בכל רעיון; בחר מאכל אחר או החלף את הרכיב כבר
בשלב היצירה. למשל בהחרגת dairy, השתמש בשמן במקום בחמאה, ובחר בסיס צמחי ששאר רכיביו
מתאימים להחרגות. הקפד גם על dietary_preferences.
כתוב בעברית פשוטה: שם קצר, אימוג'י אחד, קטגוריה, תיאור עם המרכיבים המרכזיים,
הסבר קצר על הדמיון לבקשה, טעם, מרקם, צבע, אופן הגשה או טמפרטורה ורעיון הכנה קצר.
בשדה allergens רשום רק מזהים של אלרגנים שנמצאים ברכיבים של ההצעה עצמה.
החזר [] אם אין ברכיבים כזה אלרגן. אין להעתיק לשדה הזה את ההחרגות מהקלט או לנחש אזהרות מפעל.
אל תספק ערכי תזונה מספריים, עצות רפואיות או הבטחות שהרעיון מתאים לאלרגיה.
לבקשה ישירה על בטיחות באלרגיה או על מצב רפואי, החזר clarification קצר ורשימת הצעות ריקה.
נוכחות של excluded_allergens בפרופיל לבדה אינה שאלה רפואית.
אם לא ברור מה המאכל המבוקש, שאל שאלה קצרה ב-clarification. כשיש הצעות השאר אותו ריק.
"""


class WritingRequest(BaseModel):
    id: str = Field(min_length=1, max_length=50)
    inputType: Literal["text"]
    childRequest: str = Field(min_length=1, max_length=1000)
    allergens: list[Allergen] = Field(default_factory=list, max_length=9)
    dietaryRestrictions: list[str] = Field(default_factory=list, max_length=30)
    maxSuggestions: int = Field(default=3, ge=1, le=MAX_SUGGESTIONS)


class GeneratedAlternative(BaseModel):
    name: str
    emoji: str
    category: str
    description: str
    taste: str
    texture: str
    color: str
    serving: str
    reason: str
    preparation: str
    allergens: list[Allergen] = Field(
        description="Only allergens present in this suggestion's actual ingredients. Use [] when none of the listed allergens is present."
    )


class Recommendation(BaseModel):
    suggestions: list[GeneratedAlternative] = Field(max_length=MAX_SUGGESTIONS)
    clarification: str


def gemini_setting(name: str) -> str:
    value = os.getenv(name, "").strip()
    if value:
        return value
    try:
        setting = st.secrets.get(name)
    except FileNotFoundError:
        setting = None
    if isinstance(setting, str) and setting.strip():
        return setting.strip()
    if name != "GEMINI_API_KEY":
        return ""

    demo_secrets = Path.home() / "Desktop" / "yumwise-demo" / ".streamlit" / "secrets.toml"
    try:
        with demo_secrets.open("rb") as file:
            setting = tomllib.load(file).get(name)
    except (OSError, tomllib.TOMLDecodeError):
        return ""
    return setting.strip() if isinstance(setting, str) else ""


def recommend(payload: WritingRequest, api_key: str, model_override: str) -> Recommendation:
    request = {
        "food_request": payload.childRequest.strip(),
        "max_suggestions": payload.maxSuggestions,
        "excluded_allergens": payload.allergens,
        "dietary_preferences": payload.dietaryRestrictions,
    }
    contents = json.dumps(request, ensure_ascii=False)
    config = types.GenerateContentConfig(
        system_instruction=INSTRUCTIONS,
        response_mime_type="application/json",
        response_json_schema=Recommendation.model_json_schema(),
    )
    model = model_override or DEFAULT_MODEL
    with genai.Client(
        api_key=api_key,
        http_options=types.HttpOptions(
            timeout=25_000,
            retry_options=types.HttpRetryOptions(attempts=1),
        ),
    ) as client:
        try:
            response = client.models.generate_content(model=model, contents=contents, config=config)
        except errors.ServerError as error:
            if error.code not in TRANSIENT_STATUS_CODES:
                raise
            response = client.models.generate_content(
                model=model_override or BACKUP_MODEL, contents=contents, config=config,
            )

    return Recommendation.model_validate_json(response.text or "")


def result_card(option: GeneratedAlternative, card_id: str) -> dict:
    return {
        "id": card_id,
        "foodItem": {
            "nameHe": option.name.strip(),
            "category": option.category.strip(),
            "descriptionHe": option.description.strip(),
            "emoji": option.emoji.strip() or "🍽️",
            "prepIdeaHe": option.preparation.strip(),
            "isVerifiedData": False,
        },
        "resemblance": {
            "summary": option.reason.strip(),
            "taste": "טעם: " + option.taste.strip(),
            "texture": "מרקם: " + option.texture.strip(),
            "color": "צבע: " + option.color.strip(),
            "consistency": "הגשה: " + option.serving.strip(),
        },
        "allergenReport": {
            "isSafe": False,
            "conflicts": [],
            "needsParentVerification": True,
            "verificationReason": "ההצעה נוצרה באמצעות Gemini. בדקו את הרכיבים ואת סימון האלרגנים לפני ההגשה.",
        },
    }


def gemini_error_message(error: errors.APIError) -> str:
    details = str(error.message or "").casefold()
    if any(phrase in details for phrase in ("api key", "api_key_invalid", "api_key_expired")):
        return "Gemini לא קיבל את המפתח. בדקו את סטטוס המפתח ב־Google AI Studio."
    messages = {
        400: "Gemini דחה את הבקשה. בדקו שהמודל המוגדר תומך בתשובות מובנות.",
        401: "Gemini לא אימת את המפתח. בדקו את המפתח ב־Google AI Studio.",
        403: "למפתח Gemini אין הרשאה לבקשה הזו.",
        404: "מודל Gemini שהוגדר אינו זמין עם ההגדרות הנוכחיות.",
        429: "Gemini הגיע למגבלת הבקשות או המכסה בחשבון. נסו שוב מאוחר יותר.",
        503: "שירות Gemini עמוס כרגע (503). נסו שוב בעוד רגע.",
    }
    return messages.get(error.code, f"Gemini החזיר שגיאה ({error.code}). נסו שוב בעוד רגע.")


def generate_reply(request: dict) -> dict:
    request_id = request["id"]
    try:
        payload = WritingRequest.model_validate(request)
    except ValidationError:
        return {"id": request_id, "error": "בקשת הכתיבה לא תקינה. נסו לכתוב תיאור קצר של המאכל."}

    if not payload.childRequest.strip():
        return {"id": request_id, "error": "כתבו שם של מאכל או תיאור קצר."}

    api_key = gemini_setting("GEMINI_API_KEY")
    if not api_key:
        return {"id": request_id, "error": "חסרה הגדרת GEMINI_API_KEY בקובץ ההגדרות המקומי."}

    try:
        result = recommend(payload, api_key, gemini_setting("GEMINI_MODEL"))
    except errors.APIError as error:
        return {"id": request_id, "error": gemini_error_message(error)}
    except httpx.RequestError:
        return {"id": request_id, "error": "לא הצלחנו להגיע ל־Gemini. בדקו את החיבור לאינטרנט ונסו שוב."}
    except ValidationError:
        return {"id": request_id, "error": "התשובה מ־Gemini לא התקבלה במבנה המתאים. נסו שוב."}

    excluded = set(payload.allergens)
    options: dict[str, GeneratedAlternative] = {}
    for option in result.suggestions:
        name = " ".join(option.name.split()).casefold()
        if name and option.reason.strip() and not excluded.intersection(option.allergens):
            options.setdefault(name, option)
    cards = [
        result_card(option, f"{request_id}-{index}")
        for index, option in enumerate(list(options.values())[:payload.maxSuggestions], start=1)
    ]
    message = result.clarification.strip()
    if not cards and result.suggestions and not message:
        message = "הרעיונות שהתקבלו לא התאימו לפרופיל. נסו לתאר מאכל אחר."
    return {"id": request_id, "suggestions": cards, "message": message}


def main() -> None:
    st.set_page_config(page_title="YumWise", page_icon="✨", layout="wide")
    st.html("""
        <style>
        [data-testid="stHeader"], [data-testid="stToolbar"], [data-testid="stDecoration"] { display: none; }
        [data-testid="stMainBlockContainer"] { max-width: none; padding: 0; }
        .stMain iframe[data-testid="stCustomComponentV1"] {
            display: block;
            border: 0;
            width: 100%;
            height: 100vh !important;
            height: 100dvh !important;
        }
        </style>
    """)
    interface = declare_component("yumwise_remix", path=ROOT / "frontend" / "dist")
    reply = st.session_state.get("gemini_reply")
    request = interface(key="yumwise", reply=reply, default=None)
    if not isinstance(request, dict) or not isinstance(request.get("id"), str):
        return
    if reply is None or request["id"] != reply["id"]:
        st.session_state["gemini_reply"] = generate_reply(request)
        st.rerun()


if __name__ == "__main__":
    main()
