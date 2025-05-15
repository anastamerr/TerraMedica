// ai_chat.controller.js - Updated for Egyptian sustainable medical tourism
import { OpenAI } from 'openai';
import { Pinecone } from '@pinecone-database/pinecone';
import dotenv from 'dotenv';

dotenv.config();

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Initialize Pinecone
const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
});
const index = pinecone.index(process.env.PINECONE_INDEX);

// In-memory storage for chat history (replace with database in production)
const chatHistory = {};

// Extract medical conditions from user message
async function extractMedicalConditions(message) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4.1-nano-2025-04-14", 
      messages: [
        {
          role: "system",
          content: "You are a medical condition analyzer. Extract any medical conditions or symptoms mentioned in the user's message. Return ONLY a comma-separated list of conditions, or 'none' if no conditions are mentioned."
        },
        { role: "user", content: message }
      ],
      temperature: 0.3,
    });
    
    const conditions = response.choices[0].message.content.toLowerCase();
    return conditions === 'none' ? [] : conditions.split(',').map(c => c.trim());
  } catch (error) {
    console.error("Error extracting medical conditions:", error);
    return [];
  }
}

// Extract user preferences for sustainability and medical tourism
async function extractPreferences(message, history) {
  try {
    // Combine current message with history for context
    const historyText = history.map(msg => `${msg.role}: ${msg.content}`).join('\n');
    
    const response = await openai.chat.completions.create({
      model: "gpt-4.1-nano",
      messages: [
        {
          role: "system",
          content: `Extract user preferences regarding medical tourism and sustainability from the conversation. 
          Analyze for: 
          1. Medical conditions or symptoms mentioned
          2. Carbon consciousness (high/medium/low)
          3. Preferred transportation types
          4. Budget sensitivity (high/medium/low) 
          5. Preferred treatment types
          6. Accommodation preferences
          7. Specific Egyptian locations of interest
          8. Duration of stay (if mentioned)
          9. Travel companions (solo, family, etc.)
          Return a JSON object with these fields. Use null if a preference isn't mentioned.`
        },
        { role: "user", content: `Conversation history:\n${historyText}\n\nCurrent message: ${message}` }
      ],
      temperature: 0.3,
      response_format: { type: "json_object" }
    });
    
    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.error("Error extracting preferences:", error);
    return {};
  }
}

// Helper function to format responses with proper structure
async function structureResponse(content, context) {
  // If content already contains structured format, return as is
  if (content.includes('TREATMENT/LOCATION:') || content.includes('BENEFITS:')) {
    return content;
  }
  
  // Check if this is likely a treatment/location recommendation
  const hasRecommendationIndicators = 
    (content.toLowerCase().includes('recommend') || 
     content.toLowerCase().includes('option') || 
     content.toLowerCase().includes('package') || 
     content.toLowerCase().includes('treatment')) &&
    content.length > 300; // Longer responses likely contain recommendations
  
  if (!hasRecommendationIndicators) {
    return content; // Return conversational responses as is
  }
  
  // For responses that likely contain recommendations but aren't formatted yet
  return structureWithGPT(content, context);
}

// Use GPT to structure the response
async function structureWithGPT(content) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4.1-nano",
      messages: [
        {
          role: "system",
          content: `You are a formatting assistant for medical tourism information. 
          Take the following unstructured treatment recommendation and reformat it into a 
          clearly structured format:
          
          1. Begin with a brief introduction
          2. Format each treatment option as:
             TREATMENT/LOCATION: [Name]
             BENEFITS: [Health benefits]
             SUSTAINABILITY: [Environmental features]
             ACCOMMODATION: [Options]
             TRANSPORTATION: [Options with carbon footprint]
             APPROXIMATE COST: [Range]
          
          3. End with the original closing question or statement
          
          Preserve ALL information from the original text but make it more organized.`
        },
        { role: "user", content: content }
      ],
      temperature: 0.3,
    });
    
    return response.choices[0].message.content;
  } catch (error) {
    console.error("Error structuring response:", error);
    return content; // Fall back to original content if structuring fails
  }
}

