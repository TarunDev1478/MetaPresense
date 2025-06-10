// User.ts
import { WebSocket } from "ws";
import { OutgoingMessage } from "./types";
import { RoomManager } from "./RoomManager";
import { PrismaClient } from "@prisma/client";
import jwt, { JwtPayload } from "jsonwebtoken";
import { JWT_password } from "./config";

const client = new PrismaClient();

function getRandomString(length: number) {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}

export class User {
    public inVideoCall: boolean = false;
    public currentCallId?: string;
    public id: string;
    public userId?: string;
    private spaceId?: string;
    public roomId: string;
    public x: number;
    public y: number;
    public d: string;
    private ws: WebSocket;
    public im: boolean;

    constructor(ws: WebSocket) {
        this.id = getRandomString(10);
        this.x = 0;
        this.y = 0;
        this.ws = ws;
        this.d = "down";
        this.im = false;
        this.roomId = '';
        this.initHandlers();
    }

    initHandlers() {
        this.ws.on("message", async (data) => {
            try {
                const parsedData = JSON.parse(data.toString());
                console.log('\n=== Incoming WebSocket Message ===');
                console.log('Message Type:', parsedData.type);
                console.log('Full Message Data:', parsedData);
                console.log('================================\n');

                switch (parsedData.type) {
                    case "join":
                        await this.handleJoin(parsedData);
                        break;
                    case "move":
                        this.handleMove(parsedData);
                        break;
                    case "movement-stopped":
                        this.handleMovementStopped(parsedData);
                        break;
                    case "message":
                        this.handleMessage(parsedData);
                        break;
                    case "video-offer":
                        this.handleVideoOffer(parsedData);
                        break;
                    case "video-answer":
                        this.handleVideoAnswer(parsedData);
                        break;
                    case "ice-candidate":
                        this.handleIceCandidate(parsedData);
                        break;
                    case "video-call-start":
                        this.handleVideoCallStart(parsedData);
                        break;
                    case "video-call-end":
                        this.handleVideoCallEnd(parsedData);
                        break;
                    case "video-call-join":
                        this.handleVideoCallJoin(parsedData);
                        break;
                }
            } catch (error) {
                console.error("Error handling message:", error);
            }
        });

        this.ws.on("close", () => {
            console.log('\n=== WebSocket Connection Closed ===');
            console.log('User ID:', this.userId);
            console.log('Space ID:', this.spaceId);
            console.log('================================\n');
            this.destroy();
        });
    }

    private handleVideoOffer(parsedData: any) {
        const { targetUserId, offer, callId } = parsedData.payload;
        if (targetUserId) {
            RoomManager.getInstance().sendToUser(targetUserId, {
                type: "video-offer",
                payload: { offer, callId, senderId: this.userId }
            },this.roomId);
        } else if (this.roomId) {
            RoomManager.getInstance().broadcast({
                type: "video-offer",
                payload: { offer, callId, senderId: this.userId, roomId: this.roomId }
            }, this, this.roomId);
        }
    }

    private handleVideoAnswer(parsedData: any) {
        const { targetUserId, answer, callId } = parsedData.payload;
        if (targetUserId) {
            RoomManager.getInstance().sendToUser(targetUserId, {
                type: "video-answer",
                payload: { answer, callId, senderId: this.userId }
            },this.roomId);
        }
    }

    private handleIceCandidate(parsedData: any) {
        const { targetUserId, candidate, callId } = parsedData.payload;
        if (targetUserId) {
            RoomManager.getInstance().sendToUser(targetUserId, {
                type: "ice-candidate",
                payload: { candidate, callId, senderId: this.userId }
            },this.roomId);
        } else if (this.roomId) {
            RoomManager.getInstance().broadcast({
                type: "ice-candidate",
                payload: { candidate, callId, senderId: this.userId }
            }, this, this.roomId);
        }
    }

    private handleVideoCallStart(parsedData: any) {
        const { targetUserId } = parsedData.payload;
        const inroom = parsedData.payload.roomId
        console.log(parsedData.payload);
        this.inVideoCall = true;
        this.currentCallId = parsedData.payload.callId;
        console.log(this.roomId)
        if (targetUserId) {
            RoomManager.getInstance().sendToUser(targetUserId, {
                type: "video-call-start",
                payload: { callId: this.currentCallId, senderId: this.userId,roomId:0 }
            },this.roomId);
        } else if (inroom>0) {
            RoomManager.getInstance().broadcast({
                type: "video-call-start",
                payload: { callId: this.currentCallId, senderId: this.userId, roomId: inroom}
            }, null, this.roomId);
        }
    }

