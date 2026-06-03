import "dotenv/config";
import { auth } from "../lib/auth";
import { prisma } from "../lib/db";

// ─── helpers ─────────────────────────────────────────────────────────────────

function daysAgo(d: number, h = 0, m = 0) {
  const t = new Date();
  t.setDate(t.getDate() - d);
  t.setHours(h, m, 0, 0);
  return t;
}

function minsAgo(mins: number) {
  return new Date(Date.now() - mins * 60 * 1000);
}

// ─── users ───────────────────────────────────────────────────────────────────

const USERS = [
  { name: "Alex Morgan",    email: "alex@example.com",   password: "password123" },
  { name: "Emma Wilson",    email: "emma@example.com",   password: "password123" },
  { name: "Liam Johnson",   email: "liam@example.com",   password: "password123" },
  { name: "Sofia Martinez", email: "sofia@example.com",  password: "password123" },
  { name: "Noah Davis",     email: "noah@example.com",   password: "password123" },
  { name: "Ava Brown",      email: "ava@example.com",    password: "password123" },
];

// ─── clear ───────────────────────────────────────────────────────────────────

async function clearAll() {
  console.log("Clearing database…");
  await prisma.message.deleteMany({});
  await prisma.conversationMember.deleteMany({});
  await prisma.groupMember.deleteMany({});
  await prisma.conversation.deleteMany({});
  await prisma.group.deleteMany({});
  await prisma.session.deleteMany({});
  await prisma.account.deleteMany({});
  await prisma.verification.deleteMany({});
  await prisma.user.deleteMany({});
  console.log("✓ Database cleared\n");
}

// ─── seed ────────────────────────────────────────────────────────────────────

