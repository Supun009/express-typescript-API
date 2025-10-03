import { Router  } from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { deleteUserAdmin, deleteUsersAdmin, getUserAdmin, getUsersAdmin, updateUserAdmin } from "../controllers/adminController.js";

const adminRouter = Router();

adminRouter.get("/users", authMiddleware, getUsersAdmin);

adminRouter.get("/users/:id", authMiddleware, getUserAdmin);

adminRouter.put("/users/:id", authMiddleware, updateUserAdmin);

adminRouter.delete("/users/delete", authMiddleware, deleteUsersAdmin);

adminRouter.delete("/users/:id", authMiddleware, deleteUserAdmin);


export default adminRouter;