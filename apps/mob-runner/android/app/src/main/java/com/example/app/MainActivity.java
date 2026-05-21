package com.example.app;

import android.view.MotionEvent;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

  private float startX = 0;
  private static final float MIN_SWIPE_DISTANCE = 100f; // 最小滑动距离阈值，单位 px

  @Override
  public boolean dispatchTouchEvent(MotionEvent ev) {
    int action = ev.getAction();

    switch (action) {
      case MotionEvent.ACTION_DOWN:
        // 记录触摸开始的 X 坐标
        startX = ev.getX();
        break;

      case MotionEvent.ACTION_UP:
        // 获取触摸结束的 X 坐标
        float endX = ev.getX();
        float deltaX = startX - endX; // 左滑时为正，右滑时为负
        float absDeltaX = Math.abs(deltaX);

        // 判断是否为有效水平滑动
        if (absDeltaX > MIN_SWIPE_DISTANCE) {
          // 使用 runOnUiThread 确保在主线程执行 JS
          runOnUiThread(() -> {
            if (deltaX > 0) {
              // 左滑 -> 前进 (forward)
              getBridge().eval("history.forward();", null);
            } else {
              // 右滑 -> 后退 (back)
              getBridge().eval("history.back();", null);
            }
          });

          // 返回 true 表示事件已被消费，系统不再处理（如返回桌面）
          return true;
        }
        break;

      default:
        // 对于其他动作（如 ACTION_MOVE），让父类处理
        break;
    }

    // 对于非滑动手势或无效滑动，调用父类方法继续分发事件
    return super.dispatchTouchEvent(ev);
  }
}
