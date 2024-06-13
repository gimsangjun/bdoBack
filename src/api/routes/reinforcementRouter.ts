import express, { Request, Response } from "express";
import ReinforcementModel from "../../models/reinforcement";
const router = express.Router();

// POST: /reinforcement, body: {type : 아이템 타입}
router.post("/", async (req: Request, res: Response) => {
  const { type } = req.body;
  try {
    const data = await ReinforcementModel.findOne({ type: type });
    if (!data) {
      return res.status(404).json({ message: "Data not found" });
    }
    res.status(200).json(data);
  } catch (error) {
    console.log("Error reinforcement", error);
    res.status(500).json({ message: "Error reinforcement", error });
  }
});

export default router;
