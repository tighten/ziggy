import { resolve } from 'node:path';
import ts from 'typescript';
import { describe, expect, test } from 'vitest';

const fixtureFile = resolve(process.cwd(), 'tests/js/__completions__.ts');

function getCompletions(source: string, marker = '/*cursor*/') {
    if (!source.includes(marker)) {
        throw new Error(`Missing completion marker ${marker}`);
    }

    source = `
        import { route } from '../../src/js';
        declare module '../../src/js' {
            interface RouteList {
                'posts.comments.show': [
                    { name: 'post'; required: true },
                    { name: 'comment'; required: false; binding: 'uuid' },
                ];
                optional: [{ name: 'maybe'; required: false }];
            }
        }
        ${source}
    `;

    const cursor = source.indexOf(marker);
    source = source.replace(marker, '');

    const compilerOptions: ts.CompilerOptions = {
        target: ts.ScriptTarget.ESNext,
        module: ts.ModuleKind.ESNext,
        moduleResolution: ts.ModuleResolutionKind.Bundler,
        strict: true,
        lib: ['lib.esnext.d.ts'],
        noEmit: true,
    };

    function fileExists(fileName: string) {
        return fileName === fixtureFile || ts.sys.fileExists(fileName);
    }
    function readFile(fileName: string) {
        return fileName === fixtureFile ? source : ts.sys.readFile(fileName);
    }

    const host: ts.LanguageServiceHost = {
        getCompilationSettings: () => compilerOptions,
        getCurrentDirectory: () => process.cwd(),
        getDefaultLibFileName: (options) => ts.getDefaultLibFilePath(options),
        getScriptFileNames: () => [fixtureFile],
        getScriptVersion: () => '0',
        getScriptSnapshot: (fileName) => {
            const contents = readFile(fileName);
            return contents === undefined ? undefined : ts.ScriptSnapshot.fromString(contents);
        },
        fileExists,
        readFile,
        readDirectory: ts.sys.readDirectory,
        directoryExists: ts.sys.directoryExists,
        getDirectories: ts.sys.getDirectories,
        resolveModuleNames: (moduleNames, containingFile) =>
            moduleNames.map(
                (moduleName) =>
                    ts.resolveModuleName(moduleName, containingFile, compilerOptions, {
                        fileExists,
                        readFile,
                        directoryExists: ts.sys.directoryExists,
                        getCurrentDirectory: () => process.cwd(),
                        getDirectories: ts.sys.getDirectories,
                        realpath: ts.sys.realpath,
                    }).resolvedModule,
            ),
    };

    const service = ts.createLanguageService(host);
    const completions =
        service
            .getCompletionsAtPosition(fixtureFile, cursor, {})
            ?.entries.map((entry) => entry.name) ?? [];

    service.dispose();

    return new Set(completions);
}

describe('TypeScript completions', () => {
    test('suggest known route names', () => {
        let completions = getCompletions(`
            route('/*cursor*/');
        `);

        expect(completions).toContain('posts.comments.show');
        expect(completions).toContain('optional');
    });

    test('suggest route params when a required param is still missing', () => {
        let completions = getCompletions(`
            route('posts.comments.show', {
                /*cursor*/
            });
        `);

        expect(completions).toContain('post');
        expect(completions).toContain('comment');
        expect(completions).toContain('_query');
    });

    test('suggest remaining params after required params are provided', () => {
        let completions = getCompletions(`
            route('posts.comments.show', {
                post: 1,
                /*cursor*/
            });
        `);

        expect(completions).toContain('comment');
        expect(completions).toContain('_query');
        expect(completions).not.toContain('post');
    });

    test('suggest optional params on all-optional routes', () => {
        let completions = getCompletions(`
            route('optional', {
                /*cursor*/
            });
        `);

        expect(completions).toContain('maybe');
        expect(completions).toContain('_query');
    });
});
