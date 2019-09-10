module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        modules: false,
        forceAllTransforms: true,
        useBuiltIns: false,
        targets: {
          browsers: [
            '> 2%',
            'last 2 versions'
          ]
        }
      }
    ]
  ],
  plugins: [
    '@babel/transform-object-assign'
  ],
};