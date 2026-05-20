const mongoose = require("mongoose");

const budgetSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        month: {
            type: String,
            required: true,
            match: [/^\d{4}-\d{2}$/, "Invalid month format. Use YYYY-MM"]
        },
        categories: {
            Food: { type: Number, default: 0, min: 0 },
            Transport: { type: Number, default: 0, min: 0 },
            Shopping: { type: Number, default: 0, min: 0 },
            Bills: { type: Number, default: 0, min: 0 },
            Other: { type: Number, default: 0, min: 0 }
        }
    },
    { timestamps: true, versionKey: false }
);

budgetSchema.index({ userId: 1, month: 1 }, { unique: true });

module.exports = mongoose.model("Budget", budgetSchema);