import { Router, type IRouter } from "express";
import { Record } from "../../models/Record.js";
import { authenticate, requireRole, type AuthRequest } from "../../middlewares/auth.js";
import {
  CreateRecordBody,
  UpdateRecordBody,
  GetRecordParams,
  UpdateRecordParams,
  DeleteRecordParams,
  ListRecordsQueryParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

function formatRecord(record: InstanceType<typeof Record>) {
  return {
    id: record.id,
    amount: record.amount,
    type: record.type,
    category: record.category,
    date: record.date.toISOString(),
    notes: record.notes ?? null,
    createdBy: record.createdBy.toString(),
    isDeleted: record.isDeleted,
    createdAt: record.createdAt.toISOString(),
  };
}

router.get("/records", authenticate, async (req: AuthRequest, res): Promise<void> => {
  const queryParams = ListRecordsQueryParams.safeParse(req.query);

  const page = queryParams.success ? (queryParams.data.page ?? 1) : 1;
  const limit = queryParams.success ? (queryParams.data.limit ?? 20) : 20;
  const skip = (page - 1) * limit;

  const filter: Record<string, unknown> = { isDeleted: false };

  if (queryParams.success) {
    if (queryParams.data.type) filter.type = queryParams.data.type;
    if (queryParams.data.category) filter.category = new RegExp(queryParams.data.category, "i");
    if (queryParams.data.search) {
      filter.$or = [
        { category: new RegExp(queryParams.data.search, "i") },
        { notes: new RegExp(queryParams.data.search, "i") },
      ];
    }
    if (queryParams.data.startDate || queryParams.data.endDate) {
      filter.date = {};
      if (queryParams.data.startDate) {
        (filter.date as Record<string, Date>).$gte = new Date(queryParams.data.startDate);
      }
      if (queryParams.data.endDate) {
        (filter.date as Record<string, Date>).$lte = new Date(queryParams.data.endDate);
      }
    }
  }

  const [records, total] = await Promise.all([
    Record.find(filter).sort({ date: -1 }).skip(skip).limit(limit),
    Record.countDocuments(filter),
  ]);

  res.json({ records: records.map(formatRecord), total, page, limit });
});

router.post("/records", authenticate, requireRole("analyst", "admin"), async (req: AuthRequest, res): Promise<void> => {
  const parsed = CreateRecordBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { amount, type, category, date, notes } = parsed.data;
  const record = new Record({
    amount,
    type,
    category,
    date: new Date(date),
    notes: notes ?? null,
    createdBy: req.user!.id,
  });
  await record.save();
  res.status(201).json(formatRecord(record));
});

router.get("/records/:id", authenticate, async (req: AuthRequest, res): Promise<void> => {
  const params = GetRecordParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: "Invalid record ID" });
    return;
  }

  const record = await Record.findOne({ _id: params.data.id, isDeleted: false });
  if (!record) {
    res.status(404).json({ error: "Record not found" });
    return;
  }
  res.json(formatRecord(record));
});

router.patch("/records/:id", authenticate, requireRole("analyst", "admin"), async (req: AuthRequest, res): Promise<void> => {
  const params = UpdateRecordParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: "Invalid record ID" });
    return;
  }

  const parsed = UpdateRecordBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const update: Record<string, unknown> = { ...parsed.data };
  if (parsed.data.date) update.date = new Date(parsed.data.date);

  const record = await Record.findOneAndUpdate(
    { _id: params.data.id, isDeleted: false },
    { $set: update },
    { new: true }
  );

  if (!record) {
    res.status(404).json({ error: "Record not found" });
    return;
  }
  res.json(formatRecord(record));
});

router.delete("/records/:id", authenticate, requireRole("admin"), async (req: AuthRequest, res): Promise<void> => {
  const params = DeleteRecordParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: "Invalid record ID" });
    return;
  }

  const record = await Record.findOneAndUpdate(
    { _id: params.data.id, isDeleted: false },
    { $set: { isDeleted: true } },
    { new: true }
  );

  if (!record) {
    res.status(404).json({ error: "Record not found" });
    return;
  }
  res.sendStatus(204);
});

export default router;
