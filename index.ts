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

// 自定义函数来提取 result 字段
function formatChunk(chunk: Buffer): { result?: string } {
  try {
    const jsonData = JSON.parse(chunk.toString());

    // 检查是否存在 'outputs' 类型的块
    if (jsonData.type === "chunk" && jsonData.value.type === "outputs") {
      const outputs = jsonData.value.values;
      if (outputs && outputs.result) {
        return { result: outputs.result };
      }
    }

    return {};
  } catch (error) {
    console.error("解析块失败", error);
    return {};
  }
}

// 为 /proxy 定义 POST 路由
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

    // 设置响应头，使用分块传输编码
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Transfer-Encoding", "chunked");

    // 监听数据块
    response.data.on("data", (chunk: Buffer) => {
      const parsed = formatChunk(chunk);
      if (parsed.result) {
        // 将 result 作为 JSON 格式发送给客户端
        res.write(JSON.stringify({ result: parsed.result }) + "\n");
      }
    });

    // 在流结束时关闭响应
    response.data.on("end", () => {
      res.end();
    });

    // 处理流错误
    response.data.on("error", (err: any) => {
      console.error("流错误:", err);
      res.status(500).json({ message: "流处理错误" });
    });
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      // 处理 API 错误响应
      res.status(error.response.status).json(error.response.data);
    } else {
      // 处理其他错误
      res.status(500).json({ message: "内部服务器错误" });
    }
  }
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
