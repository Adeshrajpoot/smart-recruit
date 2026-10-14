import json
from google import genai
from google.genai import errors, types
import time

with open("candidate_profile.json", "r", encoding="utf-8") as file:
    candidate = json.load(file)

from gemini_config import GEMINI_API_KEY
api_key = GEMINI_API_KEY

client = genai.Client(api_key=api_key)


prompt = '''You are an expert technical interviewer.

Analyze the candidate's Resume and GitHub data and generate exactly **45 personalized technical multiple-choice questions (MCQs)** designed to be completed in approximately **90 minutes**.

RULES:

1. Generate exactly **45 questions**.

2. The 45 questions should be reasonably solvable within **90 minutes**. Questions should test technical understanding and reasoning without being unnecessarily long or repetitive.

3. Every question must be grounded in **explicit information present in the candidate data**.

4. Never invent or assume:
   - skills
   - technologies
   - tools
   - architectures
   - implementations
   - responsibilities
   - algorithms
   - results
   - configurations
   - project features
   - performance metrics

5. Distinguish between:
   - **IMPLEMENTED**: explicitly shown as implemented by the candidate.
   - **USED**: a technology or tool explicitly mentioned but without evidence of a specific implementation.
   - **HYPOTHETICAL**: a technical scenario that extends an explicitly mentioned technology, project, or implementation.

6. Never treat a "USED" technology as proof that the candidate implemented a specific feature.

   BAD:
   "You configured Redis eviction policies."

   GOOD:
   "You used Redis. If the cache reached its memory limit, which eviction strategy could you consider?"

7. Factual questions must describe only actions, implementations, technologies, results, or responsibilities explicitly supported by the candidate data.

8. Hypothetical questions must clearly indicate that they are hypothetical by using wording such as:
   - "If you had to..."
   - "How would you..."
   - "What would you do if..."
   - "Suppose..."

9. Focus questions on:
   - implementation
   - code
   - debugging
   - algorithms
   - data structures
   - model evaluation
   - preprocessing
   - training
   - optimization
   - architecture
   - technical trade-offs
   - performance
   - technical reasoning

10. For GitHub evidence, prioritize:
    - actual source code
    - libraries
    - algorithms
    - configurations
    - preprocessing
    - experiments
    - model architecture
    - training
    - evaluation
    - results
    - project-specific implementation details

    Only use information explicitly present in the GitHub data.

11. For Resume evidence, prioritize:
    - explicitly documented responsibilities
    - technologies
    - projects
    - implementations
    - measurable achievements
    - technical experience

12. Avoid generic questions such as:
    - "What is Python?"
    - "What is machine learning?"
    - "What is AWS?"

    Questions should be personalized to the candidate's actual Resume and GitHub evidence.

13. Cover different projects, technologies, and technical areas represented in the candidate data.

14. Avoid duplicate questions. Do not ask the same concept repeatedly with only minor wording changes.

15. Difficulty distribution must be exactly:
    - **14 easy**
    - **16 medium**
    - **15 hard**

    Total: **45 questions**.

    Generate the questions in this order:
    - Questions 1–14: easy
    - Questions 15–30: medium
    - Questions 31–45: hard

16. Every question must contain exactly **four plausible options**:
    - A
    - B
    - C
    - D

17. Each question must have **exactly one correct answer**.

18. Do not use:
    - "All of the above"
    - "None of the above"

19. Randomize the position of the correct answer across A, B, C, and D. Do not always place the correct answer in the same position.

20. The `"correct_answer"` field must contain exactly one of:
    - `"A"`
    - `"B"`
    - `"C"`
    - `"D"`

    It must correspond exactly to the correct option.

21. The `"source"` field must contain exactly one of:
    - `"Resume"`
    - `"GitHub"`
    - `"Resume + GitHub"`

22. The `"reference"` field must identify the specific evidence used to construct the question, such as:
    - project
    - repository
    - source file
    - technology
    - implementation
    - responsibility
    - algorithm
    - experiment
    - documented result

23. The `"reference"` must contain only evidence that actually exists in the candidate data.

24. The `"topic"` field must identify the specific technical area being tested, such as:
    - Python
    - Machine Learning
    - Deep Learning
    - SQL
    - APIs
    - React
    - Data Structures
    - Algorithms
    - Model Evaluation
    - Computer Vision
    - Backend Development

    Only use topics supported by the candidate data.

25. The `"difficulty"` field must contain exactly one of:
    - `"easy"`
    - `"medium"`
    - `"hard"`

26. Do not include explanations, solutions, reasoning, or answer explanations in the output.

27. Do not include any text before or after the JSON.

28. Return **only valid JSON** matching the following structure:

{
    "questions": [
        {
            "question no.": "1",
            "question": "...",
            "options": {
                "A": "...",
                "B": "...",
                "C": "...",
                "D": "..."
            },
            "correct_answer": "B",
            "source": "GitHub",
            "reference": "...",
            "topic": "...",
            "difficulty": "easy"
        }
    ]
}

FINAL VALIDATION BEFORE RETURNING:

Verify all of the following:

- Exactly **45 questions**
- Questions numbered sequentially from **1 to 45**
- Exactly **14 easy questions**
- Exactly **16 medium questions**
- Exactly **15 hard questions**
- Exactly **4 options per question**
- Options are exactly A, B, C, and D
- Exactly one correct answer per question
- `"correct_answer"` matches the correct option
- `"source"` contains only an allowed value
- `"difficulty"` contains only an allowed value
- `"reference"` is supported by candidate data
- No invented candidate information
- No duplicate questions
- No "All of the above"
- No "None of the above"
- Questions are personalized to the candidate
- Questions are appropriate for approximately 90 minutes
- Output is valid JSON
- Do not output Markdown code fences
- Do not output explanations or additional text

CANDIDATE DATA:
''' + json.dumps(candidate, ensure_ascii=False, indent=2)


