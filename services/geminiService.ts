import { GoogleGenAI, Type } from "@google/genai";
import { IndustryTrendData, ResumeAnalysis, SalaryPrediction, SkillsForecastData, JobOpening, DetailedComparisonData, HistoricalIndustryTrend, GrammarCorrection, CourseRecommendationData, CareerPathData, GroundedJobsResult, NearbyPlace, GroundingSource, MissingSkill } from '../types';
import { INDUSTRIES } from "../constants";

const getAiClient = () => {
    const API_KEY = process.env.API_KEY;
    if (!API_KEY) {
      throw new Error("API_KEY environment variable not set");
    }
    return new GoogleGenAI({ apiKey: API_KEY });
};

export async function getIndustryTrends(industry: string): Promise<IndustryTrendData> {
  const ai = getAiClient();
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: `You are a job market analyst AI. For the "${industry}" industry, generate a list of the top 10 most in-demand skills. For each skill, provide a current demand score (1-100) and a trend score (-10 to +10). Also, list 5 common job titles and provide an estimated annual growth rate (percentage) for the industry.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          topSkills: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                skill: { type: Type.STRING },
                demand: { type: Type.NUMBER },
                trend: { type: Type.NUMBER },
              },
              required: ["skill", "demand", "trend"]
            },
          },
          jobTitles: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
          annualGrowthRate: {
            type: Type.NUMBER,
            description: "Estimated annual growth rate percentage for the industry."
          }
        },
        required: ["topSkills", "jobTitles", "annualGrowthRate"]
      },
    },
  });

  const jsonStr = response.text.trim();
  return JSON.parse(jsonStr) as IndustryTrendData;
}

export async function getHistoricalTrends(): Promise<HistoricalIndustryTrend[]> {
    const ai = getAiClient();
    const currentYear = new Date().getFullYear();
    const prompt = `You are a market trend simulation AI. Generate plausible historical growth trend data for the following industries from the year 2000 to ${currentYear}: ${INDUSTRIES.join(', ')}. For each industry, provide an array of data points. Each data point should have a 'year' and a 'value' (a normalized growth index from 0 to 100). The trends should be realistic, showing periods of growth, stagnation, or decline, reflecting major economic events where appropriate.`;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        industry: { type: Type.STRING },
                        data: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    year: { type: Type.NUMBER },
                                    value: { type: Type.NUMBER }
                                },
                                required: ["year", "value"]
                            }
                        }
                    },
                    required: ["industry", "data"]
                }
            }
        }
    });

    const jsonStr = response.text.trim();
    return JSON.parse(jsonStr) as HistoricalIndustryTrend[];
}


export async function getDetailedIndustryComparison(industries: string[]): Promise<DetailedComparisonData> {
    const ai = getAiClient();
    const industryList = industries.map(i => `"${i}"`).join(', ');
    const prompt = `You are an expert market analyst AI. Provide a detailed, side-by-side comparison of the following industries: ${industryList}. 
    
    First, provide an array of objects, where each object contains an industry's name and its estimated annual growth rate.
    
    Then, for each of the following factors, provide a detailed analysis for EACH industry (2-3 sentences per industry) and a final summary analysis comparing all of them.

    Factors:
    1. Market Size & Growth: Total revenue, annual growth rate, trends.
    2. Profitability & Financial Metrics: Average profit margins, ROI, capital intensity.
    3. Employment & Skill Demand: Workforce size, key skill requirements, job opportunities.
    4. Competitive Landscape: Key players, market share, barriers to entry.
    5. Innovation & Technology: R&D investment, technology adoption, innovation pace.
    6. Regulatory & Environmental Factors: Government policies, regulations, environmental impact.
    7. Consumer/Market Demand: Demand trends, customer base, pricing sensitivity.
    8. Risk Factors: Economic sensitivity, supply chain vulnerabilities, technological disruption risk.
    
    Return the data in the specified JSON format.`;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    industries: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                name: { type: Type.STRING },
                                growthRate: { type: Type.NUMBER }
                            },
                            required: ["name", "growthRate"]
                        }
                    },
                    comparison: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                factor: { type: Type.STRING },
                                comparisonDetails: {
                                    type: Type.ARRAY,
                                    items: {
                                        type: Type.OBJECT,
                                        properties: {
                                            industry: { type: Type.STRING },
                                            details: { type: Type.STRING }
                                        },
                                        required: ["industry", "details"]
                                    }
                                },
                                analysis: { type: Type.STRING, description: "A summary analysis comparing all industries for this factor." }
                            },
                             required: ["factor", "comparisonDetails", "analysis"]
                        }
                    }
                },
                required: ["industries", "comparison"]
            }
        }
    });
    
    const jsonStr = response.text.trim();
    return JSON.parse(jsonStr) as DetailedComparisonData;
}


export async function analyzeResume(resumeText: string, jobDescription: string, language: string): Promise<ResumeAnalysis> {
    const ai = getAiClient();
    if (!resumeText.trim() || !jobDescription.trim()) {
        throw new Error("Resume and Job Description cannot be empty.");
    }
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: `You are an expert career coach and resume parser AI. Analyze the following resume against the target job description. Your entire response, including all analysis and suggestions, MUST be in the ${language} language.

    First, parse the resume and extract the following key details:
    - A list of skills mentioned.
    - A summary of each professional experience (job title, company, duration, and a 1-2 sentence summary).
    - A list of educational qualifications mentioned.
    - The user's most likely current location (City, Country).
    - The primary job domain or field (e.g., 'Software Engineering', 'Marketing').
    - The user's experience level, categorizing them as one of: 'Entry-level', 'Mid-level', 'Senior', 'Expert'.

    Next, perform a detailed analysis based on the job description:
    - Calculate an Applicant Tracking System (ATS) compatibility score from 0-100.
    - Identify skills present in both the resume and the job description (matching skills).
    - Identify important skills from the job description that are missing from the resume. For each missing skill, provide a brief (1-sentence) explanation of its importance for the target role.
    - Provide 3-4 actionable improvement suggestions.

    Resume:
    ---
    ${resumeText}
    ---
    Job Description:
    ---
    ${jobDescription}
    ---
    `,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
           extractedSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
            extractedExperience: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        jobTitle: { type: Type.STRING },
                        company: { type: Type.STRING },
                        duration: { type: Type.STRING },
                        summary: { type: Type.STRING }
                    },
                    required: ["jobTitle", "company", "duration", "summary"]
                }
            },
            extractedEducation: { type: Type.ARRAY, items: { type: Type.STRING } },
            location: { type: Type.STRING, description: "User's most likely location (e.g., Bengaluru, India)" },
            primaryDomain: { type: Type.STRING, description: "Primary job domain (e.g., 'Software Engineering')" },
            experienceLevel: { type: Type.STRING, description: "One of: 'Entry-level', 'Mid-level', 'Senior', 'Expert'" },
            atsScore: { type: Type.NUMBER },
            matchingSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
            missingSkills: { 
                type: Type.ARRAY, 
                items: { 
                    type: Type.OBJECT,
                    properties: {
                        skill: { type: Type.STRING },
                        explanation: { type: Type.STRING }
                    },
                    required: ["skill", "explanation"]
                } 
            },
            improvementSuggestions: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["extractedSkills", "extractedExperience", "extractedEducation", "location", "primaryDomain", "experienceLevel", "atsScore", "matchingSkills", "missingSkills", "improvementSuggestions"]
      },
    },
  });

  const jsonStr = response.text.trim();
  // Ensure missingSkills is always an array, even if the API returns null
  const parsed = JSON.parse(jsonStr)
  if (!parsed.missingSkills) {
    parsed.missingSkills = [];
  }
  return parsed as ResumeAnalysis;
}

export async function predictSalary(jobTitle: string, skills: string[], location: string, experience: number): Promise<SalaryPrediction> {
    const ai = getAiClient();
    if (!jobTitle.trim() || skills.length === 0 || !location.trim()) {
        throw new Error("Job title, skills, and location are required.");
    }
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: `You are a salary prediction AI. Based on the job title "${jobTitle}", skills "${skills.join(', ')}", location "${location}", and experience of ${experience} years, estimate a realistic annual salary range in INR (Indian Rupees). Provide a base salary, a high-end salary, and a short analysis of the most impactful factors.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          salaryRange: {
            type: Type.OBJECT,
            properties: {
              low: { type: Type.NUMBER },
              high: { type: Type.NUMBER },
            },
            required: ["low", "high"]
          },
          analysis: {
            type: Type.STRING,
            description: "A brief analysis of what influenced the salary estimate.",
          },
        },
        required: ["salaryRange", "analysis"]
      },
    },
  });

  const jsonStr = response.text.trim();
  return JSON.parse(jsonStr) as SalaryPrediction;
}

