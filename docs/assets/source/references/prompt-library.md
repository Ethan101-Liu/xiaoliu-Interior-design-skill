# AI 生图提示词规范（室内设计）

用途：阶段 3 生成效果图、阶段 4 改图时，按本文件规范组装提示词。标准提示词可直接用 `scripts/build_prompt.py` 生成，本文件提供模板结构、词库与注意事项。

## 提示词结构模板

标准室内效果图提示词 = **空间 + 风格 + 尺寸/视角 + 材质 + 灯光 + 氛围 + 质量词**

中文示例：

```
现代简约客厅，25㎡，奶油白墙面与浅灰微水泥地面，模块布艺沙发配黑胡桃木茶几，
无主灯设计（筒灯+线性灯带，4000K），大面积落地窗自然光，绿植点缀，温暖松弛氛围，
三点透视全景视角，超写实室内效果图，8K 高清渲染，细节丰富，无人空镜
```

英文示例（AI 生图工具对英文理解更稳定，建议中英都给出）：

```
modern minimalist living room, 25 sqm, cream white walls with light grey microcement floor,
modular fabric sofa and walnut coffee table, recessed lighting with linear LED strips 4000K,
floor-to-ceiling window natural light, greenery accents, warm relaxed mood,
three-point perspective full view, photorealistic interior render, 8K, highly detailed, no people
```

## 场景词库（空间 + 视角）

- 空间：living room 客厅 / bedroom 卧室 / kitchen 厨房 / dining room 餐厅 / study 书房 / bathroom 卫生间 / walk-in closet 衣帽间 / wardrobe 全屋定制柜 / balcony 阳台
- 视角：three-point perspective 三点透视 / eye-level view 平视 / low angle 仰视 / top-down plan view 俯视平面 / corner view 角落视角 / full view 全景
- 画幅建议：客厅/主空间横图（16:9、3:2），全屋效果 4:3，展示柜/柜体特写 1:1，小红书/手机端 4:5 或 9:16

## 材质与灯光描述词

- 地面：microcement 微水泥 / oak wood flooring 橡木地板 / large-format tiles 大板砖 / terrazzo 水磨石
- 墙面：plaster 艺术漆 / wood veneer 木饰面 / wallpaper 壁纸 / fluted panel 格栅板 / stone 石材（克制使用）
- 柜体：handleless flat panel 无把手平板门 / fluted oak 格栅橡木 / lacquered 烤漆 / open shelving 开放格
- 灯光：recessed lighting 无主灯 / track lighting 轨道灯 / cove lighting 灯带 / pendant lamp 吊灯 / warm 3000K 暖光 / neutral 4000K 中性光

## 负面提示词（默认）

```
low quality, blurry, distorted, deformed furniture, bad proportions, watermark, text,
oversaturated, cluttered, low resolution, cartoon style
```

## 改图提示词注意事项

1. **局部编辑**：不重复描述原图已有特征，只描述要改的部分（"把茶几换成圆形大理石面""去掉背景墙的金属线条"）
2. **风格转换**：给出目标风格关键词（见 style-library.md），说明保留内容（"保留空间结构与家具位置，整体改为奶油风配色与材质"）
3. **比例**：局部编辑/元素替换/颜色调整/画风转换/画质增强必须保持原图比例
4. **一次一个维度**：多维度同时修改（如同时换风格和换布局）效果不稳定，先确认优先级

## 质量词组合建议

- 基础：`photorealistic render, 4K, highly detailed`
- 进阶：`architectural visualization, cinematic lighting, 8K, ultra sharp, no people`
- 极简空间慎用"luxury marble"等堆砌词，保持材质克制
