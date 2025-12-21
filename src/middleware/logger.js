import morgan from 'morgan';

// Custom logger format
const loggerFormat = ':method :url :status :response-time ms - :res[content-length]';

export const setupLogger = (app) => {
    if (process.env.NODE_ENV === 'development') {
        app.use(morgan('dev')); // calls next() internally
    } else if (process.env.NODE_ENV === 'production') {
        app.use(morgan('combined')); // calls next() internally
    } else {
        app.use(morgan(loggerFormat));
    }
};
