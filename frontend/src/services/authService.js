import apiClient from "./api";

const loginHandle = (setUser) => {
    const backendUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4002/api';
    
    const loginUrl = `${backendUrl}/auth/login`;

    const width = 500;
    const height = 650;
    const left = window.innerWidth / 2 - width / 2;
    const top = window.innerHeight / 2 - height / 2;

    window.open(
        loginUrl,
        'MAL_OAuth_Login',
        `width=${width},height=${height},top=${top},left=${left},toolbar=no,menubar=no,scrollbars=yes`
    );

    const messageListener = async (event) => {
        const expectedOrigin = backendUrl.startsWith('http') 
            ? new URL(backendUrl).origin
            : window.location.origin;
        
        if (event.origin !== expectedOrigin) return; 

        if (event.data === "mal_login_success") {
            console.log("Authentication successful! Cookies are set.");
            
            window.removeEventListener("message", messageListener);
            
            try {
                const response = await apiClient.get('auth/me');
                
                if (setUser) {
                    setUser(response.data.data); 
                }
            } catch (error) {
                console.error("Failed to fetch profile after login", error);
            }
        }
    };

    window.addEventListener("message", messageListener);
};

export { loginHandle };