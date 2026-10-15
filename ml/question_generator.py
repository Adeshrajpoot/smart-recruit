import json
from google import genai
from google.genai import errors, types
import time

with open("candidate_profile.json", "r", encoding="utf-8") as file:
    candidate = json.load(file)

from gemini_config import GEMINI_API_KEY
api_key = GEMINI_API_KEY

client = genai.Client(api_key=api_key)


prompt = '''You are a senior technical interviewer and assessment-engineering expert.

Your task is to analyze the candidate's Resume and GitHub data and generate exactly **45 high-quality personalized technical multiple-choice questions (MCQs)** designed to evaluate the candidate's actual technical understanding, implementation knowledge, debugging ability, reasoning, and engineering judgment.

The goal is NOT to test whether the candidate can memorize facts from their Resume or GitHub.

The goal is to determine whether the candidate **actually understands the technologies and implementations they claim or demonstrate**.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CORE QUESTION-QUALITY PRINCIPLE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Every question must test a technical concept, decision, implementation detail, debugging process, algorithm, trade-off, or reasoning ability that is grounded in evidence from the candidate data.

The candidate's data should be treated as **evidence for selecting the technical domain**, not as a list of facts to memorize.

BAD:

"Which port did your FastAPI application use?"

Why this is bad:

* Tests memorization.
* Has almost no technical reasoning value.
* Does not measure engineering competence.

BAD:

"Which library did you use for face detection?"

Why this is weak:

* The answer may be directly copied from the Resume.
* It tests recognition rather than understanding.

GOOD:

"Your project uses MediaPipe for facial landmark detection. Suppose the system starts reporting frequent false 'no face' events when the candidate briefly turns their head. Which change would most directly reduce this problem without retraining the entire system?"

This tests:

* understanding of the existing technology
* computer-vision behavior
* temporal reasoning
* practical engineering judgment

GOOD:

"Your pipeline converts facial landmark observations into aggregated behavioral features before passing them to an XGBoost classifier. If the classifier performs well on training data but poorly on unseen interview sessions, which change would be the most appropriate first investigation?"

This tests:

* understanding of the actual pipeline
* overfitting/generalization
* feature distribution
* model evaluation

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. EVIDENCE-GROUNDED PERSONALIZATION
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Every question must be grounded in explicit evidence from the candidate's Resume or GitHub data.

Never invent:

* skills
* technologies
* libraries
* frameworks
* architectures
* algorithms
* implementations
* responsibilities
* datasets
* results
* performance metrics
* configurations
* deployment environments
* model architectures
* project features

Distinguish evidence into:

IMPLEMENTED:
The candidate's data explicitly shows that the candidate implemented or wrote the relevant functionality.

USED:
The candidate's data explicitly mentions a technology/tool/library, but does not prove a specific implementation.

HYPOTHETICAL:
A technical scenario extending an explicitly supported technology, implementation, project, or concept.

If evidence only establishes that a technology was USED, do NOT claim that the candidate implemented a particular feature.

Example:

BAD:
"You configured Redis eviction policies."

GOOD:
"You used Redis. Suppose the cache begins reaching its memory limit. Which eviction strategy would you consider if recently accessed entries should remain available?"

The hypothetical must still be technically connected to the candidate's actual evidence.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
2. NO FACT-RECALL / CONFIGURATION-RECALL QUESTIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

DO NOT generate questions whose answer is simply a value, name, path, filename, port, URL, version, configuration value, or other easily memorized detail from the candidate data.

Unless the value itself is technically important to a deeper reasoning question, do NOT ask about:

* localhost ports
* IP addresses
* URLs
* API endpoint names
* filenames
* directory names
* package versions
* model filenames
* environment variable names
* exact configuration values
* project folder names
* repository names as answers
* dates
* trivial library names
* exact command syntax
* trivial implementation labels

BAD:

"Which port was used by the FastAPI service?"

BAD:

"What was the name of the Python file containing the model?"

BAD:

"Which repository contained the ML project?"

BAD:

"Which version of Python did the candidate use?"

These questions have low assessment value.

Instead, transform the evidence into a technical reasoning question.

Example:

Evidence:
FastAPI service exposes a prediction endpoint.

GOOD:
"Suppose the FastAPI prediction endpoint becomes slow when several candidates are being assessed simultaneously. Which architectural change would be the most appropriate first investigation?"

Example:

Evidence:
The project uses a serialized ML model.

GOOD:
"Suppose the model loads correctly during development but fails after deployment because the serialized model was created with a different dependency version. What is the most appropriate way to prevent this class of deployment failure?"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
3. TEST UNDERSTANDING, NOT MEMORY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Prefer questions that require the candidate to:

* choose an appropriate algorithm
* identify a bug
* diagnose a failure
* interpret model behavior
* reason about data preprocessing
* select an evaluation metric
* identify data leakage
* reason about overfitting
* analyze computational complexity
* choose an appropriate data structure
* compare architectural approaches
* reason about API behavior
* identify a scalability problem
* choose a debugging strategy
* interpret an experiment
* identify a bottleneck
* reason about edge cases
* analyze trade-offs
* improve robustness
* identify incorrect assumptions
* predict the consequence of a technical change

Avoid questions where the answer can be obtained simply by scanning the candidate data.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
4. QUESTION TRANSFORMATION RULE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

For every piece of candidate evidence, ask:

"What technical understanding can be tested using this evidence?"

NOT:

"What fact can I ask about this evidence?"

Example:

Candidate evidence:
"Used scikit-learn."

Do NOT ask:

"Which library was used for machine learning?"

Instead ask something like:

"Suppose a scikit-learn classification model achieves 96% accuracy, but only 5% of the samples belong to the positive class. Which additional evaluation measure would provide more useful information about minority-class performance?"

The question is personalized because the candidate has demonstrated use of scikit-learn, while the assessment tests actual ML understanding.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
5. SCENARIO-BASED QUESTIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

At least **60% of the 45 questions must be scenario-based or reasoning-based**.

Use realistic technical situations related to the candidate's actual projects.

Useful structures include:

* "Suppose..."
* "If you had to..."
* "What would you do if..."
* "A bug appears where..."
* "The system suddenly..."
* "During deployment..."
* "The model performs well on training data but..."
* "Two approaches are producing..."
* "If the input distribution changes..."
* "If the number of users increases..."
* "If this component fails..."
* "Which change would most likely..."
* "What is the most appropriate first step..."

Do NOT make every question hypothetical.

Mix:

1. Implementation understanding
2. Debugging
3. Technical reasoning
4. Code behavior
5. Algorithm selection
6. Model evaluation
7. Architecture
8. Trade-offs
9. Project-specific knowledge

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
6. CODE-REASONING QUESTIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

When the candidate's GitHub contains meaningful source code, prioritize questions derived from actual code behavior.

Questions may ask the candidate to determine:

* what a code segment does
* what output it produces
* why an implementation fails
* which edge case breaks it
* how complexity changes
* which modification fixes a bug
* which implementation is more efficient
* what happens when input changes
* why a library/API call is appropriate
* how data flows through the implementation

Do NOT simply ask:

"What function did you write?"

Instead ask:

"Given the preprocessing approach used in the project, what would happen if a previously unseen category appears during inference?"

Only generate such questions when the relevant code/evidence actually exists.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
7. DEBUGGING QUESTIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Include debugging questions when the candidate's technology/project evidence supports them.

A good debugging question should provide:

* a realistic symptom
* relevant technical context
* several plausible causes or fixes
* exactly one best answer

Example:

"The model works correctly during local development but fails during deployment after loading the serialized model. The deployment environment uses a different scikit-learn version. Which investigation should be performed first?"

The distractors should represent realistic engineering mistakes.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
8. DISTRACTOR QUALITY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Every question must have four plausible options.

Do NOT create obviously incorrect distractors.

BAD:

A. Use machine learning
B. Restart the computer
C. Delete the project
D. Do nothing

GOOD distractors should represent:

* a common misconception
* a technically possible but inappropriate approach
* a solution that addresses a different problem
* an approach that works under different assumptions

The correct answer must be distinguishable because it is technically superior, NOT because the other options are obviously absurd.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
9. EXACT DIFFICULTY DISTRIBUTION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Generate exactly:

Questions 1–14:
14 EASY

Questions 15–30:
16 MEDIUM

Questions 31–45:
15 HARD

Difficulty should reflect reasoning complexity, not question length.

EASY:

* basic implementation understanding
* straightforward code behavior
* fundamental concepts directly related to candidate evidence
* simple debugging
* direct technical reasoning

MEDIUM:

* multi-step reasoning
* implementation trade-offs
* debugging
* model evaluation
* preprocessing
* API behavior
* moderate algorithmic reasoning

HARD:

* architecture
* optimization
* scalability
* subtle bugs
* model generalization
* data leakage
* complex debugging
* system trade-offs
* algorithmic reasoning
* advanced project-specific scenarios

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
10. EXACTLY ONE CORRECT ANSWER
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Every question must have exactly four options:

A
B
C
D

There must be exactly one technically correct answer.

Do not use:

* All of the above
* None of the above
* Multiple correct answers
* ambiguous answers
* answers dependent on unstated assumptions

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
11. ANSWER POSITION RANDOMIZATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Randomize the correct answer position across A, B, C, and D.

Do NOT create a predictable pattern such as:

A, B, C, D, A, B, C, D

The correct answer should not systematically favor one option.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
12. COVERAGE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Cover different technical areas represented in the candidate data.

Prioritize:

* actual projects
* source code
* algorithms
* preprocessing
* model training
* model evaluation
* debugging
* architecture
* APIs
* databases
* backend
* frontend
* computer vision
* deep learning
* machine learning
* data structures
* algorithms
* optimization
* deployment

Only use areas actually supported by the candidate data.

Do NOT force coverage of a topic that the candidate has not demonstrated.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
13. PROJECT-SPECIFIC QUESTIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Questions should make it difficult for another candidate to answer them without having similar technical experience.

For example, instead of:

"What is XGBoost?"

Ask:

"Your project uses XGBoost after converting facial-observation data into structured behavioral features. Suppose training accuracy is high but performance drops substantially on unseen interview sessions. Which investigation would best determine whether the feature distributions differ between training and deployment data?"

This tests both:

* XGBoost understanding
* understanding of the candidate's project pipeline

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
14. RESUME VS GITHUB EVIDENCE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

For GitHub evidence, prioritize:

1. actual source code
2. algorithms
3. preprocessing
4. model architecture
5. training code
6. evaluation
7. experiments
8. libraries actually imported
9. API implementation
10. configuration that has technical significance

For Resume evidence, prioritize:

1. documented responsibilities
2. project implementations
3. technical experience
4. measurable achievements
5. technologies
6. documented engineering decisions

When both sources support the same concept, use:

"Resume + GitHub"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
15. SOURCE AND REFERENCE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

"source" must contain exactly one of:

"Resume"
"GitHub"
"Resume + GitHub"

"reference" must identify the actual evidence used to construct the question.

Examples:

"XGBoost classifier used in the face-activity prediction pipeline"

"FastAPI prediction endpoint implemented in api.py"

"MediaPipe Face Landmarker used for facial landmark extraction"

"scikit-learn preprocessing implemented in the model training pipeline"

Do NOT put unsupported claims into the reference.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
16. NO GENERIC QUESTIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Avoid generic textbook questions such as:

"What is Python?"

"What is machine learning?"

"What is AWS?"

"What is an API?"

"What is XGBoost?"

"What is React?"

Instead connect the concept directly to the candidate's demonstrated technology or project.

BAD:

"What is XGBoost?"

GOOD:

"Your project uses XGBoost for classification. Which characteristic of gradient-boosted decision trees makes the method particularly suitable for structured tabular features compared with directly feeding raw image pixels into the classifier?"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
17. NO REPETITION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Do not ask the same underlying concept multiple times.

For example, do not create five questions about:

* overfitting
* MediaPipe
* Python lists
* REST APIs
* XGBoost

with only minor wording changes.

Each question should test a distinct skill.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
18. 90-MINUTE ASSESSMENT DESIGN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Generate questions that can reasonably be completed in approximately 90 minutes.

Target approximately:

* Easy: 60–90 seconds
* Medium: 2 minutes
* Hard: 2–3 minutes

Avoid unnecessarily long questions.

However, do not make questions artificially short if technical context is required.

The assessment should favor **quality of reasoning over reading complexity**.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
19. QUESTION CONSTRUCTION CHECK
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Before accepting each question, internally verify:

1. What candidate evidence caused me to generate this question?
2. Is that evidence explicitly present?
3. Does the question test understanding rather than memorization?
4. Could the candidate answer it by simply reading their Resume?
5. If yes, rewrite it.
6. Does it require technical reasoning?
7. Are all four options plausible?
8. Is exactly one option technically correct?
9. Is the correct answer independent of unstated assumptions?
10. Is the question distinct from the other questions?

If the question can be answered by simply looking up a filename, port, URL, technology name, repository name, or configuration value, reject it and generate a reasoning-based replacement.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
20. FINAL OUTPUT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Return ONLY valid JSON.

Do not include:

* Markdown
* code fences
* explanations
* analysis
* introductions
* conclusions
* answer explanations

Use exactly this structure:

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

FINAL VALIDATION:

Before returning the JSON, verify:

* Exactly 45 questions
* Questions numbered 1 through 45
* Exactly 14 easy
* Exactly 16 medium
* Exactly 15 hard
* Exactly 4 options per question
* Options are exactly A, B, C, D
* Exactly one correct answer per question
* correct_answer matches the correct option
* Correct answers are reasonably distributed across A/B/C/D
* source is valid
* difficulty is valid
* reference is supported by candidate evidence
* No invented candidate information
* No generic textbook questions
* No configuration-recall questions
* No port/URL/filename/version trivia
* At least 60% of questions are scenario/reasoning based
* Questions require technical understanding
* Questions are personalized
* Questions are non-duplicative
* No "All of the above"
* No "None of the above"
* Questions are appropriate for approximately 90 minutes
* Output is valid JSON
* No text appears outside the JSON

CANDIDATE DATA:

''' + json.dumps(candidate, ensure_ascii=False, indent=2)


i = 0
while i == 0:
    try:
        response = client.models.generate_content(
            model="gemini-3.5-flash-lite",
            contents=prompt
        )
        i = 1
    except errors.ServerError as e:
        if e.code == 503:
            print("Server busy. Retrying in 15 seconds...")
            time.sleep(15)
    except errors.ClientError as e:
        if e.code == 429:
            print("Rate limit reached. Switching to Gemini 3.7 Flash...")
            response = client.models.generate_content(
                model="gemini-3.5-flash",
                contents=prompt
            )
            i = 1

questions = json.loads(response.text)

with open("questions.json", "w", encoding="utf-8") as file:
    json.dump(
        questions,
        file,
        indent=4,
        ensure_ascii=False
    )
