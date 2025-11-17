import { PrismaClient, RoomRole } from "@prisma/client"

const db = new PrismaClient()

const userData = [
        {
            id: "1",
            name:  "Ronak Maheshwari",
            email: "ronak@mailinator.com",
            password: "123456",
        },
        {
            id: "2",
            name: "Jack Brave",
            email: "jack@mailinator.com",
            password: "123456"
        },
        {
            id: "3",
            name: "Rita Fedo",
            email: "rita@mailinator.com",
            password: "123456"
        },
    ]

const createUser = async() => {
    for(const x of userData){
        await db.user.upsert({
            where:{
                email: x.email
            },
            update:{},
            create:{
                id: x.id,
                name: x.name,
                email: x.email,
                password: x.password
            }
        })
    }

    return userData;
}

const createRoom = async (users: any[]) => {
    const roomData = [
        {
            id: "room-1",
            slug: "chemistry-class",
            link: "ronak-1"
        },
        {
            id: "room-2",
            slug: "System Design",
            link: "system"
        },
    ]

    for(const x of roomData){
        await db.room.upsert({
            where:{
                slug: x.slug
            },
            update:{},
            create:{
                id: x.id,
                slug: x.slug,
                link: x.link
            }
        })
    }

    const assignMembers = [
        { userId: users[0].id, roomId: "room-1", role: RoomRole.ADMIN },
        { userId: users[1].id, roomId: "room-1", role: RoomRole.EDITOR},
        { userId: users[2].id, roomId: "room-1", role: RoomRole.VIEWER},

        { userId: users[0].id, roomId: "room-2", role: RoomRole.EDITOR },
        { userId: users[1].id, roomId: "room-2", role: RoomRole.ADMIN },
    ]

    for(const x of assignMembers){
        await db.roomMember.upsert({
            where:{
                userId_roomId:{
                    userId: x.userId,
                    roomId: x.roomId
                }
            },
            update:{role: x.role},
            create:x
        })
    }

    return roomData;
}

const getRandomMessage = [
    "Hello everyone!",
    "What's up?",
    "This is awesome!",
    "Anyone available?",
    "Let's work on this together.",
    "Good morning!",
    "Good evening!",
    "I need help on something.",
    "Check this out!",
    "Do we have updates?",
  ];

async function createChatMessages(users: any[], rooms: any[]) {
  const messages: { roomId: string; userId: string; message: string }[] = [];

  for (const room of rooms) {
    for (let i = 0; i < 10; i++) {
        const randomUser = users[Math.floor(Math.random() * users.length)];
        let randomMessage  = getRandomMessage[Math.floor(Math.random() * getRandomMessage.length)]!;
        messages.push({
            roomId: room.id,
            userId: randomUser.id,
            message: randomMessage,
        });
    }
  }

  for (const msg of messages) {
    await db.chat.create({ data: msg });
  }
}

async function main() {
  console.log("Seeding database...");

  const users = await createUser();
  const rooms = await createRoom(users);
  await createChatMessages(users, rooms);

  console.log("Seeding complete!");
}

main()
  .catch((err) => {
    console.error("Seed failed:", err);
  })
  .finally(async () => {
    await db.$disconnect();
  });
