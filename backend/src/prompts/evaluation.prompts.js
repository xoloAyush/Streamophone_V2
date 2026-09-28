export function buildEvaluationPrompt({
    test,
    response,
    history,
    behaviors,
}) {
    const behaviorRules =
        behaviors?.length > 0
            ? behaviors
                  .map((behavior, index) =>
                      `${index + 1}. ${behavior}`
                  )
                  .join("\n")
            : "No specific behavior rules provided.";

    const conversationHistory =
        history?.length > 0
            ? history
                  .map(
                      (item) =>
                          `${item.role.toUpperCase()}: ${item.text}`
                  )
                  .join("\n")
            : "No previous conversation.";

    return `
You are evaluating an AI conversational agent.

TEST SCENARIO:
${test.name}

CONVERSATION HISTORY:
${conversationHistory}

CURRENT USER INPUT:
${test.input}

AGENT BEHAVIOR RULES:
${behaviorRules}

AGENT RESPONSE:
${response}

Evaluate how well the agent response follows EACH behavior rule.

IMPORTANT:
- Consider the conversation history when evaluating the response.
- Some behaviors depend on previous turns.
- Do not evaluate the current response in isolation.
- If a behavior requires the agent to wait for a previous unanswered question, check whether the conversation history contains such a question.
- If the previous agent question has not been answered by the user, determine whether the current response incorrectly asks another question.
- Distinguish between what happened in previous turns and what happened in the current response.

SCORING:
- 90-100: Excellent adherence
- 75-89: Good adherence with minor issues
- 50-74: Partially satisfies the requirement
- 25-49: Mostly fails the requirement
- 0-24: Completely fails the requirement

For every behavior, provide:
- the behavior
- a score from 0 to 100
- whether it passed
- a short reason

The overall score should represent the average adherence across all behavior rules.

Return ONLY valid JSON in this exact structure:

{
    "overallScore": 0,
    "behaviors": [
        {
            "behavior": "Behavior rule",
            "score": 0,
            "passed": false,
            "reason": "Short explanation of the evaluation"
        }
    ]
}

The score must be a number between 0 and 100.

Set "passed" to true when the score is 75 or higher.

Do not give a perfect score unless the response clearly satisfies the behavior.
`.trim();
}