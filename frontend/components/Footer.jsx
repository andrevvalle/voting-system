import React from 'react';

function Footer() {
  const year = new Date().getFullYear();
  
  return (
    <footer className="footer">
      <div className="footer-container">
        <p>&copy; {year} Sistema de Votação. Todos os direitos reservados.</p>
      </div>
      
      <style jsx>{`
        .footer {
          background-color: #343a40;
          color: rgba(255, 255, 255, 0.8);
          padding: 1.5rem 0;
          margin-top: 2rem;
        }
        
        .footer-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 1rem;
          text-align: center;
        }
      `}</style>
    </footer>
  );
}

export default Footer;