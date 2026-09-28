import { generate } from "./ai.service.js";
import { buildEvaluationPrompt } from "../prompts/evaluation.prompts.js";
import {
    findDeterministicCheck,
} from "./behavior-check.service.js";


export async function evaluateAgentResponse(
    test,
    response,
    history,
    behaviors
) {
    // -------------------------------
    // 1. Ask LLM to evaluate behavior
    // -------------------------------

    const prompt = buildEvaluationPrompt({
        test,
        response,
        history,
        behaviors,
    });

    const result = await generate(prompt);


    try {

        const cleaned = result
            .replace(/^```json\s*/, "")
            .replace(/\s*```$/, "")
            .trim();

        const evaluation =
            JSON.parse(cleaned);


        if (!Array.isArray(evaluation.behaviors)) {
            throw new Error(
                "Invalid behavior evaluation"
            );
        }


        // -------------------------------
        // 2. Combine LLM + deterministic
        // -------------------------------

        const finalBehaviors =
            evaluation.behaviors.map(
                (behavior) => {

                    const check =
                        findDeterministicCheck(
                            behavior.behavior
                        );


                    // --------------------------------
                    // Deterministic behavior
                    // --------------------------------

                    if (check) {

                        const deterministicResult =
                            check(response);

                        return {
                            behavior:
                                behavior.behavior,

                            score:
                                deterministicResult.score,

                            passed:
                                deterministicResult.passed,

                            reason:
                                deterministicResult.reason,

                            evaluationType:
                                "deterministic",
                        };
                    }


                    // --------------------------------
                    // LLM behavior
                    // --------------------------------

                    return {
                        ...behavior,

                        evaluationType:
                            "llm",
                    };
                }
            );


        // -------------------------------
        // 3. Calculate overall score
        // -------------------------------

        const totalScore =
            finalBehaviors.reduce(
                (sum, behavior) =>
                    sum +
                    Number(
                        behavior.score || 0
                    ),
                0
            );


        const overallScore =
            finalBehaviors.length > 0
                ? Math.round(
                      totalScore /
                          finalBehaviors.length
                  )
                : 0;


        return {
            overallScore,
            behaviors:
                finalBehaviors,
        };


    } catch (error) {

        console.error(
            "Evaluation parse error:",
            error
        );


        return {
            overallScore: 0,
            behaviors: [],
            error:
                "Evaluator returned invalid output",
            raw: result,
        };
    }
}