declare module "next-auth" {
  interface Session {
    accessToken: string;
    user: {
      id: string;
      name: string;
      email: string;
      roles: string[];
      permissions: string[];
    };
  }

  interface User {
    id: string;
    name: string;
    email: string;
    roles: string[];
    permissions?: string[];
    accessToken?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken: string;
    roles: string[];
    permissions: string[];
  }
}
