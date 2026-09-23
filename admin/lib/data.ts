export type StatusTone = 'success' | 'warning' | 'danger' | 'info' | 'neutral'

export const statusTone: Record<string, StatusTone> = {
  Active: 'success',
  Confirmed: 'success',
  Approved: 'success',
  Disbursed: 'success',
  Completed: 'success',
  'Verified Registry': 'success',

  Pending: 'warning',
  'Under Review': 'warning',
  Moderate: 'warning',
  'Bed Reserved': 'warning',

  Critical: 'danger',
  Emergency: 'danger',
  Rejected: 'danger',
  Cancelled: 'danger',
  'Full Capacity': 'danger',

  Dispatched: 'info',
  Enroute: 'info',
  Admitted: 'info',

  Standby: 'neutral',
  Inactive: 'neutral',
}

export function formatINR(val: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(val)
}

export const metrics = [
  {
    label: 'Partner Hospitals',
    value: '1,451',
    trend: 'up' as const,
    delta: '+12%',
    hint: 'across 107 cities',
  },
  {
    label: 'Available ICU Beds',
    value: '10,880',
    trend: 'up' as const,
    delta: '+8.4%',
    hint: 'of 91,398 total beds',
  },
  {
    label: 'Cashless Pre-Auths',
    value: '₹4.82 Cr',
    trend: 'up' as const,
    delta: '+24.6%',
    hint: 'under AB-PMJAY HBP 2.2',
  },
  {
    label: 'SOS Trauma Dispatches',
    value: '3,842',
    trend: 'down' as const,
    delta: '-14 min',
    hint: 'avg ambulance ETA',
  },
]

export const bookingsTrend = [
  { month: 'Apr', opd: 4200, emergency: 950, surgery: 620 },
  { month: 'May', opd: 4800, emergency: 1100, surgery: 710 },
  { month: 'Jun', opd: 5300, emergency: 1050, surgery: 830 },
  { month: 'Jul', opd: 6100, emergency: 1250, surgery: 890 },
  { month: 'Aug', opd: 6800, emergency: 1400, surgery: 960 },
  { month: 'Sep', opd: 7450, emergency: 1320, surgery: 1040 },
]

export const claimsMix = [
  { name: 'Disbursed', value: 840, tone: '#10b981' },
  { name: 'Approved', value: 290, tone: '#0ea5e9' },
  { name: 'Under Review', value: 114, tone: '#f59e0b' },
  { name: 'Rejected', value: 40, tone: '#ef4444' },
]

export const bedOccupancy = [
  { city: 'Chandigarh', occupancy: 92 },
  { city: 'Mohali', occupancy: 78 },
  { city: 'Panchkula', occupancy: 64 },
  { city: 'Delhi NCR', occupancy: 88 },
  { city: 'Ludhiana', occupancy: 72 },
  { city: 'Amritsar', occupancy: 68 },
]

export interface AdminHospital {
  id: string
  name: string
  city: string
  state: string
  type: 'Multispecialty' | 'Cardiac' | 'Trauma' | 'Maternity' | 'General'
  status: string
  rating: number
  cashless: boolean
  emergency: boolean
  beds: number
  bedsAvailable: number
}

