import fs from 'fs';

export const appendToFile = (context, content) => {
    fs.appendFileSync(context.outputFile, content + '\n')
}
export const appendToSummaryFile = (context, content) => {
    fs.appendFileSync(context.summaryFile, content + '\n')
}
export const writeOutcome = (context, content) => {
    fs.appendFileSync(context.outcomeFile, `
> ${context.date}
> ${context.step} steps completed

# ${context.icon} ${context.name}
 
${content}

`)
}

export const uuid = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}
