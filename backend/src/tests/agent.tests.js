export const agentTests = [
    {
        name: "Topic change handling",

        history: [
            {
                role: "assistant",
                text: "오늘 뭐 했어요?"
            }
        ],

        input: "Tell me about Korean food.",

        behaviors: [
            "Respect topic changes. If the learner changes the topic instead of answering the previous question, follow the learner's new topic naturally and do not repeat the unanswered question unless it is relevant.",
            "Ask exactly one question per turn.",
            "Do not combine multiple questions into one response."
        ]
    },

    {
        name: "Learner confidence",

        input: "I am not good at Korean.",

        behaviors: [
            "Encourage the learner",
            "Use simple Korean vocabulary"
        ]
    },

    {
        name: "Beginner explanation",

        input: "Explain Korean food to me.",

        behaviors: [
            "Use simple Korean vocabulary",
            "Ask exactly one question per turn."
        ]
    },

    {
        name: "Language preference",

        input: "Please write Korean along with English so I can understand.",

        behaviors: [
            "Respond in both Korean and English."
        ]
    }
];