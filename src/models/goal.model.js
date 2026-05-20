const mongoose = require("mongoose");

const goalSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        title: {
            type: String,
            required: true,
            trim: true,
            minlength: 2
        },
        targetAmount: {
            type: Number,
            required: true,
            min: 1
        },
        currentAmount: {
            type: Number,
            default: 0,
            min: 0
        },
        deadline: {
            type: Date
        },
        status: {
            type: String,
            enum: ["in-progress", "completed"],
            default: "in-progress"
        },
        notes: {
            type: String,
            trim: true,
            default: ""
        }
    },
    { timestamps: true, versionKey: false }
);

goalSchema.pre("save", function (next) {
    if (this.currentAmount >= this.targetAmount) {
        this.status = "completed";
    } else {
        this.status = "in-progress";
    }
    next();
});

module.exports = mongoose.model("Goal", goalSchema);