// Main function to process chat messages with RAG for Egyptian medical tourism
export const processChat = async (req, res) => {
  try {
    const { message, sessionId } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }
    
    // Initialize chat history for this session if it doesn't exist
    if (!chatHistory[sessionId]) {
      chatHistory[sessionId] = [];
    }
    
    // Extract medical conditions from the user's message
    const medicalConditions = await extractMedicalConditions(message);
    
    // Extract user preferences from message and history
    const userPreferences = await extractPreferences(message, chatHistory[sessionId]);
    
    // Generate embeddings for the user query
    const embeddingResponse = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: message,
    });
    const queryEmbedding = embeddingResponse.data[0].embedding;
    
    // Prepare search options
    let searchOptions = {
      vector: queryEmbedding,
      topK: 5,
      includeMetadata: true
    };
    
    // Query Pinecone for relevant information
    let relevantInfo = [];
    
    // If medical conditions were detected, use them to enhance the search
    if (medicalConditions.length > 0) {
      console.log(`Detected medical conditions: ${medicalConditions.join(', ')}`);
      
      // Generate embeddings for the medical condition query
      const conditionSearch = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: `Treatment in Egypt for ${medicalConditions.join(', ')} using natural remedies`,
      });
      const conditionEmbedding = conditionSearch.data[0].embedding;
      
      // Search for treatments matching the medical conditions
      const treatmentResponse = await index.query({
        vector: conditionEmbedding,
        topK: 3,
        includeMetadata: true
      });
      
      relevantInfo = [...treatmentResponse.matches];
      
      // For each treatment location found, get corresponding transportation options
      const treatmentLocations = new Set(
        treatmentResponse.matches
          .filter(match => match.metadata.location)
          .map(match => match.metadata.location.split(',')[0].trim())
      );
      
      if (treatmentLocations.size > 0) {
        // Prioritize low-carbon transportation if user seems eco-conscious
        let transportFilter = {};
        if (userPreferences.carbonConsciousness === 'high') {
          // Search for transportation options with low carbon emissions
          const transportEmbed = await openai.embeddings.create({
            model: "text-embedding-3-small",
            input: `Low carbon sustainable transport to ${Array.from(treatmentLocations).join(' or ')} in Egypt`,
          });
          
          const transportResponse = await index.query({
            vector: transportEmbed.data[0].embedding,
            topK: treatmentLocations.size * 2, // Get multiple options per location
            includeMetadata: true
          });
          
          // Add transport options to relevant info
          relevantInfo = [...relevantInfo, ...transportResponse.matches];
        } else {
          // Just get standard transport options
          for (const location of treatmentLocations) {
            const transportEmbed = await openai.embeddings.create({
              model: "text-embedding-3-small",
              input: `Transport to ${location} in Egypt`,
            });
            
            const transportResponse = await index.query({
              vector: transportEmbed.data[0].embedding,
              topK: 2,
              includeMetadata: true
            });
            
            relevantInfo = [...relevantInfo, ...transportResponse.matches];
          }
        }
        
        // Add sample itineraries if available
        const itineraryEmbed = await openai.embeddings.create({
          model: "text-embedding-3-small",
          input: `Itinerary for treating ${medicalConditions.join(', ')} in Egypt sustainable natural therapy`,
        });
        
        const itineraryResponse = await index.query({
          vector: itineraryEmbed.data[0].embedding,
          topK: 2,
          includeMetadata: true
        });
        
        relevantInfo = [...relevantInfo, ...itineraryResponse.matches];
      }
    } else {
      // If no specific medical conditions, just search based on the query
      const queryResponse = await index.query(searchOptions);
      relevantInfo = queryResponse.matches;
    }
    
    // Deduplicate results
    const uniqueIds = new Set();
    relevantInfo = relevantInfo.filter(item => {
      if (uniqueIds.has(item.id)) return false;
      uniqueIds.add(item.id);
      return true;
    });
    
    // Format context from relevant information
    const context = relevantInfo
      .map(match => `TITLE: ${match.metadata.title}\nLOCATION: ${match.metadata.location}\n${match.metadata.text}${match.metadata.carbonEmission ? `\nCARBON EMISSION: ${match.metadata.carbonEmission}` : ''}${match.metadata.sustainability ? `\nSUSTAINABILITY: ${match.metadata.sustainability}` : ''}`)
      .join('\n\n---\n\n');
    
    // Prepare messages including conversation history for context
    const messages = [
      { 
        role: "system", 
        content: `You are a friendly and helpful medical tourism assistant for Egypt's natural healing destinations. 
Focus exclusively on Egypt's natural healing environments and sustainable eco-tourism.

CONVERSATION STYLE:
1. Always be conversational and friendly - chat naturally like a human guide would
2. Ask clarifying questions when needed before providing recommendations
3. Keep initial responses brief and engaging
4. Only provide detailed recommendations after understanding the user's needs
5. Always acknowledge the user's questions or concerns first

RECOMMENDATION FORMAT:
When presenting treatment options or travel packages, ALWAYS format them in a clean, organized way:

1. Start with a brief introduction (1-2 sentences)
2. Present each option in a clearly structured format:
   - TREATMENT/LOCATION: [Name]
   - BENEFITS: [Brief description of health benefits]
   - SUSTAINABILITY: [Environmental benefits] 
   - ACCOMMODATION: [Options available]
   - TRANSPORTATION: [How to get there, with carbon footprint]
   - APPROXIMATE COST: [Budget range]

3. Finish with a follow-up question to refine recommendations

Important guidelines:
1. Only recommend natural treatments available in Egypt's unique environments (oases, desert climate, sulfur springs, salt lakes, black sand beaches, Nile River)
2. Emphasize sustainability and low carbon footprint in all recommendations
3. Highlight the carbon emissions for different transportation options
4. If you don't have information on a specific condition, suggest the most appropriate Egyptian natural healing location
5. Explain how Egypt's natural environments provide unique healing properties not found elsewhere

Use the following tourism information to create recommendations:

${context}`
      }
    ];
    
    // Add conversation history (limit to last 5 exchanges for token management)
    const recentHistory = chatHistory[sessionId].slice(-5);
    messages.push(...recentHistory);
    
    // Add the current user message
    messages.push({ role: "user", content: message });
    
    // Get response from GPT-4.1 Nano with guidance to create itinerary when appropriate
    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-nano", 
      messages: messages,
      temperature: 0.7,
    });
    
    const assistantResponse = completion.choices[0].message.content;
    
    // Before returning response, check if it needs formatting
    let formattedResponse = assistantResponse;
    if (medicalConditions.length > 0 || Object.keys(userPreferences).length > 0) {
      formattedResponse = await structureResponse(assistantResponse, context);
    }
    
    // Save the exchange to history
    chatHistory[sessionId].push({ role: "user", content: message });
    chatHistory[sessionId].push({ role: "assistant", content: formattedResponse });
    
    // Send response back to client
    res.json({
      answer: formattedResponse,
      sources: relevantInfo.map(match => ({
        title: match.metadata.title || 'Egyptian Tourism Information',
        location: match.metadata.location || 'Egypt',
        sustainability: match.metadata.sustainability || 'Information not available',
        carbonEmission: match.metadata.carbonEmission || 'Information not available'
      }))
    });
    
  } catch (error) {
    console.error('Error in chat endpoint:', error);
    res.status(500).json({ error: 'An error occurred while processing your request' });
  }
};

// Get chat history for a specific session
export const getChatHistory = (req, res) => {
  const { sessionId } = req.params;
  
  if (!chatHistory[sessionId]) {
    return res.json({ history: [] });
  }
  
  res.json({ history: chatHistory[sessionId] });
};

// Clear chat history for a specific session
export const clearChatHistory = (req, res) => {
  const { sessionId } = req.params;
  
  if (chatHistory[sessionId]) {
    chatHistory[sessionId] = [];
  }
  
  res.json({ message: 'Chat history cleared successfully' });
};