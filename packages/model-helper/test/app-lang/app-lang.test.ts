import { resolveAppLangKey } from '../../src/utils/app-lang/app-lang';
import { describe, test, expect } from 'vitest';

describe('应用多语言键解析', () => {
    test('带地区后缀的语言回退到模型声明的裸语言码', () => {
        // 浏览器 en-US 归一化成 EN_US，而模型里只有 EN
        expect(resolveAppLangKey('EN_US', ['ZH_CN', 'EN'])).toBe('EN');
    })

    test('精确键优先，本身带下划线的键原样命中', () => {
        expect(resolveAppLangKey('ZH_CN', ['ZH_CN', 'EN'])).toBe('ZH_CN');
    })

    test('同时接受带连字符的原始语言标识', () => {
        expect(resolveAppLangKey('en-US', ['ZH_CN', 'EN'])).toBe('EN');
        expect(resolveAppLangKey('zh-CN', ['ZH_CN', 'EN'])).toBe('ZH_CN');
    })

    test('未声明的语言不回退，避免把繁体误配到简体', () => {
        // ZH 不是模型键，所以 zh-TW 仍然按未支持上报，而不是套用 zh-CN
        expect(resolveAppLangKey('ZH_TW', ['ZH_CN', 'EN'])).toBeUndefined();
        expect(resolveAppLangKey('FR_FR', ['ZH_CN', 'EN'])).toBeUndefined();
    })

    test('没有可用语言时返回未命中', () => {
        expect(resolveAppLangKey('EN_US', [])).toBeUndefined();
    })
})
