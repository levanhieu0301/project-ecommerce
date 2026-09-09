import { Router } from "express";
const router = Router();
import * as dashboardController from "../../controllers/admin/dashboard.controller"
import { checkPermissions } from "../../middlewares/admin/account.middleware";

router.get('/',checkPermissions("dashboard"), dashboardController.dashboard)
router.get('/revenue-by-time', dashboardController.revenueByTime);
router.get('/order-statistic', dashboardController.orderStatistic);

router.get('/top-selling-products', dashboardController.topSellingProducts);
router.get('/customer-statistic', dashboardController.customerStatistic);


export default router;