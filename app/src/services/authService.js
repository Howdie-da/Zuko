import { Browser } from "@capacitor/browser";
import { App } from "@capacitor/app";
import { Preferences } from "@capacitor/preferences";
import axios from "axios";

const login = async (setUserCallback) => {
    let verifier = "";
    let str = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (let idx = 0; idx < 48; idx++) {
      verifier += str[Math.floor(Math.random() * str.length)];
    }

    await Preferences.set({ key: "code_verifier", value: verifier });

    const malAuthUrl = `https://myanimelist.net/v1/oauth2/authorize?` +
                       `response_type=code` +
                       `&client_id=${import.meta.env.VITE_MAL_CLIENT_ID}` +
                       `&redirect_uri=${encodeURIComponent(import.meta.env.VITE_MAL_REDIRECT_URI)}` +
                       `&code_challenge=${verifier}` +
                       `&code_challenge_method=plain`;
    
    let listener;

    listener = await App.addListener("appUrlOpen", async ({ url }) => {
        try {
            if (!url.startsWith(import.meta.env.VITE_MAL_REDIRECT_URI)) return;

            await Browser.close();

            const callbackUrl = new URL(url);
            const error = callbackUrl.searchParams.get("error");
            const code = callbackUrl.searchParams.get("code");

            if (error) {
                console.error("OAuth failed:", error);
                return;
            }

            if (code) {
                const profile = await callback(code);
                
                if (setUserCallback) {
                    setUserCallback(profile);
                }
            }
        } catch (err) {
            console.error("Native login failed:", err);
        } finally {
            if (listener) {
                listener.remove();
            }
        }
    });

    await Browser.open({ url: malAuthUrl });
}

const callback = async (code) => {
    const { value: code_verifier } = await Preferences.get({key: "code_verifier"});

    await Preferences.remove({ key: "code_verifier" });

    const tokenPayload = {
        client_id: import.meta.env.VITE_MAL_CLIENT_ID,
        client_secret: import.meta.env.VITE_MAL_SECRET,
        code,
        code_verifier,
        grant_type: "authorization_code",
        redirect_uri: import.meta.env.VITE_MAL_REDIRECT_URI
    }

    const response = await axios.post(
        "https://myanimelist.net/v1/oauth2/token",
        new URLSearchParams(tokenPayload),
        { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    )

    const { access_token, refresh_token } = response.data;

    await Preferences.set({ key: "accessToken", value: access_token });
    
    if (refresh_token) {
        await Preferences.set({ key: "refreshToken", value: refresh_token });
    }

    const profileResponse = await axios.get(
        "https://api.myanimelist.net/v2/users/@me",
        { headers: {"Authorization": `Bearer ${access_token}`} }
    )

    return profileResponse.data;
}

const getProfile = async () => {
    const { value: accessToken } = await Preferences.get({key: "accessToken"})

    if (!accessToken) {
        console.log("User is not authenticated");
        return null;
    }

    try {
        const response = await axios.get(
            "https://api.myanimelist.net/v2/users/@me",
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            }
        );

        return response.data;
    } catch (error) {
        console.log("Error while Fetching Profile: ", error);
        return null;
    }
}

const logoutHandle = async (dispatch) => {
    try {
        await Preferences.remove({ key: "zuko_access_token" });
        
        await Preferences.remove({ key: "zuko_refresh_token" });
        
        dispatch(logout())
        
        console.log("Tokens cleared from native storage.");
    } catch (error) {
        console.error("Error during logout:", error);
    }
};

const getStats = async () => {
    const {value: accessToken} = await Preferences.get({key: "accessToken"})

    if (!accessToken) {
        console.log("User is not authenticated")
        return null
    }

    const response = await axios.get(
        "https://api.myanimelist.net/v2/users/@me",
        {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
            params: {
                fields: "id,name,picture,gender,joined_at,anime_statistics",
            },
        }
    );

    return response.data
}

export { login, callback, getProfile, logoutHandle, getStats }