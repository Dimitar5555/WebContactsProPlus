import fs from'fs';
import { expect, test } from 'vitest';

test('i18n locales', () => {
    function getKeys(obj: any, prefix = ''): Set<string> {
        let keys = new Set<string>();
        for(const key of Object.keys(obj)) {
            const fullKey = prefix ? `${prefix}.${key}` : key;
            if(typeof obj[key] === 'object' && obj[key] !== null) {
                const nestedKeys = getKeys(obj[key], fullKey);
                console.log(`Nested keys for ${fullKey}:`, nestedKeys);
                for(const nestedKey of nestedKeys) {
                    keys.add(nestedKey);
                }
            }
            else {
                keys.add(fullKey);
            }
        }
        return keys;
    }

    const locales = fs
        .readdirSync('src/locales')
        .filter(file => file.endsWith('.json'))
        .map(file => file.replace('.json', ''));
    const keys = new Map<string, Set<string>>();

    for(const locale of locales) {
        const content = fs.readFileSync(`src/locales/${locale}.json`, 'utf-8');
        const json = JSON.parse(content);
        const locale_keys = getKeys(json);
        keys.set(locale, locale_keys);
        console.log(`Locale ${locale} has ${locale_keys.size} keys.`);
    }
    const reference_locale = locales[0];
    const reference_keys: Set<string> =
        keys.get(reference_locale) || new Set<string>();
    for(let i = 1; i < locales.length; i++) {
        const locale = locales[i];
        const current_keys: Set<string> = keys.get(locale) || new Set<string>();

        const diffrence = reference_keys.symmetricDifference(current_keys);
        if(diffrence.size > 0) {
            console.error(
                `Locale ${locale} has different keys than ${reference_locale}:`,
                diffrence
            );
        }
        expect(diffrence.size).toBe(0);
    }
});
