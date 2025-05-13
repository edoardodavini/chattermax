// Example usage (in another file, e.g., app.js)
import { list, generate, chat } from './chat.js';
import fs from 'fs';


const URL = 'http://192.168.160.250:11434';
const config = {
    stateful: true
}

async function main(newMembers) {
    try {
        const models = await list()
        const members = modelPicking(newMembers, models.models);

        const topic = await generateTopic({ stateful: config.stateful });
        console.log('Topic is:', topic);

        const outcome = await conversate(members, topic);

        console.log('**************************************************');
        console.log('**************************************************');
        console.log('**************************************************');
        console.log('**************************************************');
        console.log('  ')
        console.log('  ')
        console.log('Outcome is:', outcome);

        // const generateResponse = await generate('Hello, how are you?')
        // console.log('Ollama Generate Response:', generateResponse);
    } catch (error) {
        console.error('Error in main:', error);
    }
}

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


const conversate = async (members, topic) => {
    const randomIndex = Math.floor(Math.random() * members.length);
    let member = members[randomIndex];
    let outcome = null;
    let messages = []

    while (!outcome) {
        const response = await chatAsMember(member, topic, messages);
        console.log(`${member.name} (${member.role}): ${response}`);

        messages.push({
            role: 'user',
            content: response
        });

        member = members.filter(m => m !== member)[Math.floor(Math.random() * (members.length - 1))];

        if (member.role === 'product manager') {
            messages.push({
                role: 'user',
                content: `Normie, please summarize the conversation so far.`
            });
            const summary = await chatAsMember(member, topic, messages);
            messages = [{
                role: 'assistant',
                content: summary
            }]
            console.log('Summary:', summary);
            outcome = await evaluateSummary(member, summary, topic);

            if (outcome) {
                return outcome
            }
        }
    }
}

const evaluateSummary = async (member, summary, topic) => {
    const messages = [{
        role: 'system',
        content: `You are a ${member.name}, a ${member.role}. You are evaluating the following summary of a conversation: ${summary}. The topic of the conversation is: ${topic}.`
    },
    {
        role: 'user',
        content: `Please evaluate the summary and evaluate if this is completed. If it reached a reasonable outcome, please explicitly write "it is over" and provide a 200 words outcome, otherwise we need to continue the conversation.`
    }
    ];
    const response = await chat(member.role, messages);
    if (response.includes('it is over')) {
        return response
    } else {
        console.log('Summary is not completed yet. Continuing the conversation...');
        return null;
    }
}

const modelPicking = (members, models) => {
    models = models.filter(model => model.name !== 'llama4:latest'); // Filter out the llama4:latest model

    return members.map(member => {
        const modelsLength = models.length;
        const model = models[Math.floor(Math.random() * modelsLength)];
        // console.log(`Member: Hi, I'm ${member.name} and I'm picking the ${model.name} model at ${Math.round(model.size / 1024 / 1024 / 102.4) / 10} GB`);

        member.model = model; // Assign the model to the member
        models.splice(models.indexOf(model), 1); // Remove the picked model from the list
        return member;
    }
    );
}

const generateTopic = async ({ stateful = false }) => {
    // console.log('Generating topic...');
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