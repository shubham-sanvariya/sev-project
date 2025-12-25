import mongoose from 'mongoose';

class Database {
    constructor() {
        this.connection = null;
    }

    async connect() {
        if (this.connection) return this.connection;

        try {
            this.connection = await mongoose.connect(process.env.DB_URL, {
                maxPoolSize: 10, // Connection pooling
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
