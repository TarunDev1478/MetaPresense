// VideoCallUI.tsx
import React, { useEffect, useRef, useState } from 'react';
import { VideoCallManager } from './VideoCallManager';
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import CallEndIcon from '@mui/icons-material/CallEnd';
import GroupIcon from '@mui/icons-material/Group';

interface VideoCallUIProps {
  ws: WebSocket;
  currentUserId: string;
  currentRoom: Number;
  selectedUser?: string | null;
}

interface VideoStream {
  userId: string;
  stream: MediaStream;
}

export const VideoCallUI: React.FC<VideoCallUIProps> = ({ 
  ws, 
  currentUserId, 
  currentRoom,
  selectedUser 
}) => {
  const [isInCall, setIsInCall] = useState(false);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<VideoStream[]>([]);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [incomingCall, setIncomingCall] = useState<{ callId: string; senderId: string ,inroom:Number } | null>(null);
  const [showCallUI, setShowCallUI] = useState(false);
  const [focusedUserId, setFocusedUserId] = useState<string | null>(null);
  const roomId=currentRoom;
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const videoCallManagerRef = useRef<VideoCallManager | null>(null);

  useEffect(() => {
    if (!videoCallManagerRef.current) {
      videoCallManagerRef.current = new VideoCallManager(ws);
      
      // Set up event listeners
      videoCallManagerRef.current.on('localStream', (stream: MediaStream) => {
        setLocalStream(stream);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      });

      videoCallManagerRef.current.on('remoteStream', ({ userId, stream }: { userId: string; stream: MediaStream }) => {
        setRemoteStreams(prev => {
          const filtered = prev.filter(s => s.userId !== userId);
          return [...filtered, { userId, stream }];
        });
      });

      videoCallManagerRef.current.on('participantLeft', (userId: string) => {
        setRemoteStreams(prev => prev.filter(s => s.userId !== userId));
        if (focusedUserId === userId) {
          setFocusedUserId(null);
        }
      });

      videoCallManagerRef.current.on('callEnded', () => {
        setIsInCall(false);
        setLocalStream(null);
        setRemoteStreams([]);
        setShowCallUI(false);
        setFocusedUserId(null);
      });
    }

    // WebSocket message handler
    const handleWebSocketMessage = (event: MessageEvent) => {
      const message = JSON.parse(event.data);
      
      switch (message.type) {
        case 'video-call-start':
          if (message.payload.senderId !== currentUserId) {
            setIncomingCall({
              callId: message.payload.callId,
              senderId: message.payload.senderId,
              inroom: message.payload.roomId
            });
          }
          break;
          
        case 'video-offer':
          if (videoCallManagerRef.current && message.payload.senderId !== currentUserId) {
            videoCallManagerRef.current.handleVideoOffer(
              message.payload.senderId,
              message.payload.offer
            );
          }
          break;
          
        case 'video-answer':
          if (videoCallManagerRef.current) {
            videoCallManagerRef.current.handleVideoAnswer(
              message.payload.senderId,
              message.payload.answer
            );
          }
          break;
          
        case 'ice-candidate':
          if (videoCallManagerRef.current && message.payload.senderId !== currentUserId) {
            videoCallManagerRef.current.handleIceCandidate(
              message.payload.senderId,
              message.payload.candidate
            );
          }
          break;
          
        case 'video-call-join':
          if (videoCallManagerRef.current && isInCall && message.payload.userId !== currentUserId) {
            // New participant joined, initiate connection
            videoCallManagerRef.current.initiateConnectionWith(message.payload.userId);
          }
          break;
          
        case 'video-call-end':
          if (message.payload.senderId !== currentUserId) {
            videoCallManagerRef.current?.removeParticipant(message.payload.senderId);
          }
          break;
      }
    };

    ws.addEventListener('message', handleWebSocketMessage);

    return () => {
      ws.removeEventListener('message', handleWebSocketMessage);
    };
  }, [ws, currentUserId, isInCall, focusedUserId]);

  const startCall = async () => {
    if (videoCallManagerRef.current) {
      try {
        if (selectedUser) {
          // One-on-one call
          await videoCallManagerRef.current.startCall(selectedUser);
        } else if (currentRoom !== 0) {
          // Room call
          await videoCallManagerRef.current.startCall(undefined, currentRoom);
        }
        setIsInCall(true);
        setShowCallUI(true);
      } catch (error) {
        console.error('Failed to start call:', error);
      }
    }
  };

  const answerCall = async () => {
    if (videoCallManagerRef.current && incomingCall) {
      try {
        await videoCallManagerRef.current.joinCall(incomingCall.callId);
        setIsInCall(true);
        setShowCallUI(true);
        setIncomingCall(null);
      } catch (error) {
        console.error('Failed to answer call:', error);
      }
    }
  };

  const rejectCall = () => {
    setIncomingCall(null);
  };

  const endCall = () => {
    if (videoCallManagerRef.current) {
      videoCallManagerRef.current.endCall();
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
      }
    }
  };

  const toggleAudio = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioEnabled(audioTrack.enabled);
      }
    }
  };

  // Get all participants including local user
  const allParticipants = [
    { userId: currentUserId, stream: localStream, isLocal: true },
    ...remoteStreams.map(rs => ({ ...rs, isLocal: false }))
  ].filter(p => p.stream);

  // Find focused participant
  const focusedParticipant = focusedUserId 
    ? allParticipants.find(p => p.userId === focusedUserId) || allParticipants[0]
    : allParticipants[0];

  // Get other participants for thumbnails
  const thumbnailParticipants = allParticipants.filter(p => p.userId !== focusedParticipant?.userId);

  return (
    <>
      {/* Call Button */}
      {!isInCall && !incomingCall && (
        <div
          style={{
            position: 'fixed',
            bottom: '20px',
            left: '20px',
            zIndex: 1000
          }}
        >
          <button
            onClick={startCall}
            disabled={currentRoom === 0 && !selectedUser}
            style={{
              background: currentRoom === 0 && !selectedUser 
                ? 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)' 
                : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: 'white',
              padding: '14px 28px',
              borderRadius: '12px',
              border: 'none',
              cursor: currentRoom === 0 && !selectedUser ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontSize: '16px',
              fontWeight: '600',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              if (currentRoom !== 0 || selectedUser) {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.3)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2)';
            }}
          >
            <VideocamIcon />
            {selectedUser ? 'Call User' : 'Start Room Call'}
          </button>
        </div>
      )}

      {/* Incoming Call Modal */}
      {incomingCall?.inroom === roomId && (
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.98) 0%, rgba(30, 41, 59, 0.98) 100%)',
          padding: '32px',
          borderRadius: '16px',
          zIndex: 2000,
          textAlign: 'center',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)'
        }}>
          <h3 style={{ 
            color: 'white', 
            marginBottom: '24px',
            fontSize: '24px',
            fontWeight: '600'
          }}>
            Incoming Call
          </h3>
          <p style={{
            color: '#94a3b8',
            marginBottom: '24px',
            fontSize: '16px'
          }}>
            from {incomingCall.senderId.substring(0, 8)}...
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
            <button
              onClick={answerCall}
              style={{
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: 'white',
                padding: '12px 32px',
                borderRadius: '12px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: '600',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(16, 185, 129, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.3)';
              }}
            >
              Answer
            </button>
            <button
              onClick={rejectCall}
              style={{
                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                color: 'white',
                padding: '12px 32px',
                borderRadius: '12px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: '600',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(239, 68, 68, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.3)';
              }}
            >
              Reject
            </button>
          </div>
        </div>
      )}

      {/* Video Call UI */}
      {showCallUI && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: '#0a0a0a',
          zIndex: 1500,
          display: 'flex',
          flexDirection: 'column'
        }}>
          {/* Main Video Area */}
          <div style={{
            flex: 1,
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px'
          }}>
            {/* Focused Video (Large) */}
            {focusedParticipant && (
              <div style={{
                position: 'relative',
                width: '100%',
                height: '100%',
                maxWidth: thumbnailParticipants.length > 0 ? 'calc(100% - 180px)' : '100%',
                backgroundColor: '#1a1a1a',
                borderRadius: '16px',
                overflow: 'hidden',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
                transition: 'all 0.3s ease'
              }}>
                {focusedParticipant.isLocal ? (
                  <video
                    ref={localVideoRef}
                    autoPlay
                    muted
                    playsInline
                    style={{ 
                      width: '100%', 
                      height: '100%', 
                      objectFit: 'contain',
                      backgroundColor: '#000'
                    }}
                  />
                ) : (
                  <RemoteVideo 
                    userId={focusedParticipant.userId} 
                    stream={focusedParticipant.stream!} 
                    isLarge={true}
                  />
                )}
                
                {/* Name Label */}
                <div style={{
                  position: 'absolute',
                  bottom: '16px',
                  left: '16px',
                  background: 'rgba(0, 0, 0, 0.7)',
                  backdropFilter: 'blur(10px)',
                  color: 'white',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '500',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  {focusedParticipant.isLocal && (
                    <div style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: '#10b981',
                      animation: 'pulse 2s infinite'
                    }}></div>
                  )}
                  {focusedParticipant.isLocal ? 'You' : `${focusedParticipant.userId.substring(0, 8)}...`}
                </div>
              </div>
            )}

            {/* Thumbnail Strip */}
            {thumbnailParticipants.length > 0 && (
              <div style={{
                position: 'absolute',
                right: '16px',
                top: '50%',
                transform: 'translateY(-50%)',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                maxHeight: '80vh',
                overflowY: 'auto',
                overflowX: 'hidden',
                paddingRight: '8px',
                scrollbarWidth: 'thin',
                scrollbarColor: 'rgba(255, 255, 255, 0.2) transparent'
              }}>
                {thumbnailParticipants.map((participant) => (
                  <div
                    key={participant.userId}
                    onClick={() => setFocusedUserId(participant.userId)}
                    style={{
                      position: 'relative',
                      width: '160px',
                      height: '120px',
                      backgroundColor: '#2a2a2a',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      border: '2px solid transparent',
                      transition: 'all 0.3s ease',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.border = '2px solid #6366f1';
                      e.currentTarget.style.transform = 'scale(1.05)';
                      e.currentTarget.style.boxShadow = '0 6px 20px rgba(99, 102, 241, 0.3)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.border = '2px solid transparent';
                      e.currentTarget.style.transform = 'scale(1)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)';
                    }}
                  >
                    {participant.isLocal ? (
                      <video
                        ref={el => {
                          if (el && participant.stream) {
                            el.srcObject = participant.stream;
                          }
                        }}
                        autoPlay
                        muted
                        playsInline
                        style={{ 
                          width: '100%', 
                          height: '100%', 
                          objectFit: 'cover'
                        }}
                      />
                    ) : (
                      <RemoteVideo 
                        userId={participant.userId} 
                        stream={participant.stream!} 
                        isLarge={false}
                      />
                    )}
                    
                    {/* Thumbnail Label */}
                    <div style={{
                      position: 'absolute',
                      bottom: '8px',
                      left: '8px',
                      right: '8px',
                      background: 'rgba(0, 0, 0, 0.7)',
                      backdropFilter: 'blur(5px)',
                      color: 'white',
                      padding: '4px 8px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: '500',
                      textAlign: 'center',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {participant.isLocal ? 'You' : `${participant.userId.substring(0, 8)}...`}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Controls */}
          <div style={{
            position: 'absolute',
            bottom: '32px',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: '16px',
            background: 'rgba(15, 23, 42, 0.9)',
            backdropFilter: 'blur(20px)',
            padding: '16px 24px',
            borderRadius: '16px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
          }}>
            <button
              onClick={toggleVideo}
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '50%',
                border: 'none',
                background: isVideoEnabled 
                  ? 'rgba(99, 102, 241, 0.2)' 
                  : 'rgba(239, 68, 68, 0.2)',
                color: isVideoEnabled ? '#a5b4fc' : '#fca5a5',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.3s ease',
                position: 'relative'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.1)';
                e.currentTarget.style.background = isVideoEnabled 
                  ? 'rgba(99, 102, 241, 0.3)' 
                  : 'rgba(239, 68, 68, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.background = isVideoEnabled 
                  ? 'rgba(99, 102, 241, 0.2)' 
                  : 'rgba(239, 68, 68, 0.2)';
              }}
            >
              {isVideoEnabled ? <VideocamIcon /> : <VideocamOffIcon />}
            </button>

            <button
              onClick={toggleAudio}
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '50%',
                border: 'none',
                background: isAudioEnabled 
                  ? 'rgba(99, 102, 241, 0.2)' 
                  : 'rgba(239, 68, 68, 0.2)',
                color: isAudioEnabled ? '#a5b4fc' : '#fca5a5',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.1)';
                e.currentTarget.style.background = isAudioEnabled 
                  ? 'rgba(99, 102, 241, 0.3)' 
                  : 'rgba(239, 68, 68, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.background = isAudioEnabled 
                  ? 'rgba(99, 102, 241, 0.2)' 
                  : 'rgba(239, 68, 68, 0.2)';
              }}
            >
              {isAudioEnabled ? <MicIcon /> : <MicOffIcon />}
            </button>

            <button
              onClick={endCall}
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '50%',
                border: 'none',
                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                color: 'white',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.1)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(239, 68, 68, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.3)';
              }}
            >
              <CallEndIcon />
            </button>
          </div>

          {/* Participant Count */}
          <div style={{
            position: 'absolute',
            top: '24px',
            left: '24px',
            background: 'rgba(15, 23, 42, 0.8)',
            backdropFilter: 'blur(10px)',
            color: 'white',
            padding: '10px 20px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            fontSize: '16px',
            fontWeight: '500'
          }}>
            <GroupIcon />
            <span>{allParticipants.length} participant{allParticipants.length !== 1 ? 's' : ''}</span>
          </div>
        </div>
      )}

      <style>
        {`
          @keyframes pulse {
            0% {
              opacity: 1;
            }
            50% {
              opacity: 0.5;
            }
            100% {
              opacity: 1;
            }
          }
          
          /* Custom scrollbar for thumbnail strip */
          div::-webkit-scrollbar {
            width: 4px;
          }
          
          div::-webkit-scrollbar-track {
            background: rgba(255, 255, 255, 0.05);
            border-radius: 2px;
          }
          
          div::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.2);
            border-radius: 2px;
          }
          
          div::-webkit-scrollbar-thumb:hover {
            background: rgba(255, 255, 255, 0.3);
          }
        `}
      </style>
    </>
  );
};

// Updated Remote Video Component
const RemoteVideo: React.FC<{ userId: string; stream: MediaStream; isLarge: boolean }> = ({  stream, isLarge }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <video
      ref={videoRef}
      autoPlay
      playsInline
      style={{ 
        width: '100%', 
        height: '100%', 
        objectFit: isLarge ? 'contain' : 'cover',
        backgroundColor: '#000'
      }}
    />
  );
};