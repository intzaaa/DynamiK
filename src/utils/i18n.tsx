import { effect, signal } from "@preact/signals";
import { JSX } from "preact";

// https://stackoverflow.com/questions/58434389/typescript-deep-keyof-of-a-nested-object/58436959
type i18nObject = Record<string, string | JSX.Element>;

export type Paths<T> = T extends i18nObject
  ? {
      [K in keyof T]: `${Exclude<K, symbol>}${"" | `.${Paths<T[K]>}`}`;
    }[keyof T]
  : never;

export type Leaves<T> = T extends i18nObject
  ? {
      [K in keyof T]: `${Exclude<K, symbol>}${Leaves<T[K]> extends never ? "" : `.${Leaves<T[K]>}`}`;
    }[keyof T]
  : never;

const deep_value = <T extends object>(o: T, path: string) => path.split(".").reduce((a, v) => (a as any)[v], o);

export default function setup<T extends object, L extends string>(fallback_lang: L, data: T) {
  const selected = signal<string>(fallback_lang);

  effect(() => {
    document.documentElement.lang = selected.value;
  });

  const database: {
    [key: string]: T;
  } = {
    [fallback_lang]: data,
  };

  const match = (langs: readonly string[], fallback: string, dbLangs: string[]): string => {
    if (!langs.length) return fallback;
    const [lang, region] = langs[0]!.split("-");
    const filtered = dbLangs.filter((val) => val.startsWith(lang!));
    if (filtered.length) {
      const exact = filtered.find((val) => {
        const [, database_region] = val.split("-");
        return database_region === region;
      });
      return exact ?? filtered.sort((a, b) => a.length - b.length)[0]!;
    }
    return match(langs.slice(1), fallback, dbLangs);
  };

  const register = (lang: string, data: T) => {
    database[lang] = data;

    const user_langs = navigator.languages;
    const database_langs = Object.keys(database);
    selected.value = match(user_langs, fallback_lang, database_langs);
  };

  const Text = ({ path }: { path: Leaves<T> }) => {
    const value = deep_value(database[selected.value]!, path);
    return Object.assign(<>{value}</>, { raw: value as unknown as string });
  };

  return { register, Text };
}
