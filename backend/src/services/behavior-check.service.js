export function checkQuestionCount(text) {
    // Remove English translations inside parentheses
    const textWithoutTranslations = text.replace(
        /\([^)]*\)/g,
        ""
    );

    const questionCount =
        (textWithoutTranslations.match(/\?/g) || []).length;

    return {
        questionCount,
        passed: questionCount === 1,
        score: questionCount === 1 ? 100 : 0,
        reason:
            questionCount === 1
                ? "The response contains exactly one question."
                : `The response contains ${questionCount} questions. Exactly one question was required.`,
    };
}

const deterministicChecks = {
    "ask exactly one question per turn":
        checkQuestionCount,
};


export function findDeterministicCheck(behavior) {
    const normalizedBehavior =
        behavior.toLowerCase().trim();

    for (const [rule, check] of Object.entries(
        deterministicChecks
    )) {
        if (normalizedBehavior.includes(rule)) {
            return check;
        }
    }

    return null;
}