import * as z from "zod";

export const SignupSchema = z.object({
    name: z.string().min(3).max(20),
    email: z.email(),
    password: z.string().min(6).max(20)
})

export const SigninSchema = z.strictObject({
    email: z.email(),
    password: z.string().min(6).max(20)
})

export const UpdateUser = z.object({
    name: z.string().min(3).max(20).optional(),
    avatarUrl: z.string().optional()
})

export type SignupType = z.infer<typeof SignupSchema>;
export type SigninType = z.infer<typeof SigninSchema>;
export type UpdateUser = z.infer<typeof UpdateUser>;

export * as z from "zod";