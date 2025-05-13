// ollama-client.js
import { Ollama } from 'ollama';

const ollama = new Ollama({
  host: 'http://192.168.160.250:11434', // Replace with your Ollama server address
})

export const list = async () => ollama.list()
export const chat = async (model, messages) => ollama.chat({ model: model, messages: messages })
export const generate = async (model, prompt) => (await ollama.generate({ model: model, prompt: prompt })).response