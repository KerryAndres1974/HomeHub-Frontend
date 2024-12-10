import { useContext, createContext, useState, useEffect } from "react";

const AuthContext = createContext({
    saveUser: () => {},
    logout: () => {},
    login: () => {},
});

export function AuthProvider({ children }) {
    const [accessToken, setAccessToken] = useState(() => {
        const storedToken = localStorage.getItem("token");
        return storedToken ? JSON.parse(storedToken) : "";
    });

    const [cargo, setCargo] = useState(() => {
        const storedCargo = localStorage.getItem("cargo");
        return storedCargo ? JSON.parse(storedCargo) : "";
    })

    useEffect(() => {
        const storedToken = localStorage.getItem("token");
        const storedCargo = localStorage.getItem("cargo");
        if (storedToken) setAccessToken(JSON.parse(storedToken));
        if (storedCargo) setCargo(JSON.parse(storedCargo));
    }, []);

    function login() {
        return { accessToken, cargo };
    }

    function logout() {
        setCargo("");
        setAccessToken("");
        localStorage.removeItem("token");
        localStorage.removeItem("cargo");
    }

    function saveUser(userData) {
        setCargo(userData.body.cargo);
        setAccessToken(userData.body.accessToken);

        localStorage.setItem("token", JSON.stringify(userData.body.accessToken));
        localStorage.setItem("cargo", JSON.stringify(userData.body.cargo));
    }

    return (
        <AuthContext.Provider value={{ saveUser, logout, login }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);