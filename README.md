# 仮想スクロールの実装方法によるパフォーマンス比較

雑に作った比較用実装．
DOM の並びかえと，生成・破棄による実装でどれくらい差がでるのか？

1. 同じ VDOM をキープしつつ，その上のコンテンツのみ変更（`StaticVirtualScrollWrapper`）

2. コンテンツ変更時に，VDOM を生成・破棄する（`DynamicVirtualScrollWrapper`）