    private handleVideoCallEnd(parsedData: any) {
        this.inVideoCall = false;
        this.currentCallId = undefined;
        if (this.roomId) {
            RoomManager.getInstance().broadcast({
                type: "video-call-end",
                payload: { senderId: this.userId, callId: parsedData.payload.callId }
            }, null, this.roomId);
        }
    }

    private handleVideoCallJoin(parsedData: any) {
        const { callId } = parsedData.payload;
        this.inVideoCall = true;
        this.currentCallId = callId;
        if (this.roomId) {
            RoomManager.getInstance().broadcast({
                type: "video-call-join",
                payload: { userId: this.userId, callId }
            }, this, this.roomId);
        }
    }

    private handleMessage(parsedData: any) {
        if (!this.spaceId || !this.userId) return;

        const { content, targetUserId, roomId } = parsedData.payload;
        if (!content || content.trim() === '') return;

        const messagePayload = {
            type: "message",
            payload: {
                senderId: this.userId,
                content,
                timestamp: new Date().toISOString(),
                targetUserId,
                roomId
            }
        };

        if (targetUserId) {
            RoomManager.getInstance().sendDirectMessage(messagePayload, this.userId, targetUserId, this.roomId);
        } else if (roomId) {
            RoomManager.getInstance().broadcast(messagePayload, this, this.roomId);
        } else {
            RoomManager.getInstance().broadcast(messagePayload, this, this.roomId);
        }
    }

    private async handleMovementStopped(parsedData: any) {
        if (!this.spaceId) return;

        RoomManager.getInstance().broadcast({
            type: "movement-stopped",
            payload: {
                userId: this.userId,
                x: this.x,
                y: this.y,
                d: this.d,
                isMoving: false
            }
        }, null, this.roomId);
    }

    private async handleJoin(parsedData: any) {
        const { spaceId, token, roomId } = parsedData.payload;
        try {
            const decoded = jwt.verify(token, JWT_password) as JwtPayload;
            this.userId = decoded.userId;

            const space = await client.space.findFirst({ where: { id: spaceId } });
            if (!space) {
                this.ws.close();
                return;
            }

            this.spaceId = spaceId;
            this.roomId = roomId;
            this.x = Math.floor(Math.random() * space.width);
            this.y = Math.floor(Math.random() * space.height);

            const existingUsers = RoomManager.getInstance().getRoomUsers(roomId);

            this.send({
                type: "space-joined",
                payload: {
                    spawn: { x: this.x, y: this.y, d: this.d, ism: this.im },
                    userId: this.userId,
                    users: existingUsers.map(u => ({ userId: u.userId, x: u.x, y: u.y, d: u.d, isMoving: u.im }))
                }
            });

            RoomManager.getInstance().addUser(roomId, this);

            RoomManager.getInstance().broadcast({
                type: "user-joined",
                payload: { userId: this.userId, x: this.x, y: this.y, d: this.d, isMoving: this.im }
            }, null, roomId);
        } catch (error) {
            console.error("Join error:", error);
            this.ws.close();
        }
    }

    private handleMove(parsedData: any) {
        if (!this.spaceId) return;

        const { x, y, d, isMoving } = parsedData.payload;
        const xDelta = Math.abs(this.x - x);
        const yDelta = Math.abs(this.y - y);

        if ((xDelta <= 1 && yDelta === 0) || (xDelta === 0 && yDelta <= 1)) {
            this.x = x;
            this.y = y;
            this.d = d;
            this.im = isMoving;

            RoomManager.getInstance().broadcast({
                type: "movement",
                payload: { userId: this.userId, x: this.x, y: this.y, d: this.d, isMoving: this.im }
            }, null, this.roomId);
        } else {
            this.send({
                type: "movement-rejected",
                payload: { x: this.x, y: this.y, d: this.d, isMoving: false }
            });
        }
    }

    destroy() {
        if (this.roomId) {
            RoomManager.getInstance().broadcast({
                type: "user-left",
                payload: { userId: this.userId }
            }, null, this.roomId);
            RoomManager.getInstance().removeUser(this, this.roomId);
        }
    }

    send(payload: OutgoingMessage) {
        this.ws.send(JSON.stringify(payload));
    }
}
