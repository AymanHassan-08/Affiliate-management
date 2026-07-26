import mongoose from "mongoose";

export interface IContent {
  _id?: string;
  workspaceId: mongoose.Schema.Types.ObjectId;
  productId?: mongoose.Schema.Types.ObjectId;
  type: "description" | "review" | "seo" | "social" | "ad" | "long-form";
  title: string;
  body: string;
  metadata?: {
    generatedAt?: Date;
    model?: string;
    tokens?: number;
    keywords?: string[];
  };
  socialPlatforms?: {
    facebook?: {
      posted: boolean;
      postId?: string;
      url?: string;
      postedAt?: Date;
      engagement?: number;
    };
    instagram?: {
      posted: boolean;
      postId?: string;
      url?: string;
      postedAt?: Date;
      engagement?: number;
    };
    tiktok?: {
      posted: boolean;
      videoId?: string;
      url?: string;
      postedAt?: Date;
      views?: number;
    };
    twitter?: {
      posted: boolean;
      tweetId?: string;
      url?: string;
      postedAt?: Date;
      engagement?: number;
    };
    linkedin?: {
      posted: boolean;
      postId?: string;
      url?: string;
      postedAt?: Date;
      engagement?: number;
    };
  };
  earnings?: {
    totalEarnings: number;
    currency: string;
    lastUpdated: Date;
    sources: Array<{
      platform: string;
      amount: number;
      conversions: number;
      clicks: number;
    }>;
  };
  automationSettings?: {
    autoPost: boolean;
    autoRefresh: boolean;
    postSchedules?: Array<{
      platform: string;
      dayOfWeek: number;
      time: string;
    }>;
  };
  createdAt: Date;
  updatedAt: Date;
}

const ContentSchema = new mongoose.Schema<IContent>(
  {
    workspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
      index: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      index: true,
    },
    type: {
      type: String,
      enum: ["description", "review", "seo", "social", "ad", "long-form"],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    body: {
      type: String,
      required: true,
    },
    metadata: {
      generatedAt: { type: Date, default: Date.now },
      model: String,
      tokens: Number,
      keywords: [String],
    },
    socialPlatforms: {
      facebook: {
        posted: { type: Boolean, default: false },
        postId: String,
        url: String,
        postedAt: Date,
        engagement: { type: Number, default: 0 },
      },
      instagram: {
        posted: { type: Boolean, default: false },
        postId: String,
        url: String,
        postedAt: Date,
        engagement: { type: Number, default: 0 },
      },
      tiktok: {
        posted: { type: Boolean, default: false },
        videoId: String,
        url: String,
        postedAt: Date,
        views: { type: Number, default: 0 },
      },
      twitter: {
        posted: { type: Boolean, default: false },
        tweetId: String,
        url: String,
        postedAt: Date,
        engagement: { type: Number, default: 0 },
      },
      linkedin: {
        posted: { type: Boolean, default: false },
        postId: String,
        url: String,
        postedAt: Date,
        engagement: { type: Number, default: 0 },
      },
    },
    earnings: {
      totalEarnings: { type: Number, default: 0 },
      currency: { type: String, default: "USD" },
      lastUpdated: { type: Date, default: Date.now },
      sources: [
        {
          platform: String,
          amount: { type: Number, default: 0 },
          conversions: { type: Number, default: 0 },
          clicks: { type: Number, default: 0 },
        },
      ],
    },
    automationSettings: {
      autoPost: { type: Boolean, default: false },
      autoRefresh: { type: Boolean, default: false },
      postSchedules: [
        {
          platform: String,
          dayOfWeek: Number,
          time: String,
        },
      ],
    },
  },
  { timestamps: true }
);

// Indexes for performance
ContentSchema.index({ workspaceId: 1, createdAt: -1 });
ContentSchema.index({ workspaceId: 1, type: 1 });
ContentSchema.index({ "socialPlatforms.facebook.posted": 1 });
ContentSchema.index({ "earnings.totalEarnings": -1 });

export default mongoose.model<IContent>("Content", ContentSchema);
