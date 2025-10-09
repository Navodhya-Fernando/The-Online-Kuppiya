import React from 'react';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="app-footer bg-gray-800 text-white py-4 mt-auto">
      <div className="container text-center text-sm">
        <p>&copy; {currentYear} The Online Kuppiya. All rights reserved. | <span className="text-gray-400">Empowering student collaboration.</span></p>
      </div>
    </footer>
  );
};

export default Footer;