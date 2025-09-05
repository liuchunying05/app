# 🔑 DeepSeek API 配置指南

## 📋 配置步骤

### 1. 获取API密钥
1. 访问 [DeepSeek官网](https://platform.deepseek.com/)
2. 注册并登录账户
3. 进入"API Keys"页面
4. 点击"Create new secret key"
5. 复制生成的API密钥（以`sk-`开头）

### 2. 配置API密钥
编辑 `src/config/api.ts` 文件：
```typescript
export const API_CONFIG = {
  DEEPSEEK: {
    URL: 'https://api.deepseek.com/v1/chat/completions',
    API_KEY: 'sk-your-actual-deepseek-api-key-here', // 替换为你的真实密钥
    MODEL: 'deepseek-chat',
    MAX_TOKENS: 200,
    TEMPERATURE: 0.7
  }
}
```

### 3. 环境变量配置（推荐）
创建 `.env` 文件：
```bash
REACT_APP_DEEPSEEK_API_KEY=sk-your-actual-deepseek-api-key-here
```

然后更新 `src/config/api.ts`：
```typescript
API_KEY: process.env.REACT_APP_DEEPSEEK_API_KEY || 'sk-1234567890abcdef'
```

## 🚨 常见问题

### 问题1：余额不足 (402 Payment Required)
**错误信息**: `"Insufficient Balance"`
**解决方案**:
1. 登录 [DeepSeek平台](https://platform.deepseek.com/)
2. 进入"Billing"页面
3. 选择合适的充值套餐
4. 完成支付后即可正常使用

### 问题2：API密钥无效 (401 Unauthorized)
**错误信息**: `"Invalid API key"`
**解决方案**:
1. 检查API密钥是否正确复制
2. 确认密钥是否已激活
3. 重新生成新的API密钥

### 问题3：请求频率过高 (429 Too Many Requests)
**错误信息**: `"Too Many Requests"`
**解决方案**:
1. 等待1-2分钟后重试
2. 检查账户配额使用情况
3. 升级账户获取更高配额

## 💰 费用说明

- **免费额度**: 新用户通常有免费试用额度
- **付费标准**: 按使用量计费，具体价格请查看官网
- **充值方式**: 支持多种支付方式

## 🔧 测试验证

配置完成后，使用调试工具测试：
1. 打开小精灵页面
2. 点击右上角的 🔧 按钮
3. 查看测试结果

## 📱 安全提醒

- 不要将API密钥提交到公共代码仓库
- 使用环境变量或配置文件管理密钥
- 定期更换API密钥
- 监控API使用量和费用

---

**💡 提示**: 如果遇到余额不足问题，充值后即可正常使用AI对话功能！

