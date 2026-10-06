import "server-only";

import { ObjectId, type Collection, type WithId } from "mongodb";

import { getDatabase } from "@/lib/mongodb";

export type ReportType = "template" | "standalone";

export interface ReportDocument {
  _id?: ObjectId;
  userId: ObjectId;
  internalName: string;
  title: string;
  type: ReportType;
  source: "google_ads";
  googleAdsAccountId: string;
  googleAdsAccountName: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateReportInput {
  userId: ObjectId;
  internalName: string;
  title: string;
  type: ReportType;
  googleAdsAccountId: string;
  googleAdsAccountName: string;
}

export type SafeReport = Omit<ReportDocument, "_id" | "userId"> & {
  _id: string;
};

async function getReportsCollection(): Promise<Collection<ReportDocument>> {
  const database = await getDatabase(process.env.MONGODB_DB || "hexaads");

  return database.collection<ReportDocument>("reports");
}

function toSafeReport(report: WithId<ReportDocument>): SafeReport {
  return {
    _id: report._id.toString(),
    internalName: report.internalName,
    title: report.title,
    type: report.type,
    source: report.source,
    googleAdsAccountId: report.googleAdsAccountId,
    googleAdsAccountName: report.googleAdsAccountName,
    createdAt: report.createdAt,
    updatedAt: report.updatedAt,
  };
}

export async function createReport(
  input: CreateReportInput
): Promise<SafeReport> {
  const reports = await getReportsCollection();
  const now = new Date();

  const document: ReportDocument = {
    userId: input.userId,
    internalName: input.internalName,
    title: input.title,
    type: input.type,
    source: "google_ads",
    googleAdsAccountId: input.googleAdsAccountId,
    googleAdsAccountName: input.googleAdsAccountName,
    createdAt: now,
    updatedAt: now,
  };

  const result = await reports.insertOne(document);

  return toSafeReport({
    ...document,
    _id: result.insertedId,
  });
}

export async function getReportsForUser(
  userId: ObjectId
): Promise<SafeReport[]> {
  const reports = await getReportsCollection();

  const documents = await reports
    .find({ userId })
    .sort({ createdAt: -1 })
    .toArray();

  return documents.map(toSafeReport);
}