import { genericOAuthClient } from 'better-auth/client/plugins';
import {createAuthClient} from "better-auth/react"

export const authClient= createAuthClient({
     baseURL: process.env.BETTER_AUTH_URL,
     plugins: [genericOAuthClient()],
});

 export const signIn = async ()=> {
    const data = await authClient.signIn.social(
        {
            provider: "google",
            callbackURL: "/table-data"
        }
    )
    console.log("data of google : ", data)
}

export const signOut = async () => {
  const result = await authClient.signOut();

  console.log(result);
};

export const handleKeyCloakLogin = async () => {
    await authClient.signIn.oauth2({
        providerId: "keycloak",
        callbackURL: process.env.BETTER_AUTH_URL,
    })
}
export const handleKeyCloakLogout = async () => {
    await authClient.signOut();
}