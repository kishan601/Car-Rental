import bcrypt from "bcryptjs";

export interface MockUser {
  id: number;
  name: string;
  email: string;
  passwordHash: string;
  role: "customer" | "agency";
  agencyName?: string;
  phone?: string;
  createdAt: string;
}

export interface MockCar {
  id: number;
  vehicleModel: string;
  vehicleNumber: string;
  seatingCapacity: number;
  rentPerDay: number;
  agencyId: number;
  agencyName: string;
  available: boolean;
  createdAt: string;
}

export interface MockBooking {
  id: number;
  carId: number;
  customerId: number;
  startDate: string;
  numberOfDays: number;
  totalCost: number;
  createdAt: string;
}

const hash = (pw: string) => bcrypt.hashSync(pw, 10);

export const mockUsers: MockUser[] = [
  {
    id: 1,
    name: "DriveEasy Agency",
    email: "agency@driveeasy.com",
    passwordHash: hash("password123"),
    role: "agency",
    agencyName: "DriveEasy Rentals",
    phone: "9876543210",
    createdAt: new Date("2024-01-01").toISOString(),
  },
  {
    id: 2,
    name: "SpeedWheels Co.",
    email: "agency@speedwheels.com",
    passwordHash: hash("password123"),
    role: "agency",
    agencyName: "SpeedWheels Co.",
    phone: "9123456789",
    createdAt: new Date("2024-01-02").toISOString(),
  },
  {
    id: 3,
    name: "John Doe",
    email: "john@example.com",
    passwordHash: hash("password123"),
    role: "customer",
    phone: "9000000001",
    createdAt: new Date("2024-02-01").toISOString(),
  },
  {
    id: 4,
    name: "Jane Smith",
    email: "jane@example.com",
    passwordHash: hash("password123"),
    role: "customer",
    phone: "9000000002",
    createdAt: new Date("2024-02-10").toISOString(),
  },
];

export const mockCars: MockCar[] = [
  {
    id: 1,
    vehicleModel: "Toyota Camry",
    vehicleNumber: "MH01AB1234",
    seatingCapacity: 5,
    rentPerDay: 2500,
    agencyId: 1,
    agencyName: "DriveEasy Rentals",
    available: true,
    createdAt: new Date("2024-01-05").toISOString(),
  },
  {
    id: 2,
    vehicleModel: "Honda City",
    vehicleNumber: "MH02CD5678",
    seatingCapacity: 5,
    rentPerDay: 2000,
    agencyId: 1,
    agencyName: "DriveEasy Rentals",
    available: true,
    createdAt: new Date("2024-01-06").toISOString(),
  },
  {
    id: 3,
    vehicleModel: "Ford Endeavour",
    vehicleNumber: "MH03EF9012",
    seatingCapacity: 7,
    rentPerDay: 4500,
    agencyId: 1,
    agencyName: "DriveEasy Rentals",
    available: true,
    createdAt: new Date("2024-01-07").toISOString(),
  },
  {
    id: 4,
    vehicleModel: "Hyundai Creta",
    vehicleNumber: "MH04GH3456",
    seatingCapacity: 5,
    rentPerDay: 3000,
    agencyId: 2,
    agencyName: "SpeedWheels Co.",
    available: true,
    createdAt: new Date("2024-01-08").toISOString(),
  },
  {
    id: 5,
    vehicleModel: "Maruti Swift",
    vehicleNumber: "MH05IJ7890",
    seatingCapacity: 5,
    rentPerDay: 1500,
    agencyId: 2,
    agencyName: "SpeedWheels Co.",
    available: true,
    createdAt: new Date("2024-01-09").toISOString(),
  },
  {
    id: 6,
    vehicleModel: "Toyota Innova",
    vehicleNumber: "MH06KL2345",
    seatingCapacity: 8,
    rentPerDay: 5000,
    agencyId: 2,
    agencyName: "SpeedWheels Co.",
    available: true,
    createdAt: new Date("2024-01-10").toISOString(),
  },
];

export const mockBookings: MockBooking[] = [
  {
    id: 1,
    carId: 1,
    customerId: 3,
    startDate: "2024-03-01",
    numberOfDays: 3,
    totalCost: 7500,
    createdAt: new Date("2024-02-28").toISOString(),
  },
  {
    id: 2,
    carId: 2,
    customerId: 4,
    startDate: "2024-03-05",
    numberOfDays: 5,
    totalCost: 10000,
    createdAt: new Date("2024-03-01").toISOString(),
  },
  {
    id: 3,
    carId: 4,
    customerId: 3,
    startDate: "2024-03-10",
    numberOfDays: 2,
    totalCost: 6000,
    createdAt: new Date("2024-03-05").toISOString(),
  },
];

let nextUserId = 5;
let nextCarId = 7;
let nextBookingId = 4;

export function getNextUserId() { return nextUserId++; }
export function getNextCarId() { return nextCarId++; }
export function getNextBookingId() { return nextBookingId++; }
