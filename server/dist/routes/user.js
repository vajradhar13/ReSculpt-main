"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_1 = require("../controllers/user");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const userRoutes = (0, express_1.Router)();
userRoutes.get("/profile", authMiddleware_1.authMiddleware, user_1.profile);
userRoutes.post("/contribution/:id", authMiddleware_1.authMiddleware, user_1.contribute);
userRoutes.get("/getUploadedProducts", authMiddleware_1.authMiddleware, user_1.uploadedInnovativeProducts);
userRoutes.get("/getUploadedWasteRequirements", authMiddleware_1.authMiddleware, user_1.uploadedWasteRequirements);
userRoutes.get("/getSatisfiedWasterequirements", authMiddleware_1.authMiddleware, user_1.satisfiedWasteRequirements);
userRoutes.get("/getContributions", authMiddleware_1.authMiddleware, user_1.contributions);
userRoutes.post("/order/:productId", authMiddleware_1.authMiddleware, user_1.orders);
userRoutes.get("/getOrders", authMiddleware_1.authMiddleware, user_1.getOrders);
exports.default = userRoutes;