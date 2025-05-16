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
