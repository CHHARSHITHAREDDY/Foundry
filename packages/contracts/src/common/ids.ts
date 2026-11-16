import { z } from "zod";

export const IdSchema = z.string().min(1);

export const IdeaIdSchema = z.string().regex(/^idea_[a-zA-Z0-9]+$/).or(z.string().uuid()).or(z.string().min(3));
export const CompanyIdSchema = z.string().regex(/^comp_[a-zA-Z0-9]+$/).or(z.string().uuid()).or(z.string().min(3));
export const RunIdSchema = z.string().regex(/^run_[a-zA-Z0-9]+$/).or(z.string().uuid()).or(z.string().min(3));
export const UserIdSchema = z.string().regex(/^usr_[a-zA-Z0-9]+$/).or(z.string().uuid()).or(z.string().min(3));
export const TaskIdSchema = z.string().regex(/^tsk_[a-zA-Z0-9]+$/).or(z.string().uuid()).or(z.string().min(3));

export type IdeaId = z.infer<typeof IdeaIdSchema>;
export type CompanyId = z.infer<typeof CompanyIdSchema>;
export type RunId = z.infer<typeof RunIdSchema>;
export type UserId = z.infer<typeof UserIdSchema>;
export type TaskId = z.infer<typeof TaskIdSchema>;
