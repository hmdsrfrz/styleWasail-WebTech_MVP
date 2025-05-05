// src/components/AuthButton.jsx
import { motion as Motion } from "framer-motion";

const AuthButton = ({ onClick }) => {
  return (
    <Motion.button
      whileHover={{ scale: 1.20 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      style={{
        fontFamily: 'Cal Sans',
        padding: "12px 24px",
        borderRadius: "12px", // Rounded rectangle
        border: "2px solid #000", // Sharp border
        boxShadow: "4px 4px 0px 0px rgb(94, 9, 65)", // Non-blurred drop shadow
        transition: "all 0.2s ease",
        backgroundColor: "transparent",
        color: 'rgb(66, 7, 46)',
        fontWeight: "600",
        fontSize: "20px",
        letterSpacing: "0.1em",
        cursor: "pointer",
        
      }}
    >
      Login/Signup
    </Motion.button>
  );
};

export default AuthButton;