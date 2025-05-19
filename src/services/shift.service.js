import { api } from "./api.service";

export class ShiftService {
  static async logShiftVisits(data) {
    const res = await api.post("log-shift", data);
    return res.data;
  }

  static async getShifts() {
    const res = await api.get(`shifts`);
    return res.data;
  }
}
