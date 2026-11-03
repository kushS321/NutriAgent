# NutriAgent — Backend API Reference

This document describes the server-side REST API routes available in NutriAgent under `/api`.

---

## 1. Product Resolution & Search

### `GET /api/products/[barcode]`
Looks up packaged food data by barcode using Open Food Facts with automatic local catalog fallback.

- **URL Parameter:** `barcode` (string, EAN-13, EAN-8, UPC-A, UPC-E)
- **Response:**
  ```json
  {
    "product": {
      "id": "8901058852461",
      "name": "Maggi 2-Minute Masala Instant Noodles",
      "brand": "Nestlé Maggi",
      "barcode": "8901058852461",
      "ingredientsText": "Refined wheat flour (Maida), Palm oil, Salt...",
      "nutrition": {
        "servingSize": "1 pack (70g)",
        "calories": 312,
        "proteinG": 8.0,
        "totalCarbohydratesG": 43.6,
        "totalSugarsG": 2.2,
        "addedSugarsG": 1.1,
        "sodiumMg": 860,
        "saturatedFatG": 5.8
      },
      "vegStatus": "veg",
      "provenance": "open_food_facts"
    }
  }
  ```

### `GET /api/products/search?q={query}`
Searches Open Food Facts database by product name or brand.

- **Query Parameter:** `q` (string, e.g. "oats", "epigamia", "curd")
- **Response:**
  ```json
  {
    "products": [ ... ],
    "count": 10
  }
  ```

---

## 2. Assessment & Rules Engine

### `POST /api/assessment`
Evaluates a food product against a user's dietary profile.

- **Request Body:**
  ```json
  {
    "product": { ... },
    "userProfile": {
      "dietaryPreferences": ["vegetarian", "jain"],
      "allergies": ["peanuts"],
      "healthConsiderations": ["hypertension"],
      "calorieTargetDaily": 2000
    }
  }
  ```
- **Response:**
  ```json
  {
    "assessment": {
      "id": "assess-1730620000000",
      "status": "review_carefully",
      "headline": "Review Carefully: Specific Conflicts Detected",
      "summary": "...",
      "healthEvaluation": {
        "profileName": "Your Profile",
        "sugarEvaluation": {
          "productValue": 12,
          "recommendedDailyBudget": 25,
          "percentageOfBudget": 48,
          "verdict": "moderate",
          "userRecommendation": "..."
        },
        "sodiumEvaluation": {
          "productValue": 480,
          "recommendedDailyBudget": 1500,
          "percentageOfBudget": 32,
          "verdict": "excessive"
        }
      }
    }
  }
  ```

---

## 3. Multimodal OCR & Image Analysis

### `POST /api/ocr/analyze`
Extracts structured nutrition facts and ingredients from an uploaded label photograph or cropped label image.

- **Request Body:**
  ```json
  {
    "image": "data:image/jpeg;base64,...",
    "mimeType": "image/jpeg"
  }
  ```
- **Response:**
  ```json
  {
    "product": {
      "name": "Extracted Food Item",
      "ingredientsText": "...",
      "nutrition": { ... },
      "ocrConfidence": 92
    }
  }
  ```

---

## 4. Product Comparison

### `POST /api/compare`
Calculates differences and normalized 100g comparisons between two products.

- **Request Body:** `{ "productA": { ... }, "productB": { ... } }`
- **Response:**
  ```json
  {
    "comparison": {
      "productA": { ... },
      "productB": { ... },
      "servingBasisComparison": "per_100g",
      "differences": { ... }
    }
  }
  ```

---

## 5. Conversational Nutrition Assistant

### `POST /api/assistant`
Provides plain-English answers to questions about ingredients, chemical additives, and food compatibility.

- **Request Body:**
  ```json
  {
    "message": "Is INS 621 safe for vegetarian diet?",
    "productContext": { ... },
    "conversationHistory": [ ... ]
  }
  ```
- **Response:**
  ```json
  {
    "reply": "INS 621 refers to Monosodium Glutamate (MSG). In commercial manufacturing...",
    "citedSources": [ "ICMR-NIN 2024", "FSSAI 2022" ]
  }
  ```
