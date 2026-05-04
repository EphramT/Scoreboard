import time


class ShotClock:
    DURATION_LONG = 15
    DURATION_SHORT = 10

    def __init__(self):
        self.duration = self.DURATION_LONG
        self._previous_duration = self.DURATION_LONG
        self._time_remaining = float(self.DURATION_LONG)
        self._last_tick = None
        self._running = False

    def start(self):
        if not self._running:
            self._last_tick = time.monotonic()
            self._running = True

    def pause(self):
        if self._running:
            self._tick()
            self._running = False

    def reset(self):
        self._previous_duration = self.duration
        self._time_remaining = float(self.duration)
        self._running = False
        self._last_tick = None

    def continue_clock(self):
        """Resume to the previous duration (e.g. ball called, not a throw)."""
        self.duration = self._previous_duration
        self._time_remaining = float(self._previous_duration)
        self._running = False
        self._last_tick = None

    def switch_duration(self):
        """Toggle between 15s and 10s."""
        if self.duration == self.DURATION_LONG:
            self.duration = self.DURATION_SHORT
        else:
            self.duration = self.DURATION_LONG
        self.reset()

    def tick(self):
        """Call regularly to advance the clock. Returns True if clock hit zero."""
        if self._running:
            return self._tick()
        return False

    def _tick(self):
        now = time.monotonic()
        if self._last_tick is not None:
            elapsed = now - self._last_tick
            self._time_remaining = max(0.0, self._time_remaining - elapsed)
        self._last_tick = now

        if self._time_remaining <= 0:
            self._running = False
            return True
        return False

    @property
    def time_remaining(self):
        if self._running:
            self._tick()
        return self._time_remaining

    @property
    def running(self):
        return self._running

    def state(self):
        return {
            "running": self._running,
            "time_remaining": round(self.time_remaining, 2),
            "duration": self.duration,
        }
