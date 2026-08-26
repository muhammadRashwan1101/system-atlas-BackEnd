const Counter = require("../../models/counter.model");

const generateEmployeeId = async () => {

  const counter = await Counter.findOneAndUpdate(
    { name: "employee" },
    { $inc: { seq: 1 } },
    {
      new: true,
      upsert: true,
    }
  );

  return `EMP-${String(counter.seq).padStart(4, "0")}`;
};

module.exports = generateEmployeeId;