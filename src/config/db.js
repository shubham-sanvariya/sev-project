import mongoose from 'mongoose';

class Database {
    constructor() {
        this.connection = null;
    }

    async connect() {
        if (this.connection) return this.connection;

        try {
            this.connection = await mongoose.connect(process.env.DB_URL, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
                maxPoolSize: 10, // Connection pooling
                bufferMaxEntries: 0
            });

            console.log('🟢 Database connected successfully');
            return this.connection;
        } catch (error) {
            console.error('🔴 Database connection failed:', error);
            process.exit(1);
        }
    }

    async disconnect() {
        if (this.connection) {
            await mongoose.disconnect();
            this.connection = null;
        }
    }
}

export default new Database();