models = [
    "gemini-3.5-flash-lite",
    "gemini-3.8-flash"
]

response = None
last_error = None

for model in models:
    try:
        print(f"Generating interview questions with {model}...")

        response = client.models.generate_content(
            model=model,
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                temperature=0.2,
                max_output_tokens=20000
            )
        )

        if not response.text:
            raise ValueError(
                f"{model} returned an empty response."
            )

        questions = json.loads(response.text)

        if not isinstance(questions, dict):
            raise ValueError(
                "The response must be a JSON object."
            )

        question_list = questions.get("questions")

        if not isinstance(question_list, list):
            raise ValueError(
                "The response does not contain a questions list."
            )

        if len(question_list) != 45:
            raise ValueError(
                f"Expected 45 questions, received {len(question_list)}."
            )

        expected_counts = {
            "easy": 14,
            "medium": 16,
            "hard": 15
        }

        actual_counts = {
            difficulty: sum(
                1
                for question in question_list
                if question.get("difficulty") == difficulty
            )
            for difficulty in expected_counts
        }

        if actual_counts != expected_counts:
            raise ValueError(
                f"Incorrect difficulty distribution: {actual_counts}"
            )

        for index, question in enumerate(question_list, start=1):
            if question.get("question no.") != str(index):
                raise ValueError(
                    f"Question {index} has an incorrect question number."
                )

            options = question.get("options")

            if not isinstance(options, dict) or set(options) != {
                "A", "B", "C", "D"
            }:
                raise ValueError(
                    f"Question {index} must have options A, B, C and D."
                )

            if question.get("correct_answer") not in {
                "A", "B", "C", "D"
            }:
                raise ValueError(
                    f"Question {index} has an invalid correct_answer."
                )

            if question.get("source") not in {
                "Resume", "GitHub", "Resume + GitHub"
            }:
                raise ValueError(
                    f"Question {index} has an invalid source."
                )

            if not question.get("reference"):
                raise ValueError(
                    f"Question {index} is missing its evidence reference."
                )

        with open(
            "questions.json",
            "w",
            encoding="utf-8"
        ) as file:
            json.dump(
                questions,
                file,
                indent=4,
                ensure_ascii=False
            )

        print(
            f"Successfully generated and validated "
            f"{len(question_list)} questions using {model}."
        )

        break

    except (errors.ServerError, errors.ClientError) as error:
        last_error = error
        status = getattr(error, "code", None)

        if status not in (429, 503):
            raise

        print(
            f"{model} failed with HTTP {status}. "
            "Trying the next configured model."
        )

        response = None

    except (json.JSONDecodeError, ValueError) as error:
        last_error = error

        print(
            f"{model} returned invalid interview output: {error}"
        )

        response = None

if response is None:
    raise RuntimeError(
        "Interview generation failed for every configured model. "
        "Check the preceding error messages and Gemini quota."
    ) from last_error
