
"use client"

import { handleKeyCloakLogin, handleKeyCloakLogout, signIn, signOut } from "@/lib/auth-client";


export default function ButtonSignIn(){
    return(
        <>
        <button onClick={signIn}>
            Sign In better With Google
        </button>

        <button onClick={signOut}>
            Sign Out better
        </button>

        <button onClick={handleKeyCloakLogin}>
            Handle Keycloak Login
        </button>

        <button onClick={handleKeyCloakLogout}>
            Handle Keycloak Logout
        </button>
        
        </>
    )
}