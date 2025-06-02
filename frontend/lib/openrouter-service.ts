import OpenAI from "openai";

export const MODELS = {
  GPT_4O: "openai/gpt-4o",
};

export interface ResumeAnalysisResult {
  score: number;
  keywords: {
    matched: string[];
    missing: string[];
  };
  sections: {
    experience: number;
    skills: number;
    education: number;
    formatting: number;
  };
  suggestions: Array<{
    title: string;
    description: string;
    priority: "high" | "medium" | "low";
  }>;
  detailedAnalysis: string;
}

export interface QuestionInput {
  id: string;
  text: string;
  options: string[];
  correctAnswer: string;
}

class OpenRouterApiService {
  private client: OpenAI | null = null;

  constructor() {
    try {
      this.client = new OpenAI({
        baseURL: "https://openrouter.ai/api/v1",
        dangerouslyAllowBrowser: true,
        apiKey: process.env.NEXT_PUBLIC_OPENROUTER_API_KEY as string,
        defaultHeaders: {
          "HTTP-Referer":
            process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
          "X-Title": "Edulearn ATS Resume Parser",
        },
      });
    } catch (error) {
      console.error("Failed to initialize OpenRouter API:", error);
    }
  }

  async analyzeResume(
    resumeText: string,
    jobDetails: {
      title: string;
      company: string;
      description: string;
    }
  ): Promise<ResumeAnalysisResult> {
    if (!this.client) {
      throw new Error("OpenRouter client is not initialized");
    }

    try {
      const prompt = this.createPrompt(resumeText, jobDetails);

      const completion = await this.client.chat.completions.create({
        model: "meta-llama/llama-4-maverick:free",
        messages: [
          {
            role: "system",
            content: `You are a professional ATS (Applicant Tracking System) resume analyzer. 
            You will analyze resumes against job descriptions to provide detailed feedback and compatibility scores.
            
            IMPORTANT: You must respond with a valid JSON object with the following structure:
            {
              "score": number - Overall ATS compatibility score (0-100),
              "keywords": {
                "matched": ["string", "string"] - Keywords from the job description found in the resume,
                "missing": ["string", "string"] - Important keywords from the job description missing in the resume
              },
              "sections": {
                "experience": number - Score for experience section (0-100),
                "skills": number - Score for skills section (0-100), 
                "education": number - Score for education section (0-100),
                "formatting": number - Score for overall formatting (0-100)
              },
              "suggestions": [
                {
                  "title": "string - Brief suggestion title",
                  "description": "string - Detailed explanation of the suggestion",
                  "priority": "high" | "medium" | "low" - Importance of this suggestion
                }
              ],
              "detailedAnalysis": "string - Full textual analysis of resume vs job description"
            }
            
            Make sure your response is valid JSON. Do not include any markdown formatting or explanatory text outside the JSON structure.`,
          },
          {
            role: "user",
            content: prompt,
          },
        ],
      });

      const content = completion.choices[0].message.content;
      if (!content) {
        throw new Error("No response from API");
      }

      try {
        return JSON.parse(content);
      } catch (error) {
        console.error("Failed to parse API response:", error);
        throw new Error("Invalid response format from API");
      }
    } catch (error) {
      console.error("Error analyzing resume:", error);
      throw error;
    }
  }

  private createPrompt(
    resumeText: string,
    jobDetails: {
      title: string;
      company: string;
      description: string;
    }
  ): string {
    return `Please analyze the following resume for the ${
      jobDetails.title
    } position${jobDetails.company ? ` at ${jobDetails.company}` : ""}.

JOB TITLE: ${jobDetails.title}
${jobDetails.company ? `COMPANY: ${jobDetails.company}` : ""}
JOB DESCRIPTION:
${jobDetails.description}

RESUME:
${resumeText}

Please analyze this resume against the job description with the following criteria:
1. Overall ATS compatibility score
2. Keywords matched and missing
3. Section-by-section scoring (experience, skills, education, formatting)
4. Specific improvement suggestions with priority levels
5. Detailed analysis explaining strengths and weaknesses`;
  }

  async extractTextFromPDF(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          if (!this.client) {
            throw new Error("OpenRouter client is not initialized");
          }

          const base64Data = (event.target?.result as string)?.split(",")[1];

          const completion = await this.client.chat.completions.create({
            model: "meta-llama/llama-4-maverick:free",
            messages: [
              {
                role: "system",
                content:
                  "You are a helpful assistant that extracts and formats text from PDF documents.",
              },
              {
                role: "user",
                content: [
                  {
                    type: "text",
                    text: "Extract all text from this resume PDF and return it in a well-structured format.",
                  },
                  {
                    type: "image_url",
                    image_url: {
                      url: `data:application/pdf;base64,${base64Data}`,
                    },
                  },
                ],
              },
            ],
          });

          resolve(completion.choices[0].message.content || "");
        } catch (error) {
          console.error("Error extracting text from PDF:", error);
          reject(error);
        }
      };
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsDataURL(file);
    });
  }

  async generateQuestionsWithOpenAI({
    topic,
    difficulty,
    count,
    description,
  }: {
    topic: string;
    difficulty: string;
    count: number;
    description: string;
  }): Promise<QuestionInput[]> {
    if (!this.client) {
      throw new Error("OpenRouter client is not initialized");
    }

    const systemPrompt = `You are an expert coding test generator. Generate an array of ${count} multiple-choice questions for a coding challenge on the topic '${topic}' with difficulty '${difficulty}'. Each question should be an object with the following structure: { id: string, text: string, options: string[], correctAnswer: string }. Do not include explanations. The questions should be relevant to: ${description}`;

    const completion = await this.client.chat.completions.create({
      model: "mistralai/mistral-7b-instruct:free",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Generate the questions as a JSON array.` },
      ],
    });

    const content = completion.choices[0].message.content;
    if (!content) {
      throw new Error("No response from API");
    }

    try {
      const questions = JSON.parse(content);
      if (!Array.isArray(questions)) throw new Error("Invalid format");
      return questions;
    } catch (error) {
      console.error("Failed to parse generated questions:", error);
      throw new Error("Invalid response format from API");
    }
  }
}

export const openRouterService = new OpenRouterApiService();
