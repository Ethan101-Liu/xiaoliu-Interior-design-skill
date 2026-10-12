# SketchUp / 3ds Max / Blender 室内建模要点

用途：用户指定 SketchUp、3ds Max 或 Blender 建模时，按软件输出分步指令。统一原则：先建墙体骨架 → 门窗洞口 → 硬装 → 家具 → 材质 → 灯光 → 渲染。

## 通用建模流程（三软件一致）

1. 设定单位：毫米（mm）为工作单位，确保与 CAD 图纸一致
2. 导入平面图：CAD 底图/图片放样作为描线依据
3. 建墙体：按轴线放样墙体轮廓，开窗洞门洞
4. 硬装：吊顶、地面、踢脚线
5. 家具：先做高频标准件（餐桌、沙发、柜体），复杂件用模型库
6. 材质与灯光：统一材质命名，布光后再渲染

## SketchUp（草图大师）

- 建模：`Rectangle` 描墙 → `Push/Pull`（快捷键 P）挤出墙高 → 布尔运算开洞（安装插件 BoolTools / 用组减组）
- 组件化：家具做成 Component（如柜门用 Dynamic Component 可调尺寸），便于阵列与修改
- 材质：`Materials` 面板赋予，贴图需 1:1 无缝；纹理旋转用右键 `Texture > Position`
- 灯光渲染：搭配 Enscape 或 V-Ray
  - Enscape：一键实时渲染，布光用「人造光源」拖入筒灯/灯带，调节色温亮度
  - V-Ray：矩形灯 + IES 射灯，曝光用物理相机
- 快捷键要点：`P` 推拉 / `M` 移动 / `G` 成组 / `S` 缩放 / `E` 橡皮擦 / `B` 材质

## 3ds Max

- 建模：`Line` 描墙 → `Extrude`（挤出）墙高；窗洞用 `Boolean`（ProBoolean）减出；地面用 `Plane`
- 精细模型：`Editable Poly` 多边形建模（衣柜用 box 分面挤出柜门、把手）
- 材质：`Slate Material Editor` → PBR 流程：Base Color / Roughness / Metallic；木饰面贴图接缝用 `UVW Map`
- 灯光：V-Ray 或 Corona
  - V-Ray：VRaySun + VRaySky 打底，室内补 VRayLight（窗口面光）+ 射灯用 IES
  - Corona：CoronaSun + LightMix，实时调光
- 渲染：帧缓冲渲染 → 出图分辨率 ≥2K；先用小图（640×480）测光再出大图
- 快捷键：`W` 移动 / `E` 旋转 / `R` 缩放 / `Alt+W` 最大化视口 / `M` 材质编辑器

## Blender

- 建模：`Shift+A > Mesh > Cube` 放样墙体 → `Edit Mode`（Tab）`E` 挤出 → 窗洞用 `Boolean` 修改器
- 基础形状：`Bevel`（Ctrl+B）做圆角柜门；`Array` 修改器阵列格栅/筒灯
- 材质：`Shading` 工作区 → Principled BSDF：Base Color / Roughness；贴图用 `Image Texture` 节点
- 灯光：`Shift+A > Light` → Point（筒灯）/ Area（窗光）→ 色温与功率（W）
- 渲染：Cycles（写实，采样 ≥256）或 Eevee（实时预览）；输出分辨率在 Output Properties 设置
- 快捷键：`G` 移动 / `R` 旋转 / `S` 缩放 / `E` 挤出 / `Ctrl+B` 倒角 / `F9` 调上次操作参数

## 改图/修改模型指令

| 改什么 | 操作 |
|---|---|
| 改墙体尺寸 | 选中墙线 → 移动端点（SketchUp 直接拖；Max/Blender 进点层级） |
| 替换家具模型 | 删除原组件 → 从模型库导入新组件，对齐地面 |
| 改材质 | 选中面/物体 → 材质编辑器替换贴图或改颜色 |
| 缩放柜体 | 若组件带参数（SU Dynamic Component）改参数；否则整体缩放后复核门缝比例 |
| 灯光调整 | 选中光源 → 改色温/亮度；Max/Blender 注意亮度单位（流明/瓦特） |

## 输出规则

给用户的指令必须：写明软件内菜单位置/快捷键/修改器名称、关键参数（墙厚、挤出高度、渲染采样、分辨率）、可校验结果（模型尺寸与图纸一致、渲染无死黑）。
