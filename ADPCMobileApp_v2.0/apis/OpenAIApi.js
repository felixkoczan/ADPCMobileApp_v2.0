// Import the Axios library for making HTTP requests
import axios from 'axios';

// Import the OpenAI API key from a constants file
const { openAIKey } = require("../constants.js");

// Define the ChatGPT API endpoint for sending chat completion requests
const chatGPTEndpoint = 'https://api.openai.com/v1/chat/completions';

// Create an Axios client instance with predefined headers
const client = axios.create({
    headers: {
        "Content-Type": "application/json", // Set content type to JSON for the request body
        "Authorization": "Bearer " + openAIKey, // Attach the OpenAI API key for authorization
    }
});

// Define an asynchronous function `apiCall` to interact with the ChatGPT API
export const apiCall = async (userPrompt) => {
    try {
        // Prepare the messages array with an object containing the user's prompt
        const messages = [
            { role: "user", content: 'What does this mean:'+ userPrompt }
        ];

        // Use the Axios client to send a POST request to the ChatGPT API
        const res = await client.post(chatGPTEndpoint, {
            model: "gpt-3.5-turbo", // Specify the model to use, in this case, gpt-3.5-turbo
            messages, // Include the messages array in the request body
            max_tokens: 100 // Limit the response to a maximum of 100 tokens
        });

        // Extract the response message from the ChatGPT API response
        let response = res.data?.choices[0]?.message.content;
        console.log('ChatGPT:', response) // Log the ChatGPT response to the console

        // Return a success object with the ChatGPT response
        return Promise.resolve({ success: true, data: response });
    } catch (err) {
        // Log any errors that occur during the API call
        console.log("Error in apiCall: ", err);
        // Return an error object with the error message
        return Promise.resolve({ success: false, msg: err.message });
    }
}
