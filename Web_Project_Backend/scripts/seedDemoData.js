/**
 * Seeds approved demo movies + optional demo user (subscribed) for local testing.
 * Run from backend folder: npm run seed
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Movie = require('../modules/movies/Movie');
const { User } = require('../modules/adminSellerUser/AdminSellerUser');

const SAMPLE_MP4 =
    'https://filesamples.com/samples/video/mp4/sample_640x360.mp4';

async function ensureDemoVideoFile() {
    const rel = path.join('uploads', 'seed-demo.mp4');
    const abs = path.join(__dirname, '..', rel);
    fs.mkdirSync(path.dirname(abs), { recursive: true });
    if (fs.existsSync(abs) && fs.statSync(abs).size > 50_000) {
        return rel.replace(/\\/g, '/');
    }
    process.stdout.write('Downloading sample video for playback…\n');
    const res = await fetch(SAMPLE_MP4);
    if (!res.ok) throw new Error(`Video download failed: ${res.status}`);
    const buf = Buffer.from(await res.arrayBuffer());
    fs.writeFileSync(abs, buf);
    return rel.replace(/\\/g, '/');
}

const DEMO_TITLES = [
    'Neon Horizon',
    'Steel Justice',
    'Laugh Track',
    'Midnight Runners',
    'Cosmic Drift',
    'The Last Stand',
    'Weekend Warriors',
    'Velvet Heist',
];

async function seedDemoUser() {
    const email = 'demo@movieweb.local';
    let user = await User.findOne({ email });
    if (user) return user;
    const hashed = await bcrypt.hash('demo1234', 10);
    user = await User.create({
        name: 'Demo User',
        email,
        password: hashed,
        isSubscribed: true,
    });
    process.stdout.write(`Created demo user: ${email} / demo1234\n`);
    return user;
}

async function main() {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
        console.error('Missing MONGODB_URI in .env');
        process.exit(1);
    }
    await mongoose.connect(uri);

    const filePath = await ensureDemoVideoFile();
    await seedDemoUser();

    const existingDemo = await Movie.countDocuments({ title: { $in: DEMO_TITLES } });
    if (existingDemo >= DEMO_TITLES.length && process.env.FORCE_SEED !== '1') {
        console.log('Demo movies already present. Set FORCE_SEED=1 to insert again.');
        await mongoose.disconnect();
        return;
    }
    if (process.env.FORCE_SEED === '1') {
        await Movie.deleteMany({ title: { $in: DEMO_TITLES } });
    }

    const posters = [
        'https://picsum.photos/seed/m1/400/600',
        'https://picsum.photos/seed/m2/400/600',
        'https://picsum.photos/seed/m3/400/600',
        'https://picsum.photos/seed/m4/400/600',
        'https://picsum.photos/seed/m5/400/600',
        'https://picsum.photos/seed/m6/400/600',
        'https://picsum.photos/seed/m7/400/600',
        'https://picsum.photos/seed/m8/400/600',
    ];

    const rows = DEMO_TITLES.map((title, i) => ({
        title,
        genre: i % 3 === 0 ? ['Action', 'Thriller'] : i % 3 === 1 ? ['Comedy', 'Family'] : ['Action', 'Comedy'],
        filePath,
        overview: 'Demo listing for local development.',
        popularity: 100 - i,
        averageRating: 4.2,
        photo: posters[i],
        isApproved: true,
        views: i * 10,
    }));

    await Movie.insertMany(rows);
    console.log(`Inserted ${rows.length} approved demo movies (video file: ${filePath}).`);
    await mongoose.disconnect();
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});
