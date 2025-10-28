# 贡献指南

感谢您对 GoldMonitor 项目的关注！我们欢迎所有形式的贡献。

## 如何贡献

### 报告 Bug

如果您发现了 bug，请创建一个 issue，包含以下信息：

- Bug 的详细描述
- 重现步骤
- 期望行为
- 实际行为
- 系统环境（操作系统、Python/Node.js 版本等）
- 相关日志或截图

### 提出新功能

如果您有新功能的想法，请创建一个 issue，说明：

- 功能的详细描述
- 使用场景
- 期望的实现方式
- 可能的替代方案

### 提交代码

#### 1. Fork 仓库

点击页面右上角的 "Fork" 按钮，将仓库 fork 到您的账号下。

#### 2. 克隆仓库

```bash
git clone https://github.com/your-username/goldmonitor.git
cd goldmonitor
```

#### 3. 创建分支

```bash
git checkout -b feature/your-feature-name
# 或
git checkout -b fix/your-bug-fix
```

分支命名规范：
- `feature/` - 新功能
- `fix/` - Bug 修复
- `docs/` - 文档更新
- `refactor/` - 代码重构
- `test/` - 测试相关

#### 4. 设置开发环境

```bash
# Python 项目
python -m venv venv
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate     # Windows
pip install -r requirements.txt
pip install -r requirements-dev.txt  # 开发依赖

# Node.js 项目
npm install
```

#### 5. 进行修改

- 遵循项目的代码风格
- 添加必要的测试
- 更新相关文档
- 确保所有测试通过

#### 6. 运行测试

```bash
# Python 项目
pytest tests/ -v --cov=app

# Node.js 项目
npm test

# 代码格式检查
black app/  # Python
flake8 app/

eslint src/  # JavaScript
```

#### 7. 提交更改

```bash
git add .
git commit -m "feat: add your feature description"
```

提交信息格式（遵循 Conventional Commits）：
- `feat:` - 新功能
- `fix:` - Bug 修复
- `docs:` - 文档更新
- `style:` - 代码格式调整
- `refactor:` - 代码重构
- `test:` - 测试相关
- `chore:` - 构建或辅助工具的变动

#### 8. 推送到 GitHub

```bash
git push origin feature/your-feature-name
```

#### 9. 创建 Pull Request

1. 在 GitHub 上打开您 fork 的仓库
2. 点击 "Pull Request" 按钮
3. 填写 PR 标题和描述
4. 确保勾选了 "Allow edits from maintainers"
5. 提交 PR

### Pull Request 指南

PR 描述应包含：

```markdown
## 变更类型
- [ ] Bug 修复
- [ ] 新功能
- [ ] 文档更新
- [ ] 性能优化
- [ ] 重构
- [ ] 其他

## 变更说明
简要描述您的更改...

## 相关 Issue
Closes #123

## 测试
- [ ] 添加了新的测试用例
- [ ] 所有测试通过
- [ ] 手动测试通过

## 检查清单
- [ ] 代码遵循项目风格指南
- [ ] 进行了自我代码审查
- [ ] 添加了必要的注释
- [ ] 更新了相关文档
- [ ] 没有引入新的警告
- [ ] 添加了测试且都通过
```

## 代码规范

### Python 代码规范

遵循 PEP 8 规范：

```python
# 好的例子
def fetch_gold_price(source: str, retry_count: int = 3) -> dict:
    """
    从指定数据源获取金价。
    
    Args:
        source: 数据源名称
        retry_count: 重试次数
        
    Returns:
        包含价格信息的字典
    """
    try:
        response = requests.get(source_url, timeout=30)
        return parse_response(response)
    except RequestException as e:
        logger.error(f"Failed to fetch price from {source}: {e}")
        raise
```

- 使用 4 个空格缩进
- 函数名使用小写加下划线
- 类名使用驼峰命名
- 添加类型提示
- 编写清晰的文档字符串

### JavaScript 代码规范

遵循 Airbnb JavaScript Style Guide：

```javascript
// 好的例子
async function fetchGoldPrice(source, retryCount = 3) {
  /**
   * 从指定数据源获取金价
   * @param {string} source - 数据源名称
   * @param {number} retryCount - 重试次数
   * @returns {Promise<Object>} 价格信息对象
   */
  try {
    const response = await axios.get(sourceUrl, { timeout: 30000 });
    return parseResponse(response);
  } catch (error) {
    logger.error(`Failed to fetch price from ${source}:`, error);
    throw error;
  }
}
```

