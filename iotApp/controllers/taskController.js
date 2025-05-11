const Task = require("../models/taskModel");
const {
  sendMail,
  createHydroponicTaskReminderHTML,
} = require("../mail/mailService");

const add7Hours = (dateStrOrObj) => {
  const date = new Date(dateStrOrObj);
  return new Date(date.getTime() + 7 * 60 * 60 * 1000);
};

const createTask = async (req, res) => {
  try {
    if (req.body.scheduleTime) {
      req.body.scheduleTime = add7Hours(req.body.scheduleTime);
    }

    req.body.createdAt = add7Hours(new Date());

    const task = new Task(req.body);
    await task.save();
    res.status(201).json(task);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateTask = async (req, res) => {
  try {
    if (req.body.scheduleTime) {
      req.body.scheduleTime = add7Hours(req.body.scheduleTime);
    }

    const updatedTask = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    if (!updatedTask) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json(updatedTask);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteTask = async (req, res) => {
  try {
    const deletedTask = await Task.findByIdAndDelete(req.params.id);
    if (!deletedTask) {
      return res.status(404).json({ message: "Task not found" });
    }
    res.json({ message: "Task deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
    task.status = status;
    await task.save();
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const toVietnamString = (date) => {
  return new Date(date).toLocaleString("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const checkUpcomingTasks = async () => {
  const now = new Date();
  const nowVN = new Date(now.getTime() + 7 * 60 * 60 * 1000); // ➕ Convert to Vietnam Time (UTC+7)
  const fiveMinutesLaterVN = new Date(nowVN.getTime() + 5 * 60 * 1000);

  console.log(
    `🕐 Checking from ${nowVN.toISOString()} to ${fiveMinutesLaterVN.toISOString()} (Asia/Ho_Chi_Minh)`
  );

  try {
    const tasks = await Task.find({
      scheduleTime: { $gte: nowVN, $lte: fiveMinutesLaterVN },
      status: { $ne: "completed" },
    }).populate({
      path: "userId",
      select: "email",
    });

    if (tasks.length === 0) {
      console.log("No upcoming (or incomplete) tasks.");
    } else {
      for (const task of tasks) {
        const scheduledTimeVN = new Date(
          task.scheduleTime.getTime() - 7 * 60 * 60 * 1000
        ).toLocaleString("en-US");
        const emailHTML = createHydroponicTaskReminderHTML(
          task.title,
          task.description,
          scheduledTimeVN
        );
        const emailText = `You have an upcoming task: ${
          task.title
        }. Scheduled time: ${scheduledTimeVN}. ${
          task.description || ""
        } Please check your hydroponic system.`;

        if (task.userId?.email) {
          console.log("Recipient Email:", task.userId.email);
          const success = await sendMail({
            to: task.userId.email,
            subject: `Reminder: ${task.title}`,
            text: emailText,
            html: emailHTML,
          });

          if (!success) {
            console.error("❌ Failed to send email for task:", task._id);
          }
        } else {
          console.warn("⚠️ No user email found for task:", task._id);
        }
      }
    }
  } catch (error) {
    console.error("❌ Error checking tasks:", error.message);
  }
};

const getTasksByUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    const tasks = await Task.find({ userId }).sort({ scheduleTime: 1 });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getHistoryTaskCompletedByUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    const completedTasks = await Task.find({
      userId,
      status: "completed",
    }).sort({ updatedAt: -1 });
    res.json(completedTasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createTask,
  updateTask,
  deleteTask,
  updateStatus,
  checkUpcomingTasks,
  getTasksByUserId,
  getHistoryTaskCompletedByUserId,
};