export const hospitals: AdminHospital[] = [
  {
    id: 'hosp-1',
    name: 'PGIMER Chandigarh',
    city: 'Chandigarh',
    state: 'Chandigarh',
    type: 'Trauma',
    status: 'Active',
    rating: 4.8,
    cashless: true,
    emergency: true,
    beds: 1948,
    bedsAvailable: 142,
  },
  {
    id: 'hosp-12',
    name: 'Max Super Speciality Hospital',
    city: 'Mohali',
    state: 'Punjab',
    type: 'Multispecialty',
    status: 'Active',
    rating: 4.6,
    cashless: true,
    emergency: true,
    beds: 240,
    bedsAvailable: 34,
  },
  {
    id: 'hosp-13',
    name: 'Fortis Escorts Hospital',
    city: 'Mohali',
    state: 'Punjab',
    type: 'Cardiac',
    status: 'Active',
    rating: 4.7,
    cashless: true,
    emergency: true,
    beds: 350,
    bedsAvailable: 28,
  },
  {
    id: 'hosp-3',
    name: 'Government Medical College & Hospital (GMCH-32)',
    city: 'Chandigarh',
    state: 'Chandigarh',
    type: 'General',
    status: 'Active',
    rating: 4.5,
    cashless: true,
    emergency: true,
    beds: 950,
    bedsAvailable: 68,
  },
  {
    id: 'hosp-14',
    name: 'Alchemist Hospital',
    city: 'Panchkula',
    state: 'Haryana',
    type: 'Multispecialty',
    status: 'Active',
    rating: 4.3,
    cashless: true,
    emergency: true,
    beds: 180,
    bedsAvailable: 22,
  },
  {
    id: 'hosp-15',
    name: 'Paras Hospital Panchkula',
    city: 'Panchkula',
    state: 'Haryana',
    type: 'Cardiac',
    status: 'Active',
    rating: 4.4,
    cashless: true,
    emergency: true,
    beds: 200,
    bedsAvailable: 19,
  },
  {
    id: 'hosp-2',
    name: 'AIIMS New Delhi',
    city: 'Delhi',
    state: 'Delhi',
    type: 'Trauma',
    status: 'Active',
    rating: 4.9,
    cashless: true,
    emergency: true,
    beds: 2478,
    bedsAvailable: 85,
  },
  {
    id: 'hosp-16',
    name: 'Apollo Hospital Ludhiana',
    city: 'Ludhiana',
    state: 'Punjab',
    type: 'Multispecialty',
    status: 'Active',
    rating: 4.5,
    cashless: true,
    emergency: true,
    beds: 300,
    bedsAvailable: 41,
  },
]

export const triageCases = [
  {
    id: 'TR-8921',
    patient: 'Sukhwinder Singh (58y/M)',
    complaint: 'Acute STEMI, Chest pain radiating to left arm',
    severity: 'Critical',
    hospital: 'PGIMER Chandigarh (Cath Lab 2)',
    eta: '6 mins',
    ambulance: true,
  },
  {
    id: 'TR-8922',
    patient: 'Pooja Verma (29y/F)',
    complaint: 'Road traffic trauma, closed femoral fracture',
    severity: 'Emergency',
    hospital: 'Max Super Speciality Mohali',
    eta: '11 mins',
    ambulance: true,
  },
  {
    id: 'TR-8923',
    patient: 'Rameshwar Lal (64y/M)',
    complaint: 'Acute respiratory distress, SpO2 86%',
    severity: 'Moderate',
    hospital: 'GMCH Sector 32 Chandigarh',
    eta: '18 mins',
    ambulance: false,
  },
  {
    id: 'TR-8924',
    patient: 'Ananya Sharma (7y/F)',
    complaint: 'Pediatric febrile convulsion',
    severity: 'Emergency',
    hospital: 'Fortis Escorts Mohali',
    eta: '14 mins',
    ambulance: true,
  },
]

export const bookings = [
  {
    id: 'BK-10291',
    patient: 'Gurpreet Kaur',
    hospital: 'Max Super Speciality Mohali',
    type: 'Coronary Angioplasty (MC004)',
    amount: 95000,
    status: 'Confirmed',
    date: '2026-09-23',
  },
  {
    id: 'BK-10292',
    patient: 'Baldev Krishan',
    hospital: 'PGIMER Chandigarh',
    type: 'Coronary Bypass Graft (CABG)',
    amount: 45000,
    status: 'Confirmed',
    date: '2026-09-23',
  },
  {
    id: 'BK-10293',
    patient: 'Neelam Rani',
    hospital: 'Fortis Escorts Mohali',
    type: 'Total Knee Replacement (OR002)',
    amount: 118000,
    status: 'Pending',
    date: '2026-09-23',
  },
  {
    id: 'BK-10294',
    patient: 'Harjinder Singh',
    hospital: 'GMCH Sector 32 Chandigarh',
    type: 'Laparoscopic Cholecystectomy',
    amount: 22000,
    status: 'Completed',
    date: '2026-09-22',
  },
  {
    id: 'BK-10295',
    patient: 'Vandana Mittal',
    hospital: 'Alchemist Hospital Panchkula',
    type: 'Cesarean Delivery (LSCS)',
    amount: 42000,
    status: 'Confirmed',
    date: '2026-09-22',
  },
  {
    id: 'BK-10296',
    patient: 'Surinder Pal',
    hospital: 'Paras Hospital Panchkula',
    type: 'Renal Stone PCNL Laser',
    amount: 54000,
    status: 'Cancelled',
    date: '2026-09-21',
  },
]

