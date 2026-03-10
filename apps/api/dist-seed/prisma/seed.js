import { PrismaClient } from '../src/generated/prisma/client.js';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';
import 'dotenv/config';
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
    throw new Error('DATABASE_URL is not set');
}
const adapter = new PrismaPg({ connectionString: databaseUrl });
const prisma = new PrismaClient({ adapter });
async function main() {
    console.log('Seed starting...');
    // 1. Clear existing data (optional, but good for clean seeds)
    // Note: Order matters for deletion due to foreign keys
    await prisma.mapPinStatus.deleteMany({
        where: { id: { startsWith: 'seed-' } },
    });
    await prisma.evacuationArea.deleteMany({
        where: { id: { startsWith: 'seed-' } },
    });
    await prisma.riskRegionSnapshot.deleteMany({
        where: { id: { startsWith: 'seed-' } },
    });
    await prisma.account.deleteMany({
        where: { userId: { startsWith: 'seed-user-' } },
    });
    await prisma.user.deleteMany({ where: { id: { startsWith: 'seed-user-' } } });
    // Clear tracker data
    await prisma.trackerShipment.deleteMany({
        where: { id: { startsWith: 'seed-tracker-' } },
    });
    await prisma.trackerStats.deleteMany({
        where: { id: { startsWith: 'seed-tracker-' } },
    });
    await prisma.trackerReliefZone.deleteMany({
        where: { id: { startsWith: 'seed-tracker-' } },
    });
    await prisma.trackerValidator.deleteMany({
        where: { id: { startsWith: 'seed-tracker-' } },
    });
    const saltRounds = 10;
    const commonPassword = 'Password123!';
    const hashedPassword = await bcrypt.hash(commonPassword, saltRounds);
    // 2. Seed Users
    console.log('Seeding users...');
    // Admin User
    await prisma.user.upsert({
        where: { email: 'admin@wira-borneo.com' },
        update: {},
        create: {
            id: 'seed-user-admin',
            name: 'System Administrator',
            email: 'admin@wira-borneo.com',
            role: 'admin',
            emailVerified: true,
            accounts: {
                create: {
                    id: 'seed-acc-admin',
                    accountId: 'seed-acc-admin',
                    providerId: 'credential',
                    password: hashedPassword,
                },
            },
        },
    });
    // 3 regular users
    const users = [
        { id: 'seed-user-1', name: 'User One', email: 'user1@example.com' },
        { id: 'seed-user-2', name: 'User Two', email: 'user2@example.com' },
        { id: 'seed-user-3', name: 'User Three', email: 'user3@example.com' },
    ];
    for (const u of users) {
        await prisma.user.upsert({
            where: { email: u.email },
            update: {},
            create: {
                id: u.id,
                name: u.name,
                email: u.email,
                role: 'user',
                emailVerified: true,
                accounts: {
                    create: {
                        id: `acc-${u.id}`,
                        accountId: `acc-${u.id}`,
                        providerId: 'credential',
                        password: hashedPassword,
                    },
                },
            },
        });
    }
    // 3. Seed Disaster Response Data (porting from .sql)
    console.log('Seeding disaster response data...');
    await prisma.riskRegionSnapshot.upsert({
        where: { id: 'seed-risk-flood-1' },
        update: {},
        create: {
            id: 'seed-risk-flood-1',
            hazardType: 'FLOOD',
            severity: 'HIGH',
            name: 'Central River Flood Watch',
            latitude: 3.14,
            longitude: 113.04,
            radiusKm: 35.0,
            startsAt: new Date(),
            source: 'seed',
        },
    });
    await prisma.riskRegionSnapshot.upsert({
        where: { id: 'seed-risk-typhoon-1' },
        update: {},
        create: {
            id: 'seed-risk-typhoon-1',
            hazardType: 'TYPHOON',
            severity: 'MODERATE',
            name: 'Coastal Typhoon Exposure',
            latitude: 3.3,
            longitude: 113.3,
            radiusKm: 60.0,
            startsAt: new Date(),
            source: 'seed',
        },
    });
    await prisma.evacuationArea.upsert({
        where: { id: 'seed-evac-1' },
        update: {},
        create: {
            id: 'seed-evac-1',
            name: 'Community Hall A',
            latitude: 3.15,
            longitude: 113.05,
            address: 'Community Hall A',
            region: 'Kuching',
            isActive: true,
        },
    });
    await prisma.evacuationArea.upsert({
        where: { id: 'seed-evac-2' },
        update: {},
        create: {
            id: 'seed-evac-2',
            name: 'Public School B',
            latitude: 3.17,
            longitude: 113.08,
            address: 'Public School B',
            region: 'Kuching',
            isActive: true,
        },
    });
    await prisma.mapPinStatus.upsert({
        where: { id: 'seed-pin-1' },
        update: {},
        create: {
            id: 'seed-pin-1',
            title: 'Bridge access blocked',
            hazardType: 'FLOOD',
            status: 'OPEN',
            priority: 3,
            latitude: 3.16,
            longitude: 113.06,
            region: 'Kuching',
            note: 'Initial seeded operational pin',
        },
    });
    // 4. Seed Tracker Data
    console.log('Seeding tracker data...');
    // Tracker Stats
    await prisma.trackerStats.upsert({
        where: { id: 'seed-tracker-stats-1' },
        update: {},
        create: {
            id: 'seed-tracker-stats-1',
            totalAidDisbursed: 4281902,
            verifiedPayouts: 12840,
            networkTrustIndex: 99.98,
        },
    });
    // Tracker Relief Zones
    const reliefZones = [
        {
            id: 'seed-tracker-zone-1',
            name: 'Manila Relief Hub',
            lat: 14.5995,
            lng: 120.9842,
            familyCount: 842,
            status: 'ACTIVE',
            zoneType: 'evacuation',
        },
        {
            id: 'seed-tracker-zone-2',
            name: 'Bangkok Supply Center',
            lat: 13.7563,
            lng: 100.5018,
            familyCount: 620,
            status: 'ACTIVE',
            zoneType: 'supply',
        },
        {
            id: 'seed-tracker-zone-3',
            name: 'Jakarta Medical Station',
            lat: -6.2088,
            lng: 106.8456,
            familyCount: 1150,
            status: 'ACTIVE',
            zoneType: 'medical',
        },
        {
            id: 'seed-tracker-zone-4',
            name: 'Singapore Distribution Point',
            lat: 1.3521,
            lng: 103.8198,
            familyCount: 0,
            status: 'INACTIVE',
            zoneType: 'supply',
        },
    ];
    for (const zone of reliefZones) {
        await prisma.trackerReliefZone.upsert({
            where: { id: zone.id },
            update: {},
            create: zone,
        });
    }
    // Tracker Validators
    const validators = [
        {
            id: 'seed-tracker-val-1',
            nodeId: 'PH-Manila-01',
            location: 'Manila, Philippines',
            latencyMs: 42,
            uptimePercentage: 98.2,
            status: 'ONLINE',
        },
        {
            id: 'seed-tracker-val-2',
            nodeId: 'TH-Bangkok-14',
            location: 'Bangkok, Thailand',
            latencyMs: 38,
            uptimePercentage: 99.1,
            status: 'ONLINE',
        },
        {
            id: 'seed-tracker-val-3',
            nodeId: 'MY-KL-09',
            location: 'Kuala Lumpur, Malaysia',
            latencyMs: 156,
            uptimePercentage: 94.5,
            status: 'DEGRADED',
        },
        {
            id: 'seed-tracker-val-4',
            nodeId: 'SG-Central-03',
            location: 'Singapore',
            latencyMs: 28,
            uptimePercentage: 99.8,
            status: 'ONLINE',
        },
        {
            id: 'seed-tracker-val-5',
            nodeId: 'ID-Jakarta-07',
            location: 'Jakarta, Indonesia',
            latencyMs: 65,
            uptimePercentage: 97.3,
            status: 'ONLINE',
        },
        {
            id: 'seed-tracker-val-6',
            nodeId: 'VN-Hanoi-12',
            location: 'Hanoi, Vietnam',
            latencyMs: 88,
            uptimePercentage: 96.1,
            status: 'ONLINE',
        },
    ];
    for (const validator of validators) {
        await prisma.trackerValidator.upsert({
            where: { id: validator.id },
            update: {},
            create: validator,
        });
    }
    // Tracker Shipments
    const shipments = [
        {
            id: 'seed-tracker-ship-1',
            shipmentId: 'AR-8821',
            origin: 'JKT',
            destination: 'MNL',
            class: 'Medical Supplies',
            status: 'DISPATCHED',
            verificationStatus: 'VERIFIED',
            blockchainHash: '0x71c7f4e9a2f8d3b1c5e6a9f2d4b8c3e1a7f9d2b6',
            timestamp: new Date('2025-03-10T14:20:05Z'),
        },
        {
            id: 'seed-tracker-ship-2',
            shipmentId: 'AR-8790',
            origin: 'BKK',
            destination: 'HAN',
            class: 'Food Rations',
            status: 'DISPATCHED',
            verificationStatus: 'PENDING',
            blockchainHash: '0x44d8e2f1b9c7a5d3e8f2b6c1a9d4e7f3b8c2a6d1',
            timestamp: new Date('2025-03-10T15:05:41Z'),
        },
        {
            id: 'seed-tracker-ship-3',
            shipmentId: 'AR-8812',
            origin: 'SIN',
            destination: 'KUL',
            class: 'Shelter Kits',
            status: 'IN_TRANSIT',
            verificationStatus: 'VERIFIED',
            blockchainHash: '0x22a9f3b7d1e5c8a4f2b9d6e3c1a7f8b4d2e9c5a1',
            timestamp: new Date('2025-03-10T16:30:12Z'),
        },
        {
            id: 'seed-tracker-ship-4',
            shipmentId: 'AR-8805',
            origin: 'PNH',
            destination: 'VTE',
            class: 'Water Filters',
            status: 'DISPATCHED',
            verificationStatus: 'VERIFIED',
            blockchainHash: '0x99e4d7a2f8c1b6e3a9f5d2c8b4e1a7f3d9c6b2a5',
            timestamp: new Date('2025-03-10T17:12:00Z'),
        },
        {
            id: 'seed-tracker-ship-5',
            shipmentId: 'AR-8833',
            origin: 'MNL',
            destination: 'BKK',
            class: 'Emergency Kits',
            status: 'DELIVERED',
            verificationStatus: 'VERIFIED',
            blockchainHash: '0x55f2a8d3c9e1b7f4a6d2c8e5b1f9a3d7c4e8b6a2',
            timestamp: new Date('2025-03-09T10:45:22Z'),
        },
        {
            id: 'seed-tracker-ship-6',
            shipmentId: 'AR-8799',
            origin: 'HAN',
            destination: 'MNL',
            class: 'Medical Equipment',
            status: 'DELIVERED',
            verificationStatus: 'VERIFIED',
            blockchainHash: '0x77d9e4a1f6c2b8d5e3a9f7c4b2d8e6a1f3c9b5d7',
            timestamp: new Date('2025-03-08T08:20:15Z'),
        },
        {
            id: 'seed-tracker-ship-7',
            shipmentId: 'AR-8856',
            origin: 'KUL',
            destination: 'SIN',
            class: 'Hygiene Supplies',
            status: 'IN_TRANSIT',
            verificationStatus: 'VERIFIED',
            blockchainHash: '0x33c6f8a4d2e9b5c1a7f3d8e6b4a2f9c5d1e7a8b3',
            timestamp: new Date('2025-03-10T12:30:45Z'),
        },
        {
            id: 'seed-tracker-ship-8',
            shipmentId: 'AR-8841',
            origin: 'JKT',
            destination: 'BKK',
            class: 'Construction Materials',
            status: 'IN_TRANSIT',
            verificationStatus: 'PENDING',
            blockchainHash: null,
            timestamp: new Date('2025-03-10T18:15:30Z'),
        },
        {
            id: 'seed-tracker-ship-9',
            shipmentId: 'AR-8872',
            origin: 'SIN',
            destination: 'HAN',
            class: 'Solar Panels',
            status: 'DELIVERED',
            verificationStatus: 'VERIFIED',
            blockchainHash: '0x88e1a7f4c3b9d6e2a5f8c1d4b7e9a3f6c2d8b5a4',
            timestamp: new Date('2025-03-07T14:55:10Z'),
        },
    ];
    for (const shipment of shipments) {
        await prisma.trackerShipment.upsert({
            where: { id: shipment.id },
            update: {},
            create: shipment,
        });
    }
    console.log('Seed completed successfully.');
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
