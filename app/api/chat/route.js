import { NextResponse } from "next/server";
import OpenAI from "openai";
import { Pinecone } from "@pinecone-database/pinecone";
import { ReadableStream } from "stream/web";

const system_prompt = `
You are an intelligent agent designed to help students 
find the best professors based on their specific queries. 
Your task is to provide the top three professors that match 
the user's query, ranked according to relevance, using the RAG 
(Retrieval-Augmented Generation) method. You will use a combination 
of semantic search and pre-existing ratings to determine the best matches.

Understand the Query:

Accurately interpret the user's request. If the user is simply interacting with you
such as saying hello or asking you how you are doing, simply interact back with the user
and don't perform and retrieval or provide any professor recommendations.

When user asks for a recommendations, or include specific subjects, 
teaching styles, course difficulty, professor ratings, or other relevant attributes.
Perform Retrieval:

Retrieve a list of professors from the database who best match the user's query 
based on relevant criteria such as subject expertise, student ratings, and comments.
Generate Response:

From the retrieved results, rank the top three professors who are most relevant to the query.
Provide a brief summary for each professor, including their name, subject(s) they teach, 
average rating, and one or two key attributes (e.g., teaching style, approachability, grading leniency).
Response Format:

Your response should be structured as follows:
Professor 1:
Name: [Professor's Full Name]
Subject(s): [Subjects Taught]
Rating: [Average Rating out of 5]
Attributes: [Brief summary of key attributes]

Professor 2:
Name: [Professor's Full Name]
Subject(s): [Subjects Taught]
Rating: [Average Rating out of 5]
Attributes: [Brief summary of key attributes]

Professor 3:
Name: [Professor's Full Name]
Subject(s): [Subjects Taught]
Rating: [Average Rating out of 5]
Attributes: [Brief summary of key attributes]
Consistency and Accuracy:

Ensure that the information provided is up-to-date, accurate, and helpful for the student's decision-making process.
Additional Guidance:

If no professors match the query exactly, provide the closest alternatives and clearly state this to the user.
Offer additional advice if relevant (e.g., suggesting similar courses or professors).

Your primary goal is to help students make informed decisions about which professors to take 
by providing personalized, relevant, and accurate recommendations based on their specific needs.
`; 
// The rest of your system prompt

export async function POST(req) {
    const data = await req.json();

    // Initialize Pinecone
    const pc = new Pinecone({
        apiKey: process.env.PINECONE_API_KEY,
    });
    const index = pc.Index('rag').namespace('ns1');

    // Initialize OpenAI
    const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY, // Ensure this is correctly set
    });

    const text = data[data.length - 1].content;

    // Create an embedding
    const embedding = await openai.embeddings.create({
        model: "text-embedding-3-small", // Ensure the correct model name
        input: text, // Corrected the typo here
    });

    const results = await index.query({
        topK: 3,
        includeMetadata: true,
        vector: embedding.data[0].embedding,
    });

    let resultString = '\n\nReturned Results from vector db (done automatically):';
    results.matches.forEach((match) => {
        resultString += `\n
        Professor: ${match.id}
        Review: ${match.metadata.stars}
        Subject: ${match.metadata.subject}
        Stars: ${match.metadata.stars}
        \n\n`;
    });

    const lastMessage = data[data.length - 1];
    const lastMessageContent = lastMessage.content + resultString;
    const lastDataWithoutLastMessage = data.slice(0, data.length - 1);

    // Create a chat completion
    const completion = await openai.chat.completions.create({
        messages: [
            { role: 'system', content: system_prompt },
            ...lastDataWithoutLastMessage,
            { role: 'user', content: lastMessageContent },
        ],
        model: "gpt-4-0613", // Adjust the model name as needed
        stream: true, // Corrected capitalization
    });

    const stream = new ReadableStream({
        async start(controller) {
            const encoder = new TextEncoder();
            try {
                for await (const chunk of completion) {
                    const content = chunk.choices[0].delta.content;
                    if (content) {
                        const text = encoder.encode(content);
                        controller.enqueue(text);
                    }
                }
            } catch (err) {
                controller.error(err);
            } finally {
                controller.close();
            }
        }
    });

    return new NextResponse(stream);
}










