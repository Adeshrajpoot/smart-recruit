import Drive from "../models/Drive.js";

export const createDrive = async (
  req,
  res
) => {
  const drive =
    await Drive.create({
      ...req.body,
      createdBy: req.user.id
    });

  res.status(201).json({
    success: true,
    message: "Drive created",
    data: { drive }
  });
};

export const getDrives = async (req, res) => {
  let filter;
  if (req.user.role === "admin") {
    filter = {};
  } else if (req.user.role === "recruiter") {
    filter = { createdBy: req.user.id };
  } else {
    filter = { isActive: true };
  }

  const drives = await Drive.find(filter)
    .sort({ createdAt: -1 })
    .populate("createdBy", "name email");

  return res.json({ success: true, data: { drives } });
};

export const getDrive = async (req, res) => {
  const filter = req.user.role === "admin"
    ? { _id: req.params.id }
    : req.user.role === "recruiter"
      ? { _id: req.params.id, createdBy: req.user.id }
      : { _id: req.params.id, isActive: true };

  const drive = await Drive.findOne(filter).populate("createdBy", "name email");
  if (!drive) {
    return res.status(404).json({ success: false, message: "Drive not found" });
  }

  return res.json({ success: true, data: { drive } });
};

export const updateDrive = async (req, res) => {
  const filter = req.user.role === "admin"
    ? { _id: req.params.id }
    : { _id: req.params.id, createdBy: req.user.id };

  const drive = await Drive.findOne(filter);
  if (!drive) {
    return res.status(404).json({ success: false, message: "Drive not found" });
  }

  const allowedFields = ["title", "company", "role", "description", "location", "startDate", "endDate", "isActive"];
  for (const field of allowedFields) {
    if (req.body[field] !== undefined) drive[field] = req.body[field];
  }
  await drive.save();

  return res.json({ success: true, message: "Drive updated", data: { drive } });
};

export const deleteDrive = async (req, res) => {
  const filter = req.user.role === "admin"
    ? { _id: req.params.id }
    : { _id: req.params.id, createdBy: req.user.id };

  const drive = await Drive.findOneAndDelete(filter);
  if (!drive) {
    return res.status(404).json({ success: false, message: "Drive not found" });
  }

  return res.json({ success: true, message: "Drive deleted" });
};

export const inviteCandidate = async (
  req,
  res
) => {
  const {
    candidateId
  } = req.body;

  const drive = await Drive.findOne(
    req.user.role === "admin"
      ? { _id: req.params.id }
      : { _id: req.params.id, createdBy: req.user.id }
  );

  if (!drive) {
    return res.status(404).json({
      success: false,
      message: "Drive not found"
    });
  }

  if (
    !drive.invitedCandidates
      .map(String)
      .includes(String(candidateId))
  ) {
    drive.invitedCandidates.push(
      candidateId
    );

    await drive.save();
  }

  res.json({
    success: true,
    message: "Candidate invited",
    data: { drive }
  });
};