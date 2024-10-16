// import { createContext, useEffect, useState } from "react";
// import axios from "axios"
// export const AuthContext = createContext()

// export const AuthContextProvider = ({children}) => {
//     const [currentUser, setCurrentUser] = useState(JSON.parse(localStorage.getItem("user"))) || null

//     const login = async (inputs) => {
//        const res = await axios.post("http://localhost:8000/api/auth/login", inputs, {
//         withCredentials: true
//        })
//        console.log(res);
//        setCurrentUser(res.data)
       
//     }

//     useEffect(()=>{
//         localStorage.setItem("user", JSON.stringify(currentUser))
//     }, [currentUser])

//     return(
//         <AuthContext.Provider value={{currentUser, login}}>{children}</AuthContext.Provider>
//     )

// }

import { createContext, useEffect, useState } from "react";
import axios from "axios";

export const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(JSON.parse(localStorage.getItem("user")) || null);

    const login = async (credentials) => {
        try {
            console.log("cred", credentials);
            const response = await axios.post("http://localhost:8000/api/auth/login", credentials, {
                withCredentials: true
            });
            const userData = response.data;
            setCurrentUser(userData);
            console.log("userData", userData);
            localStorage.setItem("user", JSON.stringify(userData));
            console.log("localstorage sets");
        } catch (error) {
            console.error("Login failed:", error);
        }
    };

    useEffect(()=>{
        localStorage.setItem("user", JSON.stringify(currentUser))
    }, [currentUser])

    const logout = async () => {
        try {
            await axios.post("http://localhost:8000/api/auth/logout", null, {
                withCredentials: true
            });
            setCurrentUser(null);
            localStorage.removeItem("user");
        } catch (error) {
            console.error("Logout failed:", error);
            // Handle logout failure
        }
    };

    useEffect(() => {
        const refreshToken = async () => {
            try {
                const response = await axios.get("http://localhost:8000/api/auth/refresh-token", {
                    withCredentials: true
                });
            } catch (error) {
                console.error("Token refresh failed:", error);
                setCurrentUser(null);
                localStorage.removeItem("user");
            }
        };

        const interval = setInterval(refreshToken, 840000); // Refresh token every 14 minutes
        refreshToken(); // Initial token refresh

        return () => clearInterval(interval); // Clean up interval on component unmount
    }, []);

    return (
        <AuthContext.Provider value={{ currentUser, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
