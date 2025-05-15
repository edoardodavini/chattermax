import { chat } from './chat.js';

export const summarize = async (context, member, topic, inputMessages) => {
    const messages = [{
        role: 'system',
        content: `You are a ${member.role} of a team of software engineer and product manager. You are tasked to summarize the previous messages about the following topic: ${topic}. Please, provide a summary no longer than 500 words.`
    },
    ...inputMessages
    ];
    const response = await chat(member.model.name, messages);
    return response.message.content;
}

export const evaluateSummary = async (context, member, summary, topic) => {
    const messages = [{
        role: 'system',
        content: `You are a ${member.name}, a ${member.role}. You are evaluating the following summary of a conversation: ${summary}. The topic of the conversation is: ${topic}.`
    },
    {
        role: 'user',
        content: `Please evaluate the summary and evaluate if this is completed. If it reached a reasonable outcome, please explicitly write "Outcome ready" and provide a 1000 words outcome. Use markdown as output, nothing else. Otherwise we need to continue the conversation.`
    }
    ];
    const response = (await chat(member.model.name, messages)).message.content;
    if (response.includes('Outcome ready')) {
        return response
    } else {
        console.log('> > > > > > Summary is not completed yet. Continuing the conversation...');
        return null;
    }
}

