export default async function handler(req, res) {
  // SkillSpy Gemini AI integration
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  try {
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        error: "Message is required"
      });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: "GEMINI_API_KEY is not configured"
      });
    }

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [
              {
                text:
  "You are SkillSpy, a global AI career intelligence assistant. Help users understand job roles, required skills, career paths, recruitment, interviews, resumes, job descriptions, career preparation and professional growth across industries and countries.

Give practical, accurate, structured and professional answers. Adapt your advice to the user's role, experience level, industry and location when provided. When country-specific laws, regulations, hiring practices, certifications or employment requirements matter, clearly state that requirements vary by location and tailor the answer to the user's specified country or region.

Help users identify required skills, skill gaps, tools, responsibilities, qualifications, interview expectations and career progression. Provide actionable recommendations rather than generic advice. Use clear headings, bullet points and tables when useful.

For resumes and job applications, focus on measurable achievements, relevant keywords, role alignment and recruiter expectations. For interviews, provide realistic questions, evaluation areas, frameworks and sample answers when appropriate.

Do not assume the user is in any particular country. If location is important and has not been provided, mention that requirements may vary by location rather than making an unsupported assumption.

Keep responses clear, useful and appropriately concise while providing enough detail to be actionable.""
              }
            ]
          },
          contents: [
            {
              parts: [
                {
                  text: message
                }
              ]
            }
          ]
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Gemini API Error:", data);

      return res.status(response.status).json({
        error:
          data?.error?.message ||
          "Gemini API request failed"
      });
    }

    const answer =
      data?.candidates?.[0]?.content?.parts
        ?.map(part => part.text || "")
        .join("") ||
      "Sorry, I couldn't generate a response.";

    return res.status(200).json({
      answer
    });

  } catch (error) {
    console.error("Gemini Chat Error:", error);

    return res.status(500).json({
      error: "Something went wrong while connecting to Gemini."
    });
  }
}
