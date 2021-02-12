import mongoose, { Document } from "mongoose";

export interface IUser extends Document {
	_id: string
	username: string,
	userId: number
}

const User = new mongoose.Schema(
	{
		username: {
			type: String,
			required: true
		},
		userId: {
			type: Number,
			required: true
		}
	},
	{
		collection: "User",
		versionKey: false
	}
);

export default mongoose.model<IUser>("User", User);