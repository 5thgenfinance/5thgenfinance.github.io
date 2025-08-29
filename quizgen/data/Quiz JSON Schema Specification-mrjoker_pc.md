<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" class="logo" width="120"/>

# Quiz JSON Schema Specification

## Overview

This schema defines the structure for a multi-choice quiz application with comprehensive metadata tracking, dynamic section management, and detailed question specifications. The schema supports educational content with percentage-based topic distribution and extensive question metadata.

## Root Schema Structure

### **Top-Level Properties**

| Property | Type | Required | Description |
| :-- | :-- | :-- | :-- |
| `metadata` | object | ✅ | Comprehensive quiz information and statistics |
| `questions` | array | ✅ | Array of quiz questions with detailed metadata |

## Metadata Section

### **Required Metadata Fields**

| Field | Type | Format | Description |
| :-- | :-- | :-- | :-- |
| `quiz_name` | string | 1-200 characters | Full descriptive name of the quiz/examination |
| `total_questions` | integer | ≥ 1 | Total number of questions in the complete quiz |
| `created_date` | string | YYYY-MM-DD | Date when this quiz file was created |
| `gen_model_used` | string | Min 1 character | AI model used to generate this JSON file |
| `file_description` | string | 10-500 characters | Detailed description of the quiz content and scope |
| `content_areas` | array | Min 1 item | Topic categories with statistics |

### **Optional Metadata Fields**

| Field | Type | Format | Description |
| :-- | :-- | :-- | :-- |
| `batch_range` | string | "number-number" | Range of question batches (e.g., "1-18") |
| `question_id_range` | string | "number-number" | Range of question IDs (e.g., "1-450") |
| `sources` | array | strings | Reference sources and materials used |
| `special_features` | array | strings | Descriptive features and highlights |

### **Content Areas Object Schema**

Each content area must include:


| Field | Type | Format | Description |
| :-- | :-- | :-- | :-- |
| `name` | string | 1-100 characters | Name of the content area/topic |
| `weight` | string | "number%" | Official exam weight percentage |
| `questions_in_file` | integer | ≥ 0 | Actual questions for this topic in current file |
| `percentage` | string | "number.number%" | Actual percentage in this file |

## Questions Section

### **Question Object Schema**

Each question must include:


| Field | Type | Required | Format | Description |
| :-- | :-- | :-- | :-- | :-- |
| `id` | integer | ✅ | Sequential from 1 | Unique question identifier |
| `section` | string | ✅ | 1+ characters | Primary content area name |
| `subsection` | string | ✅ | 1-100 characters | Specific subtopic within section |
| `question` | string | ✅ | 10-1000 characters | The actual question text |
| `choices` | array | ✅ | Exactly 4 strings | Multiple choice options |
| `correct_answer` | string | ✅ | A, B, C, or D | Letter designation of correct answer |
| `explanation` | string | ✅ | 10-500 characters | Detailed answer explanation |
| `source` | string | ✅ | 3-100 characters | Reference citation |

### **Choice Array Requirements**

- **Length**: Exactly 4 elements
- **Format**: Each choice must be prefixed with letter and parenthesis:
    - `"A) [option text]"`
    - `"B) [option text]"`
    - `"C) [option text]"`
    - `"D) [option text]"`


## Validation Rules \& Constraints

### **Cross-Field Validation**

1. **Section Alignment**: Every `questions[].section` must correspond to a `content_areas[].name`
2. **Answer Validation**: `correct_answer` must match an existing choice letter (A-D)
3. **ID Sequencing**: Question IDs should be consecutive integers starting from 1
4. **Percentage Consistency**: `content_areas[].questions_in_file` should sum to approximately `total_questions`

### **Data Integrity Checks**

- All required string fields must be non-empty
- Date format must follow YYYY-MM-DD pattern
- Percentage strings must end with "%" symbol
- Range strings must follow "number-number" pattern
- Choice arrays must contain exactly 4 items with proper letter prefixes


### **Recommended Practices**

- **Content Quality**: Questions should be clear, unambiguous, and appropriate for target audience
- **Distribution**: Actual question counts should approximate the official content area weights
- **Source Attribution**: Include specific references for educational content
- **Metadata Accuracy**: Ensure all statistics and ranges accurately reflect the file contents


## Example Structure

```json
{
  "metadata": {
    "quiz_name": "FINRA Series 65 - Uniform Investment Adviser Law Examination",
    "total_questions": 450,
    "batch_range": "1-18",
    "question_id_range": "1-450",
    "created_date": "2025-07-29",
    "gen_model_used": "Grok 4.0",
    "file_description": "Complete Series 65 practice question bank including original 300 questions plus 150 advanced/emerging topic questions",
    "content_areas": [
      {
        "name": "Economic Factors and Business Information",
        "weight": "15%",
        "questions_in_file": 71,
        "percentage": "15.8%"
      }
    ],
    "sources": [
      "NASAA Series 65 Content Outline 2023",
      "Achievable Series 65 Practice Questions"
    ],
    "special_features": [
      "Comprehensive coverage of all NASAA content areas",
      "Advanced investment strategies and modern planning concepts"
    ]
  },
  "questions": [
    {
      "id": 1,
      "section": "Economic Factors and Business Information",
      "subsection": "Basic Economic Concepts",
      "question": "What is the primary function of the Federal Reserve?",
      "choices": [
        "A) Regulate stock markets",
        "B) Control monetary policy",
        "C) Supervise investment advisers",
        "D) Enforce securities laws"
      ],
      "correct_answer": "B",
      "explanation": "The Federal Reserve's primary function is to control monetary policy through interest rates and money supply management.",
      "source": "Federal Reserve System Overview"
    }
  ]
}
```

This specification ensures 