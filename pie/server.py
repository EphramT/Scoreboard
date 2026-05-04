import asyncio
import json
import websockets

from shotclock import ShotClock

TICK_INTERVAL = 0.05  # seconds between clock updates broadcast to clients


class ShotClockServer:
    def __init__(self, host="0.0.0.0", port=8765):
        self.host = host
        self.port = port
        self.clock = ShotClock()
        self.clients: set[websockets.WebSocketServerProtocol] = set()

    async def register(self, ws):
        self.clients.add(ws)
        await ws.send(json.dumps(self.clock.state()))

    def unregister(self, ws):
        self.clients.discard(ws)

    async def broadcast(self, message: str):
        if self.clients:
            await asyncio.gather(*(c.send(message) for c in self.clients), return_exceptions=True)

    async def handle(self, ws):
        await self.register(ws)
        try:
            async for raw in ws:
                await self._handle_command(raw)
        except websockets.exceptions.ConnectionClosed:
            pass
        finally:
            self.unregister(ws)

    async def _handle_command(self, raw: str):
        try:
            msg = json.loads(raw)
            cmd = msg.get("cmd")
        except (json.JSONDecodeError, AttributeError):
            return

        if cmd == "start":
            self.clock.start()
        elif cmd == "pause":
            self.clock.pause()
        elif cmd == "reset":
            self.clock.reset()
        elif cmd == "continue":
            self.clock.continue_clock()
        elif cmd == "switch":
            self.clock.switch_duration()
        else:
            return

        await self.broadcast(json.dumps(self.clock.state()))

    async def _tick_loop(self):
        while True:
            hit_zero = self.clock.tick()
            await self.broadcast(json.dumps(self.clock.state()))
            if hit_zero:
                print("Shot clock expired!")
            await asyncio.sleep(TICK_INTERVAL)

    async def serve(self):
        print(f"Shot clock server starting on ws://{self.host}:{self.port}")
        async with websockets.serve(self.handle, self.host, self.port):
            await self._tick_loop()