// import { NextResponse } from "next/server";
// import OpenAI from "openai";
// import { Pinecone } from "@pinecone-database/pinecone";
// import { Stream } from "openai/streaming";

// const system_prompt = `
// You are an intelligent agent designed to help students 
// find the best professors based on their specific queries. 
// Your task is to provide the top three professors that match 
// the user's query, ranked according to relevance, using the RAG 
// (Retrieval-Augmented Generation) method. You will use a combination 
// of semantic search and pre-existing ratings to determine the best matches.

// Understand the Query:

// Accurately interpret the user's request, which may include specific subjects, 
// teaching styles, course difficulty, professor ratings, or other relevant attributes.
// Perform Retrieval:

// Retrieve a list of professors from the database who best match the user's query 
// based on relevant criteria such as subject expertise, student ratings, and comments.
// Generate Response:

// From the retrieved results, rank the top three professors who are most relevant to the query.
// Provide a brief summary for each professor, including their name, subject(s) they teach, 
// average rating, and one or two key attributes (e.g., teaching style, approachability, grading leniency).
// Response Format:

// Your response should be structured as follows:
// Professor 1:
// Name: [Professor's Full Name]
// Subject(s): [Subjects Taught]
// Rating: [Average Rating out of 5]
// Attributes: [Brief summary of key attributes]

// Professor 2:
// Name: [Professor's Full Name]
// Subject(s): [Subjects Taught]
// Rating: [Average Rating out of 5]
// Attributes: [Brief summary of key attributes]

// Professor 3:
// Name: [Professor's Full Name]
// Subject(s): [Subjects Taught]
// Rating: [Average Rating out of 5]
// Attributes: [Brief summary of key attributes]
// Consistency and Accuracy:

// Ensure that the information provided is up-to-date, accurate, and helpful for the student's decision-making process.
// Additional Guidance:

// If no professors match the query exactly, provide the closest alternatives and clearly state this to the user.
// Offer additional advice if relevant (e.g., suggesting similar courses or professors).

// Your primary goal is to help students make informed decisions about which professors to take 
// by providing personalized, relevant, and accurate recommendations based on their specific needs.
// `

// export async function POST(req) {
//     const data = await req.json()
//     const pc = new Pinecone({
//         apiKey: process.env.PINECONE_API_KEY,
//     })
//     const index = pc.Index('rag').namespace('ns1')
//     const openai = new OpenAI()

//     const text = data[data.length - 1].content
//     const embedding = await openai.embeddings.create({
//         model: "text-embedding-3-small",
//         input: text,
//         embedding_format: "float",
//     })

//     const results = await index.query ({
//         topK: 3,
//         includeMetadata: true,
//         vector: embedding.data[0].embedding
//     })

//     let resultString = '\n\nReturned Results from vecrtor db (done automatically:'
//     results.matches.forEach((match)=>{
//         resultString+=`\n
//         Profesor: ${match.id}
//         Review: ${match.metadata.stars}
//         Subject: ${match.metadata.subject}
//         Stars: ${match.metadata.stars}
//         \n\n
//         `
//     })

//     const lastMessage = data[data.length - 1]
//     const lastMessageContent = lastMessage.content + resultString
//     const lastDataWithoutLastMessage = data.slice[0, data.length - 1]

//     const completion = await openai.chat.combinations.create({
//         messages: [
//             {role: 'system', content: 'systemPrompt'},
//             ...lastDataWithoutLastMessage,
//             {role: 'user', content: lastMessageContent},
//         ],
//         model: "gpt-4o-mini",
//         Stream: true
//     })

//     const stream = new ReadableStream({
//         async start(controller){
//             const encoder = new TextEncoder()
//             try{
//                 for await(const chunk of completion){
//                     const content = chunk.choices[0].delta.content
//                     if(content){
//                         const text = encoder.encode(content)
//                         controller.enqueue(text)
//                     }
//                 }
//             }
//             catch(err){
//                 controller.error(err)
//             }
//             finally{
//                 controller.close()
//             }
//         }
//     })
//     return new NextResponse(stream)
// }
