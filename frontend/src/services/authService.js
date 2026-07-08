import apiClient from "./api";

const loginHandle = () => {
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

    const messageListener = (event) => {
        if (event.origin !== "https://zuko-1rfg.onrender.com") return; 

        if (event.data === "mal_login_success") {
            console.log("Authentication successful!");
            
            window.removeEventListener("message", messageListener);
            
            window.location.reload(); 
        }
    };

    window.addEventListener("message", messageListener);
};

export { loginHandle };