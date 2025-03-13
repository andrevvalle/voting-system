import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

function Header() {
  const router = useRouter();
  
  const isActive = (path) => router.pathname === path;
  
  return (
    <header className="header">
      <div className="header-container">
        <Link href="/" className="logo">
          Sistema de Votação
        </Link>
        
        <nav className="nav">
          <ul className="nav-list">
            <li className="nav-item">
              <Link href="/" className={isActive('/') ? 'nav-link active' : 'nav-link'}>
                Home
              </Link>
            </li>
            <li className="nav-item">
              <Link href="/polls" className={isActive('/polls') ? 'nav-link active' : 'nav-link'}>
                Votações
              </Link>
            </li>
            <li className="nav-item">
              <Link href="/admin" className={isActive('/admin') ? 'nav-link active' : 'nav-link'}>
                Admin
              </Link>
            </li>
          </ul>
        </nav>
      </div>
      
      <style jsx="true">{`
        .header {
          background-color: #343a40;
          color: #fff;
          padding: 1rem 0;
        }
        
        .header-container {
          display: flex;
          justify-content: space-between;
          align-items: center;
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 1rem;
        }
        
        .logo {
          font-size: 1.5rem;
          font-weight: bold;
          color: white;
          text-decoration: none;
        }
        
        .nav-list {
          display: flex;
          list-style: none;
          margin: 0;
          padding: 0;
        }
        
        .nav-item {
          margin-left: 1.5rem;
        }
        
        .nav-link {
          color: rgba(255, 255, 255, 0.8);
          text-decoration: none;
          font-size: 1rem;
          transition: color 0.3s;
        }
        
        .nav-link:hover {
          color: white;
          text-decoration: none;
        }
        
        .nav-link.active {
          color: white;
          font-weight: bold;
        }
        
        @media (max-width: 768px) {
          .header-container {
            flex-direction: column;
          }
          
          .logo {
            margin-bottom: 1rem;
          }
          
          .nav-list {
            width: 100%;
            justify-content: space-between;
          }
          
          .nav-item {
            margin-left: 0;
          }
        }
      `}</style>
    </header>
  );
}

export default Header;