import OpenAI from "openai";

export const openai = new OpenAI({
  apiKey: Bun.env.OPEN_AI_KEY as string,
});
