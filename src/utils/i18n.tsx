// https://stackoverflow.com/questions/58434389/typescript-deep-keyof-of-a-nested-object/58436959
export type Paths<T> = T extends object
  ? {
      [K in keyof T]: `${Exclude<K, symbol>}${"" | `.${Paths<T[K]>}`}`;
    }[keyof T]
  : never;

export type Leaves<T> = T extends object
  ? {
      [K in keyof T]: `${Exclude<K, symbol>}${Leaves<T[K]> extends never ? "" : `.${Leaves<T[K]>}`}`;
    }[keyof T]
  : never;

const deep_value = <T extends object>(o: T, path: string) => path.split(".").reduce((a, v) => (a as any)[v], o);

export default function setup<T extends object, L extends string>(fallback_lang: L, data: T) {
  const database: {
    [key: string]: T;
  } = {
    [fallback_lang]: data,
  };

  const register = (lang: string, data: T) => {
    database[lang] = data;
  };

  const Text = ({ path }: { path: Leaves<T> }) => {
    const user_langs = navigator.languages;
    const database_langs = Object.keys(database);

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

    const selected = match(user_langs, fallback_lang, database_langs);
    const value = deep_value(database[selected]!, path);
    return Object.assign(<>{value}</>, { raw: value as unknown as string });
  };

  return { register, Text };
}
