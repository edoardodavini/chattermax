import { chat } from './chat.js';

export const summarize = async (context, member) => {
    const messages = [
        ...context.messages,
        {
            role: 'system',
            content: `
You are a ${member.role} in a dynamic startup.
The name of the startup is ${context.name}.
You are tasked to summarize the previous messages about the following topic: ${context.topic}. 
Please, provide a summary no longer than 500 words.`
        }
    ];
    const response = await chat(member.model.name, messages);
    return response.message.content;
}

export const evaluateSummary = async (context, member) => {
    const messages = [{
        role: 'system',
        content: `
You are the CEO of the new startup ${context.name}.
Main topic of the startup is ${context.topic}.
You are evaluating the summary of a conversation.
Your goal is to evaluate if the summary is good enough to be used as a final outcome.
`
    },
    {
        role: 'user',
        content: `
This is the summary of the conversation: 

${context.summary}

`
    },
    {
        role: 'system',
        content: `
If the summary is good enough, generate an Outcome, begin the new message with "OUTCOME READY" (case sensitive). Otherwise let the conversation continue.

The outcome must contain an executive plan.
The outcome must include a business plan spannin 2 years.
The outcome must include a financial plan for the first year.
The outcome must include a marketing plan for the first year.
The outcome must include a product plan for the first year. `
    }
    ];
    const response = (await chat(member.model.name, messages)).message.content;
    if (response.includes('OUTCOME READY')) {
        return response
    } else {
        console.log('> > > > > > Summary is not completed yet. Continuing the conversation...');
        return null;
    }
}

export const generateName = async (context, member) => {
    const messages = [
        {
            role: 'system',
            content: `
You are the CEO of the new startup ${context.name}.
You are generating a name for the startup.
`
        },
        {
            role: 'user',
            content: `
This is the outcome of the conversation: ${context.outcome}
`
        },
        {
            role: 'system',
            content: `
Generate a name for the startup. Return only the name. Nothing else should be included.`
        }
    ];
    const response = await chat(member.model.name, messages);
    return response.message.content;
}