import { Router } from "express";
const router = Router();
import homeRoute from "./home.route"

router.use('/', homeRoute)



export default router;