export const claims = [
  {
    id: 'CLM-7482',
    patient: 'Gurpreet Kaur',
    hospital: 'Max Super Speciality Mohali',
    insurer: 'National Health Authority (AB-PMJAY)',
    submitted: '23 Sep 2026',
    amount: 65000,
    status: 'Disbursed',
  },
  {
    id: 'CLM-7483',
    patient: 'Harish Chander',
    hospital: 'PGIMER Chandigarh',
    insurer: 'Punjab State Health Agency',
    submitted: '23 Sep 2026',
    amount: 130000,
    status: 'Approved',
  },
  {
    id: 'CLM-7484',
    patient: 'Simranjeet Kaur',
    hospital: 'Fortis Escorts Mohali',
    insurer: 'Star Health & Allied Insurance',
    submitted: '22 Sep 2026',
    amount: 115000,
    status: 'Under Review',
  },
  {
    id: 'CLM-7485',
    patient: 'Rajinder Kumar',
    hospital: 'Alchemist Hospital Panchkula',
    insurer: 'HDFC ERGO General Insurance',
    submitted: '22 Sep 2026',
    amount: 48000,
    status: 'Approved',
  },
  {
    id: 'CLM-7486',
    patient: 'Manmohan Sahni',
    hospital: 'GMCH Sector 32',
    insurer: 'National Health Authority (AB-PMJAY)',
    submitted: '21 Sep 2026',
    amount: 28000,
    status: 'Disbursed',
  },
  {
    id: 'CLM-7487',
    patient: 'Sunita Dogra',
    hospital: 'Apollo Hospital Ludhiana',
    insurer: 'Care Health Insurance',
    submitted: '20 Sep 2026',
    amount: 82000,
    status: 'Rejected',
  },
]

export const users = [
  {
    id: 'USR-01',
    name: 'Dr. Arvind Saxena',
    email: 'arvind.saxena@pgimer.edu.in',
    role: 'Chief Medical Officer',
    city: 'Chandigarh',
    joined: 'Jan 2025',
    status: 'Active',
  },
  {
    id: 'USR-02',
    name: 'Dr. Shalini Nambiar',
    email: 'shalini.n@maxhealthcare.com',
    role: 'TPA Coordinator',
    city: 'Mohali',
    joined: 'Mar 2025',
    status: 'Active',
  },
  {
    id: 'USR-03',
    name: 'Harpreet Singh',
    email: 'harpreet.dispatch@moh.punjab.gov.in',
    role: 'Trauma Dispatcher',
    city: 'Mohali',
    joined: 'May 2025',
    status: 'Active',
  },
  {
    id: 'USR-04',
    name: 'Keshav Chaudhary',
    email: 'admin@medroute.in',
    role: 'Platform Superadmin',
    city: 'Chandigarh',
    joined: 'Nov 2024',
    status: 'Active',
  },
  {
    id: 'USR-05',
    name: 'Preeti Ganguly',
    email: 'preeti.g@fortishealthcare.com',
    role: 'ICU Telemetry Lead',
    city: 'Mohali',
    joined: 'Aug 2025',
    status: 'Active',
  },
]
