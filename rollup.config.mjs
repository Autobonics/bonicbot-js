import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';

const isProduction = process.env.NODE_ENV === 'production';

export default [
    // ESM build
    {
        input: 'src/index.js',
        output: {
            file: 'dist/index.esm.js',
            format: 'esm',
            sourcemap: true
        },
        plugins: [
            resolve({
                browser: true,
                preferBuiltins: false
            }),
            commonjs(),
            isProduction && terser()
        ].filter(Boolean)
    },

    // UMD build for browser script tag usage
    {
        input: 'src/index.js',
        output: {
            file: 'dist/index.umd.js',
            format: 'umd',
            name: 'BonicBot',
            sourcemap: true,
            exports: 'auto'
        },
        plugins: [
            resolve({
                browser: true,
                preferBuiltins: false
            }),
            commonjs(),
            isProduction && terser()
        ].filter(Boolean)
    },

    // Minified UMD build
    {
        input: 'src/index.js',
        output: {
            file: 'dist/index.umd.min.js',
            format: 'umd',
            name: 'BonicBot',
            sourcemap: true,
            exports: 'auto'
        },
        plugins: [
            resolve({
                browser: true,
                preferBuiltins: false
            }),
            commonjs(),
            terser()
        ]
    }
];