import "dotenv/config";
import { auth } from "../lib/auth";

const fakeUsers = [
  {
    name: "Sarah Mitchell",
    email: "sarah@example.com",
    password: "password123",
  },
  {
    name: "James Carter",
    email: "james@example.com",
    password: "password123",
  },
  {
    name: "Emily Rodriguez",
    email: "emily@example.com",
    password: "password123",
  },
  {
    name: "Michael Chen",
    email: "michael@example.com",
    password: "password123",
  },
  {
    name: "Olivia Thompson",
    email: "olivia@example.com",
    password: "password123",
  },
  {
    name: "Daniel Park",
    email: "daniel@example.com",
    password: "password123",
  },
];

async function seed() {
  console.log("Seeding fake users...\n");
  let created = 0;
  let skipped = 0;

  for (const user of fakeUsers) {
    try {
      await auth.api.signUpEmail({ body: user });
      console.log(`✓  ${user.name} — ${user.email}`);
      created++;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.log(`⚠  ${user.email} — ${msg}`);
      skipped++;
    }
  }

  console.log(`\nDone — ${created} created, ${skipped} skipped.`);
  console.log("All passwords: password123");
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
