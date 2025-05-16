import { chat } from './chat.js';
import { appendToFile, appendToSummaryFile } from './util.js';
import { summarize, evaluateSummary, generateName } from './summary.js';

const chatAsMember = async (context, member) => {
    const messages = [{
        role: 'system',
        content: `
You are: ${member.name}
Here is a brief description of you: ${member.description} 
You are part of a group of very smart people.
You are discussing the idea of launching a startup.
You are united together to define what should be the focus of the startup.
`
    },
    {
        role: 'admin',
        content: context.summary
    },
    ...context.messages,
    {
        role: 'system',
        content: `
You are ${member.name}
Here is a brief description of you: ${member.description} 
You are trying to analyze a good idea for a startup.
Analyze previous messages and try to propose an idea for a startup.
If an idea is already proposed, try to improve it or find a fluke in it.

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

    while (!outcome) {
        const response = await chatAsMember(context, member);
        console.log(`[${context.step}] ${member.name} (${member.role}) contributed`);
        context.messages.push({
            role: 'user',
            content: `I am ${member.name} with the role ${member.role}. This is my insight: ${response}`
        });
        appendToFile(context, `[${context.step}] ${member.name} (${member.role}): ${response}`);

        member = context.members.filter(m => m !== member)[Math.floor(Math.random() * (context.members.length - 1))];

        context.step++;
        if (context.step % 5 === 0) {
            console.log(`[${context.step}] Generating summary...`);
            context.summary = await summarize(context, member);
            console.log(`[${context.step}] Summary generated: it is ${context.summary.length} characters`);
            appendToFile(context, 'Summary. \n' + context.summary);
            appendToSummaryFile(context, `
## Summary. [${context.step}] 

${context.summary}
            `);
            context.outcome = await evaluateSummary(context, member, context.summary, context.topic);
            context.name = await generateName(context, member);

            if (context.outcome) {
                return context.outcome
            }
        }
    }
}