async function seed() {
  await clearAll();

  // 1. Create users via Better Auth (hashes passwords correctly)
  console.log("Creating users…");
  const userIds: Record<string, string> = {};

  for (const u of USERS) {
    const res = await auth.api.signUpEmail({ body: u });
    userIds[u.email] = res.user.id;
    console.log(`  ✓ ${u.name}`);
  }

  const alex  = userIds["alex@example.com"];
  const emma  = userIds["emma@example.com"];
  const liam  = userIds["liam@example.com"];
  const sofia = userIds["sofia@example.com"];
  const noah  = userIds["noah@example.com"];
  const ava   = userIds["ava@example.com"];

  // 2. DM Conversations
  console.log("\nCreating DM conversations…");

  // ── Alex ↔ Emma (design review) ──────────────────────────────────────────
  const convAlexEmma = await prisma.conversation.create({ data: {} });
  await prisma.conversationMember.createMany({
    data: [{ conversationId: convAlexEmma.id, userId: alex }, { conversationId: convAlexEmma.id, userId: emma }],
  });
  const ae: { id: string }[] = [];
  ae.push(await prisma.message.create({ data: { conversationId: convAlexEmma.id, senderId: emma, type: "text", text: "Hey Alex! I finished the new dashboard mockups 🎨", createdAt: daysAgo(3, 10, 5) } }));
  ae.push(await prisma.message.create({ data: { conversationId: convAlexEmma.id, senderId: alex, type: "text", text: "Amazing, can't wait to see them!", createdAt: daysAgo(3, 10, 8) } }));
  ae.push(await prisma.message.create({ data: { conversationId: convAlexEmma.id, senderId: emma, type: "text", text: "I focused on simplifying the metrics section — fewer charts, more clarity", createdAt: daysAgo(3, 10, 12) } }));
  ae.push(await prisma.message.create({ data: { conversationId: convAlexEmma.id, senderId: alex, type: "text", text: "That's exactly what the PM wanted. Good call.", createdAt: daysAgo(3, 10, 20) } }));
  ae.push(await prisma.message.create({ data: { conversationId: convAlexEmma.id, senderId: emma, type: "text", text: "Should we schedule a review with Liam before the sprint demo?", createdAt: daysAgo(3, 11, 0) } }));
  ae.push(await prisma.message.create({ data: { conversationId: convAlexEmma.id, senderId: alex, type: "text", text: "Yes, let's do Thursday at 2pm", createdAt: daysAgo(3, 11, 5) } }));
  ae.push(await prisma.message.create({ data: { conversationId: convAlexEmma.id, senderId: emma, type: "text", text: "Perfect. I'll send the invite!", createdAt: daysAgo(3, 11, 7) } }));
  ae.push(await prisma.message.create({ data: { conversationId: convAlexEmma.id, senderId: alex, type: "text", text: "One more thing — the color palette looks great btw. Very clean.", createdAt: daysAgo(2, 9, 30) } }));
  ae.push(await prisma.message.create({ data: { conversationId: convAlexEmma.id, senderId: emma, type: "text", text: "Thanks! Went with slate + violet to match the brand guidelines", createdAt: daysAgo(2, 9, 45) } }));
  ae.push(await prisma.message.create({ data: { conversationId: convAlexEmma.id, senderId: alex, type: "text", text: "Nailed it 💯", createdAt: daysAgo(2, 9, 50) } }));
  await prisma.conversation.update({ where: { id: convAlexEmma.id }, data: { updatedAt: daysAgo(2, 9, 50) } });

  // ── Alex ↔ Noah (code review) ─────────────────────────────────────────────
  const convAlexNoah = await prisma.conversation.create({ data: {} });
  await prisma.conversationMember.createMany({
    data: [{ conversationId: convAlexNoah.id, userId: alex }, { conversationId: convAlexNoah.id, userId: noah }],
  });
  const an: { id: string }[] = [];
  an.push(await prisma.message.create({ data: { conversationId: convAlexNoah.id, senderId: noah, type: "text", text: "Hey, pushed the refactor for the socket server. Mind reviewing?", createdAt: daysAgo(2, 14, 0) } }));
  an.push(await prisma.message.create({ data: { conversationId: convAlexNoah.id, senderId: alex, type: "text", text: "On it. Give me 20 min", createdAt: daysAgo(2, 14, 10) } }));
  an.push(await prisma.message.create({ data: { conversationId: convAlexNoah.id, senderId: alex, type: "text", text: "The in-memory block cache is really clever. Saves a ton of DB queries", createdAt: daysAgo(2, 14, 35) } }));
  an.push(await prisma.message.create({ data: { conversationId: convAlexNoah.id, senderId: noah, type: "text", text: "Yeah, was worried about the race condition on restart but the init function handles it", createdAt: daysAgo(2, 14, 40) } }));
  an.push(await prisma.message.create({ data: { conversationId: convAlexNoah.id, senderId: alex, type: "text", text: "Approved ✅ Left one small comment on the typing handler", createdAt: daysAgo(2, 14, 55) } }));
  an.push(await prisma.message.create({ data: { conversationId: convAlexNoah.id, senderId: noah, type: "text", text: "Seen it, makes sense. I'll fix before merge", createdAt: daysAgo(2, 15, 2) } }));
  an.push(await prisma.message.create({ data: { conversationId: convAlexNoah.id, senderId: noah, type: "text", text: "Done! Also added the ErrorEvent suppression from server.ts", createdAt: daysAgo(1, 9, 0) } }));
  an.push(await prisma.message.create({ data: { conversationId: convAlexNoah.id, senderId: alex, type: "text", text: "Great, merging now 🚀", createdAt: daysAgo(1, 9, 10) } }));
  // reply example
  an.push(await prisma.message.create({ data: { conversationId: convAlexNoah.id, senderId: noah, type: "text", text: "Should we tackle the image upload optimization next?", createdAt: daysAgo(1, 9, 30), replyToId: an[7].id } }));
  an.push(await prisma.message.create({ data: { conversationId: convAlexNoah.id, senderId: alex, type: "text", text: "Let's do it after the demo. One thing at a time 😄", createdAt: daysAgo(1, 9, 35) } }));
  await prisma.conversation.update({ where: { id: convAlexNoah.id }, data: { updatedAt: daysAgo(1, 9, 35) } });

  // ── Emma ↔ Sofia (personal) ───────────────────────────────────────────────
  const convEmmaSofia = await prisma.conversation.create({ data: {} });
  await prisma.conversationMember.createMany({
    data: [{ conversationId: convEmmaSofia.id, userId: emma }, { conversationId: convEmmaSofia.id, userId: sofia }],
  });
  await prisma.message.create({ data: { conversationId: convEmmaSofia.id, senderId: sofia, type: "text", text: "Emma! Are you coming to the team lunch on Friday?", createdAt: daysAgo(1, 12, 0) } });
  await prisma.message.create({ data: { conversationId: convEmmaSofia.id, senderId: emma, type: "text", text: "Yes! Already blocked my calendar 🍕", createdAt: daysAgo(1, 12, 5) } });
  await prisma.message.create({ data: { conversationId: convEmmaSofia.id, senderId: sofia, type: "text", text: "Perfect. Ava is coming too, we reserved a table at that Italian place downtown", createdAt: daysAgo(1, 12, 8) } });
  await prisma.message.create({ data: { conversationId: convEmmaSofia.id, senderId: emma, type: "text", text: "Oh nice!! That place has the best pasta", createdAt: daysAgo(1, 12, 10) } });
  await prisma.message.create({ data: { conversationId: convEmmaSofia.id, senderId: sofia, type: "text", text: "Also — how's the new dashboard coming along?", createdAt: daysAgo(1, 12, 15) } });
  await prisma.message.create({ data: { conversationId: convEmmaSofia.id, senderId: emma, type: "text", text: "Almost done! Alex loves the new color scheme", createdAt: daysAgo(1, 12, 20) } });
  await prisma.message.create({ data: { conversationId: convEmmaSofia.id, senderId: sofia, type: "text", text: "Nice, I'll need the mockup for the analytics section too eventually", createdAt: daysAgo(1, 12, 22) } });
  await prisma.message.create({ data: { conversationId: convEmmaSofia.id, senderId: emma, type: "text", text: "Sure, let's sync after the demo 🤝", createdAt: daysAgo(1, 12, 25) } });
  await prisma.conversation.update({ where: { id: convEmmaSofia.id }, data: { updatedAt: daysAgo(1, 12, 25) } });

  // ── Liam ↔ Noah (sprint planning) ────────────────────────────────────────
  const convLiamNoah = await prisma.conversation.create({ data: {} });
  await prisma.conversationMember.createMany({
    data: [{ conversationId: convLiamNoah.id, userId: liam }, { conversationId: convLiamNoah.id, userId: noah }],
  });
  const ln: { id: string }[] = [];
  ln.push(await prisma.message.create({ data: { conversationId: convLiamNoah.id, senderId: liam, type: "text", text: "Noah, what's the velocity looking like for this sprint?", createdAt: daysAgo(1, 15, 0) } }));
  ln.push(await prisma.message.create({ data: { conversationId: convLiamNoah.id, senderId: noah, type: "text", text: "42 points so far, should close at around 48", createdAt: daysAgo(1, 15, 8) } }));
  ln.push(await prisma.message.create({ data: { conversationId: convLiamNoah.id, senderId: liam, type: "text", text: "That's ahead of plan. Great work 🎯", createdAt: daysAgo(1, 15, 12) } }));
  ln.push(await prisma.message.create({ data: { conversationId: convLiamNoah.id, senderId: noah, type: "text", text: "The refactor saved us about 2 days of tech debt", createdAt: daysAgo(1, 15, 15) } }));
  ln.push(await prisma.message.create({ data: { conversationId: convLiamNoah.id, senderId: liam, type: "text", text: "Makes sense. Can we scope the push notifications feature for next sprint?", createdAt: daysAgo(1, 15, 20) } }));
  ln.push(await prisma.message.create({ data: { conversationId: convLiamNoah.id, senderId: noah, type: "text", text: "Should be around 8-10 points. I'll draft the ticket", createdAt: daysAgo(1, 15, 28) } }));
  ln.push(await prisma.message.create({ data: { conversationId: convLiamNoah.id, senderId: liam, type: "text", text: "Perfect. Also — the stakeholder demo is at 3pm Monday", createdAt: daysAgo(0, 9, 0) } }));
  ln.push(await prisma.message.create({ data: { conversationId: convLiamNoah.id, senderId: noah, type: "text", text: "Got it, I'll make sure the staging env is clean", createdAt: daysAgo(0, 9, 5) } }));
  ln.push(await prisma.message.create({ data: { conversationId: convLiamNoah.id, senderId: liam, type: "text", text: "Thanks 🙌 Let's meet at 2:30 for a quick run-through", createdAt: minsAgo(90) } }));
  ln.push(await prisma.message.create({ data: { conversationId: convLiamNoah.id, senderId: noah, type: "text", text: "Done ✅", createdAt: minsAgo(85) } }));
  await prisma.conversation.update({ where: { id: convLiamNoah.id }, data: { updatedAt: minsAgo(85) } });

  // ── Noah ↔ Ava (tech chat) ────────────────────────────────────────────────
  const convNoahAva = await prisma.conversation.create({ data: {} });
  await prisma.conversationMember.createMany({
    data: [{ conversationId: convNoahAva.id, userId: noah }, { conversationId: convNoahAva.id, userId: ava }],
  });
  const na: { id: string }[] = [];
  na.push(await prisma.message.create({ data: { conversationId: convNoahAva.id, senderId: ava, type: "text", text: "Hey Noah, I'm seeing some hydration warnings in the console. Is that on your end too?", createdAt: daysAgo(0, 10, 0) } }));
  na.push(await prisma.message.create({ data: { conversationId: convNoahAva.id, senderId: noah, type: "text", text: "Yeah, I saw that. It's the socket client initialising on the server side", createdAt: daysAgo(0, 10, 8) } }));
  na.push(await prisma.message.create({ data: { conversationId: convNoahAva.id, senderId: ava, type: "text", text: "Ah right. Should we move it to a useEffect?", createdAt: daysAgo(0, 10, 12) } }));
  na.push(await prisma.message.create({ data: { conversationId: convNoahAva.id, senderId: noah, type: "text", text: "Already done in the latest commit. Should be fixed now", createdAt: daysAgo(0, 10, 20) } }));
  na.push(await prisma.message.create({ data: { conversationId: convNoahAva.id, senderId: ava, type: "text", text: "Let me pull… yep, gone! Nice 🎉", createdAt: daysAgo(0, 10, 30) } }));
  na.push(await prisma.message.create({ data: { conversationId: convNoahAva.id, senderId: noah, type: "text", text: "Also fixed the stale closure bug in the typing handler while I was at it", createdAt: daysAgo(0, 10, 33) } }));
  na.push(await prisma.message.create({ data: { conversationId: convNoahAva.id, senderId: ava, type: "text", text: "The isBlockedRef pattern? Clever! I learned something new today 😄", createdAt: daysAgo(0, 10, 38) } }));
  na.push(await prisma.message.create({ data: { conversationId: convNoahAva.id, senderId: noah, type: "text", text: "Classic React stale closure trap. Tricky to debug the first time", createdAt: daysAgo(0, 10, 45) } }));
  na.push(await prisma.message.create({ data: { conversationId: convNoahAva.id, senderId: ava, type: "text", text: "Quick question — should the image upload go through Cloudinary directly or via an API route?", createdAt: minsAgo(45), replyToId: na[7].id } }));
  na.push(await prisma.message.create({ data: { conversationId: convNoahAva.id, senderId: noah, type: "text", text: "API route is safer — keeps the API key server-side. We already have `/api/upload-audio` as a reference", createdAt: minsAgo(40) } }));
  na.push(await prisma.message.create({ data: { conversationId: convNoahAva.id, senderId: ava, type: "text", text: "Makes sense. I'll model it off that one 👍", createdAt: minsAgo(38) } }));
  await prisma.conversation.update({ where: { id: convNoahAva.id }, data: { updatedAt: minsAgo(38) } });

  // ── Sofia ↔ Liam (data / analytics) ──────────────────────────────────────
  const convSofiaLiam = await prisma.conversation.create({ data: {} });
  await prisma.conversationMember.createMany({
    data: [{ conversationId: convSofiaLiam.id, userId: sofia }, { conversationId: convSofiaLiam.id, userId: liam }],
  });
  await prisma.message.create({ data: { conversationId: convSofiaLiam.id, senderId: sofia, type: "text", text: "Liam, the engagement metrics from last week are in. DAU up 18% 📈", createdAt: daysAgo(0, 11, 0) } });
  await prisma.message.create({ data: { conversationId: convSofiaLiam.id, senderId: liam, type: "text", text: "That's huge! What's driving it?", createdAt: daysAgo(0, 11, 5) } });
  await prisma.message.create({ data: { conversationId: convSofiaLiam.id, senderId: sofia, type: "text", text: "Group chats, mainly. Users who join a group send 3x more messages per day", createdAt: daysAgo(0, 11, 10) } });
  await prisma.message.create({ data: { conversationId: convSofiaLiam.id, senderId: liam, type: "text", text: "Interesting. So group discovery should be a priority", createdAt: daysAgo(0, 11, 18) } });
  await prisma.message.create({ data: { conversationId: convSofiaLiam.id, senderId: sofia, type: "text", text: "Exactly. I'll put together a proper report for the board deck", createdAt: daysAgo(0, 11, 22) } });
  await prisma.message.create({ data: { conversationId: convSofiaLiam.id, senderId: liam, type: "text", text: "Great — can you have a draft by end of day Thursday?", createdAt: minsAgo(120) } });
  await prisma.message.create({ data: { conversationId: convSofiaLiam.id, senderId: sofia, type: "text", text: "Absolutely 📊", createdAt: minsAgo(115) } });
  await prisma.conversation.update({ where: { id: convSofiaLiam.id }, data: { updatedAt: minsAgo(115) } });

  console.log("  ✓ 6 DM conversations created");

  // 3. Groups
  console.log("\nCreating groups…");

  // ── Product Team ──────────────────────────────────────────────────────────
  const groupProduct = await prisma.group.create({
    data: { name: "Product Team", description: "Roadmap, sprints, and feature discussions" },
  });
  await prisma.groupMember.createMany({
    data: [
      { groupId: groupProduct.id, userId: liam,  isAdmin: true },
      { groupId: groupProduct.id, userId: alex,  isAdmin: false },
      { groupId: groupProduct.id, userId: emma,  isAdmin: false },
      { groupId: groupProduct.id, userId: sofia, isAdmin: false },
    ],
  });
  const gp: { id: string }[] = [];
  gp.push(await prisma.message.create({ data: { groupId: groupProduct.id, senderId: liam, type: "text", text: "Good morning team! 👋 Sprint planning in 30 min — please have your estimates ready", createdAt: daysAgo(2, 9, 0) } }));
  gp.push(await prisma.message.create({ data: { groupId: groupProduct.id, senderId: alex, type: "text", text: "Ready on my end! I've pre-scoped the real-time notifications ticket", createdAt: daysAgo(2, 9, 5) } }));
  gp.push(await prisma.message.create({ data: { groupId: groupProduct.id, senderId: emma, type: "text", text: "Same here. Also want to raise the onboarding flow redesign in the meeting", createdAt: daysAgo(2, 9, 8) } }));
  gp.push(await prisma.message.create({ data: { groupId: groupProduct.id, senderId: sofia, type: "text", text: "I'll share the retention data that supports Emma's case 📊", createdAt: daysAgo(2, 9, 10) } }));
  gp.push(await prisma.message.create({ data: { groupId: groupProduct.id, senderId: liam, type: "text", text: "Perfect. Let's make this sprint count!", createdAt: daysAgo(2, 9, 12) } }));
  gp.push(await prisma.message.create({ data: { groupId: groupProduct.id, senderId: alex, type: "text", text: "Quick update: the auth refactor is merged and all tests passing ✅", createdAt: daysAgo(1, 14, 0) } }));
  gp.push(await prisma.message.create({ data: { groupId: groupProduct.id, senderId: liam, type: "text", text: "Awesome! That unblocks Emma's work on the settings panel", createdAt: daysAgo(1, 14, 5) } }));
  gp.push(await prisma.message.create({ data: { groupId: groupProduct.id, senderId: emma, type: "text", text: "Already on it 🎨 Should have designs by tomorrow", createdAt: daysAgo(1, 14, 10) } }));
  gp.push(await prisma.message.create({ data: { groupId: groupProduct.id, senderId: sofia, type: "text", text: "Can we add a data export option to the settings while we're at it?", createdAt: daysAgo(1, 14, 15) } }));
  gp.push(await prisma.message.create({ data: { groupId: groupProduct.id, senderId: alex, type: "text", text: "Good idea, I'll open a ticket for it", createdAt: daysAgo(1, 14, 20) } }));
  gp.push(await prisma.message.create({ data: { groupId: groupProduct.id, senderId: liam, type: "text", text: "Reminder: stakeholder demo is Monday at 3pm. Let's freeze features by Sunday midnight 🔒", createdAt: minsAgo(60) } }));
  gp.push(await prisma.message.create({ data: { groupId: groupProduct.id, senderId: emma, type: "text", text: "Got it! I'm just polishing the last screen", createdAt: minsAgo(55) } }));
  gp.push(await prisma.message.create({ data: { groupId: groupProduct.id, senderId: alex, type: "text", text: "Same, almost done with the backend for the search feature", createdAt: minsAgo(52), replyToId: gp[11].id } }));
  gp.push(await prisma.message.create({ data: { groupId: groupProduct.id, senderId: sofia, type: "text", text: "I'll have the analytics dashboard ready tonight", createdAt: minsAgo(50) } }));
  gp.push(await prisma.message.create({ data: { groupId: groupProduct.id, senderId: liam, type: "text", text: "You're all legends 🏆", createdAt: minsAgo(48) } }));
  await prisma.group.update({ where: { id: groupProduct.id }, data: { updatedAt: minsAgo(48) } });

  // ── Dev Squad ─────────────────────────────────────────────────────────────
  const groupDev = await prisma.group.create({
    data: { name: "Dev Squad 🛠️", description: "Tech discussions, code reviews, architecture decisions" },
  });
  await prisma.groupMember.createMany({
    data: [
      { groupId: groupDev.id, userId: noah,  isAdmin: true },
      { groupId: groupDev.id, userId: ava,   isAdmin: false },
      { groupId: groupDev.id, userId: alex,  isAdmin: false },
      { groupId: groupDev.id, userId: liam,  isAdmin: false },
    ],
  });
  const gd: { id: string }[] = [];
  gd.push(await prisma.message.create({ data: { groupId: groupDev.id, senderId: noah, type: "text", text: "Socket server refactor is live! Reduced message latency by ~60% 🚀", createdAt: daysAgo(1, 10, 0) } }));
  gd.push(await prisma.message.create({ data: { groupId: groupDev.id, senderId: ava, type: "text", text: "Just tested it. Feels so much snappier! Great work Noah", createdAt: daysAgo(1, 10, 8) } }));
  gd.push(await prisma.message.create({ data: { groupId: groupDev.id, senderId: alex, type: "text", text: "The in-memory block cache was the right call. Saves a ton of DB round trips", createdAt: daysAgo(1, 10, 12) } }));
  gd.push(await prisma.message.create({ data: { groupId: groupDev.id, senderId: liam, type: "text", text: "This will be great for the demo 💪", createdAt: daysAgo(1, 10, 15) } }));
  gd.push(await prisma.message.create({ data: { groupId: groupDev.id, senderId: ava, type: "text", text: "Anyone else getting TS errors after the Next.js 16 upgrade?", createdAt: daysAgo(1, 11, 30) } }));
  gd.push(await prisma.message.create({ data: { groupId: groupDev.id, senderId: noah, type: "text", text: "Yeah, the middleware rename broke a few things. proxy.ts is the new middleware.ts", createdAt: daysAgo(1, 11, 35) } }));
  gd.push(await prisma.message.create({ data: { groupId: groupDev.id, senderId: alex, type: "text", text: "Also the function must be named proxy not middleware — breaking change", createdAt: daysAgo(1, 11, 38) } }));
  gd.push(await prisma.message.create({ data: { groupId: groupDev.id, senderId: ava, type: "text", text: "Ah got it, fixed! Thanks both 🙏", createdAt: daysAgo(1, 11, 42) } }));
  gd.push(await prisma.message.create({ data: { groupId: groupDev.id, senderId: noah, type: "text", text: "Should we upgrade to React 19.2 while we're at it?", createdAt: daysAgo(0, 9, 0) } }));
  gd.push(await prisma.message.create({ data: { groupId: groupDev.id, senderId: ava, type: "text", text: "I'd wait until after the demo. Less risk", createdAt: daysAgo(0, 9, 5) } }));
  gd.push(await prisma.message.create({ data: { groupId: groupDev.id, senderId: alex, type: "text", text: "Agreed. Feature freeze first", createdAt: daysAgo(0, 9, 8), replyToId: gd[9].id } }));
  gd.push(await prisma.message.create({ data: { groupId: groupDev.id, senderId: noah, type: "text", text: "Fair. Adding it to the post-demo backlog", createdAt: daysAgo(0, 9, 12) } }));
  gd.push(await prisma.message.create({ data: { groupId: groupDev.id, senderId: ava, type: "text", text: "PR for the image compression is up for review btw 👀", createdAt: minsAgo(30) } }));
  gd.push(await prisma.message.create({ data: { groupId: groupDev.id, senderId: noah, type: "text", text: "On it!", createdAt: minsAgo(25) } }));
  gd.push(await prisma.message.create({ data: { groupId: groupDev.id, senderId: alex, type: "text", text: "Me too, assigning myself", createdAt: minsAgo(22) } }));
  await prisma.group.update({ where: { id: groupDev.id }, data: { updatedAt: minsAgo(22) } });

  // ── Weekend Plans ─────────────────────────────────────────────────────────
  const groupWeekend = await prisma.group.create({
    data: { name: "Weekend Plans 🎉", description: "Off-topic, hangouts, and fun" },
  });
  await prisma.groupMember.createMany({
    data: [
      { groupId: groupWeekend.id, userId: emma,  isAdmin: true },
      { groupId: groupWeekend.id, userId: sofia, isAdmin: false },
      { groupId: groupWeekend.id, userId: ava,   isAdmin: false },
      { groupId: groupWeekend.id, userId: alex,  isAdmin: false },
      { groupId: groupWeekend.id, userId: noah,  isAdmin: false },
      { groupId: groupWeekend.id, userId: liam,  isAdmin: false },
    ],
  });
  const gw: { id: string }[] = [];
  gw.push(await prisma.message.create({ data: { groupId: groupWeekend.id, senderId: emma, type: "text", text: "Who's free this Saturday? Thinking rooftop bar 🍹", createdAt: daysAgo(3, 18, 0) } }));
  gw.push(await prisma.message.create({ data: { groupId: groupWeekend.id, senderId: sofia, type: "text", text: "I'm in!! 🙋‍♀️", createdAt: daysAgo(3, 18, 5) } }));
  gw.push(await prisma.message.create({ data: { groupId: groupWeekend.id, senderId: ava, type: "text", text: "Same! What time?", createdAt: daysAgo(3, 18, 8) } }));
  gw.push(await prisma.message.create({ data: { groupId: groupWeekend.id, senderId: alex, type: "text", text: "I'm down, could do 7pm onwards", createdAt: daysAgo(3, 18, 12) } }));
  gw.push(await prisma.message.create({ data: { groupId: groupWeekend.id, senderId: noah, type: "text", text: "7 works for me too 🍻", createdAt: daysAgo(3, 18, 15) } }));
  gw.push(await prisma.message.create({ data: { groupId: groupWeekend.id, senderId: liam, type: "text", text: "Count me in! Which rooftop?", createdAt: daysAgo(3, 18, 20) } }));
  gw.push(await prisma.message.create({ data: { groupId: groupWeekend.id, senderId: emma, type: "text", text: "Sky Lounge on 5th Ave — has a great view and they do tapas", createdAt: daysAgo(3, 18, 25) } }));
  gw.push(await prisma.message.create({ data: { groupId: groupWeekend.id, senderId: sofia, type: "text", text: "Oh I've been there, the guacamole is insane 😍", createdAt: daysAgo(3, 18, 28) } }));
  gw.push(await prisma.message.create({ data: { groupId: groupWeekend.id, senderId: ava, type: "text", text: "Okay I need that guacamole in my life immediately", createdAt: daysAgo(3, 18, 30) } }));
  gw.push(await prisma.message.create({ data: { groupId: groupWeekend.id, senderId: alex, type: "text", text: "haha same. Saturday 7pm it is! ✅", createdAt: daysAgo(3, 18, 32) } }));
  gw.push(await prisma.message.create({ data: { groupId: groupWeekend.id, senderId: liam, type: "text", text: "Should we book a table just in case?", createdAt: daysAgo(2, 10, 0) } }));
  gw.push(await prisma.message.create({ data: { groupId: groupWeekend.id, senderId: emma, type: "text", text: "Good call. Done! Reserved for 6 under my name 🎊", createdAt: daysAgo(2, 10, 10) } }));
  gw.push(await prisma.message.create({ data: { groupId: groupWeekend.id, senderId: noah, type: "text", text: "Legend 🙌", createdAt: daysAgo(2, 10, 12), replyToId: gw[11].id } }));
  gw.push(await prisma.message.create({ data: { groupId: groupWeekend.id, senderId: sofia, type: "text", text: "Can't wait! Also bringing my roommate if that's ok?", createdAt: minsAgo(15) } }));
  gw.push(await prisma.message.create({ data: { groupId: groupWeekend.id, senderId: emma, type: "text", text: "Of course! The more the merrier 🥳", createdAt: minsAgo(10) } }));
  gw.push(await prisma.message.create({ data: { groupId: groupWeekend.id, senderId: ava, type: "text", text: "Counting down the hours honestly 😂", createdAt: minsAgo(5) } }));
  await prisma.group.update({ where: { id: groupWeekend.id }, data: { updatedAt: minsAgo(5) } });

  console.log("  ✓ 3 groups created");

  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("  Seed complete!");
  console.log("  Users       : 6");
  console.log("  DM convos   : 6");
  console.log("  Groups      : 3");
  console.log("  Password    : password123");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("\n  Accounts:");
  USERS.forEach(u => console.log(`  • ${u.email}`));
  console.log();

  process.exit(0);
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
