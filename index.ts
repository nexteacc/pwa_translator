import express, { Request, Response } from "express";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// 使用 JSON 中间件来解析请求体
app.use(express.json());

// 为根路径定义 GET 路由
app.get("/", (req: Request, res: Response) => {
  res.send("Server is running. Welcome to the API!");
});

app.post("/proxy", async (req: Request, res: Response) => {
  try {
    const apiUrl =
      "https://app.wordware.ai/api/released-app/34cfbf3c-f431-4012-8442-7bad11f6bc89/run";
    const apiKey = process.env.WORDWARE_API_KEY;

    // 获取请求体中的数据
    const data = req.body;

    // 使用 axios 转发请求
    const response = await axios.post(apiUrl, data, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
    });

    // 将 API 响应发送回客户端
    res.status(response.status).json(response.data);
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      // 处理 API 错误响应
      res.status(error.response.status).json(error.response.data);
    } else {
      // 处理其他错误
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
