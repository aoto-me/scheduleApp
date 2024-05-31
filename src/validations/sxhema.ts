import { z } from "zod";

export const monerySchema = z.object({
  date: z.string().min(1, { message: "日付を選択してください" }),
  type: z.enum(["収入", "支出"]),
  amount: z.number().min(1, { message: "金額を入力してください" }),
  content: z
    .string()
    .min(1, { message: "内容を入力してください" })
    .max(100, { message: "100文字以内で入力してください" }),
  category: z
    .union([
      z.enum([
        "食費",
        "日用品",
        "住宅費",
        "お菓子",
        "交通費",
        "交際費",
        "娯楽",
        "美容",
        "月契約",
        "保険",
        "医療",
        "その他",
      ]),
      z.enum(["給与", "副収入", "その他"]),
      z.literal(""),
    ])
    .refine((val) => val !== "", { message: "カテゴリを選択してください" }),
});
// tsの型定義
export type MonerySchema = z.infer<typeof monerySchema>;

export const todoSchema = z.object({
  date: z.string().min(1, { message: "日付を選択してください" }),
  time: z.string(),
  type: z
    .union([z.enum(["仕事", "プライベート", "ルーティン"]), z.literal("")])
    .refine((val) => val !== "", { message: "タイプを選択してください" }),
  project: z
    .object({
      id: z.number(),
      completed: z.union([z.literal(0), z.literal(1)]),
      end: z.string(),
      memo: z.string(),
      name: z.string(),
    })
    .nullable(),
  section: z
    .object({
      id: z.number(),
      projectId: z.number(),
      name: z.string(),
      memo: z.string(),
      dragType: z.literal("section"),
    })
    .nullable(),
  content: z
    .string()
    .min(1, { message: "内容を入力してください" })
    .max(100, { message: "100文字以内で入力してください" }),
  estimated: z.string(),
  completed: z.boolean(),
  memo: z.string().max(500, { message: "500文字以内で入力してください" }),
  timeTaken: z.array(
    z.object({
      start: z.string(),
      end: z.string(),
    }),
  ),
});
// tsの型定義
export type TodoSchema = z.infer<typeof todoSchema>;

export const healthSchema = z
  .object({
    date: z.string().min(1, { message: "日付を選択してください" }),
    upTime: z.string(),
    bedTime: z.string(),
    body: z
      .string()
      .regex(/^\d*\.?\d*$/, { message: "数値のみ入力してください" }),
    headache: z.boolean(),
    stomach: z.boolean(),
    period: z.boolean(),
    sleepless: z.boolean(),
    cold: z.boolean(),
    nausea: z.boolean(),
    hayfever: z.boolean(),
    depression: z.boolean(),
    tired: z.boolean(),
    other: z.boolean(),
    memo: z.string().max(500, { message: "500文字以内で入力してください" }),
  })
  .refine(({ other, memo }) => (other ? memo.length > 0 : true), {
    message: "その他の症状の場合は入力してください",
    path: ["memo"],
  });
// tsの型定義
export type HealthSchema = z.infer<typeof healthSchema>;

export const projectSchema = z.object({
  name: z
    .string()
    .min(1, { message: "プロジェクト名を入力してください" })
    .max(100, { message: "100文字以内で入力してください" }),
  end: z.string(),
  completed: z.boolean(),
  memo: z.string(),
});
// tsの型定義
export type ProjectSchema = z.infer<typeof projectSchema>;

export const sectionSchema = z.object({
  name: z
    .string()
    .min(1, { message: "セクション名を入力してください" })
    .max(100, { message: "100文字以内で入力してください" }),
  memo: z.string().max(500, { message: "500文字以内で入力してください" }),
});
// tsの型定義
export type SectionSchema = z.infer<typeof sectionSchema>;
