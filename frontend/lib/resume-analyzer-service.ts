import { openRouterService } from "./openrouter-service";

export interface JobDetails {
  title: string;
  company: string;
  description: string;
}

export interface ResumeAnalysisData {
  score: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  strengths: string[];
  weaknesses: string[];
  suggestions: Array<{
    title: string;
    description: string;
  }>;
  recommendations: {
    skills: string[];
    improvements: string[];
  };
  sections: {
    present: string[];
    missing: string[];
  };
  formattingFeedback: string;
  overallFeedback: string;
}

class ResumeAnalyzerService {
  private convertAnalysisResponseToData(
    analyzeResponse: any
  ): ResumeAnalysisData {
    return {
      score: analyzeResponse.score,
      matchedKeywords: analyzeResponse.keywords.matched,
      missingKeywords: analyzeResponse.keywords.missing,
      strengths: this.extractStrengthsFromAnalysis(
        analyzeResponse.detailedAnalysis
      ),
      weaknesses: this.extractWeaknessesFromAnalysis(
        analyzeResponse.detailedAnalysis
      ),
      suggestions: analyzeResponse.suggestions.map((suggestion: any) => ({
        title: suggestion.title,
        description: suggestion.description,
      })),
      recommendations: {
        skills: analyzeResponse.keywords.missing.slice(0, 3),
        improvements: analyzeResponse.suggestions
          .filter((s: any) => s.priority === "high")
          .map((s: any) => s.title),
      },
      sections: {
        present: [],
        missing: [],
      },
      formattingFeedback: `Format score: ${analyzeResponse.sections.formatting}/100`,
      overallFeedback: analyzeResponse.detailedAnalysis,
    };
  }

  private extractStrengthsFromAnalysis(analysis: string): string[] {
    const strengths: string[] = [];
    if (!analysis) return strengths;

    // Simple extraction - look for positive indicators
    const lines = analysis.split(".");
    for (const line of lines) {
      const lowercaseLine = line.toLowerCase().trim();
      if (
        (lowercaseLine.includes("strength") ||
          lowercaseLine.includes("strong") ||
          lowercaseLine.includes("good") ||
          lowercaseLine.includes("excellent") ||
          lowercaseLine.includes("impressive")) &&
        lowercaseLine.length > 15
      ) {
        strengths.push(line.trim() + ".");
      }
    }

    return strengths.length
      ? strengths
      : ["Unable to identify specific strengths from the analysis."];
  }

  private extractWeaknessesFromAnalysis(analysis: string): string[] {
    const weaknesses: string[] = [];
    if (!analysis) return weaknesses;

    // Simple extraction - look for negative indicators
    const lines = analysis.split(".");
    for (const line of lines) {
      const lowercaseLine = line.toLowerCase().trim();
      if (
        (lowercaseLine.includes("missing") ||
          lowercaseLine.includes("lack") ||
          lowercaseLine.includes("weak") ||
          lowercaseLine.includes("improve") ||
          lowercaseLine.includes("should")) &&
        lowercaseLine.length > 15 &&
        !lowercaseLine.includes("strength")
      ) {
        weaknesses.push(line.trim() + ".");
      }
    }

    return weaknesses.length
      ? weaknesses
      : ["No specific weaknesses identified in the analysis."];
  }

  async analyzeResume(
    resumeInput: string | File,
    jobDetails: JobDetails
  ): Promise<ResumeAnalysisData> {
    try {
      let responseContent: string | null = null;

      if (resumeInput instanceof File) {
        const resumeTextFromFile = await resumeInput.text();
        const analyzeResponse = await openRouterService.analyzeResume(
          resumeTextFromFile,
          jobDetails
        );

        return this.convertAnalysisResponseToData(analyzeResponse);
      } else {
        const analyzeResponse = await openRouterService.analyzeResume(
          resumeInput as string,
          jobDetails
        );

        return this.convertAnalysisResponseToData(analyzeResponse);
      }
    } catch (error) {
      console.error("Error analyzing resume:", error);
      throw error;
    }
  }

  generateMarkdownReport(
    analysisData: ResumeAnalysisData,
    jobTitle: string
  ): string {
    const scoreEmoji =
      analysisData.score >= 80 ? "🟢" : analysisData.score >= 60 ? "🟡" : "🔴";

    const markdown = `# Resume Analysis Report for ${jobTitle} Position

## Overall Score: ${scoreEmoji} ${analysisData.score}%

${analysisData.overallFeedback}

## Key Findings

### Strengths
${analysisData.strengths.map((strength) => `- ${strength}`).join("\n")}

### Areas for Improvement
${analysisData.weaknesses.map((weakness) => `- ${weakness}`).join("\n")}

## Keyword Analysis

### Matched Keywords
${analysisData.matchedKeywords.map((keyword) => `- ${keyword}`).join("\n")}

### Missing Keywords
${analysisData.missingKeywords.map((keyword) => `- ${keyword}`).join("\n")}

## Specific Recommendations

${analysisData.suggestions
  .map((suggestion) => `### ${suggestion.title}\n${suggestion.description}`)
  .join("\n\n")}

## Additional Recommendations

### Skills to Acquire or Highlight
${analysisData.recommendations.skills.map((skill) => `- ${skill}`).join("\n")}

### Resume Improvements
${analysisData.recommendations.improvements
  .map((improvement) => `- ${improvement}`)
  .join("\n")}

## Document Structure

### Present Sections
${analysisData.sections.present.map((section) => `- ${section}`).join("\n")}

### Recommended Additional Sections
${analysisData.sections.missing.map((section) => `- ${section}`).join("\n")}

## Formatting Feedback
${analysisData.formattingFeedback}

---

*This report was generated using AI analysis and may not capture all nuances of the recruitment process. Use as guidance for improvement rather than definitive evaluation.*
`;

    return markdown;
  }
}

export const resumeAnalyzerService = new ResumeAnalyzerService();
