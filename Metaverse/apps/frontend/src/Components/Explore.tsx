import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Explore = () => {
  const [activeTab, setActiveTab] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [selectedSpace, setSelectedSpace] = useState<any>(null);
  const [roomIdInput, setRoomIdInput] = useState('');
  
  const tabs = ['All', 'Official', 'Event', 'Office', 'Edu', 'Game'];
  const token = localStorage.getItem('token');
  
  const spaces = [
    {
      id: 1,
      title: 'Meta Presence Office',
      category: 'Office',
      spaceId: 'cm9n7b75x001eseixijslzizw',
      description: 'A professional virtual office space for team collaboration and meetings',
      image: '/images/Institute.jpg'
    }
  ];
  
  const Navigate = useNavigate();
  const filteredSpaces = activeTab === 'All' ? spaces : spaces.filter(space => space.category === activeTab);
  
  const openSpace = (spaceId: any) => {
    const space = spaces.find(space => space.id === spaceId);
    if (space) {
      setSelectedSpace(space);
      setShowModal(true);
    } else {
      console.error('Space not found');
    }
  };
  
  const handleJoinRoom = () => {
    if (roomIdInput.trim() && selectedSpace) {
      Navigate(`/game/?token=${token}&spaceId=${selectedSpace.spaceId}&roomId=${roomIdInput}`);
    }
  };
  
  const handleCreateNew = () => {
    if (selectedSpace) {
      const roomId = Date.now().toString(36) + Math.random().toString(36).substr(2);
      Navigate(`/game/?token=${token}&spaceId=${selectedSpace.spaceId}&roomId=${roomId}`);
    }
  };
  
  const closeModal = () => {
    setShowModal(false);
    setSelectedSpace(null);
    setRoomIdInput('');
  };

  // Inline styles for animation
  const modalContentStyle = {
    position: 'fixed' as const,
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    background: 'white',
    borderRadius: '24px',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
    zIndex: 1001,
    maxWidth: '500px',
    width: '90%',
    opacity: showModal ? 1 : 0,
    transition: 'opacity 0.3s ease, transform 0.3s ease',
  };

  return (
    <div style={{minHeight: '100vh', background: 'linear-gradient(135deg, #faf5ff 0%, #eff6ff 100%)', fontFamily: 'Arial, sans-serif'}}>
      
      <div style={{background: 'linear-gradient(90deg, #f3e8ff 0%, #eff6ff 50%, #f3e8ff 100%)', padding: '40px 20px'}}>
        <div style={{maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
          <h1 style={{fontSize: '48px', fontWeight: 'bold', color: '#7c3aed', margin: '0'}}>Try Meta Presence Spaces Now</h1>
          
          <div style={{width: '400px', height: '200px', borderRadius: '12px', position: 'relative', transform: 'perspective(1000px) rotateY(10deg)', boxShadow: '0 20px 40px rgba(0,0,0,0.2)'}}>
            <img style={{width:'120%'}} src="/images/explore.png" alt="" />
          </div>
        </div>
      </div>

      <div style={{maxWidth: '1200px', margin: '0 auto', padding: '40px 20px'}}>
        
        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '30px'}}>
          <h2 style={{fontSize: '32px', fontWeight: 'bold', color: '#1f2937', margin: '0'}}>Explore</h2>
          <div style={{display: 'flex', alignItems: 'center', gap: '8px', color: '#7c3aed', fontWeight: '600'}}>
            <span>Meta Presence Official Partners</span>
            <div style={{width: '24px', height: '24px', background: '#7c3aed', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '12px'}}>★</div>
          </div>
        </div>

        <div style={{display: 'flex', gap: '8px', marginBottom: '40px', background: 'white', borderRadius: '50px', padding: '8px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)'}}>
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '12px 24px',
                borderRadius: '50px',
                border: 'none',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.3s',
                background: activeTab === tab ? '#7c3aed' : 'transparent',
                color: activeTab === tab ? 'white' : '#6b7280'
              }}
            >
              {tab}
            </button>
          ))}
        </div>
        
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginBottom: '40px'}}>
          {filteredSpaces.map((space) => (
            <div
              key={space.id}
              onClick={()=>openSpace(space.id)}
              style={{background: 'white', borderRadius: '16px',width:'250px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', overflow: 'hidden', cursor: 'pointer', transition: 'transform 0.3s, box-shadow 0.3s'}}
            >
              <div style={{height: '180px', position: 'relative',width:'250px',overflow:'hidden'}}>
                {space.id === 1 && (
                  <div style={{width: '100%', height: '100%', background: '#e8f5e8', padding: '20px'}}>
                    <img 
                      onMouseEnter={(e)=>{
                        (e.target as HTMLElement).style.width ='140%';
                      }}
                      onMouseLeave={(e)=>{
                        (e.target as HTMLElement).style.width ='127%';
                      }}
                      style={{transition: 'width 0.3s, box-shadow 0.3s',width:'127%',position:'relative',left:'-58px'}} 
                      src="/images/Institute.jpg" 
                      alt="" 
                    />
                  </div>
                )}
              </div>
              <div style={{padding: '20px'}}>
                <span style={{fontSize: '12px', fontWeight: '600', color: '#7c3aed', background: '#f3e8ff', padding: '4px 12px', borderRadius: '20px', marginBottom: '10px', display: 'inline-block'}}>{space.category}</span>
                <h3 style={{fontSize: '18px', fontWeight: 'bold', color: '#1f2937', margin: '8px 0 0 0'}}>{space.title}</h3>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      {showModal && selectedSpace && (
        <>
          {/* Backdrop */}
          <div 
            onClick={closeModal}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background: 'rgba(0, 0, 0, 0.7)',
              backdropFilter: 'blur(5px)',
              zIndex: 1000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          />
          
          {/* Modal Content */}
          <div style={modalContentStyle}>
            {/* Close Button */}
            <button
              onClick={closeModal}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: 'none',
                border: 'none',
                fontSize: '24px',
                cursor: 'pointer',
                color: '#6b7280',
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background 0.2s',
                zIndex: 1
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#f3f4f6'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
            >
              ✕
            </button>
            
            {/* Image Section */}
            <div style={{
              height: '200px',
              borderRadius: '24px 24px 0 0',
              overflow: 'hidden',
              position: 'relative'
            }}>
              <img 
                src={selectedSpace.image} 
                alt={selectedSpace.title}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
              <div style={{
                position: 'absolute',
                bottom: '20px',
                left: '20px',
                background: 'rgba(124, 58, 237, 0.9)',
                color: 'white',
                padding: '8px 16px',
                borderRadius: '20px',
                fontSize: '14px',
                fontWeight: '600'
              }}>
                {selectedSpace.category}
              </div>
            </div>
            
            {/* Content Section */}
            <div style={{padding: '30px'}}>
              <h2 style={{
                fontSize: '28px',
                fontWeight: 'bold',
                color: '#1f2937',
                margin: '0 0 10px 0'
              }}>
                {selectedSpace.title}
              </h2>
              
              <p style={{
                color: '#6b7280',
                fontSize: '16px',
                lineHeight: '1.6',
                margin: '0 0 30px 0'
              }}>
                {selectedSpace.description}
              </p>
              
              {/* Join Room Section */}
              <div style={{marginBottom: '20px'}}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  Join Existing Room
                </label>
                <div style={{display: 'flex', gap: '10px'}}>
                  <input
                    type="text"
                    placeholder="Enter Room ID"
                    value={roomIdInput}
                    onChange={(e) => setRoomIdInput(e.target.value)}
                    style={{
                      flex: 1,
                      padding: '12px 16px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '12px',
                      fontSize: '16px',
                      outline: 'none',
                      transition: 'border-color 0.2s'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#7c3aed'}
                    onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                  />
                  <button
                    onClick={handleJoinRoom}
                    disabled={!roomIdInput.trim()}
                    style={{
                      padding: '12px 24px',
                      background: roomIdInput.trim() ? '#7c3aed' : '#e5e7eb',
                      color: roomIdInput.trim() ? 'white' : '#9ca3af',
                      border: 'none',
                      borderRadius: '12px',
                      fontSize: '16px',
                      fontWeight: '600',
                      cursor: roomIdInput.trim() ? 'pointer' : 'not-allowed',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      if (roomIdInput.trim()) {
                        e.currentTarget.style.background = '#6d28d9';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (roomIdInput.trim()) {
                        e.currentTarget.style.background = '#7c3aed';
                      }
                    }}
                  >
                    Join
                  </button>
                </div>
              </div>
              
              {/* Divider */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                margin: '20px 0',
                gap: '10px'
              }}>
                <div style={{flex: 1, height: '1px', background: '#e5e7eb'}} />
                <span style={{color: '#9ca3af', fontSize: '14px'}}>OR</span>
                <div style={{flex: 1, height: '1px', background: '#e5e7eb'}} />
              </div>
              
              {/* Create New Room Button */}
              <button
                onClick={handleCreateNew}
                style={{
                  width: '100%',
                  padding: '14px',
                  background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'transform 0.2s',
                  boxShadow: '0 4px 20px rgba(124, 58, 237, 0.3)'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                Create New Room
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Explore;