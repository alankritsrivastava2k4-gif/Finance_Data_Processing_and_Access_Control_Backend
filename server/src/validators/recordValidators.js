import { body, query } from "express-validator";
import { ENTRY_TYPES } from "../models/FinancialRecord.js";

export const createRecordRules = [
  body("amount").isFloat({ min: 0 }).withMessage("amount must be a non-negative number"),
  body("type").isIn(Object.values(ENTRY_TYPES)),
  body("category").trim().notEmpty(),
  body("date").isISO8601().toDate(),
  body("notes").optional().isString(),
];

export const updateRecordRules = [
  body("amount").optional().isFloat({ min: 0 }),
  body("type").optional().isIn(Object.values(ENTRY_TYPES)),
  body("category").optional().trim().notEmpty(),
  body("date").optional().isISO8601().toDate(),
  body("notes").optional().isString(),
];

export const listRecordQueryRules = [
  query("page").optional().isInt({ min: 1 }),
  query("limit").optional().isInt({ min: 1, max: 100 }),
  query("type").optional().isIn(Object.values(ENTRY_TYPES)),
  query("category").optional().isString(),
  query("dateFrom").optional().isISO8601(),
  query("dateTo").optional().isISO8601(),
  query("search").optional().isString(),
];
