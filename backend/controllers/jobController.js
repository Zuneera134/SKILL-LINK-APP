const Job = require("../models/Job");
const User = require("../models/User");


exports.createJob = async (req, res) => {
  try {
    const { workerId, service, address, scheduledAt, notes, price } = req.body;

    if (!workerId || !service || !address) {
      return res.status(400).json({ message: "workerId, service, address are required" });
    }

    const job = await Job.create({
      clientId: req.user.id,
      workerId,
      service,
      address,
      notes: notes || "",
      price: price || 0,
      scheduledAt: scheduledAt || null,
      status: "Pending",
    });

    res.status(201).json(job);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


exports.getClientJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ clientId: req.user.id }).sort({ createdAt: -1 });
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


exports.getWorkerJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ workerId: req.user.id }).sort({ createdAt: -1 });
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


exports.acceptJob = async (req, res) => {
  try {
    const job = await Job.findOne({ _id: req.params.id, workerId: req.user.id });
    if (!job) return res.status(404).json({ message: "Job not found" });

    if (job.status !== "Pending") {
      return res.status(400).json({ message: "Only Pending jobs can be accepted" });
    }

    job.status = "Accepted";
    await job.save();
    res.json(job);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


exports.completeJob = async (req, res) => {
  try {
    const job = await Job.findOne({ _id: req.params.id, workerId: req.user.id });
    if (!job) return res.status(404).json({ message: "Job not found" });

    if (job.status !== "Accepted") {
      return res.status(400).json({ message: "Only Accepted jobs can be completed" });
    }

    job.status = "Completed";
    await job.save();
    res.json(job);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


exports.emergencyJob = async (req, res) => {
  try {
    const { service, address } = req.body;
    if (!service) return res.status(400).json({ message: "service is required" });

    const worker = await User.findOne({
      role: "serviceProvider",
      approved: true,
      skill: new RegExp(`^${service}$`, "i"),
    });

    if (!worker) return res.status(404).json({ message: "No approved worker found for this service" });

    const job = await Job.create({
      clientId: req.user.id,
      workerId: worker._id,
      service,
      address: address || "Emergency",
      status: "Emergency",
      price: worker.price || 0,
    });

    res.status(201).json(job);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
