export async function seed() {
  console.log("Seeding application defaults...");
}

if (import.meta.url === `file://${process.argv[1]}`) {
  seed();
}
