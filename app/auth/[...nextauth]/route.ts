
import { authOptions } from "@/app/api/auth/[...nextauth]/options"
import NextAuth from "next-auth"

export default NextAuth(authOptions)