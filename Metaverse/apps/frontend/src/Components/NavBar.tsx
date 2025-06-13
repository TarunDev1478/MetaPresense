import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";



type UserInfo = {
    username: string;
    
  };
  
const NavBar = () => {
    const token = localStorage.getItem('token');
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const navigate = useNavigate();
    const url = process.env.api
    // Get user info from localStorage (you might store this when user logs in)
    const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userInfo');
        navigate('/login');
        setDropdownOpen(false);
    };

    const toggleDropdown = () => {
        setDropdownOpen(!dropdownOpen);
    };
    useEffect(() => {
        const fetchUserData = async () => {
          try {
            const response = await fetch(`${url}/api/v1/user/me`, {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${token}`
              }
            });
      
            if (response.ok) {
              const data = await response.json();
              setUserInfo(data);
              console.log(data);
            } else {
              console.error('Failed to fetch user:', response.statusText);
            }
          } catch (error) {
            console.error('Fetch error:', error);
          }
        };
      
        fetchUserData();
      }, [token]);
      
    return (
        <div>
            <div style={{
                width: '100vw',
                height: '80px',
                backgroundColor: 'white',
                boxShadow: '-5px 1px 33px -10px',
                position: 'fixed',
                zIndex: '3'
            }}>
                <img style={{ width: '120px', height: '120px', position: 'absolute', top: '-28px', marginLeft: '50px', left: '170px' }} src="/images/Logo1.png" alt="Logo" />
                <div style={{ listStyle: 'none', display: 'flex', alignItems: 'center', height: '100%' }}>
                    <ul style={{ fontSize: '1.13rem', listStyle: 'none', display: 'flex', alignItems: 'center', position: 'relative', left: '400px', fontWeight: '1000' }}>
                        <Link to={'/'} style={{ color: 'black', cursor: 'pointer', textDecoration: 'none' }}>Home</Link>
                        <Link to={'/about'} style={{ color: 'black', marginLeft: '35px', cursor: 'pointer', textDecoration: 'none' }}>About</Link>
                        <Link to={'/explore'} style={{ color: 'black', marginLeft: '35px', cursor: 'pointer', textDecoration: 'none' }}>Explore</Link>
                        <Link to={'/contact'} style={{ color: 'black', marginLeft: '35px', cursor: 'pointer', textDecoration: 'none' }}>Contact us</Link>
                        
                        {!token && <Link style={{ cursor: 'pointer', color: 'white', borderRadius: '10px', position: 'relative', textDecoration: 'none', left: '450px', backgroundColor: 'rgb(117, 70, 222)', padding: '10px 40px' }} to={'/login'}>Login</Link>}
                        {!token && <Link style={{ cursor: 'pointer', color: 'rgb(117, 70, 222)', borderRadius: '10px', position: 'relative', textDecoration: 'none', left: '450px', marginLeft: '20px', backgroundColor: 'rgb(228, 218, 251)', padding: '10px 40px' }} to={'/signup'}>Signup</Link>}
                        
                        {token && (
                            <div style={{ position: 'relative', left: '500px', marginLeft: '20px' }}>
                                <div 
                                    onClick={toggleDropdown}
                                    style={{
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '10px',
                                        padding: '8px 16px',
                                        backgroundColor: 'rgb(228, 218, 251)',
                                        borderRadius: '10px',
                                        color: 'rgb(117, 70, 222)'
                                    }}
                                >
                                    <div style={{
                                        width: '35px',
                                        height: '35px',
                                        borderRadius: '50%',
                                        backgroundColor: 'rgb(117, 70, 222)',
                                        color: 'white',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '1.2rem'
                                    }}>
                                        {userInfo && userInfo!.username ? userInfo.username.charAt(0).toUpperCase() : 'P'}
                                    </div>
                                    <span>Profile</span>
                                    <span style={{ fontSize: '0.8rem' }}>▼</span>
                                </div>

                                {dropdownOpen && (
                                    <div style={{
                                        position: 'absolute',
                                        top: '50px',
                                        right: '0',
                                        backgroundColor: 'white',
                                        borderRadius: '10px',
                                        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                                        minWidth: '250px',
                                        zIndex: '10',
                                        padding: '20px',
                                        border: '1px solid #f0f0f0'
                                    }}>
                                        <div style={{ borderBottom: '1px solid #f0f0f0', paddingBottom: '15px', marginBottom: '15px' }}>
                                            <div style={{
                                                width: '60px',
                                                height: '60px',
                                                borderRadius: '50%',
                                                backgroundColor: 'rgb(117, 70, 222)',
                                                color: 'white',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: '2rem',
                                                margin: '0 auto 10px'
                                            }}>
                                                {userInfo!.username ? userInfo!.username.charAt(0).toUpperCase() : 'U'}
                                            </div>
                                            <h3 style={{ margin: '5px 0', textAlign: 'center', color: '#333' }}>
                                                {userInfo!.username || 'User'}
                                            </h3>
                                            <p style={{ margin: '0', fontSize: '0.9rem', color: '#666', textAlign: 'center' }}>
                                                {userInfo!.username || 'user@example.com'}
                                            </p>
                                        </div>
                                        
                     
                        
                                        
                                        <button
                                            onClick={handleLogout}
                                            style={{
                                                width: '100%',
                                                padding: '10px 15px',
                                                marginTop: '10px',
                                                backgroundColor: 'rgb(117, 70, 222)',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '5px',
                                                cursor: 'pointer',
                                                fontSize: '1rem',
                                                transition: 'background-color 0.2s'
                                            }}
                                            onMouseEnter={(e) =>{
                                                const event=e.target as HTMLElement;
                                                event.style.backgroundColor= 'rgb(97, 50, 202)'}}
                                            onMouseLeave={(e) => {
                                                const event=e.target as HTMLElement;
                                                event.style.backgroundColor = 'rgb(117, 70, 222)'}}
                                        >
                                            Logout
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </ul>
                </div>
            </div>
            
            {/* Click outside to close dropdown */}
            {dropdownOpen && (
                <div 
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        zIndex: 2
                    }}
                    onClick={() => setDropdownOpen(false)}
                />
            )}
        </div>
    );
}

export default NavBar;