// src/components/HeroText.jsx
import { motion as Motion } from "framer-motion";
import '../../fonts.css';

const Paragraph = ({ onClick }) => {
  return (
    <Motion.p
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      style={{
        fontFamily: 'Merryweather',
        fontWeight: '200',
        textAlign: 'center',
        fontSize: '1.5rem',
        color: 'rgb(94, 9, 65)',
        maxWidth: '72rem',
        padding: '12px 24px',
        borderRadius: '12px',
        border: '2px solid #000',
        boxShadow: '6px 6px 0px 0px rgb(94, 9, 65)',
        transition: 'all 0.2s ease',
        cursor: 'pointer',
      }}
    >
      Style Wasayl is a modern outfit-sharing platform that blends the visual appeal of Pinterest with the practicality of eBay.
      It allows users to sign up, list complete outfits with detailed components like shirts, shoes, and accessories, and rent items
      at affordable prices—typically 5% of their original cost. The platform is dynamic and user-driven, enabling seamless switching
      between renter and lender modes, much like Fiverr's buyer/seller toggle. With a clean, scrollable interface and interactive moodboards,
      Style Wasayl offers a creative and sustainable way to explore, share, and rent fashion.
    </Motion.p>
  );
};

const HeroText = () => {
  return (
    <Motion.div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        padding: '0 1rem',
        textAlign: 'center',
      }}
    >
      <Motion.h1
        className="shiny-text"
        style={{
          fontFamily: 'Cal Sans',
          fontSize: '7rem',
          fontWeight: 'bold',
          marginBottom: '1.5rem',
          backgroundImage: 'linear-gradient(to right, rgb(94, 9, 65), rgb(148, 6, 141))',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}
      >
        WELCOME TO STYLE WASAYL
      </Motion.h1>

      <Paragraph />
    </Motion.div>
  );
};

export default HeroText;
