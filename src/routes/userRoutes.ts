import { Router } from "express";
import { signUpUser, signInUser } from "../controllers/userController";

const router = Router();

router.post("/signup", signUpUser);
router.post("/signin", signInUser);

export default router;
