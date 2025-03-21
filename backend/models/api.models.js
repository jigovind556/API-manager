const mongoose = require("mongoose");

const endpointSchema = new mongoose.Schema({
  environment: {
    type: String,
    required: true,
    trim: true,
  },
  source: {
    type: String,
    required: true,
    trim: true,
  },
  destination: {
    type: String,
    required: true,
    trim: true,
  },
  portNo: {
    type: Number,
    required: true,
  },
  appUrl: {
    type: String,
    required: true,
    trim: true,
  },
  dnsName: {
    type: String,
    required: true,
    trim: true,
  },
});

const apiSchema = new mongoose.Schema(
  {
    applicationName: {
      type: String,
      required: true,
      trim: true,
    },
    endpoints: {
      type: [endpointSchema],
      required: true,
    },
    apiDescription: {
      type: String,
      trim: true,
    },
    applicationDescription: {
      type: String,
      trim: true,
    },
    request: {
      type: Object,
      required: true,
    },
    response: {
      type: Object,
      required: true,
    },
    attachment: {
      type: String,
      trim: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);
/**
 * Recursively finds differences between two objects.
 */
// function findChanges(oldObj, newObj, path = "") {
//   let changes = {};

//   for (let key in oldObj) {
//     let fullPath = path ? `${path}.${key}` : key;

//     if (!(key in newObj)) {
//       // Field was removed
//       changes[fullPath] = { old: oldObj[key], new: undefined };
//     } else if (
//       typeof oldObj[key] === "object" &&
//       typeof newObj[key] === "object"
//     ) {
//       // Recurse into nested objects
//       let nestedChanges = findChanges(oldObj[key], newObj[key], fullPath);
//       if (Object.keys(nestedChanges).length > 0) {
//         Object.assign(changes, nestedChanges);
//       }
//     } else if (oldObj[key] !== newObj[key]) {
//       // Field was updated
//       changes[fullPath] = { old: oldObj[key], new: newObj[key] };
//     }
//   }

//   for (let key in newObj) {
//     let fullPath = path ? `${path}.${key}` : key;

//     if (!(key in oldObj)) {
//       // New field added
//       changes[fullPath] = { old: undefined, new: newObj[key] };
//     }
//   }

//   return changes;
// }

/**
 * Middleware to log changes before update.
 */
// apiSchema.pre("findOneAndUpdate", async function (next) {
//   const oldData = await this.model.findOne(this.getQuery()).lean(); // Get existing document
//   if (!oldData) return next(); // Skip if no existing data
//   console.log('oldData', oldData);
//   const updateOps = this.getUpdate(); // Get update operations
//   let updatedData = { ...oldData }; // Start with old data

//   // Apply $set and $unset manually
//   if (updateOps.$set) {
//     updatedData = { ...updatedData, ...updateOps.$set };
//   }
//   if (updateOps.$unset) {
//     for (let key of Object.keys(updateOps.$unset)) {
//       delete updatedData[key]; // Remove unset fields
//     }
//   }

//   // Find deep changes
//   const changes = findChanges(oldData, updatedData);
//   console.log('changes', changes);

//   if (Object.keys(changes).length > 0) {
//     await API_Log.create({
//       apiId: oldData._id,
//       changes,
//       updatedBy: updateOps.updatedBy || null, // Capture the user who made changes
//     });
//   }

//   next();
// });

const apiLogSchema = new mongoose.Schema(
  {
    apiId: { type: mongoose.Schema.Types.ObjectId, ref: "API", required: true },
    changes: { type: Object, required: true }, // Only changed fields
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const API = mongoose.model("API", apiSchema);
const API_Log = mongoose.model("API_Log", apiLogSchema);

module.exports = { API, API_Log };
