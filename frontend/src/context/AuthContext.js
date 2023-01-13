import { createContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import jwt_decode from "jwt-decode";

const AuthContext = createContext();
export default AuthContext;

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() =>
        localStorage.getItem("access") ? jwt_decode(localStorage.getItem("access")).username : null
    );
    const [userID, setUserID] = useState(() =>
        localStorage.getItem("access") ? jwt_decode(localStorage.getItem("access")).user_id : null
    );

    const [firstLoad, setFirstLoad] = useState(true);
    const navigate = useNavigate();

    function updateUser(token) {
        if (token === null) {
            setUser(null);
            setUserID(null);
            return;
        }
        setUser(jwt_decode(token).username);
        setUserID(jwt_decode(token).user_id);
    }

    function login(e, u, p) {
        if (e === null) {
            e = {
                target: { username: { value: u }, password: { value: p } },
            };
        } else {
            e.preventDefault();
        }

        fetch("http://127.0.0.1:8000/backend/login/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                username: e.target.username.value,
                password: e.target.password.value,
            }),
        })
            .then((res) => {
                // If response is not 200 OK, throw an error
                if (res.status !== 200) {
                    return res.json().then((json) => {
                        throw new Error(`${res.status} ${res.statusText}: ${json.detail || json.username || json.password}`);
                    });
                }
                return res.json();
            })
            .then((data) => {
                // Store the access and refresh tokens in localStorage
                localStorage.setItem("access", data.access);
                localStorage.setItem("refresh", data.refresh);
                // setUser(jwt_decode(data.access).username);
                updateUser(data.access);
                // Navigate to the home page
                navigate("/studyhub");
            })
            .catch((errMessage) => {
                alert(errMessage);
            });
    }

    function logout() {
        // Remove the tokens from localStorage
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        // Set the user to null
        updateUser(null);
        // Navigate to the login page
        navigate("/login");
    }

    function register(e) {
        e.preventDefault();

        const username = e.target.username.value;
        const password = e.target.password.value;

        fetch("http://127.0.0.1:8000/backend/register/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                username: username,
                password: password,
            }),
        })
            .then((res) => {
                // If response is not 201 CREATED, throw an error
                if (res.status !== 201) {
                    return res.json().then((json) => {
                        throw new Error(`${res.status} ${res.statusText}: ${json.detail || json.username || json.password}`);
                    });
                }
                // Else, log the user in
                login(null, username, password);
            })
            .catch((errMessage) => {
                alert(errMessage);
            });
    }

    function updateToken() {
        fetch("http://127.0.0.1:8000/backend/refresh/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                refresh: localStorage.getItem("refresh"),
            }),
        })
            .then((res) => {
                // If response is not 200 OK, throw an error
                if (res.status !== 200) {
                    return res.json().then((json) => {
                        throw new Error(`${res.status} ${res.statusText}\n${json.detail}`);
                    });
                }
                return res.json();
            })
            .then((data) => {
                // Store the new access token in localStorage
                localStorage.setItem("access", data.access);
                localStorage.setItem("refresh", data.refresh);
                updateUser(data.access);
                console.log("Token updated");
            })
            .catch((errMessage) => {
                console.log(errMessage);
                logout();
            });

        // Set the firstLoad state after first render
        if (firstLoad) {
            setFirstLoad(false);
        }
    }

    function Loading() {
        return <div>Loading...</div>;
    }

    useEffect(() => {
        if (firstLoad) {
            updateToken();
        }

        // Call the updateToken function every 4 minutes
        let interval = setInterval(() => {
            if (user !== null) {
                updateToken();
            }
        }, 4 * 60 * 1000);
        // Clear the interval when the component is unmounted
        return () => clearInterval(interval);
    }, [user]);

    let context = {
        user: user,
        register: register,
        login: login,
        logout: logout,
    };

    return <AuthContext.Provider value={context}>{firstLoad ? <Loading /> : children}</AuthContext.Provider>;
}
