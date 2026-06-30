import { betterAuth } from "better-auth";
import { genericOAuth, keycloak } from "better-auth/plugins";

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET,
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  plugins: [
    genericOAuth({
      config: [
        keycloak({
          clientId: process.env.KEYCLOAK_CLIENT_ID!,
          clientSecret: "",
          redirectURI: `${process.env.BETTER_AUTH_URL}/api/auth/oauth2/callback/keycloak`,
          issuer: `${process.env.AUTH_KEYCLOAK_ISSUER}`,
          pkce: true,
        }),
      ],
    }),
  ],
  account: {
    storeStateStrategy: "cookie",
  },
});
