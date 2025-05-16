import { list } from './libs/chat.js';

const models = await list()
console.log(`Available models: ${models.length}`);
models.forEach(model => {
    console.log(`- ${model.name} (${Math.round(model.size / 1024 / 1024 / 102.4) / 10} GB)`);
});