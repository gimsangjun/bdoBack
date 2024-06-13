import mongoose, { Schema, Document } from "mongoose";

export interface IReinforcement extends Document {
  type: string;
  stages: string[];
  cronStones: number[];
  reinforcementStart: number[];
  reinforceIncreasedAmountBeforeSoftCap: number[];
  reinforceIncreasedAmountAfterSoftCap: number[];
  stackSoftCap: number[];
  recommendStack: number[];
  maxReinforcementChange: number[];
  itemsPerTry: any[];
  durabilityLossOnFailure: number;
  downgradeProbability: number;
}

const ItemSchema = new Schema({
  name: { type: String },
  count: { type: Number, required: true },
});

const ReinforcementSchema: Schema = new Schema({
  type: { type: String, required: true, unique: true }, // 검은별 무기, 악세사리, 고드아이드, 태고 방어구
  stages: [{ type: String, required: true }], // 장광고유동
  cronStones: [{ type: Number, required: true }], // 강화단계별 크론석 소모 갯수
  reinforcementStart: [{ type: Number, required: true }], // 0스택 확률
  reinforceIncreasedAmountBeforeSoftCap: [{ type: Number, required: true }], // 소프트캡 이전 1스택당 오르는 확률
  reinforceIncreasedAmountAfterSoftCap: [{ type: Number, required: true }], // 소프트캡 이후 1스택당 오르는 확률
  stackSoftCap: [{ type: Number, required: true }], // 스택 소프트캡.
  recommendStack: [{ type: Number, required: true }], // 기본값, 추천 스택
  maxReinforcementChange: [{ type: Number, required: true }], // 강화확률 최대 오를 수 있는 퍼센트
  // 강화단계별 크론석 제외 필요한 아이템, 이름이 없는 경우(ex 악세), 자기자신0단계가 들어감.
  // Ex  { name: "무결한 마력의 블랙스톤", count: 1 }, 등등.
  itemsPerTry: [{ type: ItemSchema, required: true }],
  durabilityLossOnFailure: { type: Number, required: true }, // 강화 실패 시 내구도 소모량
  downgradeProbability: { type: Number, required: true }, // 강화 실패시 강화 등급 내려갈 확률
});

const ReinforcementModel = mongoose.model<IReinforcement>(
  "Reinforcement",
  ReinforcementSchema,
);
export default ReinforcementModel;
