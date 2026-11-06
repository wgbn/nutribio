// Closes the database pool when Nitro shuts down (SIGTERM / restart).

export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('close', async () => {
    await closeDb();
  });
});
