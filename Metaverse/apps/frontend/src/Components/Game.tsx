import { useEffect, useRef, useState } from 'react';
import MessageIcon from '@mui/icons-material/Message';
import SendIcon from '@mui/icons-material/Send';
import CloseIcon from '@mui/icons-material/Close';
import {VideoCallUI} from './VideoCall/VideoCallUI.tsx'
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import { compareSync } from 'bcrypt';
// Define interfaces for your types
interface Element {
  id: string;
  x: number;
  y: number;
  element: {
    imageUrl: string;
    width: number;
    height: number;
  };
}

interface Message {
  id: number;
  senderId: string;
  content: string;
  timestamp: string;
  isMine?: boolean;
  isDirect?: boolean;
  isDirectToMe?: boolean;
  isSystem?: boolean;
  targetUserId?: string | null;
  roomId?: number;
}

interface WebSocketPayload {
  type: string;
  payload: any;
}
interface PrivateMessageStore {
  [userId: string]: Message[];
}


interface User {
  x: number;
  y: number;
  userId: string;
  d: 'left' | 'right' | 'up' | 'down';
  isMoving: boolean;
}

const Arena = () => {
  const canvasRef = useRef<any>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const wsRef = useRef<any>(null);
  const [isInVideoCall, setIsInVideoCall] = useState(false);
const [videoCallParticipants, setVideoCallParticipants] = useState<string[]>([]);
  const [currentUser, setCurrentUser] = useState<any>({});
  const [users, setUsers] = useState(new Map());
  const [params, setParams] = useState({ token: '', spaceId: '',roomId:'' });
  const [spaceId, setId] = useState<string>();
  const [elements, setElements] = useState<any>([]);
  const [camera, setCamera] = useState({ x: 0, y: 0 });
  const VIEWPORT_WIDTH = 1525;  // Adjust these values as needed
  const VIEWPORT_HEIGHT = 769;
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState<string>('');
  const [showMessageDialog, setShowMessageDialog] = useState(false);
  const [hover, setHover] = useState(false);
  const [privateMessageStore, setPrivateMessageStore] = useState<PrivateMessageStore>({});
  const [broadcastMessages, setBroadcastMessages] = useState<Message[]>([]);
  const [inroom, setinRoom] = useState(0);
  const [sprites, setSprites] = useState<{
    left: HTMLImageElement[];
    right: HTMLImageElement[];
    up: HTMLImageElement[];
    down: HTMLImageElement[];
    idleLeft: HTMLImageElement[];
    idleRight: HTMLImageElement[];
    idleBack: HTMLImageElement[];
    idleFront: HTMLImageElement[];
  }>({
    left: [],
    right: [],
    up: [],
    down: [],
    idleLeft: [],
    idleRight: [],
    idleBack: [],
    idleFront: []
  });

  const [lfcurrentFrame, setLfCurrentFrame] = useState(0);
  const [udcurrentFrame, setUpCurrentFrame] = useState(0);
  const [direction, setDirection] = useState<'left' | 'right' | 'up' | 'down'>('right');
  const [isMoving, setIsMoving] = useState(false);
  // const [px, setpx] = useState<any>(new Map());
  const frameRate1 = 30;
  const frameRate2 = 80;
  const [elementImages, setElementImages] = useState<Map<string, any>>(new Map());
  const privateMessages = selectedUser ? (privateMessageStore[selectedUser] || []) : [];
  // New state for selected character info
  const [selectedCharacter, setSelectedCharacter] = useState<User | null>(null);
  const [showCharacterInfo, setShowCharacterInfo] = useState(false);
  const [count, setCount] = useState(0);
  const button = [{ x: 630, y: 342 }, { x: 712, y: 336 }, { x: 462, y: 999 }, { x: 957, y: 1021 }, { x: 1315, y: 1640 }, { x: 49, y: 1636 }];
  const [roomMessages, setRoomMessages] = useState<{ [roomId: string]: Message[] }>(() => {
    const savedRoomMessages = localStorage.getItem('roomMessages');
    return savedRoomMessages ? JSON.parse(savedRoomMessages) : {
      '1': [],
      '2': [],
      '3': [],
      '4': [],
      '5': [],
      '6': []
    };
  });

  useEffect(() => {
    const loadMessagesFromStorage = () => {
      try {
        // Load private messages
        const storedPrivateMessages = localStorage.getItem('privateMessages');
        if (storedPrivateMessages) {
          const parsedMessages = JSON.parse(storedPrivateMessages);
          setPrivateMessageStore(parsedMessages);
        }

        // Load broadcast messages
        const storedBroadcastMessages = localStorage.getItem('broadcastMessages');
        if (storedBroadcastMessages) {
          const parsedBroadcastMessages = JSON.parse(storedBroadcastMessages);
          setBroadcastMessages(parsedBroadcastMessages);
          // Also set as current messages when no user is selected
          setMessages(parsedBroadcastMessages);
        }
        const storedRoomMeesages = localStorage.getItem('roomMessages');
        if (storedRoomMeesages) {
          const parsedBroadcastMessages = JSON.parse(storedRoomMeesages);
          setRoomMessages(parsedBroadcastMessages);
          // Also set as current messages when no user is selected
          setMessages(parsedBroadcastMessages);
        }
      } catch (error) {
        console.error('Error loading messages from localStorage:', error);
      }
    };

    loadMessagesFromStorage();
  }, []);

  // useEffect(() => {
  //   saveMessagesToStorage();
  // }, [privateMessageStore, broadcastMessages]);
  useEffect(() => {
    const loadSprites = () => {
      const leftSprites: HTMLImageElement[] = [];
      const rightSprites: HTMLImageElement[] = [];
      const backSprites: HTMLImageElement[] = [];
      const frontSprites: HTMLImageElement[] = [];
      const leftIdleSprites: HTMLImageElement[] = [];
      const rightIdleSprites: HTMLImageElement[] = [];
      const backIdleSprites: HTMLImageElement[] = [];
      const frontIdleSprites: HTMLImageElement[] = [];
      let totalImages = 15 * 7 + 14; // Total images to load
      let imagesLoaded = 0;

      const checkAllImagesLoaded = () => {
        if (imagesLoaded === totalImages) {
          setSprites({
            left: leftSprites,
            right: rightSprites,
            idleLeft: leftIdleSprites,
            idleRight: rightIdleSprites,
            idleBack: backIdleSprites,
            idleFront: frontIdleSprites,
            up: backSprites,
            down: frontSprites,
          });
          console.log("All images loaded successfully.");
        }
      };

      const loadImage = (
        src: string,
        targetArray: HTMLImageElement[],
        description: string
      ) => {
        const img = new Image();
        img.src = src;
        img.onload = () => {
          console.log(`Loaded: ${description}`);
          targetArray.push(img);
          imagesLoaded++;
          checkAllImagesLoaded();
        };
        img.onerror = () => {
          console.error(`Failed to load: ${description}`);
          imagesLoaded++;
          checkAllImagesLoaded();
        };
      };

      // Load directional sprites (15 images each)
      for (let i = 1; i <= 15; i++) {
        loadImage(`/images/Le/r${i}.png`, leftSprites, `Left Sprite ${i}`);
        loadImage(`/images/Right/r${i}.png`, rightSprites, `Right Sprite ${i}`);
        loadImage(`/images/back/r${i}.png`, backSprites, `Back Sprite ${i}`);
        loadImage(`/images/Front/r${i}.png`, frontSprites, `Front Sprite ${i}`);
        loadImage(`/images/Le/${i}.png`, leftIdleSprites, `Left Idle ${i}`);
        loadImage(`/images/Right/${i}.png`, rightIdleSprites, `Right Idle ${i}`);
        loadImage(`/images/back/${i}.png`, backIdleSprites, `Back Idle ${i}`);
      }

      // Load idle front sprites (14 images)
      for (let i = 1; i <= 14; i++) {
        loadImage(`/images/Front/${i}.png`, frontIdleSprites, `Front Idle ${i}`);
      }
    };

    loadSprites();
  }, []);

  useEffect(() => {
    // if (!isMoving) return;

    const interval = setInterval(() => {
      setLfCurrentFrame((prev) => (prev + 1) % 15);
      // 7 frames in the animation
    }, frameRate1);

    const interval2 = setInterval(() => {
      setUpCurrentFrame((prev) => (prev + 1) % 14);
      // 7 frames in the animation
    }, frameRate2);

    // const interval2 = setInterval(() => {
    //   setUpCurrentFrame((prev) => (prev + 1) % 15); // 7 frames in the animation
    // }, frameRate);

    return () => { clearInterval(interval); clearInterval(interval2) }
  }, [frameRate1, frameRate2]);

  useEffect(() => {
    if (currentUser && currentUser.x !== undefined && currentUser.y !== undefined) {
      // Calculate camera position to keep player centered within viewport
      const cameraX = (currentUser.x * 10) - (VIEWPORT_WIDTH / 2) + 100;
      const cameraY = (currentUser.y * 10) - (VIEWPORT_HEIGHT / 2) + 100;

      setCamera({ x: cameraX, y: cameraY });
    }
  }, [currentUser?.x, currentUser?.y]);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token') || '';
    const spaceId = urlParams.get('spaceId') || '';
    const roomId = urlParams.get('roomId')||'';
    setParams({ token, spaceId,roomId });
    setId(spaceId);

    wsRef.current = new WebSocket('wss://metapresense-wsserver.onrender.com'); 

    wsRef.current.onopen = () => {
 
      wsRef.current.send(JSON.stringify({
        type: 'join',
        payload: {
          spaceId,
          token,
          roomId
        }
      }));
    };

    wsRef.current.onmessage = (event: any) => {
      const message = JSON.parse(event.data);
      handleWebSocketMessage(message);
    };

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  const url = process.env.api;
  useEffect(() => {
    const getSpace = async () => {
      try {
        const response = await fetch(`${url}/api/v1/space/${spaceId}`, {
          method: "GET",
        });
        const data = await response.json();
        console.log(data.space.elements);
        setElements(data.space.elements);
      } catch (error) {
        console.error("Error fetching space data:", error);
      }
    };

    if (spaceId) {
      getSpace();
    }
  }, [spaceId]);
  useEffect(() => {
    const loadElementImages = async () => {
      const imageMap = new Map<string, HTMLImageElement>();

      for (const element of elements) {
        const img = new Image();
        img.src = element.element.imageUrl;
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
        });
        imageMap.set(element.id, img);
      }

      setElementImages(imageMap);
    };

    if (elements.length > 0) {
      loadElementImages();
    }
  }, [elements]);

  //function to find in which room current user is
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [privateMessages, broadcastMessages, roomMessages]);
  const inRoom = () => {
    console.log("inroom")
    const roomsInfo = [
      {
        x1: 0,
        y1: 1560,
        x2: 550,
        y2: 2000
      },
      {
        x1: 860,
        y1: 1560,
        x2: 1390,
        y2: 2000,
      },
      {
        x1: 0,
        y1: 760,
        x2: 550,
        y2: 1130
      }, {
        x1: 940,
        y1: 760,
        x2: 1390,
        y2: 1160,
      }, {
        x1: 0,
        y1: 60,
        x2: 680,
        y2: 440
      }, {
        x1: 685,
        y1: 60,
        x2: 1400,
        y2: 440,
      }
    ]
    const characterCenterX = currentUser.x * 10 + 60; // Center of the 120px character
    const characterCenterY = currentUser.y * 10 + 60;
    var count=0;
    console.log("hii" + characterCenterX, characterCenterY)
    roomsInfo.map((val, index) => {
      if (
        characterCenterX + 20 >= val.x1 && characterCenterX + 20 <= val.x2 &&
        characterCenterY + 20 >= val.y1 && characterCenterY + 20 <= val.y2
      ) {
        setinRoom(index + 1);
        console.log(index + 1);
        count++;
      }
      if(count==0)setinRoom(0);
    })
  }


  const handleWebSocketMessage = (message: any) => {
    console.log(message);
    switch (message.type) {
      case 'space-joined':
        setCurrentUser({
          x: message.payload.spawn.x,
          y: message.payload.spawn.y,
          userId: message.payload.userId,
          d: message.payload.spawn.d,
          isMoving: message.payload.spawn.ism
        }); 
        const userMap = new Map();
        message.payload.users.forEach((user: any) => {
          if (user.userId !== message.payload.userId) {
            userMap.set(user.userId, {
              x: user.x,
              y: user.y,
              userId: user.userId,
              d: user.d,
              isMoving: user.isMoving
            });
          }
        });
        setUsers(userMap);
        break;

      case 'user-joined':
        if (message.payload.userId !== currentUser.userId) {
          setUsers(prev => {
            const newUsers = new Map(prev);
            newUsers.set(message.payload.userId, {
              x: message.payload.x,
              y: message.payload.y,
              userId: message.payload.userId,
              d: message.payload.d,
              isMoving: message.payload.isMoving
            });
            return newUsers;
          });
        }
        break;

      case 'movement':
        if (message.payload.userId === currentUser.userId) {
          setCurrentUser((prev: any) => ({
            ...prev,
            x: message.payload.x,
            y: message.payload.y,
            d: message.payload.d,
            isMoving: message.payload.isMoving
          }));
        } else {
          setUsers(prev => {
            const newUsers = new Map(prev);
            const existingUser = newUsers.get(message.payload.userId) || {};
            newUsers.set(message.payload.userId, {
              ...existingUser,
              x: message.payload.x,
              y: message.payload.y,
              d: message.payload.d,
              isMoving: message.payload.isMoving,
              userId: message.payload.userId
            });
            // Debug log to verify state update
            console.log('Updated user state:', newUsers.get(message.payload.userId));
            return newUsers;
          });
        }
        break;

      case 'movement-rejected':
        setCurrentUser((prev: any) => ({
          ...prev,
          x: message.payload.x,
          y: message.payload.y,
          d: message.payload.d,
          isMoving: message.payload.isMoving
        }));
        break;

      case 'movement-stopped':
        setUsers(prev => {
          const newUsers = new Map(prev);
          const existingUser = newUsers.get(message.payload.userId) || {};
          newUsers.set(message.payload.userId, {
            ...existingUser,
            x: message.payload.x,
            y: message.payload.y,
            d: message.payload.d,
            isMoving: false,
            userId: message.payload.userId
          });
          console.log('User stopped moving:', message.payload.userId);
          return newUsers;
        });
        break;
      case 'user-left':
        setUsers(prev => {
          const newUsers = new Map(prev);
          newUsers.delete(message.payload.userId);
          return newUsers;
        });
        break;
        case 'message':
          const isDirectMessage = message.payload.targetUserId !== undefined && message.payload.targetUserId !== '';
          const isRoomMessage = message.payload.roomId !== undefined && message.payload.roomId !== '';
        
          const messageObj: Message = {
            id: Date.now() + Math.random(), // Added randomness to ensure unique IDs
            senderId: message.payload.senderId,
            content: message.payload.content,
            timestamp: message.payload.timestamp || new Date().toISOString(),
            isDirect: isDirectMessage,
            isDirectToMe: isDirectMessage && message.payload.targetUserId === currentUser.userId,
            targetUserId: message.payload.targetUserId,
            roomId: message.payload.roomId 
          };
        
          if (isDirectMessage) {
            // Handle private messages
            if (message.payload.senderId === currentUser.userId) {
              // Outgoing private message
              const targetUserId = message.payload.targetUserId;
              setPrivateMessageStore(prev => {
                const prevState = prev || {};
                const userMessages = Array.isArray(prevState[targetUserId]) ? prevState[targetUserId] : [];
                const updatedMessages = [...userMessages, messageObj];
        
                try {
                  localStorage.setItem('privateMessages', JSON.stringify({ ...prevState, [targetUserId]: updatedMessages }));
                } catch (error) {
                  console.error('Error saving to localStorage:', error);
                }
        
                return {
                  ...prevState,
                  [targetUserId]: updatedMessages
                };
              });
        
              // Update current messages if viewing this conversation
              if (showMessageDialog && selectedUser === targetUserId) {
                setMessages(prevMessages => {
                  const prevArray = Array.isArray(prevMessages) ? prevMessages : [];
                  return [...prevArray, messageObj];
                });
              }
            } else if (message.payload.targetUserId === currentUser.userId) {
              // Incoming private message
              const senderId = message.payload.senderId;
              setPrivateMessageStore(prev => {
                const prevState = prev || {};
                const userMessages = Array.isArray(prevState[senderId]) ? prevState[senderId] : [];
                const updatedMessages = [...userMessages, messageObj];
        
                try {
                  localStorage.setItem('privateMessages', JSON.stringify({ ...prevState, [senderId]: updatedMessages }));
                } catch (error) {
                  console.error('Error saving to localStorage:', error);
                }
        
                return {
                  ...prevState,
                  [senderId]: updatedMessages
                };
              });
        
              // Update current messages if viewing this conversation
              if (showMessageDialog && selectedUser === senderId) {
                setMessages(prevMessages => {
                  const prevArray = Array.isArray(prevMessages) ? prevMessages : [];
                  return [...prevArray, messageObj];
                });
              }
            }
          } else if (isRoomMessage) {
            // Handle room message
            const roomId = message.payload.roomId;
            setRoomMessages(prev => {
              const prevState = prev || {};
              const roomMsgs = Array.isArray(prevState[roomId]) ? prevState[roomId] : [];
              const updatedRoomMsgs = [...roomMsgs, messageObj];
        
              const newRoomMessages = {
                ...prevState,
                [roomId]: updatedRoomMsgs
              };
        
              try {
                localStorage.setItem('roomMessages', JSON.stringify(newRoomMessages));
              } catch (error) {
                console.error('Error saving to localStorage:', error);
              }
        
              return newRoomMessages;
            });
        
            // Update current messages if viewing this room
            if (showMessageDialog && inroom.toString() === roomId.toString() && !selectedUser) {
              setMessages(prevMessages => {
                const prevArray = Array.isArray(prevMessages) ? prevMessages : [];
                return [...prevArray, messageObj];
              });
            }
          } else {
            // Broadcast message
            setBroadcastMessages(prev => {
              const prevArray = Array.isArray(prev) ? prev : [];
              const updatedMessages = [...prevArray, messageObj];
        
              try {
                localStorage.setItem('broadcastMessages', JSON.stringify(updatedMessages));
              } catch (error) {
                console.error('Error saving to localStorage:', error);
              }
        
              return updatedMessages;
            });
        
            // Update current messages if viewing broadcast messages
            if (showMessageDialog && inroom === 0 && !selectedUser) {
              setMessages(prevMessages => {
                const prevArray = Array.isArray(prevMessages) ? prevMessages : [];
                return [...prevArray, messageObj];
              });
            }
          }
          setCount(count + 1);
          break;
      case 'message-sent':
        // Handle confirmation of message sent
        addSystemMessage(`Message delivered to ${message.payload.targetUserId}`);
        break;
      case 'message-error':
        // Handle message error
        addSystemMessage(`Error sending message: ${message.payload.error}`);
        break;
      case 'video-call-start':
          if (message.payload.senderId !== currentUser.userId) {
            // Show notification for incoming call
            console.log('Incoming video call from:', message.payload.senderId);
          }
          break;
        
      case 'video-call-join':
          setVideoCallParticipants(prev => [...prev, message.payload.userId]);
          break;
        
      case 'video-call-end':
          setVideoCallParticipants(prev => prev.filter(id => id !== message.payload.senderId));
          if (message.payload.senderId === currentUser.userId) {
            setIsInVideoCall(false);
          }
          break;
    }
  };

  const handleMove = (newX: number, newY: number) => {
    if (!currentUser) return;
    console.log(newX,newY)
    // Calculate the center point of the character
    const characterCenterX = newX * 10 + 60; // Center of the 120px character
    const characterCenterY = newY * 10 + 60;

    // Create a smaller bounding box for more precise collision
    const userBoundingBox = {
      x: characterCenterX - 10,
      y: characterCenterY - 10,
      width: 20,
      height: 20,
    };

    let doorCollision = false;
    doorPositions.forEach((door, index) => {
      // Only check collision if door is closed or closing
      if (doorStates[index] || doorAnimations[index].animating) {
        // Simple bounding box for door (with some margin for player comfort)
        const doorBox = {
          x: door.x - 5,
          y: door.y - 10,
          width: door.width + 10,
          height: 20
        };

        // Check for intersection
        if (
          userBoundingBox.x < doorBox.x + doorBox.width &&
          userBoundingBox.x + userBoundingBox.width > doorBox.x &&
          userBoundingBox.y < doorBox.y + doorBox.height &&
          userBoundingBox.y + userBoundingBox.height > doorBox.y
        ) {
          doorCollision = true;
        }
      }
    });
    inRoom();
    if (doorCollision) {
      console.log("door rejection")
      wsRef.current.send(
        JSON.stringify({
          type: "movement-rejected",
          payload: {
            x: currentUser.x,
            y: currentUser.y,
            userId: currentUser.userId,
            d: direction,
            isMoving: false
          },
        })
      );
      setIsMoving(false);
      return;
    }


    // Get all visible room elements
    const visibleElements = getVisibleElements();
    const roomElements = visibleElements.filter((element: any) =>
      element.element.imageUrl && element.element.imageUrl.toLowerCase().includes('room')
    );

    // Function to check if a point is at a door position
    const isAtDoorPosition = (x: any, y: any) => {
      // Define door positions for each room
      // These values will need to be adjusted based on your actual door locations
      const doorPositions = [
        // Example format: {roomId: "room1", x1: 300, x2: 350, y1: 200, y2: 220},
        // This defines a door area from (300,200) to (350,220)
        { roomId: "room1", x1: 470, x2: 580, y1: 540, y2: 550 },
        { roomId: "room2", x1: 770, x2: 890, y1: 540, y2: 550 },
        { roomId: "room3", x1: 310, x2: 430, y1: 1190, y2: 1200 },
        { roomId: "room4", x1: 1020, x2: 1240, y1: 1190, y2: 1200 },
        { roomId: "room5", x1: 110, x2: 220, y1: 1550, y2: 1590 },
        { roomId: "room6", x1: 1170, x2: 1290, y1: 1550, y2: 1590 },
        // Add all your door positions here
      ];
      console.log(x, y)
      // Check if the given position is within any door area
      return doorPositions.some(door =>
        (x >= door.x1 && x <= door.x2 && y >= door.y1 && y <= door.y2) ||
        (x >= door.x1 && x <= door.x2 && y <= door.y1 && y >= door.y2)
      );
    };

    // Determine if player would cross a room boundary that is NOT a door
    let wouldCrossWall = false;
    
    roomElements.forEach((room: any) => {
      const isCurrentlyInside = (
        currentUser.x * 10 + 60 > room.x &&
        currentUser.x * 10 + 60 < room.x + room.element.width &&
        currentUser.y * 10 + 60 > room.y &&
        currentUser.y * 10 + 60 < room.y + room.element.height
      );

      const wouldBeInside = (
        characterCenterX > room.x &&
        characterCenterX < room.x + room.element.width &&
        characterCenterY > room.y &&
        characterCenterY < room.y + room.element.height
      );

      // If transitioning from inside to outside or outside to inside
      if (isCurrentlyInside !== wouldBeInside) {
        // Check if the player is passing through a door
        const passingThroughDoor = isAtDoorPosition(characterCenterX, characterCenterY);

        // Only consider it a wall crossing if not passing through a door
        if (!passingThroughDoor) {
          wouldCrossWall = true;
        }
      }
    });

    // If player would cross a wall (not a door), reject the movement
    if (wouldCrossWall) {
      console.log("wall movment rejection")
      wsRef.current.send(
        JSON.stringify({
          type: "movement-rejected",
          payload: {
            x: currentUser.x,
            y: currentUser.y,
            userId: currentUser.userId,
            d: direction,
            isMoving: false
          },
        })
      );
      setIsMoving(false);
      return;
    }
    console.log("move")
    setCurrentUser((prev: any) => ({
      ...prev,
      x: newX,
      y: newY,
      d: direction,
      isMoving: true
    }));
    // If no wall crossing, allow the movement
    wsRef.current.send(
      JSON.stringify({
        type: "move",
        payload: {
          x: newX,
          y: newY,
          userId: currentUser.userId,
          d: direction,
          isMoving: true,
        },
      })
    );
  };

  const [doorStates, setDoorStates] = useState(Array(6).fill(true)); // true = closed
  const [doorAnimations, setDoorAnimations] = useState(
    Array(6).fill({ animating: false, progress: 0, opening: false })
  );

  const doorPositions = [
    { x: 459, y: 458, width: 150, height: 100, rotation: 0 }, // Door 1
    { x: 769, y: 458, width: 150, height: 100, rotation: 0 }, // Door 2
    { x: 310, y: 1112, width: 150, height: 10, rotation: 0 }, // Door 3s
    { x: 1000, y: 1150, width: 130, height: 10, rotation: 0 }, // Door 4
    { x: 1160, y: 1602, width: 139, height: 10, rotation: 0 }, // Door 5
    { x: 100, y: 1600, width: 142, height: 10, rotation: 0 }  // Door 6
  ];
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Convert screen coordinates to world coordinates
    const worldX = mouseX + camera.x;
    const worldY = mouseY + camera.y;

    console.log(`Click at world coordinates: ${worldX}, ${worldY}`);

    // Check if click is on current user
    if (currentUser && currentUser.x) {
      const centerX = camera.x + (VIEWPORT_WIDTH / 2) - 100;
      const centerY = camera.y + (VIEWPORT_HEIGHT / 2) - 100;

      if (
        worldX >= centerX &&
        worldX <= centerX + 100 &&
        worldY >= centerY &&
        worldY <= centerY + 100
      ) {
        setSelectedCharacter({
          userId: currentUser.userId,
          x: currentUser.x,
          y: currentUser.y,
          d: currentUser.d || direction,
          isMoving: isMoving
        });
        setShowCharacterInfo(true);
        console.log("Current user selected");
        return;
      }
    }

    // Check if click is on other users
    let foundUser = false;
    users.forEach((user) => {
      if (user.x && user.y) {
        const userScreenX = user.x * 10;
        const userScreenY = user.y * 10;

        if (
          worldX >= userScreenX &&
          worldX <= userScreenX + 50 &&
          worldY >= userScreenY &&
          worldY <= userScreenY + 50
        ) {
          setSelectedCharacter(user);
          setShowCharacterInfo(true);
          foundUser = true;
          console.log("Other user selected:", user);
        }
      }
    });

    button.forEach((buttonPos, index) => {
      if (
        worldX >= buttonPos.x &&
        worldX <= buttonPos.x + 50 &&
        worldY >= buttonPos.y &&
        worldY <= buttonPos.y + 50
      ) {
        // Toggle door state
        setDoorStates(prevStates => {
          const newStates = [...prevStates];
          newStates[index] = !newStates[index];
          return newStates;
        });

        // Start door animation
        setDoorAnimations(prev => {
          const newAnimations = [...prev];
          newAnimations[index] = {
            animating: true,
            progress: 0,
            opening: doorStates[index] // If currently closed, we're opening
          };
          return newAnimations;
        });

        console.log(`Door ${index + 1} ${doorStates[index] ? "opening" : "closing"}`);
      }
    });

    // If clicked elsewhere, close the info panel
    if (!foundUser) {
      setShowCharacterInfo(false);
      setSelectedCharacter(null);
    }
  };


  useEffect(() => {
    const animationInterval = setInterval(() => {
      setDoorAnimations(prev => {
        const newAnimations = [...prev];
        let needsUpdate = false;

        newAnimations.forEach((anim, index) => {
          if (anim.animating) {
            // Increase progress
            newAnimations[index].progress += 0.02; // Adjust speed as needed
            needsUpdate = true;

            // Check if animation is complete
            if (newAnimations[index].progress >= 1) {
              newAnimations[index].animating = false;
              newAnimations[index].progress = 1;
            }
          }
        });

        return needsUpdate ? newAnimations : prev;
      });
    }, 16); // ~60fps

    return () => clearInterval(animationInterval);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = VIEWPORT_WIDTH;
    canvas.height = VIEWPORT_HEIGHT;

    const ctx = canvas.getContext("2d");
    let animationFrameId: number;

    const render = () => {
      if (!ctx) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();

      // Apply camera transform
      ctx.translate(-camera.x, -camera.y);

      // Fill the entire canvas with black first
      ctx.fillStyle = "#000000";
      ctx.fillRect(
        camera.x,
        camera.y,
        canvas.width,
        canvas.height
      );

      // Define the region that should be colored
      const coloredRegionX = 0;
      const coloredRegionY = 50;
      const coloredRegionWidth = 1400;
      const coloredRegionHeight = 2500;

      // Draw a colored rectangle within the specified coordinates
      ctx.fillStyle = "#d1c5be";
      ctx.fillRect(
        coloredRegionX,
        coloredRegionY,
        coloredRegionWidth,
        coloredRegionHeight
      );
      // Draw all elements
      elements.forEach((element: any) => {
        const elementImage = elementImages.get(element.id);
        if (elementImage) {
          ctx.drawImage(
            elementImage,
            element.x,
            element.y,
            element.element.width,
            element.element.height
          );
        }
      });
      // if (currentUser && currentUser.x) {
      //   ctx.strokeStyle = 'red';
      //   ctx.lineWidth = 2;
      //   const centerX = camera.x + (VIEWPORT_WIDTH / 2) - 100 + 50;
      //   const centerY = camera.y + (VIEWPORT_HEIGHT / 2) - 100 + 50;
      //   ctx.strokeRect(centerX, centerY, 20, 20);
      // }

      // For elements (walls, etc.)
      // m;k

      doorPositions.forEach((door, index) => {
        const isClosing = doorStates[index] === false && doorAnimations[index].animating;
        const isOpening = doorStates[index] === true && doorAnimations[index].animating;
        const isClosed = doorStates[index] === true && !doorAnimations[index].animating;

        if (isClosing || isOpening || isClosed) {
          ctx.save();

          // Set line style for door
          ctx.strokeStyle = '#433f47'; // Red for visibility
          ctx.lineWidth = 98;

          // Apply rotation if needed
          if (door.rotation !== 0) {
            // Calculate center of door
            const centerX = door.x + door.width / 2;
            const centerY = door.y + door.height / 2;

            ctx.translate(centerX, centerY);
            ctx.rotate(door.rotation * Math.PI / 180);
            ctx.translate(-centerX, -centerY);
          }

          // Draw the gate line
          if (isClosing) {
            // Animation for closing: line grows from 0 to full width
            const progress = doorAnimations[index].progress;
            const currentWidth = door.width * (1 - progress);

            ctx.beginPath();
            ctx.moveTo(door.x, door.y);
            ctx.lineTo(door.x + currentWidth, door.y);
            ctx.stroke();
          } else if (isOpening) {
            // Animation for opening: line shrinks from full width to 0

            const progress = doorAnimations[index].progress;
            const currentWidth = door.width * progress;

            ctx.beginPath();
            ctx.moveTo(door.x, door.y);
            ctx.lineTo(door.x + currentWidth, door.y);
            ctx.stroke();
          } else if (isClosed) {
            // Door is fully closed: draw full line
            ctx.beginPath();
            ctx.moveTo(door.x, door.y);
            ctx.lineTo(door.x + door.width, door.y);
            ctx.stroke();
          }

          ctx.restore();
        }
      });
      // Draw other users
      users.forEach((user) => {
        if (user.userId === currentUser.userId || !user.x) return;
        let spriteFrame;

        if (user.isMoving) {
          switch (user.d) {
            case "right":
              spriteFrame = sprites.right[lfcurrentFrame];
              break;
            case "left":
              spriteFrame = sprites.left[lfcurrentFrame];
              break;
            case "up":
              spriteFrame = sprites.up[lfcurrentFrame];
              break;
            case "down":
              spriteFrame = sprites.down[lfcurrentFrame];
              break;
            default:
              spriteFrame = sprites.idleFront[lfcurrentFrame];
          }
        } else {
          switch (user.d) {
            case "right":
              spriteFrame = sprites.idleRight[udcurrentFrame];
              break;
            case "left":
              spriteFrame = sprites.idleLeft[udcurrentFrame];
              break;
            case "up":
              spriteFrame = sprites.idleBack[udcurrentFrame];
              break;
            case "down":
              spriteFrame = sprites.idleFront[udcurrentFrame];
              break;
            default:
              spriteFrame = sprites.idleFront[udcurrentFrame];
          }
        }

        if (spriteFrame instanceof HTMLImageElement) {
          ctx.drawImage(
            spriteFrame,
            user.x * 10,
            user.y * 10,
            120,
            120
          );
        }
      });
      if (currentUser && currentUser.x) {
        let spriteFrame;
        if (isMoving) {
          switch (direction) {
            case "right":
              spriteFrame = sprites.right[lfcurrentFrame];
              break;
            case "left":
              spriteFrame = sprites.left[lfcurrentFrame];
              break;
            case "up":
              spriteFrame = sprites.up[lfcurrentFrame];
              break;
            case "down":
              spriteFrame = sprites.down[lfcurrentFrame];
              break;
            default:
              spriteFrame = sprites.idleFront[lfcurrentFrame];
          }
        } else {
          switch (direction) {
            case "right":
              spriteFrame = sprites.idleRight[udcurrentFrame];
              break;
            case "left":
              spriteFrame = sprites.idleLeft[udcurrentFrame];
              break;
            case "up":
              spriteFrame = sprites.idleBack[udcurrentFrame];
              break;
            case "down":
              spriteFrame = sprites.idleFront[udcurrentFrame];
              break;
            default:
              spriteFrame = sprites.idleFront[udcurrentFrame];
          }
        }

        if (spriteFrame instanceof HTMLImageElement) {
          const centerX = camera.x + (VIEWPORT_WIDTH / 2) - 100;
          const centerY = camera.y + (VIEWPORT_HEIGHT / 2) - 100;
          ctx.drawImage(
            spriteFrame,
            centerX,
            centerY,
            120,
            120
          );
        }
      }

      ctx.restore();
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [currentUser, users, sprites, lfcurrentFrame, udcurrentFrame, direction, isMoving, camera, elements, elementImages, selectedCharacter]);


  const handleKeyDown = (e: any) => {
    if (!currentUser) return;
    if(e.key=='w' || e.key=='a' ||e.key=='s'||e.key=='d'){
    const { x, y } = currentUser;
    console.log(x, y);
    console.log(isMoving);
    setIsMoving(true);
    switch (e.key) {
      case 'w':
        setDirection('up');
        handleMove(x, y - 1);
        break;
      case 's':
        setDirection('down');
        handleMove(x, y + 1);
        break;
      case 'a':
        setDirection('left');
        handleMove(x - 1, y);
        break;
      case 'd':
        setDirection('right');
        handleMove(x + 1, y);
        break;
    }
  }
  };
  const handleKeyUp = (e: KeyboardEvent) => {
    const { key } = e;
    if (key === 'a' || key === 'd' || key === 'w' || key === 's') {
      setIsMoving(false);
      const { x, y } = currentUser;
      // console.log(x,y);
      wsRef.current.send(
        JSON.stringify({
          type: "movement-stopped",
          payload: {
            x: x,
            y: y,
            userId: currentUser.userId,
            d: direction,
            isMoving: false,
          },
        })
      );

      console.log(`Key released: ${key}`);
    }
  };
  const isInViewport = (elementX: number, elementY: number, elementWidth: number, elementHeight: number) => {
    const viewportLeft = camera.x;
    const viewportRight = camera.x + VIEWPORT_WIDTH;
    const viewportTop = camera.y;
    const viewportBottom = camera.y + VIEWPORT_HEIGHT;

    return (
      elementX + elementWidth > viewportLeft &&
      elementX < viewportRight &&
      elementY + elementHeight > viewportTop &&
      elementY < viewportBottom
    );
  };

  const getVisibleElements = () => {
    return elements.filter((element: any) =>
      isInViewport(
        element.x,
        element.y,
        element.element.width,
        element.element.height
      )
    );
  };

  const closeCharacterInfo = () => {
    setShowCharacterInfo(false);
    setSelectedCharacter(null);
    setSelectedUser(null)
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, [currentUser, direction]);
  const addSystemMessage = (text: string): void => {
    const systemMessage: Message = {
      id: Date.now(),
      senderId: 'System',
      content: text,
      timestamp: new Date().toISOString(),
      isSystem: true
    };
  
    setMessages(prevMessages => {
      const prevArray = Array.isArray(prevMessages) ? prevMessages : [];
      return [...prevArray, systemMessage];
    });
  };

  const openMessageDialog = () => {
    setShowMessageDialog(true);

    if (selectedCharacter && selectedCharacter.userId !== currentUser.userId) {
      // Direct message to selected character
      setSelectedUser(selectedCharacter.userId);
      const userMessages = privateMessageStore[selectedCharacter.userId] || [];
      setMessages(userMessages);
    } else if (inroom > 0) {
      // In a room
      setSelectedUser(null);
      const roomId = inroom.toString();
      const roomMsgs = roomMessages[roomId] || [];
      setMessages(roomMsgs);
      console.log('Opening room messages for room:', roomId, roomMsgs);
    } else {
      // Broadcast messages (default)
      setSelectedUser(null);
      setMessages([...broadcastMessages]);
    }
  };
  const closeMessageDialog = () => {
    setShowMessageDialog(false);
    setSelectedUser(null);
  };

  const sendMessage = (): void => {
    if (!wsRef.current || !messageText.trim()) return;
  
    const timestamp = new Date().toISOString();
  
    if (selectedUser) {
      // Private message
      console.log(selectedUser);
      const messageData: WebSocketPayload = {
        type: 'message',
        payload: {
          content: messageText,
          targetUserId: selectedUser,
          senderId: currentUser.userId,
          timestamp: timestamp
        }
      };
  
      try {
        wsRef.current.send(JSON.stringify(messageData));
  
        const messageObj: Message = {
          id: Date.now(),
          senderId: currentUser.userId,
          content: messageText,
          timestamp: timestamp,
          isMine: true,
          isDirect: true,
          targetUserId: selectedUser
        };
  
        setPrivateMessageStore(prev => {
          const userMessages = prev[selectedUser] || [];
          const updatedMessages = [...userMessages, messageObj];
          localStorage.setItem('privateMessages', JSON.stringify({ ...prev, [selectedUser]: updatedMessages }));
          return {
            ...prev,
            [selectedUser]: updatedMessages
          };
        });
  
        // Fix here
        setMessages(prevMessages => {
          const prevArray = Array.isArray(prevMessages) ? prevMessages : [];
          return [...prevArray, messageObj];
        });
        setMessageText('');
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        addSystemMessage(`Error sending message: ${errorMessage}`);
      }
    } else if (inroom > 0) {
      // Room message
      const roomId = inroom.toString();
      console.log('in room message');
      const messageData: WebSocketPayload = {
        type: 'message',
        payload: {
          content: messageText,
          roomId: roomId,
          senderId: currentUser.userId,
          timestamp: timestamp
        }
      };
      
      try {
        wsRef.current.send(JSON.stringify(messageData));
  
        const messageObj: Message = {
          id: Date.now(),
          senderId: currentUser.userId,
          content: messageText,
          timestamp: timestamp,
          isMine: true,
          roomId: inroom
        };
  
        setRoomMessages(prev => {
          const roomMsgs = prev[roomId] || [];
          const updatedRoomMsgs = [...roomMsgs, messageObj];
  
          const newRoomMessages = {
            ...prev,
            [roomId]: updatedRoomMsgs
          };
  
          localStorage.setItem('roomMessages', JSON.stringify(newRoomMessages));
          return newRoomMessages;
        });
  
        // Fix here
        setMessages(prevMessages => {
          const prevArray = Array.isArray(prevMessages) ? prevMessages : [];
          return [...prevArray, messageObj];
        });
        setMessageText('');
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        addSystemMessage(`Error sending message: ${errorMessage}`);
      }
    } else {
      // Broadcast message
      console.log('hii2');
      const messageData: WebSocketPayload = {
        type: 'message',
        payload: {
          content: messageText,
          senderId: currentUser.userId,
          timestamp: timestamp
        }
      };
  
      try {
        wsRef.current.send(JSON.stringify(messageData));
  
        const messageObj: Message = {
          id: Date.now(),
          senderId: currentUser.userId,
          content: messageText,
          timestamp: timestamp,
          isMine: true
        };
  
        setBroadcastMessages(prev => {
          const updatedMessages = [...prev, messageObj];
          localStorage.setItem('broadcastMessages', JSON.stringify(updatedMessages));
          return updatedMessages;
        });
  
        // Fix here
        setMessages(prevMessages => {
          const prevArray = Array.isArray(prevMessages) ? prevMessages : [];
          return [...prevArray, messageObj];
        });
        setMessageText('');
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        addSystemMessage(`Error sending message: ${errorMessage}`);
      }
    }
  };
  
  const position12 = {
    x:currentUser.x,
    y:currentUser.y
  }

  return (
    <div style={{ height: '100vh', backgroundColor: 'black' }}>
      <div
        className="relative border-2 border-gray-300 rounded-lg overflow-hidden"
        style={{
          width: `${VIEWPORT_WIDTH}px`,
          height: `${VIEWPORT_HEIGHT}px`,
          margin: '0 auto',
          position: 'absolute',
          left: '10px',
          top: '10px'
        }}
        tabIndex={0}
      >
        <canvas
          ref={canvasRef}
          className="bg-white"
          onClick={handleCanvasClick}
        />
      </div>
      
      {currentUser && currentUser.userId && (
      <VideoCallUI
        ws={wsRef.current}
        currentUserId={currentUser.userId}
        currentRoom={inroom}
        selectedUser={selectedUser}
      />
        
    )}
{/* Room ID Box - Add this at the bottom of your game.tsx render */}
{params.roomId && (
  <div style={{
    position: 'fixed',
    bottom: '20px',
    left: '50%',
    transform: 'translateX(-50%)',
    background: 'rgba(0, 0, 0, 0.8)',
    backdropFilter: 'blur(10px)',
    padding: '10px 20px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    zIndex: 1000
  }}>
    <span style={{
      color: 'white',
      fontSize: '14px',
      fontWeight: '500'
    }}>
      Room ID: <span style={{ fontWeight: '700', fontSize: '16px' }}>{params.roomId}</span>
    </span>
    
    <button
      onClick={(e) => {
        navigator.clipboard.writeText(params.roomId);
        // Optional: Show feedback
        const btn = e.target as HTMLElement;
        btn.textContent = '✓';
        setTimeout(() => {
          btn.textContent = '📋';
        }, 1500);
      }}
      style={{
        background: 'rgba(255, 255, 255, 0.2)',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        borderRadius: '4px',
        padding: '4px 8px',
        color: 'white',
        cursor: 'pointer',
        fontSize: '16px',
        transition: 'all 0.2s ease'
      }}
      onMouseEnter={(e) => {
        const btn = e.target as HTMLElement;
        btn.style.background = 'rgba(255, 255, 255, 0.3)';
      }}
      onMouseLeave={(e) => {
        const btn = e.target as HTMLElement;
        btn.style.background = 'rgba(255, 255, 255, 0.2)';
      }}
      title="Copy Room ID"
    >
      📋
    </button>
  </div>
)}
{/* {inroom > 0 && (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: "10px",
      padding: "10px",
      width: "100%",
      whiteSpace: "nowrap",
      cursor: 'pointer'
    }}
  >
    <CameraAltIcon
      style={{
        width: "30px",
        height: "30px",
        color: "#10b981",
        padding: '9px',
        marginTop: '20px'
      }}
    />
    <span
      style={{
        color: "white",
        opacity: hover ? 1 : 0,
        transition: "opacity 0.3s ease-in-out",
        fontSize: "16px",
        paddingTop: '12px'
      }}
    >
      Room {inroom} Call
    </span>
  </div>
)} */}
      <div
        style={{
          height: "100vh",
          width: hover ? "150px" : "50px",
          backgroundColor: "rgba(5, 0, 0, 0.25)",
          backdropFilter: "blur(10px)",
          position: "fixed",
          left: "0px",
          transition: "width 0.3s ease-in-out",
          display: "flex",
          alignItems: "center",
          flexDirection: "column",
          overflow: "hidden",
        }}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "10px",
            width: "100%",
            whiteSpace: "nowrap",
          }}
          onClick={openMessageDialog}
        >
          <MessageIcon
            style={{
              width: "30px",
              height: "30px",
              color: "rgba(82,70,204,255)",
              padding: '9px',
              marginTop: '20px',
              cursor: 'pointer'
            }}
          />
          <span
            style={{
              color: "white",
              opacity: hover ? 1 : 0,
              transition: "opacity 0.3s ease-in-out",
              fontSize: "16px",
              paddingTop: '12px',
              cursor: 'pointer'
            }}
          >
            Messages
          </span>
        </div>
      </div>
      {showMessageDialog && (
  <div style={{
    position: 'fixed',
    right: '0px',
    height: '100vh',
    width: '360px',
    background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.95) 100%)',
    backdropFilter: 'blur(20px) saturate(180%)',
    borderLeft: '1px solid rgba(255, 255, 255, 0.1)',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '-10px 0 40px rgba(0, 0, 0, 0.3)'
  }}>
    {/* Header */}
    <div style={{
      padding: '20px',
      background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
      position: 'relative'
    }}>
      <button
        onClick={closeMessageDialog}
        style={{
          position: 'absolute',
          right: '20px',
          top: '50%',
          transform: 'translateY(-50%)',
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          border: 'none',
          background: 'rgba(255, 255, 255, 0.1)',
          color: 'white',
          fontSize: '20px',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        ✕
      </button>
      <h3 style={{ 
        color: 'white', 
        margin: '0',
        fontSize: '1.5rem',
        fontWeight: '600',
        letterSpacing: '-0.5px'
      }}>
        Messages
      </h3>
    </div>

    {/* Messages Container */}
    <div 
      style={{
        flex: 1,
        overflowY: 'auto',
        padding: '20px',
        scrollBehavior: 'smooth'
      }}
    >
      {selectedUser && (
        <div>
          {/* User Header */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            marginBottom: '20px',
            padding: '12px',
            background: 'rgba(99, 102, 241, 0.1)',
            borderRadius: '12px',
            border: '1px solid rgba(99, 102, 241, 0.2)'
          }}>
            <div style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              background: '#10b981',
              marginRight: '10px',
              boxShadow: '0 0 10px rgba(16, 185, 129, 0.5)'
            }}></div>
            <span style={{ 
              color: 'white', 
              fontSize: '16px',
              fontWeight: '600'
            }}>
              {selectedUser.substring(0, 8)}...
            </span>
          </div>

          {privateMessages.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '40px 20px',
              color: '#64748b',
              fontSize: '14px'
            }}>
              <p style={{ margin: '0' }}>No messages yet</p>
              <p style={{ margin: '8px 0 0 0', fontSize: '12px' }}>Start a conversation!</p>
            </div>
          ) : (
            privateMessages.map(msg => (
              <div
                key={msg.id}
                style={{
                  marginBottom: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: msg.senderId === currentUser.userId ? 'flex-end' : 'flex-start',
                  animation: 'fadeIn 0.3s ease-out'
                }}
              >
                <div style={{
                  maxWidth: '80%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: msg.senderId === currentUser.userId ? 'flex-end' : 'flex-start'
                }}>
                  <div style={{
                    background: msg.senderId === currentUser.userId 
                      ? 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' 
                      : 'rgba(51, 65, 85, 0.5)',
                    padding: '12px 16px',
                    borderRadius: '18px',
                    borderTopRightRadius: msg.senderId === currentUser.userId ? '4px' : '18px',
                    borderTopLeftRadius: msg.senderId === currentUser.userId ? '18px' : '4px',
                    boxShadow: msg.senderId === currentUser.userId 
                      ? '0 4px 12px rgba(99, 102, 241, 0.3)' 
                      : '0 2px 8px rgba(0, 0, 0, 0.2)',
                    border: msg.senderId === currentUser.userId 
                      ? 'none' 
                      : '1px solid rgba(255, 255, 255, 0.05)',
                    wordBreak: 'break-word'
                  }}>
                    <p style={{
                      margin: '0',
                      color: 'white',
                      fontSize: '15px',
                      lineHeight: '1.5'
                    }}>
                      {msg.content}
                    </p>
                  </div>
                  <span style={{
                    fontSize: '11px',
                    color: '#64748b',
                    marginTop: '6px',
                    fontWeight: '500'
                  }}>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {!selectedUser && inroom == 0 && (
        <div>
          {/* Broadcast Header */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            marginBottom: '20px',
            padding: '12px',
            background: 'rgba(251, 146, 60, 0.1)',
            borderRadius: '12px',
            border: '1px solid rgba(251, 146, 60, 0.2)'
          }}>
            <span style={{ 
              color: 'white', 
              fontSize: '16px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              📢 Broadcast Messages
            </span>
          </div>

          {broadcastMessages.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '40px 20px',
              color: '#64748b',
              fontSize: '14px'
            }}>
              <p style={{ margin: '0' }}>No broadcast messages</p>
            </div>
          ) : (
            broadcastMessages.map(msg => (
              <div
                key={msg.id}
                style={{
                  marginBottom: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: msg.isSystem ? 'center' :
                    (msg.senderId === currentUser.userId ? 'flex-end' : 'flex-start'),
                  animation: 'fadeIn 0.3s ease-out'
                }}
              >
                {!msg.isSystem && (
                  <span style={{
                    fontSize: '12px',
                    fontWeight: '600',
                    color: '#94a3b8',
                    marginBottom: '4px'
                  }}>
                    {msg.senderId === currentUser.userId ? 'You' : `User ${msg.senderId.substring(0, 5)}...`}
                  </span>
                )}
                <div style={{
                  maxWidth: msg.isSystem ? '90%' : '80%'
                }}>
                  <div style={{
                    background: msg.isSystem
                      ? 'linear-gradient(135deg, rgba(250, 204, 21, 0.2) 0%, rgba(251, 146, 60, 0.2) 100%)'
                      : msg.senderId === currentUser.userId
                        ? 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)'
                        : 'rgba(51, 65, 85, 0.5)',
                    padding: msg.isSystem ? '10px 14px' : '12px 16px',
                    borderRadius: msg.isSystem ? '12px' : '18px',
                    borderTopRightRadius: msg.senderId === currentUser.userId ? '4px' : '18px',
                    borderTopLeftRadius: msg.senderId === currentUser.userId ? '18px' : '4px',
                    border: msg.isSystem ? '1px solid rgba(250, 204, 21, 0.3)' : 
                      (msg.senderId === currentUser.userId ? 'none' : '1px solid rgba(255, 255, 255, 0.05)'),
                    boxShadow: msg.senderId === currentUser.userId 
                      ? '0 4px 12px rgba(99, 102, 241, 0.3)' 
                      : '0 2px 8px rgba(0, 0, 0, 0.2)',
                    wordBreak: 'break-word'
                  }}>
                    <p style={{
                      margin: '0',
                      color: msg.isSystem ? '#fbbf24' : 'white',
                      fontSize: msg.isSystem ? '13px' : '15px',
                      fontStyle: msg.isSystem ? 'italic' : 'normal',
                      lineHeight: '1.5'
                    }}>
                      {msg.content}
                    </p>
                  </div>
                  <span style={{
                    fontSize: '11px',
                    color: '#64748b',
                    marginTop: '6px',
                    display: 'block',
                    textAlign: msg.isSystem ? 'center' :
                      (msg.senderId === currentUser.userId ? 'right' : 'left'),
                    fontWeight: '500'
                  }}>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {!selectedUser && inroom > 0 && (
        <div>
          {/* Room Header */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            marginBottom: '20px',
            padding: '12px',
            background: 'rgba(16, 185, 129, 0.1)',
            borderRadius: '12px',
            border: '1px solid rgba(16, 185, 129, 0.2)'
          }}>
            <span style={{ 
              color: 'white', 
              fontSize: '16px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              🏠 Room {inroom} Messages
            </span>
          </div>

          {roomMessages[inroom.toString()]?.length > 0 ? (
            roomMessages[inroom.toString()].map(msg => (
              <div
                key={msg.id}
                style={{
                  marginBottom: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: msg.isSystem ? 'center' :
                    (msg.senderId === currentUser.userId ? 'flex-end' : 'flex-start'),
                  animation: 'fadeIn 0.3s ease-out'
                }}
              >
                {!msg.isSystem && (
                  <span style={{
                    fontSize: '12px',
                    fontWeight: '600',
                    color: '#94a3b8',
                    marginBottom: '4px'
                  }}>
                    {msg.senderId === currentUser.userId ? 'You' : `User ${msg.senderId.substring(0, 5)}...`}
                  </span>
                )}
                <div style={{
                  maxWidth: msg.isSystem ? '90%' : '80%'
                }}>
                  <div style={{
                    background: msg.isSystem
                      ? 'linear-gradient(135deg, rgba(250, 204, 21, 0.2) 0%, rgba(251, 146, 60, 0.2) 100%)'
                      : msg.senderId === currentUser.userId
                        ? 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)'
                        : 'rgba(51, 65, 85, 0.5)',
                    padding: msg.isSystem ? '10px 14px' : '12px 16px',
                    borderRadius: msg.isSystem ? '12px' : '18px',
                    borderTopRightRadius: msg.senderId === currentUser.userId ? '4px' : '18px',
                    borderTopLeftRadius: msg.senderId === currentUser.userId ? '18px' : '4px',
                    border: msg.isSystem ? '1px solid rgba(250, 204, 21, 0.3)' : 
                      (msg.senderId === currentUser.userId ? 'none' : '1px solid rgba(255, 255, 255, 0.05)'),
                    boxShadow: msg.senderId === currentUser.userId 
                      ? '0 4px 12px rgba(99, 102, 241, 0.3)' 
                      : '0 2px 8px rgba(0, 0, 0, 0.2)',
                    wordBreak: 'break-word'
                  }}>
                    <p style={{
                      margin: '0',
                      color: msg.isSystem ? '#fbbf24' : 'white',
                      fontSize: msg.isSystem ? '13px' : '15px',
                      fontStyle: msg.isSystem ? 'italic' : 'normal',
                      lineHeight: '1.5'
                    }}>
                      {msg.content}
                    </p>
                  </div>
                  <span style={{
                    fontSize: '11px',
                    color: '#64748b',
                    marginTop: '6px',
                    display: 'block',
                    textAlign: msg.isSystem ? 'center' :
                      (msg.senderId === currentUser.userId ? 'right' : 'left'),
                    fontWeight: '500'
                  }}>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div style={{
              textAlign: 'center',
              padding: '40px 20px',
              color: '#64748b',
              fontSize: '14px'
            }}>
              <p style={{ margin: '0' }}>No messages in Room {inroom}</p>
              <p style={{ margin: '8px 0 0 0', fontSize: '12px' }}>Be the first to say hello!</p>
            </div>
          )}
        </div>
      )}
    </div>

    {/* Input Area */}
    <div style={{
      padding: '16px',
      background: 'rgba(15, 23, 42, 0.8)',
      borderTop: '1px solid rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(10px)'
    }}>
      <div style={{
        display: 'flex',
        gap: '10px',
        alignItems: 'center',
        background: 'rgba(30, 41, 59, 0.6)',
        borderRadius: '24px',
        padding: '8px 8px 8px 20px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        transition: 'all 0.3s ease',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'
      }}>
        <input
          type="text"
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: 'white',
            fontSize: '15px',
            padding: '8px 0',
            fontWeight: '400'
          }}
          placeholder={
            selectedUser ? "Type a message..." : 
            inroom > 0 ? `Message to Room ${inroom}...` : 
            "Broadcast message..."
          }
        />
        <button
          onClick={sendMessage}
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: messageText.trim() 
              ? 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' 
              : 'rgba(107, 114, 128, 0.3)',
            border: 'none',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: messageText.trim() ? 'pointer' : 'not-allowed',
            transition: 'all 0.3s ease',
            boxShadow: messageText.trim() 
              ? '0 4px 12px rgba(99, 102, 241, 0.4)' 
              : 'none',
            transform: 'scale(1)'
          }}
          onMouseEnter={(e) => {
            if (messageText.trim()) {
              const event = e.target as HTMLElement
              event.style.transform = 'scale(1.1)';
              event.style.boxShadow = '0 6px 16px rgba(99, 102, 241, 0.5)';
            }
          }}
          onMouseLeave={(e) => {
            const event = e.target as HTMLElement
            event.style.transform = 'scale(1)';
            event.style.boxShadow = messageText.trim() 
              ? '0 4px 12px rgba(99, 102, 241, 0.4)' 
              : 'none';
          }}
          disabled={!messageText.trim()}
        >
          <svg 
            width="20" 
            height="20" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
          </svg>
        </button>
      </div>
    </div>
  </div>
)}

<style>
  {`
    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    /* Custom scrollbar for messages */
    div::-webkit-scrollbar {
      width: 6px;
    }
    
    div::-webkit-scrollbar-track {
      background: rgba(255, 255, 255, 0.05);
    }
    
    div::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.2);
      border-radius: 3px;
    }
    
    div::-webkit-scrollbar-thumb:hover {
      background: rgba(255, 255, 255, 0.3);
    }

    /* Placeholder styling */
    input::placeholder {
      color: rgba(148, 163, 184, 0.7);
    }
  `}
</style>
      {showCharacterInfo && selectedCharacter && (
  <div
    style={{
      position: 'absolute',
      top: '20px',
      left: '60px',
      width: '320px',
      background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
      backdropFilter: 'blur(20px) saturate(180%)',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255,255,255,0.2)',
      borderRadius: '24px',
      border: '1px solid rgba(255,255,255,0.1)',
      overflow: 'hidden',
      animation: 'slideIn 0.3s ease-out'
    }}
  >
    {/* Header */}
    <div 
      style={{ 
        background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
        padding: '20px',
        position: 'relative'
      }}
    >
      <h3 style={{ 
        margin: '0',
        color: 'white', 
        fontSize: '1.4rem',
        fontWeight: '600',
        letterSpacing: '-0.5px'
      }}>
        Character Info
      </h3>
      <button
        onClick={closeCharacterInfo}
        style={{ 
          position: 'absolute', 
          right: '20px', 
          top: '50%',
          transform: 'translateY(-50%)',
          color: 'white', 
          backgroundColor: 'rgba(255,255,255,0.2)', 
          border: 'none', 
          fontSize: '1.2rem',
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
        
        onMouseEnter={(e) => {
          const target = e.target as HTMLElement;
          target.style.backgroundColor = 'rgba(255,255,255,0.3)';
        }}
        
        onMouseLeave={(e) => {
          const target = e.target as HTMLElement;
          target.style.backgroundColor = 'rgba(255,255,255,0.2)';
        }}
      >
        ✕
      </button>
    </div>

    {/* Content */}
    <div style={{ padding: '24px' }}>
      {/* User ID */}
      <div style={{ 
        marginBottom: '16px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '12px',
          background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '20px'
        }}>
          👤
        </div>
        <div>
          <p style={{ 
            margin: '0',
            color: '#94a3b8',
            fontSize: '0.85rem',
            fontWeight: '500',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            User ID
          </p>
          <p style={{ 
            margin: '0',
            color: '#e2e8f0',
            fontSize: '1rem',
            fontWeight: '600'
          }}>
            {selectedCharacter.userId.substring(0, 8)}...
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '12px',
        marginBottom: '20px'
      }}>
        {/* Position */}
        <div style={{
          background: 'rgba(99, 102, 241, 0.1)',
          borderRadius: '12px',
          padding: '12px',
          border: '1px solid rgba(99, 102, 241, 0.2)'
        }}>
          <p style={{ 
            margin: '0 0 4px 0',
            color: '#94a3b8',
            fontSize: '0.8rem',
            fontWeight: '500'
          }}>
            📍 Position
          </p>
          <p style={{ 
            margin: '0',
            color: '#e2e8f0',
            fontSize: '0.9rem',
            fontWeight: '600'
          }}>
            X: {selectedCharacter.x}, Y: {selectedCharacter.y}
          </p>
        </div>

        {/* Direction */}
        <div style={{
          background: 'rgba(139, 92, 246, 0.1)',
          borderRadius: '12px',
          padding: '12px',
          border: '1px solid rgba(139, 92, 246, 0.2)'
        }}>
          <p style={{ 
            margin: '0 0 4px 0',
            color: '#94a3b8',
            fontSize: '0.8rem',
            fontWeight: '500'
          }}>
            🧭 Direction
          </p>
          <p style={{ 
            margin: '0',
            color: '#e2e8f0',
            fontSize: '0.9rem',
            fontWeight: '600'
          }}>
            {selectedCharacter.d.charAt(0).toUpperCase() + selectedCharacter.d.slice(1)}
          </p>
        </div>

        {/* Status */}
        <div style={{
          background: selectedCharacter.isMoving ? 'rgba(16, 185, 129, 0.1)' : 'rgba(156, 163, 175, 0.1)',
          borderRadius: '12px',
          padding: '12px',
          border: `1px solid ${selectedCharacter.isMoving ? 'rgba(16, 185, 129, 0.2)' : 'rgba(156, 163, 175, 0.2)'}`
        }}>
          <p style={{ 
            margin: '0 0 4px 0',
            color: '#94a3b8',
            fontSize: '0.8rem',
            fontWeight: '500'
          }}>
            ⚡ Status
          </p>
          <p style={{ 
            margin: '0',
            color: '#e2e8f0',
            fontSize: '0.9rem',
            fontWeight: '600'
          }}>
            {selectedCharacter.isMoving ? 'Moving' : 'Idle'}
          </p>
        </div>

        {/* Type */}
        <div style={{
          background: 'rgba(251, 146, 60, 0.1)',
          borderRadius: '12px',
          padding: '12px',
          border: '1px solid rgba(251, 146, 60, 0.2)'
        }}>
          <p style={{ 
            margin: '0 0 4px 0',
            color: '#94a3b8',
            fontSize: '0.8rem',
            fontWeight: '500'
          }}>
            🎮 Type
          </p>
          <p style={{ 
            margin: '0',
            color: '#e2e8f0',
            fontSize: '0.9rem',
            fontWeight: '600'
          }}>
            {selectedCharacter.userId === currentUser.userId ? 'You' : 'Player'}
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      {selectedCharacter.userId !== currentUser.userId && (
        <div style={{ 
          display: 'flex',
          flexDirection: 'column',
          gap: '10px'
        }}>
          <button
            onClick={openMessageDialog}
            style={{
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              color: 'white',
              fontSize: '1rem',
              fontWeight: '600',
              borderRadius: '12px',
              border: 'none',
              padding: '12px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
            onMouseEnter={(e) => {
              const event = e.target as HTMLElement;
              event.style.transform = 'translateY(-2px)';
              event.style.boxShadow = '0 6px 20px rgba(99, 102, 241, 0.4)';
            }}
            onMouseLeave={(e) => {
              const event = e.target as HTMLElement;
              event.style.transform = 'translateY(0)';
              event.style.boxShadow = '0 4px 12px rgba(99, 102, 241, 0.3)';
            }}
          >
            💬 Message Privately
          </button>
          
          <button
            onClick={() => setSelectedUser(selectedCharacter.userId)}
            style={{
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: 'white',
              fontSize: '1rem',
              fontWeight: '600',
              borderRadius: '12px',
              border: 'none',
              padding: '12px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
            onMouseEnter={(e) => {
              const event = e.target as HTMLElement;
              event.style.transform = 'translateY(-2px)';
              event.style.boxShadow = '0 6px 20px rgba(16, 185, 129, 0.4)';
            }}
            onMouseLeave={(e) => {
              const event = e.target as HTMLElement;
              event.style.transform = 'translateY(0)';
              event.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.3)';
            }}
          >
            📹 Start Video Call
          </button>
        </div>
      )}
    </div>
  </div>
)}
<style>
  {`
    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateX(20px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }
  `}
</style>
    </div>

  );
};

export default Arena;


