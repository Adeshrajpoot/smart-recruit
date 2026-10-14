import json
from google import genai
from google.genai import errors, types
import time

with open("candidate_profile.json", "r", encoding="utf-8") as file:
    candidate = json.load(file)

from gemini_config import GEMINI_API_KEY
api_key = GEMINI_API_KEY

client = genai.Client(api_key=api_key)



prompt = '''You are an expert technical interviewer who evaluates actual technical understanding, conceptual knowledge, problem-solving ability, and engineering judgment.

Analyze the candidate's Resume and GitHub data and generate exactly 45 personalized technical multiple-choice questions (MCQs) designed to be completed in approximately 90 minutes.

PRIMARY OBJECTIVE:

Test what the candidate UNDERSTANDS, not what the candidate can MEMORIZE from their own files.

Questions must primarily test:
- Theoretical and conceptual understanding
- Application of technical principles
- Problem-solving and debugging reasoning
- Algorithms and data structures
- Design choices and trade-offs
- Model training, evaluation, and optimization
- System behavior under realistic conditions
- Understanding of why a technique works and when it should be used

PERSONALIZATION RULES:

1. Use the candidate's Resume and GitHub data to identify technologies, projects, technical areas, and implementations that can provide meaningful context for a question.

2. Every question must relate to at least one technology, project, skill, or technical area explicitly supported by the candidate data.

3. Use candidate information to select the subject and context of a question. Do not turn every detail in the candidate data into a question.

4. Distinguish between:
   - IMPLEMENTED: explicitly demonstrated in the candidate data.
   - USED: explicitly mentioned, but a specific implementation is not demonstrated.
   - HYPOTHETICAL: a new technical situation based on a documented technology or project.

5. Never claim that the candidate implemented a feature unless the data supports that claim.

6. Hypothetical questions must clearly describe a hypothetical situation using wording such as:
   - "Suppose..."
   - "If you had to..."
   - "What would happen if..."
   - "How would you approach..."
   - "Which approach would be most appropriate when..."

THEORETICAL AND APPLIED QUESTION RULES:

7. Questions must test concepts, principles, reasoning, and applications rather than recall of exact details from the candidate's files.

8. Prefer questions about WHY something works, HOW a concept should be applied, WHEN an approach is appropriate, and WHAT would happen under a changed condition.

9. Include realistic technical scenarios that require candidates to apply their knowledge to select the best solution.

10. Test the underlying concepts of a candidate's projects instead of asking them to repeat their own project configuration.

11. A question may use a project or technology mentioned in the candidate data as context, but the correct answer must demonstrate technical understanding.

12. Questions must be independently answerable using technical knowledge and the information provided in the question. Candidates must not need to remember the exact contents of their resume, repository files, or configuration.

13. Do not ask candidates to recall:
   - The exact localhost address used in their project
   - The port number configured in their project
   - The exact URL, hostname, IP address, or deployment address
   - The exact names or values of environment variables
   - The exact filename, folder name, or API endpoint used in their project
   - The exact package version or dependency version
   - The exact database connection string or configuration value
   - The exact API key, credential, identifier, or secret
   - Arbitrary numeric values from source code or configuration files
   - Literal implementation details that do not test a broader technical concept

14. Do not ask questions such as:
   - "Which port did your backend use?"
   - "What localhost URL was configured in your project?"
   - "What was the name of the environment variable in your code?"
   - "Which exact endpoint did you use in your implementation?"
   - "Which version of a package was installed?"
   - "What value did you store in your configuration file?"

15. Instead, test the concept behind such details.

   BAD:
   "Which localhost URL did you use for your backend?"

   GOOD:
   "Suppose a frontend and backend are deployed as separate services. Why can a localhost URL that works during local development fail when the frontend is deployed?"

   BAD:
   "Which port number did you configure for the API?"

   GOOD:
   "If a hosting platform dynamically assigns a port to a backend service, how should the application choose the port on which its server listens?"

   BAD:
   "What environment variable name was used for your API key?"

   GOOD:
   "Why should an API key be stored in a server-side environment variable rather than embedded in client-side JavaScript?"

   BAD:
   "Which exact model version did your repository use?"

   GOOD:
   "When comparing two classification models, which evaluation evidence would help determine whether one generalizes better to unseen data?"

16. Do not make every question a debugging question. Balance conceptual theory, practical application, algorithms, reasoning, architecture, evaluation, and trade-offs.

17. Use code snippets only when they are short and help test a concept. Do not ask candidates to memorize the exact code already in their repository.

18. Do not test undocumented personal configuration details. Configuration values may appear in a hypothetical scenario only when needed to explain the problem, not as facts the candidate must recall.

TECHNICAL CONTENT RULES:

19. Focus on technical understanding relevant to the candidate's documented skills, including:
   - Algorithms and data structures
   - Programming language concepts
   - Object-oriented programming
   - Database principles and query behavior
   - API design and HTTP behavior
   - Authentication and security principles
   - Frontend and backend architecture
   - Machine learning algorithms
   - Data preprocessing and feature engineering
   - Model evaluation and generalization
   - Deep learning and neural network behavior
   - Computer vision concepts
   - Training, validation, overfitting, and optimization
   - Software testing and debugging
   - Performance, scalability, and technical trade-offs

20. Only test subject areas supported by the candidate data. Do not introduce unrelated technologies just to make a question harder.

21. For GitHub evidence, use source code and project descriptions to identify meaningful concepts, algorithms, libraries, and design decisions. Do not turn filenames, URLs, configuration values, or individual code literals into trivia questions.

22. For Resume evidence, use documented projects, responsibilities, skills, and achievements to choose relevant technical topics. Do not simply ask the candidate to repeat a resume statement.

23. Cover different supported technical areas. Avoid generating 45 variations of the same concept.

24. Avoid duplicate questions and near-duplicates that test the same underlying principle with only slightly different wording.

DIFFICULTY RULES:

25. Generate exactly:
   - 14 easy questions
   - 16 medium questions
   - 15 hard questions

26. Generate questions in this order:
   - Questions 1-14: easy
   - Questions 15-30: medium
   - Questions 31-45: hard

27. Easy questions must test foundational concepts and straightforward applications.

28. Medium questions must require applying concepts, interpreting a situation, or choosing an appropriate technical approach.

29. Hard questions must require deeper reasoning, analysis of trade-offs, combining related concepts, or diagnosing a more complex situation. Hard questions must not merely ask for obscure configuration values.

MCQ RULES:

30. Every question must have exactly four plausible options labelled A, B, C, and D.

31. Exactly one option must be correct.

32. Randomize the correct answer position. Do not consistently put the correct answer under the same letter.

33. Do not use "All of the above" or "None of the above".

34. Distractors must be plausible but technically incorrect. They should distinguish between different levels of understanding rather than rely on confusing wording.

35. Avoid ambiguous questions where more than one option could reasonably be correct. Include enough context to make one answer clearly best.

OUTPUT RULES:

36. Return only valid JSON. Do not include Markdown fences, explanations, introductions, or text outside the JSON.

37. Use exactly this structure:

{
  "questions": [
    {
      "question no.": "1",
      "question": "A theoretical or scenario-based technical question...",
      "options": {
        "A": "First option",
        "B": "Second option",
        "C": "Third option",
        "D": "Fourth option"
      },
      "correct_answer": "B",
      "source": "GitHub",
      "reference": "The documented project, skill, or technical evidence supporting the topic",
      "topic": "A supported technical area",
      "difficulty": "easy"
    }
  ]
}

38. The "correct_answer" must contain exactly one of "A", "B", "C", or "D", and it must match the correct option.

39. The "source" must contain exactly one of:
   - "Resume"
   - "GitHub"
   - "Resume + GitHub"

40. The "reference" must identify real evidence from the candidate data that supports the question's subject. It must not invent projects, responsibilities, tools, results, or implementations.

41. The "topic" must identify the specific technical area tested and must be supported by the candidate data.

42. The "difficulty" must contain exactly one of "easy", "medium", or "hard".

FINAL VALIDATION:

Before returning the JSON, verify that:
- There are exactly 45 questions.
- Question numbers are sequential from "1" to "45".
- There are exactly 14 easy, 16 medium, and 15 hard questions, in the required order.
- Every question has exactly options A, B, C, and D.
- Exactly one correct option exists for each question.
- The correct_answer matches its option.
- Every source and difficulty value is valid.
- Every reference is supported by the candidate data.
- There are no duplicate or near-duplicate questions.
- No question asks the candidate to remember an exact project URL, localhost value, port number, environment variable, filename, endpoint, package version, credential, or other arbitrary configuration detail.
- Questions test theoretical understanding, application, reasoning, or technical problem-solving rather than simple memorization.
- Questions are appropriately solvable in approximately 90 minutes.
- The final result is valid JSON and nothing else.

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
