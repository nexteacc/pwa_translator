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

// 自定义函数来格式化数据块
function formatChunk(chunk: Buffer): string {
  try {
    const jsonData = JSON.parse(chunk.toString());

    // 提取所需的部分
    if (jsonData.type === "prompt" || jsonData.type === "chunk") {
      const outputData = jsonData.output || jsonData.value;

      if (outputData) {
        if (outputData.result) {
          return JSON.stringify({ result: outputData.result });
        }
        if (outputData.values) {
          return JSON.stringify({ values: outputData.values });
        }
      }
    }

    return JSON.stringify({});
  } catch (error) {
    console.error("Failed to parse chunk", error);
    return JSON.stringify({});
  }
}

// 启动服务器
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
