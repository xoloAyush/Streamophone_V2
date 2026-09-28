import { Agent } from "../models/agent.model.js";
import { generate } from "../services/ai.service.js";
import { evaluateAgentResponse } from "../services/agent-evaluation.service.js";
import { buildConversationMessages } from "../prompts/agent.prompts.js";
import { agentTests } from "../tests/agent.tests.js";

export async function runAgentTests(req, res) {
    try {
        const delay = (ms) =>
    new Promise((resolve) => setTimeout(resolve, ms));

        const { agentId } = req.body;

        const agent = await Agent.findOne({
            _id: agentId,
            createdBy: req.user._id,
        });

        if (!agent) {
            return res.status(404).json({
                success: false,
                message: "Agent not found",
            });
        }

        const results = [];

        for (const [index, test] of agentTests.entries()) {

    // Wait before every test except the first
    if (index > 0) {
        await delay(5000);
    }

    // Generate Agent response
    const messages = buildConversationMessages(
        agent,
        test.history || [],
        test.input
    );

    const response = await generate(messages);

    // Wait before evaluator request
    await delay(5000);

    // Evaluate response
    const evaluation =
        await evaluateAgentResponse(
            test,
            response,
            test.history || [],
            // agent.behavior
            test.behaviors
        );

    results.push({
    test: test.name,
    input: test.input,
    response,

    overallScore: evaluation.overallScore,

    behaviors: evaluation.behaviors,
});
}

        // Calculate overall score
        const totalScore = results.reduce(
    (sum, result) => sum + result.overallScore,
    0
);

const overallScore =
    results.length > 0
        ? Math.round(totalScore / results.length)
        : 0;

const passed = results.filter(
    (result) =>
        result.behaviors.length > 0 &&
        result.behaviors.every(
            (behavior) => behavior.passed
        )
).length;

const failed = results.length - passed;

        return res.json({
            success: true,

            agent: {
                _id: agent._id,
                name: agent.name,
            },

            summary: {
                total: results.length,
                passed,
                failed,
                overallScore,
            },

            results,
        });

    } catch (error) {
        console.error("Agent test suite error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to run agent tests",
        });
    }
}