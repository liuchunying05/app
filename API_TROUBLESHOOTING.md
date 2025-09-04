# 🔧 API问题诊断指南

## 🚨 当前问题
- **现象**：显示"AI智能对话"但回复不是智能的
- **原因**：API调用失败，自动切换到备用回复模式
- **API密钥**：已配置 `sk-f6fd4bfa13c24e25a37eb6584a64b3b9`

## 🔍 诊断步骤

### 步骤1：检查浏览器控制台
1. 打开小精灵页面
2. 按 `F12` 打开开发者工具
3. 切换到 `Console` 标签
4. 发送一条消息
5. 查看控制台输出

**正常输出应该包含：**
```
🤖 开始调用DeepSeek API...
用户消息: 你好
API配置: {url: "https://api.deepseek.com/v1/chat/completions", model: "deepseek-chat", key: "sk-f6fd4b..."}
📤 发送请求: {model: "deepseek-chat", messages: [...], max_tokens: 200, temperature: 0.7}
📡 收到响应: 200 OK
✅ API响应数据: {choices: [...], usage: {...}}
🎉 AI回复: 你好呀！我是你的小精灵助手...
```

**异常输出可能包含：**
```
❌ API错误响应: {"error": {"message": "Invalid API key"}}
💥 DeepSeek API调用失败: Error: API请求失败: 401 Unauthorized
```

### 步骤2：使用调试工具
1. 点击小精灵页面右上角的 🔧 按钮
2. 查看调试信息显示
3. 检查控制台输出的详细调试信息

### 步骤3：手动测试API
在浏览器控制台中运行：
```javascript
// 测试API连接
window.debugApi.testConnection().then(result => {
  console.log('测试结果:', result)
})

// 测试完整对话
window.debugApi.testFullConversation().then(result => {
  console.log('对话测试:', result)
})

// 查看API配置
window.debugApi.logApiConfig()
```

## 🛠️ 常见问题及解决方案

### 问题1：余额不足 (402 Payment Required)
**错误信息**：`"Insufficient Balance"` 或 `API请求失败: 402`
**原因**：DeepSeek账户余额不足，无法继续使用API服务
**解决方案**：
1. 访问 [DeepSeek平台](https://platform.deepseek.com/)
2. 登录你的账户
3. 进入"Billing"或"充值"页面
4. 选择合适的充值套餐
5. 完成支付后即可正常使用
**状态显示**：页面顶部会显示"余额不足"

### 问题2：401 Unauthorized
**错误信息**：`API请求失败: 401 Unauthorized`
**原因**：API密钥无效或已过期
**解决方案**：
1. 检查API密钥是否正确复制
2. 确认密钥是否已激活
3. 重新生成新的API密钥
4. 更新 `src/config/api.ts` 中的密钥

### 问题3：429 Too Many Requests
**错误信息**：`API请求失败: 429 Too Many Requests`
**原因**：请求频率过高或配额用完
**解决方案**：
1. 等待1-2分钟后重试
2. 检查DeepSeek账户配额使用情况
3. 升级账户获取更高配额

### 问题4：网络连接失败
**错误信息**：`连接错误: Failed to fetch`
**原因**：网络连接问题
**解决方案**：
1. 检查网络连接
2. 确认防火墙设置
3. 尝试使用VPN
4. 检查代理设置

### 问题5：CORS错误
**错误信息**：`CORS policy` 相关错误
**原因**：跨域请求被阻止
**解决方案**：
1. 确认API URL正确
2. 检查浏览器安全设置
3. 尝试使用不同的浏览器

### 问题6：API响应格式异常
**错误信息**：`API响应格式异常`
**原因**：API返回的数据格式不符合预期
**解决方案**：
1. 检查API版本是否正确
2. 确认请求参数格式
3. 查看API文档更新

## 🔧 修复步骤

### 如果API密钥无效：
1. 访问 [DeepSeek官网](https://platform.deepseek.com/)
2. 登录账户
3. 进入API管理页面
4. 生成新的API密钥
5. 更新 `src/config/api.ts` 文件：
```typescript
API_KEY: 'sk-your-new-api-key-here'
```

### 如果网络连接问题：
1. 检查网络连接
2. 尝试访问其他网站
3. 重启网络设备
4. 联系网络管理员

### 如果配额用完：
1. 登录DeepSeek账户
2. 查看使用情况
3. 升级账户或等待配额重置
4. 优化请求频率

## 📊 测试验证

### 成功标志：
- ✅ 控制台显示"🎉 AI回复"
- ✅ 收到个性化、智能的回复
- ✅ 状态显示"AI智能对话"
- ✅ 调试工具显示"API连接成功！可以正常使用AI对话功能。"

### 失败标志：
- ❌ 控制台显示错误信息
- ❌ 收到通用备用回复
- ❌ 状态显示"余额不足"、"API密钥无效"或"网络连接异常"
- ❌ 调试工具显示连接失败

## 🆘 获取帮助

如果问题仍然存在：
1. 查看控制台完整错误信息
2. 记录调试工具的输出
3. 检查网络连接状态
4. 联系技术支持

---

**💡 提示**：大多数问题都是API密钥配置或网络连接问题，按照上述步骤通常可以解决。

