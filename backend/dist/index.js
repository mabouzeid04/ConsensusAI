"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const morgan_1 = __importDefault(require("morgan"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const passport_1 = __importDefault(require("passport"));
const prompt_1 = require("./routes/prompt");
const history_1 = require("./routes/history");
const auth_1 = require("./routes/auth");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// Middleware
const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:3000';
app.use((0, cors_1.default)({ origin: corsOrigin, credentials: true }));
app.use(express_1.default.json());
app.use((0, morgan_1.default)('dev'));
app.use((0, cookie_parser_1.default)());
app.use(passport_1.default.initialize());
(0, auth_1.configureGoogleStrategy)();
// Routes
app.use('/api/prompt', prompt_1.promptRouter);
app.use('/api/history', history_1.historyRouter);
app.use('/api/auth', auth_1.authRouter);
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
