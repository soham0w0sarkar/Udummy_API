import express from "express";
import { isAuthentiated, isSubsciber } from "../middlewares/auth.js";
import {
  buySubscription,
  cancelSubscription,
  getRazorKey,
  paymentVerify,
} from "../controllers/payment.js";

const router = express.Router();

router.route("/subscribe").get(isAuthentiated, buySubscription);
router.route("/paymentVerification").post(isAuthentiated, paymentVerify);
router.route("/getRazorKey").get(getRazorKey);
router
  .route("/cancelSub")
  .delete(isAuthentiated, isSubsciber, cancelSubscription);

export default router;
