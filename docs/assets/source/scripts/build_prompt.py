#!/usr/bin/env python3
"""从结构化设计参数生成标准化 AI 生图提示词（室内设计）。

用途：把方案文档中的设计参数转成可直接用于生图工具的中英文提示词。
风格关键词映射与 references/style-library.md 保持一致。
注意：风格与视角自动中译英；材质/灯光/氛围等未映射字段按原样透传，
如需纯英文提示词，请用英文填写 materials / lighting / mood 参数。

用法示例：
    python3 build_prompt.py --space "现代简约客厅" --area "25㎡" \
      --style "奶油风" --materials "浅灰微水泥地面、奶油白墙面、棉麻软装" \
      --lighting "无主灯+线性灯带，4000K中性光" --mood "温暖松弛" \
      --view "三点透视全景" --extras "大面积落地窗自然光，绿植点缀"

输出三段：中文提示词 / 英文提示词 / 负面提示词。
"""

import argparse

# 风格中→英映射（与 style-library.md 各风格提示词关键词一致）
STYLE_EN = {
    "现代简约": "modern minimalist",
    "奶油风": "cream style, milky beige tones",
    "意式极简": "Italian minimalist luxury",
    "轻奢": "light luxury with brass accents",
    "新中式": "new Chinese style, oriental minimalism",
    "日式原木": "Japanese light oak wood style",
    "侘寂": "wabi-sabi, textured plaster",
    "法式复古": "French retro, plaster moldings",
    "北欧": "Scandinavian, hygge",
}

# 视角中→英映射
VIEW_EN = {
    "三点透视": "three-point perspective",
    "平视": "eye-level view",
    "仰视": "low angle view",
    "俯视": "top-down view",
    "全景": "full view",
    "角落": "corner view",
}

NEGATIVE_BASE = (
    "low quality, blurry, distorted, deformed furniture, bad proportions, "
    "watermark, text, oversaturated, cluttered, low resolution, cartoon style"
)


def build_prompt(space, area, style, materials, lighting, mood, view, extras, negative_extra):
    """返回 (中文提示词, 英文提示词, 负面提示词)。"""
    style_en = STYLE_EN.get(style, style)
    view_en = VIEW_EN.get(view, view)

    cn = (
        f"{space}，{style}风格，{area}，{materials}，{lighting}，{mood}，"
        f"{view}视角，超写实室内效果图，高清渲染，细节丰富，无人空镜"
    )
    if extras:
        cn += f"，{extras}"

    en = (
        f"{space}, {style_en}, {area}, {materials}, {lighting}, {mood}, "
        f"{view_en} view, photorealistic interior render, highly detailed, no people"
    )
    if extras:
        en += f", {extras}"

    negative = NEGATIVE_BASE
    if negative_extra:
        negative += f", {negative_extra}"

    return cn, en, negative


def main():
    parser = argparse.ArgumentParser(
        description="生成室内设计 AI 生图提示词（中英文 + 负面词）"
    )
    parser.add_argument("--space", required=True, help="空间描述，如：现代简约客厅")
    parser.add_argument("--area", default="", help="面积，如：25㎡")
    parser.add_argument("--style", required=True, help="风格，如：奶油风（见 STYLE_EN 支持列表）")
    parser.add_argument("--materials", default="", help="材质清单，中英文均可")
    parser.add_argument("--lighting", default="", help="灯光描述，如：无主灯+灯带 4000K")
    parser.add_argument("--mood", default="", help="氛围词，如：温暖松弛")
    parser.add_argument("--view", default="三点透视全景", help="视角，如：三点透视全景")
    parser.add_argument("--extras", default="", help="附加细节词，如：落地窗自然光，绿植点缀")
    parser.add_argument("--negative", default="", help="额外的负面词，逗号分隔")
    args = parser.parse_args()

    cn, en, negative = build_prompt(
        args.space, args.area, args.style, args.materials,
        args.lighting, args.mood, args.view, args.extras, args.negative,
    )

    print("【中文提示词】")
    print(cn)
    print("\n【英文提示词】")
    print(en)
    print("\n【负面提示词】")
    print(negative)


if __name__ == "__main__":
    main()
