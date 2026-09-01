import { z } from "zod";

export const blockBaseSchema = z.object({
  id: z.string(),
});

export const cardBlockSchema = blockBaseSchema.extend({
  type: z.literal("card"),
  content: z.object({
    front: z.string().min(1),
    back: z.string().min(1),
  }),
});

export const quizBlockSchema = blockBaseSchema.extend({
  type: z.literal("quiz"),
  content: z.object({
    question: z.string().min(1),
    options: z.array(z.string()).length(4),
    correctAnswer: z.number().int().min(0).max(3),
    explanation: z.string().min(1),
  }),
});

export const textBlockSchema = blockBaseSchema.extend({
  type: z.literal("text"),
  content: z.object({
    title: z.string().optional(),
    text: z.string().min(1),
  }),
});

export const studyBlockSchema = z.discriminatedUnion("type", [
  cardBlockSchema,
  quizBlockSchema,
  textBlockSchema,
]);

export type CardBlock = z.infer<typeof cardBlockSchema>;
export type QuizBlock = z.infer<typeof quizBlockSchema>;
export type TextBlock = z.infer<typeof textBlockSchema>;
export type StudyBlock = z.infer<typeof studyBlockSchema>;