- 使用 2 个空格缩进
- 使用 const 和 let，避免 var
- 使用 async/await 而不是回调
- 添加 JSDoc 注释

### 提交信息规范

```
<type>(<scope>): <subject>

<body>

<footer>
```

示例：
```
feat(scraper): add support for new gold price source

- Add KitcoScraper class
- Implement data parsing logic
- Add unit tests

Closes #42
```

类型：
- `feat`: 新功能
- `fix`: Bug 修复
- `docs`: 文档
- `style`: 格式
- `refactor`: 重构
- `perf`: 性能优化
- `test`: 测试
- `chore`: 构建/工具

## 测试指南

### 编写测试

```python
# Python 示例
import pytest
from app.services.scraper import KitcoScraper

class TestKitcoScraper:
    def setup_method(self):
        self.scraper = KitcoScraper()
    
    def test_fetch_success(self):
        """测试成功获取数据"""
        result = self.scraper.fetch()
        assert result is not None
        assert 'price' in result
        assert result['price'] > 0
    
    def test_parse_data(self):
        """测试数据解析"""
        raw_data = '<div class="price">2050.50</div>'
        parsed = self.scraper.parse(raw_data)
        assert parsed['price'] == 2050.50
        assert parsed['currency'] == 'USD'
```

```javascript
// JavaScript 示例
const { expect } = require('chai');
const KitcoScraper = require('../src/scrapers/kitco');

describe('KitcoScraper', () => {
  let scraper;
  
  beforeEach(() => {
    scraper = new KitcoScraper();
  });
  
  it('should fetch data successfully', async () => {
    const result = await scraper.fetch();
    expect(result).to.not.be.null;
    expect(result).to.have.property('price');
    expect(result.price).to.be.above(0);
  });
  
  it('should parse data correctly', () => {
    const rawData = '<div class="price">2050.50</div>';
    const parsed = scraper.parse(rawData);
    expect(parsed.price).to.equal(2050.50);
    expect(parsed.currency).to.equal('USD');
  });
});
```

### 运行测试

```bash
# Python - 运行所有测试
pytest tests/

# Python - 运行特定测试文件
pytest tests/test_scraper.py

# Python - 运行特定测试
pytest tests/test_scraper.py::TestKitcoScraper::test_fetch_success

# Python - 查看覆盖率
pytest tests/ --cov=app --cov-report=html

# JavaScript - 运行所有测试
npm test

# JavaScript - 运行特定测试
npm test -- --grep "KitcoScraper"

# JavaScript - 查看覆盖率
npm run test:coverage
```

## 文档规范

### 代码注释

- 为复杂逻辑添加注释
- 注释说明"为什么"而不是"做什么"
- 保持注释与代码同步

### API 文档

更新 API 文档时，确保包含：
- 接口路径和方法
- 请求参数
- 响应格式
- 使用示例
- 错误码说明

### README 更新

如果您的更改影响：
- 安装步骤
- 配置方式
- 使用方法
- 依赖项

请同步更新 README.md。

## 代码审查

### 审查清单

提交 PR 前，请自我审查：

- [ ] 代码遵循项目风格
- [ ] 没有明显的 bug
- [ ] 变量和函数命名清晰
- [ ] 没有重复代码
- [ ] 没有硬编码的值（应使用配置）
- [ ] 错误处理完善
- [ ] 添加了必要的日志
- [ ] 性能考虑得当
- [ ] 安全性考虑（如输入验证）
- [ ] 测试覆盖充分

### 响应审查意见

- 认真对待审查意见
- 及时回复和修改
- 如有不同意见，礼貌地讨论
- 标记已解决的问题

## 发布流程

维护者负责版本发布：

1. 更新版本号（遵循语义化版本）
2. 更新 CHANGELOG.md
3. 创建 Git tag
4. 发布到 PyPI / npm（如适用）
5. 创建 GitHub Release

## 社区准则

### 行为规范

- 尊重他人
- 包容不同观点
- 接受建设性批评
- 关注对社区最有利的事情
- 对其他社区成员表示同理心

### 沟通方式

- 使用清晰、专业的语言
- 提供详细的信息和上下文
- 及时响应
- 保持耐心和友好

## 获得帮助

如有问题，可以通过以下方式获得帮助：

- 查看现有文档
- 搜索已有的 issues
- 在 Discussions 中提问
- 创建新的 issue

## 许可证

通过贡献，您同意您的贡献将在 MIT 许可证下授权。

---

再次感谢您的贡献！每一个贡献都让 GoldMonitor 变得更好。
