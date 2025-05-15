// Example usage (in another file, e.g., app.js)
import { list, generate, chat } from './chat.js';
import { appendToFile, appendToSummaryFile } from './util.js';
import { conversate } from './conversation.js';
import fs from 'fs';

const context = {
    stateful: false,
    outputFile: 'output.txt',
    summaryFile: 'summary.md',
    date: new Date().toISOString().substring(0, 19).replace('T', '_').replace(/:/g, '-')
}

async function main(newMembers) {
    fs.mkdirSync(`runs/${context.date}`, { recursive: true });
    context.outputFile = `runs/${context.date}/output.txt`;
    context.summaryFile = `runs/${context.date}/summary.md`;
    try {
        const topic = await generateTopic({ stateful: context.stateful });
        appendToFile(context, `Topic: ${topic}`);
        appendToSummaryFile(context, `
            > ${context.date}

            Topic: ${topic}
        `);

        const models = {
            models: [
                { name: 'gemma3:1b' },
                { name: 'gemma3:1b' },
                { name: 'gemma3:1b' },
                { name: 'gemma3:1b' }
            ]
        }
        const members = modelPicking(newMembers, models.models);

        const outcome = await conversate(context, members, topic);
        appendToSummaryFile(context, `

            # OUTCOME 
            
            ${outcome}
        `);

        console.log('**************************************************');
        console.log('  ')
        console.log('Outcome is:', outcome);
        console.log('  ')
        console.log('**************************************************');

    } catch (error) {
        console.error('Error in main:', error);
    }
}


const modelPicking = (members, models) => {

    return members.map(member => {
        const modelsLength = models.length;
        const model = models[Math.floor(Math.random() * modelsLength)];
        appendToFile(context, `Member: Hi, I'm ${member.name} and I'm picking the ${model.name} model at ${Math.round(model.size / 1024 / 1024 / 102.4) / 10} GB`);
        appendToSummaryFile(context, `Member: ${member.name}. Model: ${model.name}. Size: ${Math.round(model.size / 1024 / 1024 / 102.4) / 10} GB`);

        member.model = model; // Assign the model to the member
        models.splice(models.indexOf(model), 1); // Remove the picked model from the list
        return member;
    }
    );
}


const generateTopic = async ({ stateful = false }) => {
    let topic = '';
    if (stateful && fs.existsSync('topic.txt')) {
        topic = fs.readFileSync('topic.txt', 'utf-8');
        console.log('Topic loaded from file:', topic);
    } else {
        topic = await generate('gemma3:12b', 'Please, help me define a topic for a meeting. The topic should be focused on enhancing an idea for a new startup. Generate the idea itself, max 100 words. Do not include any other information.');
        fs.writeFileSync('topic.txt', topic);
    }
    return topic;
}

const members = [
    {
        name: 'Lame',
        description: 'Lame is an intern software engineer with a passion for coding and technology.He is always eager to learn new skills. He is a bit careful and sometimes overthinks things, but he is a quick learner and is always willing to help others.',
        personality: 'Lame is a young and careful person. Overthinks things a lot and he is usually avoiding getting himself in risky situations. He prefer playing safe and is a bit of a coward.',
        role: 'Intern Software Engineer'
    },
    {
        name: 'Guru',
        description: 'Guru is a senior software engineer with expertise in machine learning and pretty much everything. He loves findings bugs and analyzing data from monitoring platforms to collect insights that can drive business decisions.',
        personality: 'Guru is a middle-age, grown, wise and very smart person. Even if he knows pretty much everything, he is not very deep in any specific topic. He is not afraid to share his opinions, he likes to fix issues and he is capable of taking risks if needed.',
        role: 'Data Scientist'
    },
    {
        name: 'Geek',
        description: 'Geek is a DevOps engineer with experience in cloud computing and infrastructure management. He is passionate about automation and improving deployment processes.',
        personality: 'Geek is a young, turbulent genius. He likes to take risks, even when not necessarily needed. Doing so, he often finds himself in trouble. Thanks to his extraordinary intelligence, he usually comes out of those troubles with little-to-no consequences, even if that requires a lot of work.',
        role: 'DevOps Engineer'
    },
    {
        name: 'Normie',
        description: 'Normie is a product manager. He enjoys working with cross-functional teams to deliver high-quality products. He has great communication skills and is always looking for ways to improve processes.',
        personality: 'Normie is a grown adult, wise and calm. He do not speack much, prefers to listen and is very careful with his words. Everyone has high esteem of him and he is very well respected. His opinions are usually the ones that matter the most.',
        role: 'Product Manager'
    }
]
main(members);