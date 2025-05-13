// Example usage (in another file, e.g., app.js)
import { list, generate } from './chat.js';

const URL = 'http://192.168.160.250:11434';
const MODEL_NAME = 'gemma3:4b'

async function main(members) {
    try {
        const models = await list()
        modelPicking(members, models.models);

        const topic = await generateTopic()
        console.log('Topic:', topic);

        // const generateResponse = await generate('Hello, how are you?')
        // console.log('Ollama Generate Response:', generateResponse);
    } catch (error) {
        console.error('Error in main:', error);
    }
}

const modelPicking = async (members, models) => {
    // console.log('Available models:', models);
    models = models.filter(model => model.name !== 'llama4:latest'); // Filter out the llama4:latest model
    for (const member of members) {
        const modelsLength = models.length;
        const model = models[Math.floor(Math.random() * modelsLength)];
        console.log(`Member: Hi, I'm ${member.name} and I'm picking the ${model.name} model at ${Math.round(model.size / 1024 / 1024 / 102.4) / 10} GB`);

        models.splice(models.indexOf(model), 1); // Remove the picked model from the list
    }
}

const generateTopic = async () => {
    console.log('Generating topic...');
    return generate('gemma3:12b', 'Please, help me define a topic for a meeting. The topic should be focused on enhancing an idea for a new startup. Generate the idea itself, max 100 words. Do not include any other information.');
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