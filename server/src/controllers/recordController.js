import { FinancialRecord, ENTRY_TYPES } from "../models/FinancialRecord.js";

function buildFilter(query) {
  const filter = { deletedAt: null };
  if (query.type && Object.values(ENTRY_TYPES).includes(query.type)) {
    filter.type = query.type;
  }
  if (query.category) {
    filter.category = new RegExp(`^${escapeRegex(query.category)}$`, "i");
  }
  if (query.dateFrom || query.dateTo) {
    filter.date = {};
    if (query.dateFrom) filter.date.$gte = new Date(query.dateFrom);
    if (query.dateTo) filter.date.$lte = new Date(query.dateTo);
  }
  if (query.search) {
    const s = escapeRegex(query.search.trim());
    filter.$or = [{ notes: new RegExp(s, "i") }, { category: new RegExp(s, "i") }];
  }
  return filter;
}

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function listRecords(req, res, next) {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const skip = (page - 1) * limit;
    const filter = buildFilter(req.query);
    const [items, total] = await Promise.all([
      FinancialRecord.find(filter)
        .sort({ date: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("createdBy", "name email")
        .lean(),
      FinancialRecord.countDocuments(filter),
    ]);
    res.json({
      data: items,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
    });
  } catch (e) {
    next(e);
  }
}

export async function getRecord(req, res, next) {
  try {
    const doc = await FinancialRecord.findOne({
      _id: req.params.id,
      deletedAt: null,
    })
      .populate("createdBy", "name email")
      .lean();
    if (!doc) {
      return res.status(404).json({ error: "NotFound", message: "Record not found" });
    }
    res.json({ data: doc });
  } catch (e) {
    next(e);
  }
}

export async function createRecord(req, res, next) {
  try {
    const { amount, type, category, date, notes } = req.body;
    const doc = await FinancialRecord.create({
      amount,
      type,
      category,
      date: new Date(date),
      notes: notes ?? "",
      createdBy: req.user.id,
    });
    const populated = await FinancialRecord.findById(doc._id).populate("createdBy", "name email");
    res.status(201).json({ data: populated });
  } catch (e) {
    next(e);
  }
}

export async function updateRecord(req, res, next) {
  try {
    const doc = await FinancialRecord.findOne({ _id: req.params.id, deletedAt: null });
    if (!doc) {
      return res.status(404).json({ error: "NotFound", message: "Record not found" });
    }
    const { amount, type, category, date, notes } = req.body;
    if (amount !== undefined) doc.amount = amount;
    if (type !== undefined) doc.type = type;
    if (category !== undefined) doc.category = category;
    if (date !== undefined) doc.date = new Date(date);
    if (notes !== undefined) doc.notes = notes;
    await doc.save();
    const populated = await FinancialRecord.findById(doc._id).populate("createdBy", "name email");
    res.json({ data: populated });
  } catch (e) {
    next(e);
  }
}

export async function deleteRecord(req, res, next) {
  try {
    const doc = await FinancialRecord.findOne({ _id: req.params.id, deletedAt: null });
    if (!doc) {
      return res.status(404).json({ error: "NotFound", message: "Record not found" });
    }
    await doc.softDelete();
    res.status(204).send();
  } catch (e) {
    next(e);
  }
}
