import { generate, list } from './libs/chat.js';
import { appendToFile, appendToSummaryFile, writeOutcome, uuid } from './libs/util.js';
import { conversate } from './libs/conversation.js';
import fs from 'fs';

const context = {
    stateful: false,
    outputFile: 'output.txt',
    summaryFile: 'summary.md',
    outcomeFile: 'outcome.md',
    date: new Date().toISOString().substring(0, 10),
    titleModel: 'llama4:scout',
    pickableModels: ['llama4:scout'],
    step: 0,
    uuid: uuid(),
    messages: [],
    summary: '',
    outcome: null,
    prompts: {
        topic: 'Propose a random topic for a startup. The topic should be no longer than 120 words.'
    }
}

async function main(newMembers) {
    try {
        console.log(`>>>> ${context.uuid} <<<<`)
        prepareDir(context);
        context.members = await modelPicking(newMembers, context.pickableModels);
        const outcome = await conversate(context);
        updateDir(context);
        writeOutcome(context, outcome);
        console.log(`OUTCOME HAS BEEN GENERATED. Check the summary file: ${outcome.length} characters`);

    } catch (error) {
        console.error('Error in main:', error);
    }
}

const updateDir = (context) => {
    const dirName = `runs/${context.date}-${context.name}`;
    fs.mkdirSync(dirName, { recursive: true });
    context.outputFile = `${dirName}/output.txt`;
    context.summaryFile = `${dirName}/summary.md`;
    context.outcomeFile = `${dirName}/outcome.md`;
    fs.cpSync(`runs/${context.date}-${context.uuid}`, dirName, { recursive: true, force: true });
    fs.rmSync(`runs/${context.date}-${context.uuid}`, { recursive: true, force: true });
}

const prepareDir = (context) => {
    const dirName = `runs/${context.date}-${context.uuid}`;
    fs.mkdirSync(dirName, { recursive: true });
    context.outputFile = `${dirName}/output.txt`;
    context.summaryFile = `${dirName}/summary.md`;
    context.outcomeFile = `${dirName}/outcome.md`;
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