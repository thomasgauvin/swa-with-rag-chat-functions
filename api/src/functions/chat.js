const { app } = require('@azure/functions');
const { SearchClient, AzureKeyCredential } = require("@azure/search-documents");
const { OpenAIClient } = require("@azure/openai");
const OpenAI = require("openai")

app.setup({ enableHttpStream: true });

const openai = new OpenAI({
    apiKey: process.env["OPENAI_KEY"]
});

app.http('chat', {
    methods: ['GET', 'POST'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        context.log(`Http function processed request for url "${request.url}"`);
        
        const question = request.query.get('question');
        const topNDocs = await retrieveTopNDocuments(question);
        const streamingOpenAIResponse = await getChatResponseOpenAI(question, topNDocs);
        const processedStream = convertOpenAIStreamToExtractedContentStream(streamingOpenAIResponse);
    
        return {
            body: processedStream,
            headers: {
                'Content-Type': 'text/event-stream'
            }
        }
    }
});

async function retrieveTopNDocuments(query, n = 3){
    const aiSearchKey = process.env["AI_SEARCH_KEY"];
    const aiSearchEndpoint = process.env["AI_SEARCH_ENDPOINT"];
    const aiSearchIndex = process.env["AI_SEARCH_INDEX"];

    const client = new SearchClient(aiSearchEndpoint, aiSearchIndex, new AzureKeyCredential(aiSearchKey));

    const searchResults = await client.search(query, {
        top: 3,
        select:  ["chunk", "title"]
    });

    const resultsArray = [];
    for await (const result of searchResults.results) {
        resultsArray.push(result)
    }

    return resultsArray;
}

async function getChatResponseOpenAI(query, topNDocs){
    //adapted from https://github.com/Azure-Samples/azure-search-openai-javascript
    const openaiKey = process.env["OPENAI_KEY"];

    const openai = new OpenAI({
        apiKey: openaiKey, // This is the default and can be omitted
      });

    const SYSTEM_CHAT_TEMPLATE = `You are an intelligent assistant helping Azure Static Web Apps customers with questions regarding the content on the Static Web Apps blog.
    Use 'you' to refer to the individual asking the questions even if they ask with 'I'.
    Answer the following question using only the data provided in the sources below.
    For tabular information return it as an html table. Do not return markdown format.
    You must include the source of the file from which you find the answer.
    Each source has a name followed by colon and the actual information, always include the source name for each fact you use in the response.
    If you cannot answer using the sources below, say you don't know. Use below example to answer.
    Only answer the question without including unnecessary details about other topics. 
    Answer in a single sentence. You must Keep the answer to 30 words or less. The answer should be succinct.
    `;

    // shots/sample conversation
    const SAMPLE_QUESTION = ` 
    'What is snippets?'
    Sources:
    [announcing-snippets-and-traffic-splitting-for-azure-static-web-apps.html]: <p>With snippets for Azure Static Web Apps, you can specify code that will be injected into each page of your website without having to change your application’s source code. Snippets are configured on the Static Web Apps resource and get injected at runtime by the Static Web Apps host (when the site is being served).</p> <p>When providing your snippet, you can indicate which environment it should be applied to, and you can configure the code snippet to be appended or prepended to the head or the body or your website’s pages. To configure snippets for your Azure Static Web Apps resource, you can use the Azure Portal’s configuration page as&nbsp;<a href="https://aka.ms/swa/snippets" target="_blank" rel="noreferrer noopener">documented</a>.</p> <p>With this feature, snippets are centralized and configured from the Azure resource itself, decoupled from the application code. This can facilitate the management of snippets across Azure resources, environments, and teams, and avoids the need to depend on complex build processes to inject snippets.</p>
    [this-month-in-azure-static-web-apps-november-december-2023.html]: <p><em>The Community Standups livestream happens on the last Thursday of each month. Join us for the next one&nbsp;for some&nbsp;interactive demo and discussions.</em></p> <p>This was our last livestream of 2023, but join us again in January as we kickoff the new year with some announcements. This month we walk through using Static Web Apps to build OpenAI chat applications with retrieval augmented generated responses.<em>&nbsp;<strong>Check out&nbsp;</strong></em><strong><a href="https://www.youtube.com/playlist?list=PLI7iePan8aH4AiiQ6UejZ4lxmbK3QX4Dy" target="_blank" rel="noreferrer noopener"><em>past episodes</em></a><em>&nbsp;for more exciting demos and guests!</em>&nbsp;</strong></p> <h1 class="wp-block-heading has-large-font-size">Community Highlights&nbsp;</h1><h3 class="wp-block-heading has-medium-font-size"><strong>Recent Azure Static Web Apps announcements:</strong></h3><ul><li><a href="https://techcommunity.microsoft.com/t5/apps-on-azure-blog/build-and-deploy-net-8-blazor-wasm-apps-with-serverless-apis/ba-p/3988412">Build serverless full-stack .NET 8 applications with Blazor WebAssembly and Azure Static Web Apps</a></li></ul>
    `;

    const SAMPLE_ANSWER = `Snippets is a feature for Azure Static Web Apps that lets you inject code for every page of your site that is managed separately from your source code. [announcing-snippets-and-traffic-splitting-for-azure-static-web-apps.html]`;

    const QUESTION = `${query}\nSources:${topNDocsToString(topNDocs)}`;

    const streamingChatCompletion = await openai.beta.chat.completions.stream({
        messages: [{ role: 'system', content: `${SYSTEM_CHAT_TEMPLATE} ${SAMPLE_QUESTION} ${SAMPLE_ANSWER}`},
            {role: 'user', content: QUESTION}
        ],
        model: 'gpt-3.5-turbo',
        stream: true
    });
    
    // const chatCompletion = await openai.chat.completions.create({
    //     messages: [{ role: 'system', content: `${SYSTEM_CHAT_TEMPLATE} ${SAMPLE_QUESTION} ${SAMPLE_ANSWER}`},
    //         {role: 'user', content: QUESTION}
    //     ],
    //     model: 'gpt-3.5-turbo',
    // });


    return streamingChatCompletion;
}

