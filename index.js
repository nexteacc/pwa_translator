"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const axios_1 = __importDefault(require("axios"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
// 使用 JSON 中间件来解析请求体
app.use(express_1.default.json());
// 为根路径定义 GET 路由
app.get("/", (req, res) => {
    res.send("Server is running. Welcome to the API!");
});
app.post("/proxy", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const apiUrl = "https://app.wordware.ai/api/released-app/34cfbf3c-f431-4012-8442-7bad11f6bc89/run";
        const apiKey = process.env.WORDWARE_API_KEY;
        // 获取请求体中的数据
        const data = req.body;
        // 使用 axios 转发请求
        const response = yield axios_1.default.post(apiUrl, data, {
            headers: {
                Authorization: `Bearer ${apiKey}`,
                "Content-Type": "application/json",
            },
        });
        // 将 API 响应发送回客户端
        res.status(response.status).json(response.data);
    }
    catch (error) {
        if (axios_1.default.isAxiosError(error) && error.response) {
            // 处理 API 错误响应
            res.status(error.response.status).json(error.response.data);
        }
        else {
            // 处理其他错误
            res.status(500).json({ message: "Internal Server Error" });
        }
    }
}));
// 启动服务器
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
