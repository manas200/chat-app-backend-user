import mongoose, { Document, Schema } from "mongoose";

export interface IPrivacySettings {
  showOnlineStatus: boolean;
  showReadReceipts: boolean;
  showLastSeen: boolean;
}

export interface IUser extends Document {
  name: string;
  email: string;
  profilePic?: string;
  lastSeen?: Date;
  privacySettings: IPrivacySettings;
}

const privacySettingsSchema = new Schema<IPrivacySettings>(
  {
    showOnlineStatus: {
      type: Boolean,
      default: true,
    },
    showReadReceipts: {
      type: Boolean,
      default: true,
    },
    showLastSeen: {
      type: Boolean,
      default: true,
    },
  },
  { _id: false }
);

const schema: Schema<IUser> = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    profilePic: {
      type: String,
      default: "",
    },
    lastSeen: {
      type: Date,
      default: null,
    },
    privacySettings: {
      type: privacySettingsSchema,
      default: () => ({
        showOnlineStatus: true,
        showReadReceipts: true,
        showLastSeen: true,
      }),
    },
  },
  {
    timestamps: true,
  }
);

export const User = mongoose.model<IUser>("User", schema);
