import { GoogleGenerativeAI } from "@google/generative-ai";


const getResponseForGivenPrompt = async (jobDescription,resumeText ) => {
  const API_KEY = import.meta.env.VITE_API_KEY;
  console.log("API Key:", API_KEY);


  
  const prompt = `  
  You are an expert in ATS resume screening. Given the job description and a candidate's resume, analyze the match score based on key skills, experience, and keywords.
  Only include keywords that are essential to the role.
  Base the match score on the presence of essential skills, relevant experience, and key technical terms. Give weight to skills and keywords explicitly mentioned as required in the job description also reduce weights when skill not present and decrease weight based on importance of skill."
  Provide a structured JSON output:
  {
    "match_score": {
      "percentage": "70%",
      "message": "Your resume demonstrates relevant skills and experience, but some key areas need improvement to increase competitiveness."
    },
    "missing_skills": [
      "skill 1",
      "skill 2"
    ],
    "keyword_matches": {
      "count": 8,
      "message": "Your resume includes 8 key terms from the job description, which is positive for ATS scanning."
    },
    "keywords":
    //It should return keywords as per count given above.
[]
    "strengths": [
    //It should return skills like this small words examples
      "React.js",
      "Type Scipt",
      "Node.js",
      "Express",
      "Object-Oriented Programming"
    ],
    "recommendations": [
      "Clearly state the duration of frontend development experience",
      "Highlight Agile/Scrum experience",
      "Add React Native",
      "Explicitly state TypeScript Proficiency",
      "Rewrite Summary/Objective",
      "Tailor Resume to match the job description"
    ]
  }

### **Job Description:**
${jobDescription}

### **Candidate's Resume:**
${resumeText}

Generate a structured response with proper formatting.
`;
  

const generateContentConfig = {
    temperature: 1,
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 8192,
    responseMimeType: "application/json",
    responseSchema: {
      type: "OBJECT",
      required: ["match_score", "missing_skills", "keyword_matches", "keywords"],
      properties: {
        match_score: {
          type: "OBJECT",
          required: ["percentage", "message"],
          properties: {
            percentage: {
              type: "STRING",
            },
            message: {
              type: "STRING",
            },
          },
        },
        missing_skills: {
          type: "ARRAY",
          items: {
            type: "STRING",
          },
        },
        keyword_matches: {
          type: "OBJECT",
          required: ["count", "message"],
          properties: {
            count: {
              type: "INTEGER",
            },
            message: {
              type: "STRING",
            },
          },
        },
        keywords: {
          type: "ARRAY",
          items: {
            type: "STRING",
          },
        },
      },
    },
  };
  
  if (!API_KEY) {
    console.error("API Key is missing. Check your .env file.");
    return;
  }

  if (!prompt || typeof prompt !== "string") {
    console.error("Invalid prompt! Ensure you're passing a valid string.");
    return;
  }

  try {
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // ✅ Correct request format
    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [
            { text: prompt }, // Make sure text is included correctly
          ],
        },
      ],
      generationConfig: generateContentConfig,
    });

    // ✅ Ensure proper handling of response
    const response = await result.response;
    const text = response.text(); // Correctly extracting text

    console.log("Generated Response:", text);
  let jsonResponse;
    try {
        // Parse the JSON string into a JavaScript object
        jsonResponse = JSON.parse(text);
        console.log("Parsed JSON Response:", jsonResponse);
        return jsonResponse; // Return the parsed JSON object
      } catch (jsonError) {
        console.error("Error parsing JSON response:", jsonError);
        return { error: "Failed to parse JSON response", rawText: text }; // Return an error object and the raw text
      }
    return text;
  } catch (error) {
    console.error("Something went wrong:", error);
  }
};

export default getResponseForGivenPrompt;
