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

    // 使用 axios 发起请求并获取响应流
    const response = await axios.post(apiUrl, data, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      responseType: "stream", // 指定响应类型为流
    });

    // 设置响应头
    res.setHeader("Content-Type", "application/json");

    // 逐块读取数据并发送到客户端
    response.data.on("data", (chunk: Buffer) => {
      const formattedChunk = formatChunk(chunk);
      res.write(formattedChunk);
    });

    // 在流结束时关闭响应
    response.data.on("end", () => {
      res.end();
    });
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

// 自定义函数来格式化数据块
function formatChunk(chunk: Buffer): string {
  // 解析 JSON 数据块，做一些格式化操作
  const jsonData = JSON.parse(chunk.toString());

  // 假设我们对数据进行一些处理
  // 这里可以根据需要进行更复杂的处理
  return JSON.stringify(jsonData);
}
