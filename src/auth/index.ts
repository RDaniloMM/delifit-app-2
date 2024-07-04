import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

export { handlers, signIn, signOut, auth } from "./auth";

export const { auth: middleware } = NextAuth(authConfig);
