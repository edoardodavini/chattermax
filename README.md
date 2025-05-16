# ChatterMax

A Magic AI that chats with himself to generate business ideas

> Disclaimer: this is mostly a toy, not a real thingy. I am mostly playing with the idea of limitless conversations among LLMs


## How to run it locally

### Use my Ollama

> That's unlikely to be always running, but that's fun to think that's running

1. `git clone`
2. `npm i`
3. `npm run chat`
4. 😎 Enjoy!


### Do it yourself

> At least you do not rely on me

1. `git clone`
2. `docker compose up`
    1. `ollama pull qwen2.5vl:7b` (or whatever model you want to use)
3. `npm i`
4. Change the IP in `chat.js` wrapper to your local thing, most likely `localhost:11434` or something like that
5. `npm run chat`
6. 😎 Enjoy!


## Customize it

Too lazy to make the yml, go to `index.js`

These are the most interesting options to change. 
- Add and use models
- Change the topic prompt
- Change other prompts [TODO]

```
    titleModel: 'qwen2.5vl:7b',
    pickableModels: ['qwen2.5vl:7b'],
    prompts: {
        topic: 'Generate a random topic for a startup. The topic should be no longer than 80 words.',
    }
```

