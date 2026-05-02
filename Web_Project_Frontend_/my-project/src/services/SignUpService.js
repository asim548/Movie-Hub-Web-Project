import axios from "axios";

const BACKEND_URL = "http://localhost:3213";

export const registerUserOrSeller = async (userOrSeller) => {
  try {
    if (userOrSeller.role === "seller" || userOrSeller.role === "admin") {
      const response = await axios.post(BACKEND_URL + "/adminseller/register", userOrSeller);
      console.log(`${userOrSeller.role} registered successfully:`, response.data);
      return { ok: true, message: "Registration successful." };
    } else {
      const user = {
        name: userOrSeller.name,
        email: userOrSeller.email,
        password: userOrSeller.password,
      };
      const response = await axios.post(BACKEND_URL + "/user/register", user);
      console.log("User registered successfully:", response.data);
      return { ok: true, message: "Registration successful." };
    }
  } catch (error) {
    console.error("Error registering user or seller:", error);
    return {
      ok: false,
      message:
        error?.response?.data?.message ||
        error?.response?.data ||
        "Registration failed. Please try a different email.",
    };
  }
};
