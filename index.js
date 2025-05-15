// Example usage (in another file, e.g., app.js)
import { generate, list } from './chat.js';
import { appendToFile, appendToSummaryFile, writeOutcome } from './util.js';
import { conversate } from './conversation.js';
import fs from 'fs';

const context = {
    stateful: false,
    outputFile: 'output.txt',
    summaryFile: 'summary.md',
    outcomeFile: 'outcome.md',
    date: new Date().toISOString().substring(0, 10),
    titleModel: 'qwen2.5vl:7b',
    pickableModels: ['qwen2.5vl:7b'],
    step: 0,
    prompts: {
        topic: 'Generate a random topic for a startup. The topic should be no longer than 80 words.',
    }
}

async function main(newMembers) {
    try {
        await generateTopic(context);
        prepareTitle(context);
        console.log(`>>>> ${context.name} <<<<`)
        context.members = await modelPicking(newMembers, context.pickableModels);
        const outcome = await conversate(context);
        writeOutcome(context, outcome);
        console.log(`OUTCOME HAS BEEN GENERATED. Check the summary file: ${outcome.length} characters`);

    } catch (error) {
        console.error('Error in main:', error);
    }
}


const prepareTitle = (context) => {
    fs.mkdirSync(`runs/${context.date}-${context.name.replaceAll(' ', '-')}`, { recursive: true });
    context.outputFile = `runs/${context.date}-${context.name.replaceAll(' ', '-')}/output.txt`;
    context.summaryFile = `runs/${context.date}-${context.name.replaceAll(' ', '-')}/summary.md`;
    context.outcomeFile = `runs/${context.date}-${context.name.replaceAll(' ', '-')}/outcome.md`;
    appendToFile(context, `Topic: ${context.topic}`);
    appendToSummaryFile(context, `
> ${context.date}

# ${context.name}

> ${context.icon} Topic
> 
> ${context.topic}
>
        `);
}

const modelPicking = async (members, pickableModels) => {
    const availableModels = await list();

    appendToSummaryFile(context, `
-------------
| Name | Model | Size |            
|---|---|---|`);
    return members.map(member => {
        const modelsLength = pickableModels.length;
        const modelName = pickableModels[Math.floor(Math.random() * modelsLength)];
        const model = availableModels.find(m => m.name === modelName);
        if (!model) {
            console.error(`Model ${modelName} not found in available models.`);
            process.exit(1);
        }
        appendToFile(context, `Member: Hi, I'm ${member.name} and I'm picking the ${model.name} model at ${Math.round(model.size / 1024 / 1024 / 102.4) / 10} GB`);
        appendToSummaryFile(context, `| ${member.name} | ${model.name} | ${Math.round(model.size / 1024 / 1024 / 102.4) / 10} GB |`);
        member.model = model; // Assign the model to the member
        return member;
    }
    );
}

const generateTopic = async (context) => {
    context.topic = await generate(context.titleModel, context.prompts.topic);
    context.name = await generate(context.titleModel, `Please, generate a startup name that is focused in achieving this: ${context.topic}. The name should be short and catchy. Return the name only, no other information. Do not include any other information.`);
    context.icon = await generate(context.titleModel, `Please, generate a startup emoji that is representing: ${context.topic}. Return the emoji only, no other information. Do not include any other information.`);
    context.topic = await generate(context.titleModel, `Please, update the topic of the startup ${context.name} to be more catchy and attractive. The topic is: ${context.topic}. Return the topic only, no other information. Do not include any other information.`);
    return { context };
}

const members = [
    {
        name: 'Mark',
        description: 'Mark is a finance senior analyst with a strong background in data analysis and financial modeling. He knows how to build a business case and is always looking for ways to improve processes.',
        role: 'Finance Senior Analyst'
    },
    {
        name: 'David',
        description: 'David is a senior software engineer with expertise in machine learning and pretty much everything. He loves findings bugs and analyzing data from monitoring platforms to collect insights that can drive business decisions.',
        role: 'Software Engineer'
    },
    {
        name: 'Amelie',
        description: 'Amelie is a Business Development Manager. She always focuses on the business side of the product. She is a great communicator and has a strong understanding of market trends and customer needs.',
        role: 'Business Development Manager'
    }
]
main(members);