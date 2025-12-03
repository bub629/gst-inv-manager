import { FirmDetails } from './types';

export const FIRM_DETAILS: FirmDetails = {
  name: "Your Firm Name",
  address: "Update Address in Settings",
  city: "City",
  district: "District",
  state: "State",
  pincode: "000000",
  gstin: "URP", // Unregistered Person by default
  stateCode: "", 
  contact: "",
  bankName: "",
  accountNo: "",
  ifsc: ""
};

export const INDIAN_STATES = [
  { code: "21", name: "Odisha" },
  { code: "19", name: "West Bengal" },
  { code: "20", name: "Jharkhand" },
  { code: "22", name: "Chhattisgarh" },
  { code: "28", name: "Andhra Pradesh" },
  { code: "27", name: "Maharashtra" },
  { code: "07", name: "Delhi" },
  { code: "29", name: "Karnataka" },
  { code: "33", name: "Tamil Nadu" },
  { code: "09", name: "Uttar Pradesh" },
  { code: "24", name: "Gujarat" },
  { code: "08", name: "Rajasthan" },
  // Add more as needed
];

export const TAX_RATES = [0, 5, 12, 18, 28];
export const UNITS = ["KGS", "LTR", "NOS", "PCS", "TON", "BOX", "MTR", "BAG"];