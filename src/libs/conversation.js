import { chat } from './chat.js';
import { appendToFile, appendToSummaryFile } from './util.js';
import { summarize, evaluateSummary } from './summary.js';

const chatAsMember = async (context, member, contextMessages) => {
    const messages = [{
        role: 'system',
        content: `
You are: ${member.name}
Here is a brief description of you: ${member.description} 
You are part of a group of very smart people.
You are discussing the following startup: ${context.name}
The startup focus is: ${context.topic}.
`
    },
    {
        role: 'admin',
        content: context.summary
    },
    ...contextMessages,
    {
        role: 'system',
        content: `
You are ${member.name}
Try to analyze the startup and its potential.
Analyze previous messages and propose a solution for one single issue that was presented.
Once that's done, analyze the startup and find a new issue that was not presented yet.

Do not repeat what has already been said. Focus only on the content of the message. Do not include any other information or exclamations.
`
    }
    ];
    const response = await chat(member.model.name, messages);
    return response.message.content;
}

export const conversate = async (context) => {
    const randomIndex = Math.floor(Math.random() * context.members.length);
    let member = context.members[randomIndex];
    let outcome = null;
    let messages = []

    while (!outcome) {
        const response = await chatAsMember(context, member, messages);
        console.log(`[${context.step}] ${member.name} (${member.role}) contributed`);
        appendToFile(context, `[${context.step}] ${member.name} (${member.role}): ${response}`);

        messages.push({
            role: 'user',
            content: `I am ${member.name} with the role ${member.role}. This is my insight: ${response}`
        });

        member = context.members.filter(m => m !== member)[Math.floor(Math.random() * (context.members.length - 1))];

        context.step++;
        if (context.step % 5 === 0) {
            console.log(`[${context.step}] Generating summary...`);
            const summary = await summarize(context, member, context.topic, messages);
            console.log(`[${context.step}] Summary generated: it is ${summary.length} characters`);
            context.summary = summary;
            appendToFile(context, 'Summary. \n' + summary);
            appendToSummaryFile(context, `
## Summary. [${context.step}] 

${summary}
            `);
            outcome = await evaluateSummary(context, member, summary, context.topic);

            if (outcome) {
                return outcome
            }
        }
    }
}
