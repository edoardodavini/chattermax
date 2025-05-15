// ollama-client.js
import { Ollama } from 'ollama';

const ollama = new Ollama({
  host: 'https://apiai.edoardodavini.it', // Replace with your Ollama server address

})

export const list = async () => (await (ollama.list())).models
export const chat = async (model, messages) => ollama.chat({ model: model, messages: messages })
export const generate = async (model, prompt) => (await ollama.generate({ model: model, prompt: prompt })).response