import { withAuth } from "next-auth/middleware";

export default withAuth(
  function middleware() {
    // Additional middleware logic can be added here
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: ["/(protected)/:path*"],
};
