import React, { useEffect } from 'react';
import { useNavigate } from "react-router-dom";

function Logout() {
    const nav = useNavigate();

    useEffect(() => {
        // Clear cookies by setting them to expire
        document.cookie = "authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        document.cookie = "userRole=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        document.cookie = "userId=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        document.cookie = "isSubscribed=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";

        // Navigate to login page
        nav('/login');
    }, [nav]);

    return null; // No UI needed for this component
}

export default Logout;