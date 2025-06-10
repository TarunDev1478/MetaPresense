// VideoCallManager.ts
import { EventEmitter } from 'events';

interface VideoCallConfig {
  iceServers: RTCIceServer[];
}

interface CallParticipant {
  userId: string;
  stream?: MediaStream;
  connection?: RTCPeerConnection;
}

export class VideoCallManager extends EventEmitter {
  private localStream?: MediaStream;
  private participants: Map<string, CallParticipant> = new Map();
  private currentCallId?: string;
  private ws: WebSocket;
  private config: VideoCallConfig;
  private isInitiator: boolean = false;

  constructor(ws: WebSocket) {
    super();
    this.ws = ws;
    this.config = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ]
    };
  }

  async startCall(targetUserId?: string, roomId?: Number): Promise<string> {
    try {
      // Get user media
      this.localStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });

      this.currentCallId = this.generateCallId();
      this.isInitiator = true;
      const room=roomId?roomId:0;
      // Send call start signal
      this.ws.send(JSON.stringify({
        type: 'video-call-start',
        payload: {
          targetUserId,
          roomId:room,
          callId: this.currentCallId
        }
      }));

      this.emit('localStream', this.localStream);
      return this.currentCallId;
    } catch (error) {
      console.error('Error starting call:', error);
      throw error;
    }
  }

  async joinCall(callId: string): Promise<void> {
    try {
      this.localStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });

      this.currentCallId = callId;
      
      this.ws.send(JSON.stringify({
        type: 'video-call-join',
        payload: { callId }
      }));

      this.emit('localStream', this.localStream);
    } catch (error) {
      console.error('Error joining call:', error);
      throw error;
    }
  }

  async createPeerConnection(userId: string): Promise<RTCPeerConnection> {
    const pc = new RTCPeerConnection(this.config);

    // Add local stream tracks to peer connection
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => {
        pc.addTrack(track, this.localStream!);
      });
    }

    // Handle incoming stream
    pc.ontrack = (event) => {
      const participant = this.participants.get(userId) || { userId };
      participant.stream = event.streams[0];
      this.participants.set(userId, participant);
      this.emit('remoteStream', { userId, stream: event.streams[0] });
    };

    // Handle ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        this.ws.send(JSON.stringify({
          type: 'ice-candidate',
          payload: {
            targetUserId: userId,
            candidate: event.candidate,
            callId: this.currentCallId
          }
        }));
      }
    };

    // Handle connection state changes
    pc.onconnectionstatechange = () => {
      console.log(`Connection state with ${userId}: ${pc.connectionState}`);
      if (pc.connectionState === 'failed' || pc.connectionState === 'disconnected') {
        this.removeParticipant(userId);
      }
    };

    const participant = this.participants.get(userId) || { userId };
    participant.connection = pc;
    this.participants.set(userId, participant);

    return pc;
  }

  async handleVideoOffer(senderId: string, offer: RTCSessionDescriptionInit): Promise<void> {
    const pc = await this.createPeerConnection(senderId);
    await pc.setRemoteDescription(offer);
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);

    this.ws.send(JSON.stringify({
      type: 'video-answer',
      payload: {
        targetUserId: senderId,
        answer,
        callId: this.currentCallId
      }
    }));
  }

  async handleVideoAnswer(senderId: string, answer: RTCSessionDescriptionInit): Promise<void> {
    const participant = this.participants.get(senderId);
    if (participant?.connection) {
      await participant.connection.setRemoteDescription(answer);
    }
  }

  async handleIceCandidate(senderId: string, candidate: RTCIceCandidateInit): Promise<void> {
    const participant = this.participants.get(senderId);
    if (participant?.connection) {
      await participant.connection.addIceCandidate(candidate);
    }
  }

  async initiateConnectionWith(userId: string): Promise<void> {
    const pc = await this.createPeerConnection(userId);
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    this.ws.send(JSON.stringify({
      type: 'video-offer',
      payload: {
        targetUserId: userId,
        offer,
        callId: this.currentCallId
      }
    }));
  }

  endCall(): void {
    // Close all peer connections
    this.participants.forEach(participant => {
      if (participant.connection) {
        participant.connection.close();
      }
    });

    // Stop local stream
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
    }

    // Send end call signal
    this.ws.send(JSON.stringify({
      type: 'video-call-end',
      payload: { callId: this.currentCallId }
    }));

    // Clean up
    this.participants.clear();
    this.localStream = undefined;
    this.currentCallId = undefined;
    this.isInitiator = false;

    this.emit('callEnded');
  }

  removeParticipant(userId: string): void {
    const participant = this.participants.get(userId);
    if (participant) {
      if (participant.connection) {
        participant.connection.close();
      }
      this.participants.delete(userId);
      this.emit('participantLeft', userId);
    }
  }

  private generateCallId(): string {
    return `call-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  getParticipants(): string[] {
    return Array.from(this.participants.keys());
  }

  getLocalStream(): MediaStream | undefined {
    return this.localStream;
  }
}