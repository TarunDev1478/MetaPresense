// RoomManager.ts
import type { User } from "./User";
import { OutgoingMessage } from "./types";

export class RoomManager {
    rooms: Map<string, User[]> = new Map();
    static instance: RoomManager;

    private constructor() {
        this.rooms = new Map();
    }

    static getInstance() {
        if (!this.instance) {
            this.instance = new RoomManager();
        }
        return this.instance;
    }

    public removeUser(user: User, spaceId: string) {
        if (!this.rooms.has(spaceId)) {
            return;
        }
        const updatedUsers = this.rooms.get(spaceId)?.filter((u) => u.id !== user.id) ?? [];
        if (updatedUsers.length === 0) {
            this.rooms.delete(spaceId);
        } else {
            this.rooms.set(spaceId, updatedUsers);
        }
    }

    public addUser(spaceId: string, user: User) {
        if (!this.rooms.has(spaceId)) {
            this.rooms.set(spaceId, [user]);
            return;
        }
        this.rooms.set(spaceId, [...(this.rooms.get(spaceId) ?? []), user]);
    }

    public broadcast(message: OutgoingMessage, excludeUser: User | null, roomId: string) {
        const room = this.rooms.get(roomId);
        if (!room) return;

        room.forEach((user) => {
            if (!excludeUser || user.id !== excludeUser.id) {
                user.send(message);
            }
        });
    }

    sendToUser(targetUserId: string, message: any,roomId:string) {
        const room = this.rooms.get(roomId);
        if (!room) {
            console.log(`Room ${roomId} not found for direct message`);
            return false;
        }
        const targetUser = room.find(user => user.userId === targetUserId);
            if (targetUser) {
                targetUser.send(message);
                return true;
            }else{
                console.log("user not found")
            }
            
        return false;
    }

    public sendDirectMessage(message: OutgoingMessage, senderId: string, targetUserId: string, roomId: string) {
        const room = this.rooms.get(roomId);
        if (!room) {
            console.log(`Room ${roomId} not found for direct message`);
            return false;
        }
        
        // Find the target user
        const targetUser = room.find(user => user.userId === targetUserId);
        if (!targetUser) {
            console.log(`Target user ${targetUserId} not found in room ${roomId}`);
            // Find the sender to notify them that the user wasn't found
            const sender = room.find(user => user.userId === senderId);
            if (sender) {
                const errorPayload = {
                    type: "message-error",
                    payload: {
                        error: "User not found",
                        targetUserId: targetUserId,
                        timestamp: new Date().toISOString()
                    }
                };
                sender.send(errorPayload);
            }
            return false;
        }
        
        // Send message to the target user
        console.log(targetUser)
        targetUser.send(message);
        
        // Also send a confirmation to the sender if they're not the same as target
        if (senderId !== targetUserId) {
            const sender = room.find(user => user.userId === senderId);
            if (sender) {
                const confirmationPayload = {
                    type: "message-sent",
                    payload: {
                        targetUserId: targetUserId,
                        content: message.payload.content,
                        timestamp: message.payload.timestamp
                    }
                };
                sender.send(confirmationPayload);
            }
        }
        
        return true;
    }
    
    // // Optional: Add a method to get user by ID
    // public getUserById(userId: string, roomId: string): User | undefined {
    //     const room = this.rooms.get(roomId);
    //     if (!room) return undefined;
        
    //     return room.find(user => user.userId === userId);
    // }

    public getRoomUsers(spaceId: string): User[] {
        return this.rooms.get(spaceId) ?? [];
    }
}