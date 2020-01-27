# Rescue Helicopter Simulation

- ヘリコプターの救助活動のシミュレーション
- [高知県を対象とした南海トラフ巨大地震 発災後の航空機運用方法の検討](https://www.jstage.jst.go.jp/article/jscejipm/73/5/73_I_897/_pdf/-char/ja) を参考にしている

## デモ

以下のURLでデモが動作している(現在 2020/01/27)
[https://rescue-helicopter-simulation.firebaseapp.com/](https://rescue-helicopter-simulation.firebaseapp.com/)

### 推奨環境

以下の環境で動作を確認済み

- macOS / Chrome バージョン: 79.0.3945.130（Official Build） （64 ビット）

## 環境構築

### Node.js
```
% node -v
v12.10.0
% npm -v
6.13.6
```
参考: [Node.js](https://nodejs.org/ja/)　

### yarn
```
% yarn --version
1.17.3
```
参考: [Yarn](https://legacy.yarnpkg.com/lang/ja/)

### Parcel
```
% parcel --version
1.12.4
```
参考: [Parcel](https://parceljs.org/)

## 起動

### 依存関係のインストール
```
yarn install
```

### アプリケーションの起動
```
yarn start
```
例) [localhost:1234](http://localhost:1234) をブラウザで開く
