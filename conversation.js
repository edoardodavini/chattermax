import { chat } from './chat.js';
import { appendToFile, appendToSummaryFile } from './util.js';
import { summarize, evaluateSummary } from './summary.js';

const chatAsMember = async (member, topic, contextMessages) => {
    const messages = [{
        role: 'system',
        content: `You are a member of a team of software engineer and product manager. You are discussing the following topic: ${topic}. Responses are expected to be short and concise`
    },
    ...contextMessages,
    {
        role: 'system',
        content: `You are ${member.name}: ${member.description}. Your personality is: ${member.personality}. Please, provide a solution no longer than 2 sentences or 50 words.`
    }
    ];
    const response = await chat(member.model.name, messages);
    return response.message.content;
}

export const conversate = async (context, members, topic) => {
    const randomIndex = Math.floor(Math.random() * members.length);
    let member = members[randomIndex];
    let outcome = null;
    let messages = []

    let counter = 0;

    while (!outcome) {
        const response = await chatAsMember(member, topic, messages);
        console.log(`[${counter}] - ${member.name} (${member.role}): ${response}`);
        appendToFile(context, `[${counter}] - ${member.name} (${member.role}): ${response}`);

        messages.push({
            role: 'user',
            content: response
        });

        member = members.filter(m => m !== member)[Math.floor(Math.random() * (members.length - 1))];

        counter++;
        if (member.role === 'Product Manager') {
            const summary = await summarize(context, member, topic, messages);
            console.log(' > > > Summary is:', summary);
            appendToFile(context, 'Summary. \n' + summary);
            appendToSummaryFile(context, `
                ## Summary. [${counter}] 
                
                ${summary}
            `);
            outcome = await evaluateSummary(context, member, summary, topic);

            if (outcome) {
                return outcome
            }
        }
    }
}
