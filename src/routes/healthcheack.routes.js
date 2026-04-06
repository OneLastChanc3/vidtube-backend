import { Router } from "express";
import { healthcheck } from "../controllers/healthcheak.controllers.js";

const router = Router()

router.route("/").get(healthcheck)
router.route("/test").get(healthcheck )
export default router