import CredentialsProvider from "next-auth/providers/credentials";

export interface User {
  id: number;
  name: string;
  email: string;
  roles: string[];
  permissions?: string[];
}

export interface AuthResponse {
  message: string;
  user: User;
  token: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

const authOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(
        credentials: Record<"email" | "password", string> | undefined
      ) {
        if (!credentials?.email || !credentials?.password) {
          console.error("Missing credentials");
          return null;
        }

        const loginUrl = `${API_URL}/auth/login`;

        console.log("Attempting login to:", loginUrl);
        console.log("With credentials:", {
          email: credentials.email,
          password: "***",
        });

        try {
          const response = await fetch(loginUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          });

          console.log("Response status:", response.status);

          if (!response.ok) {
            const errorText = await response.text();
            console.error("Login failed:", response.status, errorText);
            return null;
          }

          const data: AuthResponse = await response.json();
          console.log("Login successful:", data.message);

          return {
            id: data.user.id.toString(),
            name: data.user.name,
            email: data.user.email,
            roles: data.user.roles,
            permissions: data.user.permissions || [],
            accessToken: data.token,
          };
        } catch (error) {
          console.error("Authentication error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }: { token: any; user?: any }) {
      if (user) {
        token.accessToken = user.accessToken;
        token.roles = user.roles;
        token.permissions = user.permissions || [];
      }
      return token;
    },
    async session({ session, token }: { session: any; token: any }) {
      if (token && session.user) {
        session.user.id = token.sub as string;
        session.accessToken = token.accessToken as string;
        session.user.roles = (token.roles as string[]) || [];
        session.user.permissions = (token.permissions as string[]) || [];
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },
  session: {
    strategy: "jwt" as const,
  },
  secret: process.env.NEXTAUTH_SECRET || "pos-atk-secret-key-for-development",
  debug: process.env.NODE_ENV === "development",
  url: process.env.NEXTAUTH_URL || "http://localhost:3000",
};

export default authOptions;
