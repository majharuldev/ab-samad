// import React, { createContext, useEffect, useState } from "react";

// export const AuthContext = createContext();

// const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(() => {
//     const storedUser = localStorage.getItem("user");
//     return storedUser ? JSON.parse(storedUser) : null;
//   });

//     const logout = () => {
//     setUser(null);
//     localStorage.removeItem("user");
//   };

//   // check expiration (24h = 86400000ms)
//   useEffect(() => {
//     if (user?.loginTime) {
//       const now = Date.now();
//       const diff = now - user.loginTime;

//       if (diff > 24 * 60 * 60 * 1000) {
//         logout();
//       } else {
//         // auto logout timer set করে দিচ্ছি
//         const remaining = 24 * 60 * 60 * 1000 - diff;
//         const timer = setTimeout(() => {
//           logout();
//         }, remaining);

//         return () => clearTimeout(timer);
//       }
//     }
//   }, [user]);

//   const login = async (email, password) => {
//     try {
//       const res = await fetch(`${import.meta.env.VITE_BASE_URL}/login`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ email, password }),
//       });

//       const data = await res.json();

//       if (res.ok) {
//          const loginData = {
//           ...data,
//           loginTime: Date.now(),
//         };
//         setUser(loginData);
//         localStorage.setItem("user", JSON.stringify(loginData));
//         return { success: true };
//       } else {
//         return { success: false, message: data?.message || "Login failed" };
//       }
//     } catch (error) {
//       return { success: false, message: error.message };
//     }
//   };

//   const value = { user, login, logout };

//   return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
// };

// export default AuthProvider;


// import { createContext, useEffect, useState } from "react";
// import Cookies from "js-cookie";
// import axios from "axios";
// // import jwtDecode from "jwt-decode";
// import * as jwtDecode from "jwt-decode";
// export const AuthContext = createContext();

// const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(null);
//   const [isAuthenticated, setIsAuthenticated] = useState(false);
//   const [loading, setLoading] = useState(true);

//   // Check auth status on initial load
//   console.log(user, "üser")
//    // initial load e check
//   useEffect(() => {
//     const token = Cookies.get("auth_token");
//     if (token) {
//       try {
//         const decoded = jwtDecode(token); // token theke role/email decode
//         console.log(decoded, "decoded")
//         setUser({
//           email: decoded.email,
//           role: decoded.role,  // role set korlam
//           name: decoded.email?.split("@")[0],
//         });
//         setIsAuthenticated(true);
//       } catch (err) {
//         console.error("Invalid token", err);
//         Cookies.remove("auth_token");
//       }
//     }
//     setLoading(false);
//   }, []);

//   // Login method
//   const login = async (email, password) => {
//     try {
//       const res = await axios.post(`${import.meta.env.VITE_BASE_URL}/login`, {
//         email,
//         password,
//       });

//       const { token } = res.data;
//       console.log(token)
//       Cookies.set("auth_token", token, { expires: 1 });
//       localStorage.setItem("user_email", email);
// const decoded = jwtDecode(token);
// console.log(decoded, "de")
//        setUser({
//         email: decoded.email,
//         role: decoded.role,
//         name: decoded.email?.split("@")[0],
//       });
//       setIsAuthenticated(true);
      
//       return { success: true };
//     } catch (err) {
//       return {
//         success: false,
//         message: err.response?.data?.message || "Login failed",
//       };
//     }
//   };

//   // Logout
//   const logout = () => {
//     Cookies.remove("auth_token");
//     localStorage.removeItem("user_email");
//     setUser(null);
//     setIsAuthenticated(false);
//     window.location.href = "/tramessy/Login";
//   };

//   if (loading) {
//     return <div>Loading authentication...</div>;
//   }

//   return (
//     <AuthContext.Provider
//       value={{
//         user,
//         isAuthenticated,
//         login,
//         logout
//       }}
//     >
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export default AuthProvider;

// import { createContext, useEffect, useState } from "react";
// import Cookies from "js-cookie";
// import axios from "axios";

// export const AuthContext = createContext();

// const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(null);
//   const [isAuthenticated, setIsAuthenticated] = useState(false);
//   const [loading, setLoading] = useState(true);
// console.log(user, "u")
//   // Check auth status on initial load
//   useEffect(() => {
//     const token = Cookies.get("auth_token");
//     const storedUser = localStorage.getItem("user");
//     console.log(storedUser, "s")
//     if (token && storedUser) {
//       // const userEmail = localStorage.getItem("user_email");
//       if (user) {
//         setUser({
//           email: userEmail,
//           name: name,
//           role:role,
//           phone: phone

//         });
//       }
//       setIsAuthenticated(true);
//     }
//     setLoading(false);
//   }, []);

//   // Login method
//   const login = async (email, password) => {
//     try {
//       const res = await axios.post(`${import.meta.env.VITE_BASE_URL}/login`, {
//         email,
//         password,
//       });
// console.log(res, "res")
//       const { token } = res.data;
//       Cookies.set("auth_token", token, { expires: 1 });
//       localStorage.setItem("user_email", email);

//       setUser({
//         email: email,
//         name: email.split("@")[0],
//         role: role,
//         phone: phone
//       });
//       setIsAuthenticated(true);
      
//       return { success: true };
//     } catch (err) {
//       return {
//         success: false,
//         message: err.response?.data?.message || "Login failed",
//       };
//     }
//   };

//   // Logout
//   const logout = () => {
//     Cookies.remove("auth_token");
//     localStorage.removeItem("user_email");
//     setUser(null);
//     setIsAuthenticated(false);
//     window.location.href = "/tramessy/Login";
//   };

//   if (loading) {
//     return <div>Loading authentication...</div>;
//   }

//   return (
//     <AuthContext.Provider
//       value={{
//         user,
//         isAuthenticated,
//         login,
//         logout
//       }}
//     >
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export default AuthProvider;

// AuthProvider.jsx
import { createContext, useEffect, useState } from "react";
import Cookies from "js-cookie";
import api from "../../utils/axiosConfig";

export const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = Cookies.get("auth_token");
    if (token) {
      api.get("/user")   //  এর /api/user endpoint
        .then((res) => {
          setUser(res.data); // user এর মধ্যে role থাকবে
          setIsAuthenticated(true);
        })
        .catch(() => {
          setUser(null);
          setIsAuthenticated(false);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    try {
      const res = await api.post("/login", { email, password });
      const { token } = res.data;

      Cookies.set("auth_token", token, { expires: 1 });

      // login এর পরে user details আনো
      const userRes = await api.get("/user");
      setUser(userRes.data);
      setIsAuthenticated(true);

      return { success: true, user: userRes.data };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || "Login failed",
      };
    }
  };

  const logout = () => {
    Cookies.remove("auth_token");
    setUser(null);
    setIsAuthenticated(false);
    window.location.href = "/tramessy/Login";
  };

  if (loading) return <div>Loading authentication...</div>;

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;

