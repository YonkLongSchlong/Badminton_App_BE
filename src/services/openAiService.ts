import { openai } from "../../utils/openAI";
import { db } from "../db";
import { answer, question } from "../db/schema";
import { getFreeLessonById, getPaidLessonById } from "./lessonService";

type ResponseOpenAI = {
  questions: Array<{
    question: string;
    options: Array<string>;
    answer: string;
  }>;
};

const questionTemplate = {
  questions: [
    {
      question: "Name of the question",
      options: [
        "An array of string containing 4 options. Don't contain A, B, C, D, etc in the answer",
      ],
      answer: "The right answer for the question",
    },
  ],
};

const extractTextFromBlocks = (content: any): string => {
  return content.blocks
    .map((block: any) => {
      if (
        block.type === "paragraph" ||
        block.type === "header" ||
        block.type === "list"
      ) {
        return block.data.text || block.data.items.join(" ");
      }
      return "";
    })
    .join(" ");
};

export const generateQuizQuestionsForFreeLesson = async (lessonId: number) => {
  try {
    const lesson = await getFreeLessonById(lessonId);
    if (lesson === undefined) {
      throw new Error(`Lesson with id ${lessonId} not found`);
    }
    const lessonContent = extractTextFromBlocks(lesson.content);

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        {
          role: "user",
          content: `Can you generate me about 5 to 7 questions, the options and the answer for this lesson? Here is the lesson content: ${lessonContent}. Please format the response as json exactly as follow ${questionTemplate}`,
        },
      ],
    });

    const quizQuestionsText = completion.choices[0].message?.content;
    console.log(quizQuestionsText);

    let cleanedResponse = quizQuestionsText!.replace(/```json|```/g, "").trim();
    const sanitizedInput = JSON.parse(cleanedResponse as string);

    saveQuestionsAndAnswersForFreeLesson(
      sanitizedInput as ResponseOpenAI,
      lessonId
    );
  } catch (error) {
    console.error("Error generating quiz questions:", error);
    throw error;
  }
};

const saveQuestionsAndAnswersForFreeLesson = async (
  data: ResponseOpenAI,
  lessonId: number
) => {
  console.log(data);

  for (const q of data.questions || data) {
    const insertedQuestion = await db
      .insert(question)
      .values({
        text: q.question,
        rightAnswer: q.answer,
        freeLessonId: lessonId,
      })
      .returning();

    const questionId = insertedQuestion[0].id;

    for (const option of q.options) {
      await db.insert(answer).values({
        text: option,
        questionId: questionId,
      });
    }
  }
};

export const generateQuizQuestionsForPaidLesson = async (
  lessonId: number,
  coachId: number
) => {
  try {
    const lesson = await getPaidLessonById(lessonId);
    if (lesson === undefined) {
      throw new Error(`Lesson with id ${lessonId} not found`);
    }
    const lessonContent = extractTextFromBlocks(lesson.content);
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        {
          role: "user",
          content: `Can you generate me about 5 to 7 questions, the options and the right answer for this lesson? Here is the lesson content: ${lessonContent}. Please format the response as json as follow ${questionTemplate}`,
        },
      ],
    });

    const quizQuestionsText = completion.choices[0].message?.content;
    console.log(quizQuestionsText);

    let cleanedResponse = quizQuestionsText!.replace(/```json|```/g, "").trim();
    const sanitizedInput = JSON.parse(cleanedResponse as string);

    saveQuestionsAndAnswersForPaidLesson(
      sanitizedInput as ResponseOpenAI,
      lessonId
    );
  } catch (error) {
    console.error("Error generating quiz questions:", error);
    throw error;
  }
};

const saveQuestionsAndAnswersForPaidLesson = async (
  data: ResponseOpenAI,
  lessonId: number
) => {
  for (const q of data.questions || data) {
    const insertedQuestion = await db
      .insert(question)
      .values({
        text: q.question,
        rightAnswer: q.answer,
        paidLessonId: lessonId,
      })
      .returning();

    const questionId = insertedQuestion[0].id;

    for (const option of q.options) {
      await db.insert(answer).values({
        text: option,
        questionId: questionId,
      });
    }
  }
};
