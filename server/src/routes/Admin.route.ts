import { Router } from "express";
import auth from "../middleware/auth.middleware.js";
import { getProvider } from "../controller/Admin.controller.js";
import { updateProviderStatus } from "../controller/Admin.controller.js";
import { getAllUser } from "../controller/Admin.controller.js";
import { deleteUser } from "../controller/Admin.controller.js";
import { getApproveProvider } from "../controller/Admin.controller.js";
import adminOnly from "../middleware/auth.middleware.js";
const AdminRoute = Router();


AdminRoute.get("/user", auth, adminOnly, getAllUser);
AdminRoute.get("/", auth, adminOnly, getProvider);
AdminRoute.put("/:id", auth, adminOnly, updateProviderStatus);
AdminRoute.delete("/:id", auth, adminOnly, deleteUser);
AdminRoute.get("/approve", auth, adminOnly, getApproveProvider);

export default AdminRoute;