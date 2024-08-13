const path = require("path");
const nodeExternals = require("webpack-node-externals");

module.exports = {
  mode: "production", // 또는 'production'. 'development'는 개발 환경에 맞춰 최적화된 설정을 적용하며, 'production'은 배포 환경에 맞춰 최적화된 설정을 적용합니다.
  entry: "./src/app.ts", // 애플리케이션의 진입점
  target: "node", // Node.js 환경을 타겟으로 함
  externals: [nodeExternals()], // 외부 모듈을 번들에서 제외. 주로 node_modules 폴더 내의 모듈을 번들에 포함시키지 않기 위해 사용합니다.
  output: {
    filename: "app.js", // 번들 파일 이름
    path: path.resolve(__dirname, "dist"), // 번들 파일이 저장될 디렉토리
  },
  resolve: {
    extensions: [".ts", ".js"], // 처리할 파일 확장자
  },
  module: {
    rules: [
      {
        test: /\.ts$/, // .ts 파일에 적용될 규칙
        exclude: /node_modules/, // node_modules 디렉토리는 제외
        use: [
          {
            loader: "babel-loader", // Webpack에서 Babel을 사용하여 파일을 트랜스파일링하는 로더.
            options: {
              presets: [
                [
                  "@babel/preset-env", // 최신 JavaScript 기능을 구형 브라우저와 환경에서 사용할 수 있도록 트랜스파일링.
                  {
                    targets: {
                      node: "current", // 현재 Node.js 버전을 타겟으로 설정.
                    },
                    useBuiltIns: "usage", // 필요한 폴리필만 포함.
                    corejs: 3, // core-js 버전 설정.
                  },
                ],
                "@babel/preset-typescript", // TypeScript를 지원하여 TypeScript 코드를 JavaScript로 트랜스파일링.
              ],
            },
          },
          "ts-loader", // Webpack에서 TypeScript 파일을 로드하고 컴파일하는 로더.
        ],
      },
    ],
  },
  devtool: "source-map", // 소스 맵을 포함하여 디버깅
};
