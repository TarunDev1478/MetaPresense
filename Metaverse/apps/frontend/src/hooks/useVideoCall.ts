import { useEffect, useRef, useState, useCallback } from 'react';
import io, { Socket } from 'socket.io-client';
import Peer from 'peerjs';

interface VideoCallOptions {
  userId: string;
  userName: string;
  videoServerUrl?: string;
}

interface RemoteUser {
  userId: string;
  userName: string;
  stream?: MediaStream;
  call?: any;
}

export const useVideoCall = ({ 
  userId, 
  userName, 
  videoServerUrl = 'http://localhost:3421' 
}: VideoCallOptions) => {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteUsers, setRemoteUsers] = useState<Map<string, RemoteUser>>(new Map());
  const [isInCall, setIsInCall] = useState(false);
  const [currentRoom, setCurrentRoom] = useState<string | null>(null);
  const [incomingCall, setIncomingCall] = useState<any>(null);

  const socketRef = useRef<Socket>();
  const peerRef = useRef<Peer>();
  const localStreamRef = useRef<MediaStream | null>(null);
  const callsRef = useRef<Map<string, any>>(new Map());

  // Initialize media
  const initializeMedia = useCallback(async (video = true, audio = true) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video, audio });
      localStreamRef.current = stream;
      setLocalStream(stream);
      return stream;
    } catch (error) {
      console.error('Error accessing media:', error);
      return null;
    }
  }, []);

  // Initialize PeerJS with your local server
  useEffect(() => {
    const peerId = `${userId}-${Date.now()}`;
    
    // Connect to your local PeerJS server
    peerRef.current = new Peer(peerId, {
      host: 'localhost',
      port: 3002,
      path: '/peerjs',
      secure: false, // Set to true if using HTTPS in production
      debug: 2,
      config: {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
          // Add TURN servers here if needed for production
          // {
          //   urls: 'turn:your-turn-server.com:3478',
          //   username: 'username',
          //   credential: 'password'
          // }
        ]
      }
    });

    peerRef.current.on('open', (id) => {
      console.log('PeerJS connected with ID:', id);
    });

    peerRef.current.on('call', async (call) => {
      console.log('Incoming call from:', call.peer);
      
      // Auto-answer calls when in a room
      if (currentRoom) {
        if (!localStreamRef.current) {
          await initializeMedia();
        }
        if (localStreamRef.current) {
          call.answer(localStreamRef.current);
          handleCallStream(call);
        }
      } else {
        // For direct calls, show incoming call notification
        setIncomingCall({ call, from: call.peer });
      }
    });

    peerRef.current.on('error', (err) => {
      console.error('PeerJS error:', err);
      // Handle specific errors
      if (err.type === 'network') {
        console.error('Network error - check if video server is running');
      } else if (err.type === 'peer-unavailable') {
        console.error('Peer not found');
      }
    });

    peerRef.current.on('disconnected', () => {
      console.log('PeerJS disconnected - attempting reconnect');
      // Attempt to reconnect
      if (!peerRef.current?.destroyed) {
        peerRef.current?.reconnect();
      }
    });

    return () => {
      peerRef.current?.destroy();
    };
  }, [userId, currentRoom]);

  // Connect to socket server
  useEffect(() => {
    socketRef.current = io(videoServerUrl);

    socketRef.current.on('connect', () => {
      console.log('Connected to video server');
      // Wait for PeerJS to be ready before registering
      const checkPeerReady = setInterval(() => {
        if (peerRef.current?.id) {
          socketRef.current?.emit('register-user', { 
            userId, 
            userName,
            peerId: peerRef.current.id 
          });
          clearInterval(checkPeerReady);
        }
      }, 100);
    });

    // Handle room events
    socketRef.current.on('room-users', (users: any[]) => {
      console.log('Room users:', users);
      // Connect to all users in the room
      users.forEach(user => {
        if (user.userId !== userId && user.peerId && !callsRef.current.has(user.peerId)) {
          callPeer(user.peerId, user);
        }
      });
    });

    socketRef.current.on('user-joined-room', async ({ user }) => {
      console.log('User joined room:', user);
      if (currentRoom && user.userId !== userId && user.peerId) {
        // Small delay to ensure peer is ready
        setTimeout(() => {
          callPeer(user.peerId, user);
        }, 1000);
      }
    });

    socketRef.current.on('user-left-room', ({ userId: leftUserId, peerId }) => {
      console.log('User left room:', leftUserId);
      const call = callsRef.current.get(peerId);
      if (call) {
        call.close();
        callsRef.current.delete(peerId);
      }
      setRemoteUsers(prev => {
        const updated = new Map(prev);
        updated.delete(leftUserId);
        return updated;
      });
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, [userId, userName, videoServerUrl, currentRoom]);

  // Handle call stream
  const handleCallStream = useCallback((call: any) => {
    const peerId = call.peer;
    console.log('Handling call stream from:', peerId);
    
    call.on('stream', (remoteStream: MediaStream) => {
      console.log('Received remote stream from:', peerId);
      setRemoteUsers(prev => {
        const updated = new Map(prev);
        updated.set(peerId, {
          userId: peerId,
          userName: 'User',
          stream: remoteStream,
          call
        });
        return updated;
      });
    });

    call.on('close', () => {
      console.log('Call closed with:', peerId);
      setRemoteUsers(prev => {
        const updated = new Map(prev);
        updated.delete(peerId);
        return updated;
      });
      callsRef.current.delete(peerId);
    });

    call.on('error', (err: any) => {
      console.error('Call error:', err);
    });

    callsRef.current.set(peerId, call);
  }, []);

  // Call a peer
  const callPeer = useCallback(async (peerId: string, userData?: any) => {
    console.log('Calling peer:', peerId);
    
    if (!localStreamRef.current) {
      const stream = await initializeMedia();
      if (!stream) {
        console.error('Failed to initialize media');
        return;
      }
    }

    if (peerRef.current && localStreamRef.current) {
      try {
        const call = peerRef.current.call(peerId, localStreamRef.current);
        
        if (call) {
          handleCallStream(call);
          
          if (userData) {
            setRemoteUsers(prev => {
              const updated = new Map(prev);
              updated.set(peerId, {
                userId: userData.userId,
                userName: userData.userName,
                call
              });
              return updated;
            });
          }
        } else {
          console.error('Failed to create call');
        }
      } catch (error) {
        console.error('Error calling peer:', error);
      }
    } else {
      console.error('PeerJS or local stream not ready');
    }
  }, [handleCallStream]);

  // Enter room
  const enterRoom = useCallback(async (roomId: string, position?: { x: number; y: number }) => {
    console.log('Entering room:', roomId);
    
    if (!localStreamRef.current) {
      await initializeMedia();
    }

    setCurrentRoom(roomId);
    setIsInCall(true);
    
    // Make sure peer is ready before joining room
    if (peerRef.current?.id) {
      socketRef.current?.emit('enter-room', { roomId, position });
    } else {
      // Wait for peer to be ready
      const checkPeer = setInterval(() => {
        if (peerRef.current?.id) {
          socketRef.current?.emit('enter-room', { roomId, position });
          clearInterval(checkPeer);
        }
      }, 100);
    }
  }, []);

  // Leave room
  const leaveRoom = useCallback(() => {
    if (currentRoom) {
      console.log('Leaving room:', currentRoom);
      socketRef.current?.emit('leave-room');
      
      // Close all calls
      callsRef.current.forEach(call => call.close());
      callsRef.current.clear();
      setRemoteUsers(new Map());
      
      setCurrentRoom(null);
      setIsInCall(false);
    }
  }, [currentRoom]);

  // Direct call to user
  const callUser = useCallback(async (targetPeerId: string) => {
    await callPeer(targetPeerId);
    setIsInCall(true);
  }, [callPeer]);

  // Answer incoming call
  const answerCall = useCallback(async (callData: any) => {
    if (!localStreamRef.current) {
      const stream = await initializeMedia();
      if (!stream) return;
    }

    if (localStreamRef.current) {
      callData.call.answer(localStreamRef.current);
      handleCallStream(callData.call);
      setIsInCall(true);
      setIncomingCall(null);
    }
  }, [handleCallStream]);

  // Reject call
  const rejectCall = useCallback(() => {
    if (incomingCall?.call) {
      incomingCall.call.close();
    }
    setIncomingCall(null);
  }, [incomingCall]);

  // Toggle video/audio
  const toggleVideo = useCallback(() => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
      }
    }
  }, []);

  const toggleAudio = useCallback(() => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
      }
    }
  }, []);

  // Update position
    // Update position
    const updatePosition = useCallback((position: { x: number; y: number }) => {
        socketRef.current?.emit('update-position', position);
      }, []);
    
      // End call
      const endCall = useCallback(() => {
        if (currentRoom) {
          leaveRoom();
        } else {
          callsRef.current.forEach(call => call.close());
          callsRef.current.clear();
          setRemoteUsers(new Map());
          setIsInCall(false);
        }
      }, [currentRoom, leaveRoom]);
    
      return {
        localStream,
        remoteUsers: Array.from(remoteUsers.values()),
        isInCall,
        currentRoom,
        incomingCall,
        enterRoom,
        leaveRoom,
        callUser,
        answerCall,
        rejectCall,
        toggleVideo,
        toggleAudio,
        updatePosition,
        endCall,
        peerId: peerRef.current?.id
      };
    };