//helpers
function topNDocsToString(topNDocs){
    let topNDocsString = '';
    for(const doc of topNDocs){
        topNDocsString += `[${doc.document["title"]}] \n `
        topNDocsString += doc.document["chunk"]
    }
    return topNDocsString;
}

function convertOpenAIStreamToExtractedContentStream(streamOpenAI){
    let stream = new ReadableStream({
        async start(controller) {
            try {
                for await (const part of streamOpenAI) {
                    controller.enqueue(part.choices[0]?.delta.content || '');
                }
                controller.close();
                return;
            } catch (err) {
                controller.close();
                throw error(500, 'Error while processing data stream.')
            }
        },
    })

    return stream;
}


// async function getChatResponseAzureOpenAI(query, topNDocs){
//     //adapted from https://github.com/Azure-Samples/azure-search-openai-javascript
//     const azureOpenAIKey = process.env["AZURE_OPENAI_KEY"];
//     const azureOpenAIDeploymentId = process.env["AZURE_OPENAI_DEPLOYMENT_ID"];
//     const azureOpenAIEndpoint = process.env["AZURE_OPENAI_ENDPOINT"];

//     const client = new OpenAIClient(azureOpenAIEndpoint, new AzureKeyCredential(azureOpenAIKey));

//     const SYSTEM_CHAT_TEMPLATE = `You are an intelligent assistant helping Azure Static Web Apps customers with questions regarding the content on the Static Web Apps blog.
//     Use 'you' to refer to the individual asking the questions even if they ask with 'I'.
//     Answer the following question using only the data provided in the sources below.
//     For tabular information return it as an html table. Do not return markdown format.
//     You must include the source of the file from which you find the answer.
//     Each source has a name followed by colon and the actual information, always include the source name for each fact you use in the response.
//     If you cannot answer using the sources below, say you don't know. Use below example to answer.
//     Only answer the question without including unnecessary details about other topics. 
//     Answer in a single sentence. You must Keep the answer to 30 words or less. The answer should be succinct.`;

//     // shots/sample conversation
//     const SAMPLE_QUESTION = ` 
//     'What happens if a guest breaks something?'

//     Sources:
//     [info1.txt]: Compensation for Damage Accidents can happen during a stay, and we have procedures in place to handle compensation for damage. If you, as a guest, notice damage during your stay or if you're a host and your property has been damaged, report it immediately through the platform
//     [info2.pdf]: Guests must not engage in any prohibited activities, including but not limited to: - Unauthorized parties or events - Smoking in non-smoking properties - Violating community rules - Damaging property or belongings
//     [info3.pdf]: Once you've provided the necessary information, submit the report. Our financial support team will investigate the matter and work to resolve it promptly.
//     `;

//     const SAMPLE_ANSWER = `If a guest breaks something, report the damage immediately through the platform [info1.txt].`;

//     const QUESTION = `${query}\nSources:${topNDocsToString(topNDocs)}`;

//     const promptContext = SYSTEM_CHAT_TEMPLATE + `Here is an example:` + `user: ` + SAMPLE_QUESTION + `assistant:` + SAMPLE_ANSWER;
//     const promptInFull = promptContext + "Here is the actual question that needs to be answered: user: " + QUESTION + `assistant: `;

//     const { id, created, choices, usage } = await client.getCompletions(azureOpenAIDeploymentId, [promptInFull], {
//         maxTokens: 4000
//     });

//     return choices[0];
// }