export async function getSkillsForecast(industry: string): Promise<SkillsForecastData> {
  const ai = getAiClient();
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: `You are a futuristic job market analyst AI. For the "${industry}" industry, predict the top 10 most in-demand skills for the next 5 years. For each skill, provide a future demand score (1-100) and a trend score (-10 to +10) indicating its growth potential. Also, list 3 actionable "Future-Proof Your Career" tips based on these predictions.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          predictedSkills: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                skill: { type: Type.STRING },
                demand: { type: Type.NUMBER, description: "Future demand score 1-100" },
                trend: { type: Type.NUMBER, description: "Growth potential score -10 to +10" },
              },
              required: ["skill", "demand", "trend"]
            },
          },
          futureProofTips: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Actionable tips for career growth."
          },
        },
        required: ["predictedSkills", "futureProofTips"]
      },
    },
  });

  const jsonStr = response.text.trim();
  return JSON.parse(jsonStr) as SkillsForecastData;
}

export async function getLiveJobs(location: string, domain: string, jobType: string, experienceLevel: string, industry: string): Promise<JobOpening[]> {
    const ai = getAiClient();
    if (!location.trim() || !domain.trim()) {
        throw new Error("Location and domain are required for job search.");
    }
    
    let prompt = `You are a job search assistant AI, simulating a job board aggregator. Find 5 to 7 recent, real job openings for a '${domain}' role in '${location}'. The list must be current.`;
    
    if (industry && industry !== 'all') {
        prompt += ` The industry MUST be '${industry}'.`;
    }
    if (jobType && jobType !== 'all') {
        prompt += ` The job type MUST be '${jobType}'.`;
    }
    if (experienceLevel && experienceLevel !== 'all') {
        prompt += ` The experience level should be '${experienceLevel}'.`;
    }

    prompt += ` For each job, provide a unique ID, the company name, exact job title, the specific location (e.g., 'Bengaluru, India'), a list of 3-5 key skills, a brief 1-2 sentence description, a list of required qualifications, a summary of the experience required (e.g., '2-4 years'), the job type ('Full-time', 'Internship', 'Contract', 'Part-time'), a plausible posted date in 'YYYY-MM-DD' format from the last 30 days, and a plausible URL that links directly to the actual company’s career page or the specific job posting. Avoid links to job aggregators like LinkedIn or Indeed.`;
    
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        id: { type: Type.STRING },
                        companyName: { type: Type.STRING },
                        jobTitle: { type: Type.STRING },
                        location: { type: Type.STRING },
                        skills: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING }
                        },
                        description: { type: Type.STRING },
                        qualifications: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING },
                            description: "List of required qualifications or degrees."
                        },
                        experienceRequired: {
                            type: Type.STRING,
                            description: "Summary of years of experience needed."
                        },
                        jobType: { type: Type.STRING },
                        postedDate: { type: Type.STRING },
                        url: {type: Type.STRING}
                    },
                    required: ["id", "companyName", "jobTitle", "location", "skills", "description", "qualifications", "experienceRequired", "jobType", "postedDate", "url"]
                }
            }
        }
    });

    const jsonStr = response.text.trim();
    return JSON.parse(jsonStr) as JobOpening[];
}

export async function getCourseRecommendations(skills: string[], industry: string, language: string): Promise<CourseRecommendationData> {
  const ai = getAiClient();
  const prompt = `You are a career development AI assistant. Based on the "${industry}" industry and the following skills: ${skills.join(', ')}, recommend relevant courses and certifications.

Provide 3-5 course recommendations from platforms like Coursera, Udemy, and NPTEL.
Provide 2-4 certification recommendations from providers like AWS, Azure, Tableau, and Google.

For each course recommendation, include the platform, title, a valid URL, a 1-2 sentence description, its difficulty level ('Beginner', 'Intermediate', 'Advanced'), and an estimated duration (e.g., '10 hours', '3 months').
For each certification, include the provider, title, a valid URL, and a description.
Ensure the URLs are correct and lead directly to the content.
Your entire response, including all descriptions and titles, MUST be in ${language}.
`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          recommendedCourses: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                platform: { type: Type.STRING },
                title: { type: Type.STRING },
                url: { type: Type.STRING },
                description: { type: Type.STRING },
                level: { type: Type.STRING },
                duration: { type: Type.STRING }
              },
              required: ["platform", "title", "url", "description", "level", "duration"]
            }
          },
          recommendedCertifications: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                provider: { type: Type.STRING },
                title: { type: Type.STRING },
                url: { type: Type.STRING },
                description: { type: Type.STRING }
              },
              required: ["provider", "title", "url", "description"]
            }
          }
        },
        required: ["recommendedCourses", "recommendedCertifications"]
      },
    },
  });

  const jsonStr = response.text.trim();
  return JSON.parse(jsonStr) as CourseRecommendationData;
}


export async function getCareerPath(currentSkills: string[], skillsToLearn: string[], industry: string, language: string): Promise<CareerPathData> {
    const ai = getAiClient();
    const prompt = `You are a career path prediction AI. A user in the "${industry}" industry has the following skills: ${currentSkills.join(', ')}. They plan to learn these additional skills: ${skillsToLearn.join(', ')}.

Based on this, predict a logical career progression. Provide:
1.  A likely current role or job title based on their existing skills.
2.  A likely target role or next-level job title they could achieve after learning the new skills.
3.  A list of the most crucial skills that bridge the gap between the current and target roles (should be a subset of the skillsToLearn).

For both the current and target roles, provide a brief 1-2 sentence description. The entire response, including all roles, descriptions, and skills, MUST be in ${language}.
`;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    currentRole: {
                        type: Type.OBJECT,
                        properties: {
                            role: { type: Type.STRING },
                            description: { type: Type.STRING }
                        },
                        required: ["role", "description"]
                    },
                    targetRole: {
                        type: Type.OBJECT,
                        properties: {
                            role: { type: Type.STRING },
                            description: { type: Type.STRING }
                        },
                        required: ["role", "description"]
                    },
                    skillsToBridge: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING }
                    }
                },
                required: ["currentRole", "targetRole", "skillsToBridge"]
            }
        }
    });
    
    const jsonStr = response.text.trim();
    return JSON.parse(jsonStr) as CareerPathData;
}


export async function correctGrammar(text: string): Promise<GrammarCorrection> {
    const ai = getAiClient();
    if (!text.trim()) {
        throw new Error("Input text cannot be empty.");
    }

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `You are an expert English grammar and style editor. Analyze the following text.
        
        First, provide a fully corrected version of the entire text.
        
        Second, provide a list of specific suggestions for improvement. For each suggestion, include the original phrase, the corrected phrase, and a brief explanation of the change (e.g., "Grammar", "Clarity", "Conciseness", "Punctuation").

        Text:
        ---
        ${text}
        ---`,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    correctedText: {
                        type: Type.STRING,
                        description: "The full text with all corrections applied."
                    },
                    suggestions: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                original: { type: Type.STRING },
                                corrected: { type: Type.STRING },
                                explanation: { type: Type.STRING }
                            },
                            required: ["original", "corrected", "explanation"]
                        }
                    }
                },
                required: ["correctedText", "suggestions"]
            }
        }
    });

    const jsonStr = response.text.trim();
    return JSON.parse(jsonStr) as GrammarCorrection;
}

export async function getGroundedJobs(
    domain: string,
    locationName: string,
    userLocation: { latitude: number; longitude: number } | null,
    language: string
): Promise<GroundedJobsResult> {
    const ai = getAiClient();
    const prompt = `You are a helpful job search assistant. Using up-to-date information from Google Search, find 5 recent, real job openings for a "${domain}" role in or near "${locationName}". Prioritize finding direct links to the company's career page or the specific job posting.

    For each job, extract the following details: a unique ID string, company name, exact job title, specific location (e.g., 'Bengaluru, India'), a list of 3-5 key skills, a brief 1-2 sentence description, a list of required qualifications, a summary of the experience required (e.g., '2-4 years'), the job type ('Full-time', 'Internship', 'Contract', 'Part-time'), a plausible posted date in 'YYYY-MM-DD' format from the last 30 days, and the direct URL to the job posting.
    
    Additionally, using Google Maps, find up to 3 relevant places nearby, such as major tech parks or company headquarters known for hiring in the "${domain}" field.
    
    Your entire response MUST be in ${language}. The final text output must be a single, valid JSON object with the following structure: { "jobs": [ { "id": "...", "companyName": "...", "jobTitle": "...", "location": "...", "skills": [...], "description": "...", "qualifications": [...], "experienceRequired": "...", "jobType": "...", "postedDate": "...", "url": "..." } ] }. Do not include any markdown formatting like \`\`\`json.`;

    const config: any = {
        tools: [{ googleSearch: {}, googleMaps: {} }],
    };

    if (userLocation) {
        config.toolConfig = {
            retrievalConfig: {
                latLng: userLocation
            }
        };
    }

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: config
    });

    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources: GroundingSource[] = [];
    const places: NearbyPlace[] = [];
    
    groundingChunks.forEach(chunk => {
        if (chunk.web && chunk.web.uri && chunk.web.title) {
             if (!sources.some(s => s.uri === chunk.web!.uri)) {
                sources.push({ uri: chunk.web.uri, title: chunk.web.title });
            }
        }
        if (chunk.maps && chunk.maps.uri && chunk.maps.title) {
            if (!places.some(p => p.uri === chunk.maps!.uri)) {
                places.push({ name: chunk.maps.title, uri: chunk.maps.uri });
            }
        }
    });

    let jsonStr = response.text.trim();
    // Sometimes the model might wrap the JSON in markdown, so we'll strip it.
    if (jsonStr.startsWith('```json')) {
        jsonStr = jsonStr.substring(7, jsonStr.length - 3).trim();
    }
    const parsed = JSON.parse(jsonStr);
    
    return { jobs: parsed.jobs as JobOpening[], places, sources };
}