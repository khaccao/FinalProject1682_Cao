const cron = require("node-cron");
const { checkUpcomingTasks } = require("../controllers/taskController");

setInterval(async () => {
  const now = new Date();
  await checkUpcomingTasks(now);
}, 2*60000);
