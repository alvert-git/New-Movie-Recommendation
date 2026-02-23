import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const LoginSuccess = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    useEffect(() => {
        const token = searchParams.get("token");
        if (token) {
            localStorage.setItem("token", token);
            
            // Decode the token to get the user ID and email
            const decoded = jwtDecode(token);
            const user = {
                id: decoded.id,
                email: decoded.email,
                picture: decoded.picture
            };
            
            localStorage.setItem("user", JSON.stringify(user));
            navigate("/dashboard");
        } else {
            navigate("/login");
        }
    }, [searchParams, navigate]);

    return <div className="text-white bg-black h-screen flex items-center justify-center">Finalizing Login...</div>;
};

export default LoginSuccess;