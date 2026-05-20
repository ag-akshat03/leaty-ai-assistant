const express = require("express");
const axios = require("axios");

const router = express.Router();

router.post("/translate", async (req, res) => {
  try {
    const { text, targetLanguage } = req.body;

    if (!text || !targetLanguage) {
      return res.status(400).json({
        success: false,
        error: "Text and target language are required",
      });
    }

    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "deepseek/deepseek-r1:free" || "openai/gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `You are Leaty, a smart multilingual in-car AI voice assistant.
Respond only in ${targetLanguage}.
Keep the tone conversational, short, and driver-friendly.`,
          },
          {
            role: "user",
            content: text,
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer":
            process.env.FRONTEND_URL || "http://localhost:5173",
          "X-Title": "Leaty Voice Assistant",
        },
      }
    );

    const translatedText =
      response.data?.choices?.[0]?.message?.content || "No response generated";

    res.status(200).json({
      success: true,
      translatedText,
    });
  } catch (error) {
    console.error(
      "OpenRouter Error:",
      error?.response?.data || error.message
    );

    res.status(500).json({
      success: false,
      error: "Failed to generate AI response",
    });
  }
});

module.exports = router;
